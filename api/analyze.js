import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { salario, gastos } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API do Claude não configurada no servidor.' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const prompt = `Você é um especialista em finanças pessoais. Analise os gastos fornecidos em relação ao salário e forneça insights acionáveis.
      
      DADOS:
      Salário: R$ ${salario / 100}
      Gastos: ${JSON.stringify(gastos.map(g => ({ nome: g.nome, valor: g.valor / 100 })))}

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
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: "{" } // Técnica de Prefill: força a resposta a ser JSON puro
      ],
    });

    // 1. Recupera o texto e adiciona o '{' que forçamos no prefill
    let content = "{" + response.content[0].text;

    // 2. Limpeza de segurança (caso a IA ainda tente usar markdown)
    content = content.replace(/```json|```/g, "").trim();

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