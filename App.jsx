import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, TrendingUp, Download, Settings, Sparkles, AlertTriangle, CheckCircle, Loader2, FileText, Table } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Configuração da IA (A chave será pedida ao usuário na UI para segurança local)
const INITIAL_GASTOS = [];

const CATEGORIA_MAP = {
    "Alimentação": { cor: "#34d399", keywords: ["ifood", "mercado", "padaria", "restaurante", "comida", "almoço", "janta", "pão", "carne", "supermercado"] },
    "Moradia": { cor: "#60a5fa", keywords: ["aluguel", "condominio", "luz", "água", "gas", "internet", "casa", "reforma"] },
    "Saúde": { cor: "#a78bfa", keywords: ["farmacia", "medico", "plano", "hospital", "dentista", "academia", "personal", "suplemento"] },
    "Educação": { cor: "#fde047", keywords: ["escola", "curso", "faculdade", "livro", "mensalidade", "estudo"] },
    "Transporte": { cor: "#fb923c", keywords: ["uber", "combustivel", "gasolina", "estacionamento", "oficina", "carro", "moto", "onibus"] },
    "Impostos": { cor: "#475569", keywords: ["ipva", "iptu", "das", "darf", "licenciamento", "irpf", "imposto", "taxa", "mei", "gps", "fies"] },
    "Lazer": { cor: "#fb7185", keywords: ["cinema", "viagem", "show", "festa", "cerveja", "bar", "netflix", "spotify", "jogos", "steam"] },
    "Dívidas": { cor: "#f87171", keywords: ["emprestimo", "fatura", "cartao", "nubank", "parcela", "juros", "banco"] },
    "Investimento": { cor: "#2dd4bf", keywords: ["acoes", "cripto", "tesouro", "poupanca", "invest", "cdb", "consorcio", "cofrinho", "caixinha", "reserva"] },
    "Outros": { cor: "#94a3b8", keywords: [] }
};

const identificarCategoria = (nome) => {
    // Função para remover acentos e converter para minúsculas
    const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const n = normalizar(nome);
    
    for (const [cat, info] of Object.entries(CATEGORIA_MAP)) {
        if (info.keywords.some(k => n.includes(normalizar(k)))) {
            return { cat, cor: info.cor };
        }
    }
    return { cat: "Outros", cor: "#94a3b8" };
};

// Função para formatar exibição de moeda (não-editável)
const fmt = v => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Função para formatar input de moeda (editável)
const formatCurrencyInputCents = (cents) => {
    if (!cents && cents !== 0) return "";
    const realValue = Number(cents) / 100;
    return realValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Componentes Auxiliares
function AnimatedBar({ valor, total, cor, delay = 0 }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth((valor / total) * 100), delay);
        return () => clearTimeout(t);
    }, [valor, total]);
    return (
        <div style={{ height: 5, background: "#1e2535", borderRadius: 99, overflow: "hidden", flex: 1 }}>
            <div style={{
                height: "100%", borderRadius: 99, background: cor,
                width: `${width}%`, transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
                boxShadow: `0 0 6px ${cor}88`
            }} />
        </div>
    );
}

const CustomTooltip = ({ active, payload, total }) => {
    if (active && payload?.length) {
        const d = payload[0];
        return (
            <div style={{ background: "#0d1117", border: `1px solid ${d.payload.cor}55`, borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ color: d.payload.cor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{d.payload.nome}</div>
                <div style={{ color: "#f1f5f9", fontSize: 15, fontFamily: "monospace", marginTop: 2 }}>{fmt(d.value)}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{((d.value / total) * 100).toFixed(1)}%</div>
            </div>
        );
    }
    return null;
};

export default function App() {
    const [aba, setAba] = useState("geral");
    const [hov, setHov] = useState(null);
    const [mounted, setMounted] = useState(false);
    
    // Estados dinâmicos
    const [salario, setSalario] = useState(0);
    const [gastos, setGastos] = useState(INITIAL_GASTOS);
    const [novoGasto, setNovoGasto] = useState({ nome: "", valor: "" });
    
    // Estados da IA
    const [analisando, setAnalisando] = useState(false);
    const [insights, setInsights] = useState(null);
    const inputDescRef = useRef(null);

    useEffect(() => { setTimeout(() => setMounted(true), 120); }, []);

    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const saldo = salario - totalGastos;
    const porcentagemComprometida = salario > 0 ? ((totalGastos / salario) * 100).toFixed(1) : "0.0";

    const categorias = gastos.reduce((acc, g) => {
        const existente = acc.find(c => c.nome === g.cat);
        if (existente) {
            existente.valor += g.valor;
        } else {
            acc.push({ nome: g.cat, valor: g.valor, cor: g.cor || "#64748b" });
        }
        return acc;
    }, []);

    const handleAddGasto = (e) => {
        e.preventDefault();
        if (!novoGasto.nome || !novoGasto.valor) return;
        
        const { cat, cor } = identificarCategoria(novoGasto.nome);

        const gasto = {
            id: Date.now(),
            nome: novoGasto.nome,
            valor: novoGasto.valor,
            cat: cat,
            cor: cor 
        };

        setGastos([...gastos, gasto]);
        setNovoGasto({ nome: "", valor: "" });
        
        // Retorna o foco para o campo de descrição
        if (inputDescRef.current) {
            inputDescRef.current.focus();
        }
    };

    const removeGasto = (id) => {
        setGastos(gastos.filter(g => g.id !== id));
    };



    const analisarComIA = async () => {
        setAnalisando(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salario, gastos })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro na resposta do servidor');
            }

            const data = await response.json();

            // Atualizar gastos com categorias e cores da IA
            const novosGastos = gastos.map(g => {
                const infoIA = data.gastosAtualizados.find(ia => ia.nomeOriginal === g.nome);
                return infoIA ? { ...g, cat: infoIA.categoria, cor: infoIA.corHex } : g;
            });

            setGastos(novosGastos);
            setInsights(data);
        } catch (error) {
            console.error("Erro detalhado:", error);
            alert("Erro na IA: " + error.message);
        } finally {
            setAnalisando(false);
        }
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        const now = new Date().toLocaleDateString("pt-BR");

        // Título e Estilo
        doc.setFillColor(8, 11, 18);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(52, 211, 153);
        doc.setFontSize(22);
        doc.text("Relatório Financeiro AI", 14, 25);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${now}`, 14, 32);

        // Sumário
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Resumo Mensal", 14, 55);
        
        const summaryData = [
            ["Salário Total", fmt(salario), "100%"],
            ["Total de Gastos", fmt(totalGastos), `${porcentagemComprometida}%`],
            ["Saldo Livre", fmt(saldo), `${(100 - parseFloat(porcentagemComprometida)).toFixed(1)}%`]
        ];

        autoTable(doc, {
            startY: 60,
            head: [["Descrição", "Valor", "%"]],
            body: summaryData,
            theme: "striped",
            headStyles: { fillColor: [52, 211, 153], textColor: [0, 0, 0] }
        });

        const tableBody = gastos.map(g => [
            g.nome, 
            g.cat || "Pendente", 
            fmt(g.valor), 
            `${((g.valor / totalGastos) * 100).toFixed(1)}%`
        ]);
        
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [["Item", "Categoria", "Valor", "%"]],
            body: tableBody,
            theme: "grid",
            headStyles: { fillColor: [30, 37, 53], textColor: [255, 255, 255] }
        });

        if (insights) {
            doc.addPage();
            doc.setTextColor(52, 211, 153);
            doc.setFontSize(18);
            doc.text("Análise da IA", 14, 25);
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("Conselho do Especialista:", 14, 40);
            
            const splitText = doc.splitTextToSize(insights.analiseIA, 180);
            doc.text(splitText, 14, 50);

            doc.setTextColor(190, 18, 60);
            doc.text("Alerta:", 14, doc.lastAutoTable.finalY + 80 || 100);
            doc.setTextColor(0, 0, 0);
            doc.text(insights.alerta, 14, doc.lastAutoTable.finalY + 90 || 110);
        }

        doc.save(`Relatorio_Financeiro_${now.replace(/\//g, "-")}.pdf`);
    };

    const exportarExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Gastos de Março");

        worksheet.columns = [
            { header: "Nome do Gasto", key: "nome", width: 30 },
            { header: "Categoria", key: "cat", width: 20 },
            { header: "Valor (R$)", key: "valor", width: 15 }
        ];

        gastos.forEach(g => worksheet.addRow(g));

        // Estilização do cabeçalho
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF34D399" }
        };

        const buffer = await workbook.xlsx.writeBuffer();
        const now = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
        saveAs(new Blob([buffer]), `Planilha_Gastos_${now}.xlsx`);
    };

    return (
        <div style={{
            fontFamily: "Inter, sans-serif",
            background: "linear-gradient(160deg,#080b12 0%,#0d1117 60%,#080b12 100%)",
            minHeight: "100vh", color: "#e2e8f0", paddingBottom: 60
        }}>
            {/* Top bar */}
            <div style={{
                borderBottom: "1px solid #1e2535", background: "#0a0d14ee",
                padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={16} color="#34d399" />
                    <span style={{ fontSize: 10, letterSpacing: 4, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Finance AI</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                     <button title="Exportar PDF" onClick={exportarPDF} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                        <FileText size={18} />
                    </button>
                    <button title="Exportar Excel" onClick={exportarExcel} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                        <Table size={18} />
                    </button>
                </div>
            </div>

            <div className="main-container">
                {/* Hero / Sumário */}
                <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all .6s ease", marginBottom: 20 }}>
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="summary-label">Salário</div>
                            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                                <input 
                                    type="text"
                                    value={salario === 0 ? "R$ 0,00" : fmt(salario)}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, "");
                                        setSalario(rawValue === "" ? 0 : Number(rawValue));
                                    }}
                                    className="salary-input"
                                />
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Gastos</div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#f87171", fontFamily: "monospace" }}>{fmt(totalGastos)}</div>
                        </div>
                        <div className="summary-card saldo-card">
                            <div className="summary-label">Saldo</div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#60a5fa", fontFamily: "monospace" }}>{fmt(saldo)}</div>
                        </div>
                    </div>
                </div>

                {/* Bloco de Ação IA */}
                <div style={{ 
                    marginBottom: 32, padding: 20, borderRadius: 20, 
                    background: analisando ? "linear-gradient(135deg, #1e2535, #0d1117)" : "linear-gradient(135deg, #0d1117, #0a0d14)",
                    border: "1px solid #34d39933", position: "relative", overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                                <Sparkles size={16} color="#34d399" />
                                Inteligência Artificial
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                Classifique gastos e receba insights financeiros.
                            </div>
                        </div>
                        <button 
                            onClick={analisarComIA}
                            disabled={analisando}
                            style={{ 
                                background: "#34d399", color: "#000", border: "none", 
                                padding: "10px 20px", borderRadius: 12, fontWeight: 700, 
                                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)", transition: "all 0.2s"
                            }}
                        >
                            {analisando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {analisando ? "Analisando..." : "Analisar Agora"}
                        </button>
                    </div>
                </div>

                {/* Insights da IA */}
                {insights && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                        <div style={{ background: "#12080a", border: "1px solid #7f1d1d33", borderRadius: 16, padding: 16 }}>
                            <div style={{ fontSize: 9, letterSpacing: 3, color: "#f87171", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                <AlertTriangle size={12} /> Alerta IA
                            </div>
                            <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>{insights.alerta}</div>
                        </div>
                        <div style={{ background: "#080f0c", border: "1px solid #14532d33", borderRadius: 16, padding: 16 }}>
                            <div style={{ fontSize: 9, letterSpacing: 3, color: "#34d399", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                <CheckCircle size={12} /> Positivo IA
                            </div>
                            <div style={{ fontSize: 12, color: "#6ee7b7", lineHeight: 1.5 }}>{insights.positivo}</div>
                        </div>
                        <div style={{ gridColumn: "span 2", background: "#111827", border: "1px solid #1e2535", borderRadius: 16, padding: 16 }}>
                            <div style={{ fontSize: 9, letterSpacing: 3, color: "#60a5fa", textTransform: "uppercase", marginBottom: 8 }}>Conselho do Especialista</div>
                            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>"{insights.analiseIA}"</div>
                        </div>
                    </div>
                )}

                {/* Formulário de Adição */}
                <form onSubmit={handleAddGasto} className="add-form">
                    <div className="input-desc">
                        <input 
                            ref={inputDescRef}
                            placeholder="Descrição do gasto..."
                            value={novoGasto.nome}
                            onChange={e => setNovoGasto({...novoGasto, nome: e.target.value})}
                            className="base-input"
                        />
                    </div>
                    <div className="input-val">
                        <input 
                            type="text"
                            placeholder="Valor"
                            value={novoGasto.valor === "" ? "" : formatCurrencyInputCents(novoGasto.valor)}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/\D/g, "");
                                setNovoGasto({...novoGasto, valor: rawValue === "" ? "" : Number(rawValue)});
                            }}
                            className="base-input"
                        />
                    </div>
                    <button type="submit" className="add-button">
                        <Plus size={22} />
                    </button>
                </form>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #1e2535", marginBottom: 24 }}>
                    {[["geral", "Análise"], ["lista", "Lançamentos"]].map(([id, label]) => (
                        <button key={id} onClick={() => setAba(id)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            padding: "9px 20px", fontSize: 10, letterSpacing: 2,
                            color: aba === id ? "#f1f5f9" : "#334155",
                            borderBottom: aba === id ? "2px solid #34d399" : "2px solid transparent",
                            textTransform: "uppercase", fontWeight: 700, transition: "color 0.2s", marginBottom: -1
                        }}>{label}</button>
                    ))}
                </div>

                {aba === "geral" && (
                    <div className="chart-section">
                        {gastos.length > 0 ? (
                            <div className="chart-grid">
                                <div className="pie-container">
                                    <PieChart width={170} height={170}>
                                        <Pie data={categorias} dataKey="valor" cx={80} cy={80} innerRadius={50} outerRadius={80} paddingAngle={3}
                                            onMouseEnter={(_, i) => setHov(categorias[i].nome)} onMouseLeave={() => setHov(null)}>
                                            {categorias.map(c => (
                                                <Cell key={c.nome} fill={c.cor}
                                                    opacity={hov === null || hov === c.nome ? 1 : 0.2}
                                                    style={{ cursor: "pointer", filter: hov === c.nome ? `drop-shadow(0 0 8px ${c.cor}66)` : "none", transition: "all 0.3s" }} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip total={totalGastos} />} />
                                    </PieChart>
                                </div>
                                <div className="legend-container">
                                    {categorias.sort((a,b) => b.valor - a.valor).map((c, i) => (
                                        <div key={c.nome} onMouseEnter={() => setHov(c.nome)} onMouseLeave={() => setHov(null)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 10, padding: "6px 10px",
                                                borderRadius: 10, marginBottom: 4, background: hov === c.nome ? "#111827" : "transparent",
                                                transition: "background .15s", cursor: "default",
                                            }}>
                                            <AnimatedBar valor={c.valor} total={totalGastos} cor={c.cor} delay={i * 60} />
                                            <span style={{ fontSize: 10, color: "#94a3b8", minWidth: 70, textAlign: "right", fontFamily: "monospace" }}>{fmt(c.valor)}</span>
                                            <span style={{ fontSize: 9, color: c.cor, minWidth: 35, fontWeight: 700 }}>{((c.valor / totalGastos) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>Nenhum gasto registrado.</div>
                        )}
                    </div>
                )}

                {aba === "lista" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {gastos.map((g) => (
                            <div key={g.id}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 14,
                                    background: "#0d1117", border: "1px solid #1e2535",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 4, height: 32, borderRadius: 99, background: g.cor }} />
                                    <div>
                                        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{g.nome}</div>
                                        <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{g.cat}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 14, color: "#f1f5f9", fontWeight: 500 }}>{fmt(g.valor)}</div>
                                    </div>
                                    <button onClick={() => removeGasto(g.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", padding: 6, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="#f87171"} onMouseLeave={e => e.currentTarget.style.color="#334155"}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
                    -webkit-appearance: none; margin: 0;
                }
                input[type=number] { -moz-appearance: textfield; }

                .main-container { max-width: 660px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
                .summary-card { background: #0d111755; padding: 12px; border-radius: 16px; border: 1px solid #1e253533; text-align: center; }
                .summary-label { font-size: 8px; font-weight: 700; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin-bottom: 4px; }
                .salary-input { background: transparent; border: none; color: #34d399; font-size: 18px; font-weight: 600; font-family: monospace; text-align: center; width: 100%; outline: none; padding: 0; }
                
                .add-form { display: flex; gap: 10px; margin-bottom: 24px; padding: 16px; background: #0d111755; border-radius: 16px; border: 1px solid #1e2535; }
                .input-desc { flex: 2; }
                .input-val { flex: 1; }
                .base-input { width: 100%; background: #05070a; border: 1px solid #1e2535; color: #f1f5f9; padding: 12px; border-radius: 10px; font-size: 13px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
                .base-input:focus { border-color: #34d39966; }
                .add-button { height: 42px; width: 42px; border-radius: 10px; background: #34d399; color: #000; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; flex-shrink: 0; }
                .add-button:active { transform: scale(0.95); }

                .chart-grid { display: grid; grid-template-columns: 170px 1fr; gap: 24px; align-items: center; margin-bottom: 20px; }
                
                @media (max-width: 580px) {
                    .summary-grid { grid-template-columns: 1fr 1fr; }
                    .saldo-card { grid-column: span 2; }
                    .add-form { flex-direction: column; }
                    .add-button { width: 100%; height: 48px; }
                    .chart-grid { grid-template-columns: 1fr; justify-items: center; text-align: center; }
                    .pie-container { margin-bottom: -20px; }
                }

                @media (max-width: 400px) {
                    .summary-grid { grid-template-columns: 1fr; }
                    .saldo-card { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
}
