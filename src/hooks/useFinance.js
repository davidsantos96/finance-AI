import { useState, useRef, useEffect } from "react";
import { identificarCategoria } from "../utils/categories";

const LS_SALARIO = "financeai_salario";
const LS_GASTOS = "financeai_gastos";

function carregarLS() {
    try {
        return {
            salario: JSON.parse(localStorage.getItem(LS_SALARIO)) ?? 0,
            gastos: JSON.parse(localStorage.getItem(LS_GASTOS)) ?? [],
        };
    } catch {
        return { salario: 0, gastos: [] };
    }
}

export function useFinance() {
    const inicial = carregarLS();

    const [salario, setSalario] = useState(inicial.salario);
    const [gastos, setGastos] = useState(inicial.gastos);
    const [novoGasto, setNovoGasto] = useState({ nome: "", valor: "" });
    const [analisando, setAnalisando] = useState(false);
    const [insights, setInsights] = useState(null);
    const inputDescRef = useRef(null);

    // ── Persistência automática no localStorage ───────────────────────────────
    useEffect(() => {
        localStorage.setItem(LS_SALARIO, JSON.stringify(salario));
    }, [salario]);

    useEffect(() => {
        localStorage.setItem(LS_GASTOS, JSON.stringify(gastos));
    }, [gastos]);

    // ── Computed ──────────────────────────────────────────────────────────────
    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const saldo = salario - totalGastos;
    const porcentagemComprometida =
        salario > 0 ? ((totalGastos / salario) * 100).toFixed(1) : "0.0";

    const categorias = gastos.reduce((acc, g) => {
        const existente = acc.find(c => c.nome === g.cat);
        if (existente) {
            existente.valor += g.valor;
        } else {
            acc.push({ nome: g.cat, valor: g.valor, cor: g.cor || "#64748b" });
        }
        return acc;
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAddGasto = (e) => {
        e.preventDefault();
        if (!novoGasto.nome || !novoGasto.valor) return;

        const { cat, cor } = identificarCategoria(novoGasto.nome);
        setGastos(prev => [
            ...prev,
            { id: Date.now(), nome: novoGasto.nome, valor: novoGasto.valor, cat, cor },
        ]);
        setNovoGasto({ nome: "", valor: "" });
        inputDescRef.current?.focus();
    };

    const removeGasto = (id) => setGastos(prev => prev.filter(g => g.id !== id));

    // Edita nome e/ou valor de um gasto existente.
    // Recategoriza automaticamente se o nome mudar.
    const editarGasto = (id, { nome, valor }) => {
        setGastos(prev => prev.map(g => {
            if (g.id !== id) return g;

            const novoNome = nome ?? g.nome;
            const novoValor = valor ?? g.valor;

            const { cat, cor } = nome && nome !== g.nome
                ? identificarCategoria(novoNome)
                : { cat: g.cat, cor: g.cor };

            return { ...g, nome: novoNome, valor: novoValor, cat, cor };
        }));
    };

    const limparDados = () => {
        setGastos([]);
        setSalario(0);
        setInsights(null);
        localStorage.removeItem(LS_SALARIO);
        localStorage.removeItem(LS_GASTOS);
    };

    const analisarComIA = async () => {
        setAnalisando(true);
        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ salario, gastos }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Erro na resposta do servidor");
            }

            const data = await response.json();

            setGastos(prev =>
                prev.map(g => {
                    const infoIA = data.gastosAtualizados.find(ia => ia.nomeOriginal === g.nome);
                    return infoIA ? { ...g, cat: infoIA.categoria, cor: infoIA.corHex } : g;
                })
            );
            setInsights(data);
        } catch (error) {
            console.error("Erro na análise IA:", error);
            alert("⚠️ " + error.message);
        } finally {
            setAnalisando(false);
        }
    };

    return {
        salario, setSalario,
        gastos,
        novoGasto, setNovoGasto,
        analisando,
        insights,
        inputDescRef,
        totalGastos,
        saldo,
        porcentagemComprometida,
        categorias,
        handleAddGasto,
        removeGasto,
        editarGasto,
        limparDados,
        analisarComIA,
    };
}