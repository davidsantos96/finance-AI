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

    const prompt = `
      Analise os gastos abaixo e retorne APENAS um JSON:
      Salário: ${salario}
      Gastos: ${JSON.stringify(gastos.map(g => ({ nome: g.nome, valor: g.valor })))}

      Formato esperado:
      {
          "gastosAtualizados": [
              { "nomeOriginal": "...", "categoria": "...", "corHex": "..." }
          ],
          "alerta": "Texto curto sobre algo preocupante",
          "positivo": "Texto curto sobre algo bom",
          "analiseIA": "Texto de conselhos de 3 linhas"
      }
      Categorias: Moradia, Alimentação, Transporte, Saúde, Lazer, Educação, Dívidas, Investimento, Outros.
      Use cores luxuosas para dark mode.
    `;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extrair o conteúdo JSON da resposta
    const content = response.content[0].text;
    const data = JSON.parse(content);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({ error: 'Falha na análise da IA: ' + error.message });
  }
}
