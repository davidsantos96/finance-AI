// Formata um valor inteiro (centavos × 100) em "R$ 1.234,56" para exibição estática
export const fmt = (v) => {
    const value = Math.round(v || 0);
    const s = value.toString().padStart(3, "0");
    const int = s.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const dec = s.slice(-2);
    return `R$ ${int},${dec}`;
};

// Máscara dinâmica para inputs: retorna "1.234,56" (sem o prefixo R$)
export const maskCurrency = (v) => {
    if (!v && v !== 0) return "";
    const s = Math.round(v).toString().padStart(3, "0");
    const int = s.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const dec = s.slice(-2);
    return `${int},${dec}`;
};
