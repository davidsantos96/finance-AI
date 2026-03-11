import Anthropic from '@anthropic-ai/sdk';

// ── Limites de uso ────────────────────────────────────────────────────────────
const LIMITE_POR_IP_POR_HORA = 5;   // máx. requisições por IP a cada 60 min
const LIMITE_GLOBAL_TOTAL = 200; // teto absoluto de chamadas (proteção do orçamento)
const MAX_GASTOS = 20;  // máx. itens de gasto por análise
const MAX_CHARS_NOME = 60;  // máx. caracteres no nome de um gasto

// ── Armazenamento em memória (por instância serverless) ───────────────────────
// Nota: funciona como barreira de contenção. Em caso de muitos acessos
// simultâneos em instâncias diferentes, o limite global no Vercel Dashboard
// (spending limit) é a proteção final.
const ipMap = new Map(); // { ip -> { count, resetAt } }
let globalCount = 0;

function checarRateLimit(ip) {
  const agora = Date.now();

  // ── Limite global ──────────────────────────────────────────────────────────
  if (globalCount >= LIMITE_GLOBAL_TOTAL) {
    return { bloqueado: true, motivo: 'Limite de uso do serviço atingido. Tente novamente mais tarde.' };
  }

  // ── Limite por IP ──────────────────────────────────────────────────────────
  const registro = ipMap.get(ip);

  if (!registro || agora > registro.resetAt) {
    // Janela nova ou expirada
    ipMap.set(ip, { count: 1, resetAt: agora + 60 * 60 * 1000 });
    return { bloqueado: false };
  }

  if (registro.count >= LIMITE_POR_IP_POR_HORA) {
    const minutosRestantes = Math.ceil((registro.resetAt - agora) / 60000);
    return {
      bloqueado: true,
      motivo: `Limite de ${LIMITE_POR_IP_POR_HORA} análises por hora atingido. Tente novamente em ${minutosRestantes} min.`,
    };
  }

  registro.count += 1;
  return { bloqueado: false };
}

// ── Sanitização contra prompt injection ──────────────────────────────────────
function sanitizarTexto(texto) {
  return String(texto)
    .slice(0, MAX_CHARS_NOME)
    .replace(/[`"\\]/g, '')       // remove chars que podem quebrar o JSON/prompt
    .replace(/\n|\r/g, ' ')       // remove quebras de linha
    .trim();
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Identificar IP ────────────────────────────────────────────────────────
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  // ── Verificar rate limit ──────────────────────────────────────────────────
  const { bloqueado, motivo } = checarRateLimit(ip);
  if (bloqueado) {
    return res.status(429).json({ error: motivo });
  }

  // ── Validar body ──────────────────────────────────────────────────────────
  const { salario, gastos } = req.body ?? {};

  if (typeof salario !== 'number' || isNaN(salario) || salario < 0) {
    return res.status(400).json({ error: 'Salário inválido.' });
  }

  if (!Array.isArray(gastos) || gastos.length === 0) {
    return res.status(400).json({ error: 'Nenhum gasto fornecido.' });
  }

  if (gastos.length > MAX_GASTOS) {
    return res.status(400).json({ error: `Máximo de ${MAX_GASTOS} gastos por análise.` });
  }

  // ── Sanitizar gastos ──────────────────────────────────────────────────────
  const gastosSanitizados = gastos.map(g => ({
    nome: sanitizarTexto(g.nome ?? ''),
    valor: typeof g.valor === 'number' && g.valor >= 0 ? g.valor : 0,
  }));

  // ── Verificar API Key ─────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API do Claude não configurada no servidor.' });
  }

  // ── Chamar a IA ───────────────────────────────────────────────────────────
  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `Você é um especialista em finanças pessoais. Analise os gastos fornecidos em relação ao salário e forneça insights acionáveis.
      
      DADOS:
      Salário: R$ ${salario / 100}
      Gastos: ${JSON.stringify(gastosSanitizados.map(g => ({ nome: g.nome, valor: g.valor / 100 })))}

      INSTRUÇÕES:
      1. Classifique cada gasto em uma das categorias: Moradia, Alimentação, Transporte, Saúde, Lazer, Educação, Dívidas, Investimento, Outros.
      2. Escolha cores luxuosas (hexadecimal) para cada categoria, otimizadas para modo escuro.
      3. Seja direto e prático nos conselhos.
      4. Retorne APENAS o JSON, sem explicações.

      FORMATO JSON ESPERADO:
      {
          "gastosAtualizados": [
              { "nomeOriginal": "...", "categoria": "...", "corHex": "..." }
          ],
          "alerta": "Insight sobre gastos excessivos (máx 100 caracteres)",
          "positivo": "Elogio sobre bons hábitos (máx 100 caracteres)",
          "analiseIA": "Conselho estratégico de 3 linhas"
      }`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: '{' }, // Prefill: força JSON puro
      ],
    });

    // Incrementa contador global após chamada bem-sucedida
    globalCount += 1;

    let content = '{' + response.content[0].text;
    content = content.replace(/```json|```/g, '').trim();

    try {
      const data = JSON.parse(content);
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('Erro ao parsear JSON da IA:', content);
      throw new Error('A IA retornou um formato inválido.');
    }

  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({ error: 'Falha na análise da IA: ' + error.message });
  }
}