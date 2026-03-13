import { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { fmt } from "../utils/currency";

function EditRow({ gasto, onSave, onCancel }) {
    const [nome, setNome] = useState(gasto.nome);
    const [valor, setValor] = useState(gasto.valor);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const salvar = () => {
        if (!nome.trim() || !valor) return;
        onSave({ nome: nome.trim(), valor });
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") salvar();
        if (e.key === "Escape") onCancel();
    };

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 14,
            background: "#111827",
            border: `1px solid ${gasto.cor}55`,
            boxShadow: `0 0 12px ${gasto.cor}18`,
        }}>
            {/* Barra de cor */}
            <div style={{ width: 4, height: 32, borderRadius: 99, background: gasto.cor, flexShrink: 0 }} />

            {/* Campo nome */}
            <input
                ref={inputRef}
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Descrição"
                style={{
                    flex: 1, background: "#1e2535", border: "1px solid #334155",
                    borderRadius: 8, padding: "6px 10px", color: "#e2e8f0",
                    fontSize: 13, fontWeight: 600, outline: "none",
                    transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = gasto.cor}
                onBlur={e => e.target.style.borderColor = "#334155"}
            />

            {/* Campo valor */}
            <input
                value={fmt(valor)}
                onChange={e => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setValor(raw ? parseInt(raw, 10) : 0);
                }}
                onFocus={e => { e.target.select(); e.target.style.borderColor = gasto.cor; }}
                onBlur={e => e.target.style.borderColor = "#334155"}
                onKeyDown={onKeyDown}
                style={{
                    width: 110, background: "#1e2535", border: "1px solid #334155",
                    borderRadius: 8, padding: "6px 10px", color: "#f1f5f9",
                    fontSize: 13, fontFamily: "monospace", outline: "none",
                    textAlign: "right", transition: "border-color .15s",
                }}
            />

            {/* Confirmar */}
            <button
                onClick={salvar}
                title="Salvar"
                style={{
                    background: "#22c55e22", border: "1px solid #22c55e55",
                    borderRadius: 8, color: "#22c55e", cursor: "pointer",
                    padding: "5px 8px", lineHeight: 1, transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#22c55e44"}
                onMouseLeave={e => e.currentTarget.style.background = "#22c55e22"}
            >
                <Check size={15} />
            </button>

            {/* Cancelar */}
            <button
                onClick={onCancel}
                title="Cancelar"
                style={{
                    background: "#f8717122", border: "1px solid #f8717155",
                    borderRadius: 8, color: "#f87171", cursor: "pointer",
                    padding: "5px 8px", lineHeight: 1, transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8717144"}
                onMouseLeave={e => e.currentTarget.style.background = "#f8717122"}
            >
                <X size={15} />
            </button>
        </div>
    );
}

export default function ExpenseList({ gastos, onRemove, onEdit }) {
    const [editandoId, setEditandoId] = useState(null);

    if (gastos.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                Nenhum lançamento ainda.
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gastos.map(g => {

                if (editandoId === g.id) {
                    return (
                        <EditRow
                            key={g.id}
                            gasto={g}
                            onSave={(campos) => {
                                onEdit(g.id, campos);
                                setEditandoId(null);
                            }}
                            onCancel={() => setEditandoId(null)}
                        />
                    );
                }

                return (
                    <div
                        key={g.id}
                        style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px", borderRadius: 14,
                            background: "#0d1117", border: "1px solid #1e2535",
                            transition: "border-color .2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2535"}
                    >
                        {/* Info */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 4, height: 32, borderRadius: 99, background: g.cor }} />
                            <div>
                                <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
                                    {g.nome}
                                </div>
                                <div style={{
                                    fontSize: 9, color: "#475569",
                                    textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5,
                                }}>
                                    {g.cat}
                                </div>
                            </div>
                        </div>

                        {/* Ações */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{
                                fontFamily: "monospace", fontSize: 14,
                                color: "#f1f5f9", fontWeight: 500, marginRight: 10,
                            }}>
                                {fmt(g.valor)}
                            </div>

                            {/* Editar */}
                            <button
                                onClick={() => setEditandoId(g.id)}
                                title="Editar lançamento"
                                style={{
                                    background: "none", border: "none",
                                    color: "#334155", cursor: "pointer",
                                    padding: 6, borderRadius: 6,
                                    transition: "color .15s, background .15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = "#60a5fa";
                                    e.currentTarget.style.background = "#60a5fa18";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = "#334155";
                                    e.currentTarget.style.background = "none";
                                }}
                            >
                                <Pencil size={15} />
                            </button>

                            {/* Remover */}
                            <button
                                onClick={() => onRemove(g.id)}
                                title="Remover lançamento"
                                style={{
                                    background: "none", border: "none",
                                    color: "#334155", cursor: "pointer",
                                    padding: 6, borderRadius: 6,
                                    transition: "color .15s, background .15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = "#f87171";
                                    e.currentTarget.style.background = "#f8717118";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = "#334155";
                                    e.currentTarget.style.background = "none";
                                }}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}