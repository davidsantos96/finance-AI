import { Plus } from "lucide-react";
import { fmt } from "../utils/currency";

export default function AddExpenseForm({ novoGasto, onChange, onSubmit, inputDescRef }) {
    return (
        <form onSubmit={onSubmit} className="add-form">
            <div className="input-desc">
                <input
                    ref={inputDescRef}
                    placeholder="Descrição do gasto..."
                    value={novoGasto.nome}
                    onChange={e => onChange({ ...novoGasto, nome: e.target.value })}
                    className="base-input"
                />
            </div>
            <div className="input-val">
                <input
                    type="text"
                    placeholder="Valor"
                    value={novoGasto.valor === "" || novoGasto.valor === 0 ? "R$ 0,00" : fmt(novoGasto.valor)}
                    onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "");
                        onChange({ ...novoGasto, valor: raw ? parseInt(raw, 10) : 0 });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="base-input"
                />
            </div>
            <button type="submit" className="add-button">
                <Plus size={22} />
            </button>
        </form>
    );
}
