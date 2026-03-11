export const CATEGORIA_MAP = {
    "Alimentação": { cor: "#34d399", keywords: ["ifood", "mercado", "padaria", "restaurante", "comida", "almoço", "janta", "pão", "carne", "supermercado"] },
    "Moradia":     { cor: "#60a5fa", keywords: ["aluguel", "condominio", "luz", "água", "gas", "internet", "casa", "reforma"] },
    "Saúde":       { cor: "#a78bfa", keywords: ["farmacia", "medico", "plano", "hospital", "dentista", "academia", "personal", "suplemento"] },
    "Educação":    { cor: "#fde047", keywords: ["escola", "curso", "faculdade", "livro", "mensalidade", "estudo"] },
    "Transporte":  { cor: "#fb923c", keywords: ["uber", "combustivel", "gasolina", "estacionamento", "oficina", "carro", "moto", "onibus"] },
    "Impostos":    { cor: "#475569", keywords: ["ipva", "iptu", "das", "darf", "licenciamento", "irpf", "imposto", "taxa", "mei", "gps", "fies"] },
    "Lazer":       { cor: "#fb7185", keywords: ["cinema", "viagem", "show", "festa", "cerveja", "bar", "netflix", "spotify", "jogos", "steam"] },
    "Dívidas":     { cor: "#f87171", keywords: ["emprestimo", "fatura", "cartao", "nubank", "parcela", "juros", "banco"] },
    "Investimento":{ cor: "#2dd4bf", keywords: ["acoes", "cripto", "tesouro", "poupanca", "invest", "cdb", "consorcio", "cofrinho", "caixinha", "reserva"] },
    "Outros":      { cor: "#94a3b8", keywords: [] }
};

const normalizar = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const identificarCategoria = (nome) => {
    const n = normalizar(nome);
    for (const [cat, info] of Object.entries(CATEGORIA_MAP)) {
        if (info.keywords.some(k => n.includes(normalizar(k)))) {
            return { cat, cor: info.cor };
        }
    }
    return { cat: "Outros", cor: "#94a3b8" };
};
