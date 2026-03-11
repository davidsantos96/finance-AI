import { useState, useRef } from "react";
import { identificarCategoria } from "../utils/categories";

export function useFinance() {
    const [salario, setSalario] = useState(0);
    const [gastos, setGastos] = useState([]);
    const [novoGasto, setNovoGasto] = useState({ nome: "", valor: "" });
    const [analisando, setAnalisando] = useState(false);
    const [insights, setInsights] = useState(null);
    const inputDescRef = useRef(null);

    // ── Computed ────────────────────────────────────────────────────────────────
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

    // ── Handlers ────────────────────────────────────────────────────────────────
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
        // state
        salario, setSalario,
        gastos,
        novoGasto, setNovoGasto,
        analisando,
        insights,
        inputDescRef,
        // computed
        totalGastos,
        saldo,
        porcentagemComprometida,
        categorias,
        // handlers
        handleAddGasto,
        removeGasto,
        analisarComIA,
    };
}