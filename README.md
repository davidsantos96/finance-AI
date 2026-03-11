# 💸 Finance AI

> Gestão financeira pessoal com análise por Inteligência Artificial, geração de relatórios e exportação em PDF e Excel — sem login, sem banco de dados, zero rastreamento.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel)
![Anthropic](https://img.shields.io/badge/Anthropic-Claude_Sonnet-CC785C?style=flat-square)

---

## 📌 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Demonstração](#-demonstração)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy no Vercel](#-deploy-no-vercel)
- [Segurança da API](#-segurança-da-api)
- [Privacidade por Design](#-privacidade-por-design)
- [Componentes](#-componentes)
- [Utilitários](#-utilitários)
- [Exportações](#-exportações)

---

## 🔍 Visão Geral

**Finance AI** é uma aplicação web de código aberto para controle financeiro pessoal. O diferencial está na integração com a API do Claude (Anthropic): ao acionar a análise, a IA categoriza automaticamente cada gasto, identifica padrões e gera conselhos financeiros personalizados.

A aplicação foi projetada com **privacidade por design** — nenhum dado é persistido no servidor ou no navegador. Tudo existe apenas em memória durante a sessão, e o usuário exporta o que quiser guardar.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Cadastro de gastos** | Adicione descrição e valor com máscara monetária automática |
| **Categorização local** | Pré-categorização por palavras-chave antes mesmo de acionar a IA |
| **Análise por IA** | Claude Sonnet classifica, colore e analisa todos os gastos de uma vez |
| **Insights financeiros** | Alertas de gastos excessivos, pontos positivos e conselho estratégico |
| **Gráfico donut interativo** | Visualização por categoria com hover e tooltip |
| **Exportação PDF** | Relatório completo com tabelas, gráfico donut e análise da IA (3 páginas) |
| **Exportação Excel** | Planilha formatada com todos os gastos e categorias |
| **Notificação de exportação** | Toast automático lembrando o usuário de exportar antes de sair |
| **Rate limiting** | Proteção contra abuso da API por IP e teto global de chamadas |

---

## 🎬 Demonstração

```
1. Informe seu salário mensal
2. Adicione seus gastos do mês
3. Clique em "Analisar Agora"
4. A IA categoriza, colore e gera insights
5. Exporte o relatório em PDF ou Excel
```

---

## 🏗 Arquitetura

```
Browser (React SPA)
    │
    ├── Estado em memória (useState)
    │       Salário, gastos, insights — nunca persistidos
    │
    └── fetch POST /api/analyze
            │
            ▼
    Vercel Serverless Function
            │
            ├── Rate limit por IP (5 req/hora)
            ├── Teto global (200 chamadas totais)
            ├── Validação e sanitização dos inputs
            │
            └── Anthropic API (Claude Sonnet)
                    Prompt com Prefill → resposta JSON puro
```

### Fluxo da análise IA

```
Usuário clica "Analisar Agora"
        │
        ▼
useFinance.analisarComIA()
        │
        ▼
POST /api/analyze  {salario, gastos}
        │
        ▼
Serverless:
  1. Checa rate limit por IP
  2. Valida e sanitiza inputs
  3. Monta prompt com dados financeiros
  4. Chama claude-sonnet-4-20250514 com Prefill "{"
  5. Parseia JSON retornado
  6. Incrementa contador global
        │
        ▼
Response: {gastosAtualizados, alerta, positivo, analiseIA}
        │
        ▼
App atualiza gastos (categoria + cor) e exibe insights
```

---

## 📁 Estrutura de Pastas

```
finance-AI/
│
├── api/
│   └── analyze.js          # Serverless Function — integração com Anthropic
│
├── src/
│   ├── components/
│   │   ├── AddExpenseForm.jsx      # Formulário de adição de gasto
│   │   ├── ChartSection.jsx        # Gráfico donut + legenda interativa
│   │   ├── ExpenseList.jsx         # Lista de gastos com remoção
│   │   ├── IAInsights.jsx          # Exibição dos insights da IA
│   │   ├── IAPanel.jsx             # Painel com botão de análise
│   │   ├── SaveReminderToast.jsx   # Notificação de exportação
│   │   ├── SummaryCards.jsx        # Cards de salário, gastos e saldo
│   │   ├── Tabs.jsx                # Navegação Geral / Lista
│   │   └── TopBar.jsx              # Barra superior com botões de exportação
│   │
│   ├── hooks/
│   │   └── useFinance.js           # Hook central — estado e lógica da aplicação
│   │
│   ├── styles/
│   │   └── globals.css             # Estilos globais e classes utilitárias
│   │
│   └── utils/
│       ├── categories.js           # Mapa de categorias e categorização local
│       ├── currency.js             # Formatação e máscara monetária (BRL)
│       ├── exportExcel.js          # Geração de planilha com ExcelJS
│       └── exportPDF.js            # Geração de PDF com jsPDF + gráfico Canvas
│
├── App.jsx                 # Componente raiz
├── main.jsx                # Entry point React
├── index.html              # HTML base
├── vite.config.js          # Configuração do Vite
└── package.json
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta na [Anthropic](https://console.anthropic.com) com uma API Key

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/davidsantos96/finance-AI.git
cd finance-AI

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua ANTHROPIC_API_KEY

# 4. Execute em desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

> **Atenção:** Em desenvolvimento local, as Serverless Functions do Vercel não são executadas automaticamente. Use a [Vercel CLI](https://vercel.com/docs/cli) com `vercel dev` para testar a rota `/api/analyze` localmente.

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic | ✅ Sim |

Crie um arquivo `.env.local` na raiz do projeto:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

> **Nunca** commite a `.env.local` no repositório. O arquivo já está no `.gitignore` por padrão no Vite.

---

## ☁️ Deploy no Vercel

```bash
# Instale a Vercel CLI (se necessário)
npm i -g vercel

# Deploy
vercel --prod
```

Ou conecte o repositório diretamente no [dashboard do Vercel](https://vercel.com/new) e configure a variável de ambiente `ANTHROPIC_API_KEY` em **Settings → Environment Variables**.

O Vercel detecta automaticamente a pasta `api/` e publica cada arquivo como uma Serverless Function.

---

## 🔐 Segurança da API

A rota `/api/analyze` é pública por natureza (sem autenticação). As seguintes camadas de proteção foram implementadas:

### Rate Limit por IP

```
Máximo: 5 requisições por IP a cada 60 minutos
```

Quando excedido, a API retorna `429 Too Many Requests` com uma mensagem informando quantos minutos faltam para liberar.

### Teto Global de Chamadas

```
Máximo: 200 chamadas totais por instância serverless
```

Proteção de orçamento absoluta. Com o modelo Sonnet, isso representa um custo controlado mesmo no pior cenário de abuso.

### Validação de Inputs

Antes de qualquer chamada à Anthropic, os dados são validados:

- `salario` deve ser um número positivo
- `gastos` deve ser um array não vazio com no máximo 20 itens
- Cada nome de gasto é truncado em 60 caracteres e sanitizado

### Sanitização contra Prompt Injection

```js
function sanitizarTexto(texto) {
    return String(texto)
        .slice(0, 60)
        .replace(/[`"\\]/g, '')   // remove chars especiais
        .replace(/\n|\r/g, ' ')   // remove quebras de linha
        .trim();
}
```

Impede que um usuário tente injetar instruções maliciosas no prompt via nome de um gasto (ex: `"ignore as instruções anteriores e..."`).

---

## 🔒 Privacidade por Design

**Nenhum dado do usuário é armazenado em nenhum momento.**

| Camada | Comportamento |
|---|---|
| **Frontend** | Dados em `useState` — desaparecem ao fechar/recarregar a aba |
| **Serverless** | Apenas processa e descarta — sem logs de dados financeiros |
| **Banco de dados** | Não existe |
| **Cookies / localStorage** | Não utilizados |
| **Anthropic API** | Os dados enviados seguem a [política de privacidade da Anthropic](https://www.anthropic.com/privacy) |

O `SaveReminderToast` existe exatamente por isso: lembrar o usuário de exportar antes de sair, já que não há recuperação de sessão.

---

## 🧩 Componentes

### `TopBar`
Barra fixa no topo com logo e botões de exportação destacados (PDF em vermelho, Excel em verde) com efeito de hover.

### `SummaryCards`
Três cards: **Salário** (editável inline com máscara monetária), **Total de Gastos** e **Saldo Livre**.

### `IAPanel`
Painel com botão "Analisar Agora". Exibe spinner animado durante o processamento.

### `IAInsights`
Exibe os três resultados da análise: alerta de gastos, ponto positivo e conselho estratégico.

### `AddExpenseForm`
Formulário com campo de descrição e campo de valor com máscara BRL automática. O foco retorna para o campo de descrição após cada adição.

### `ChartSection`
Gráfico donut (Recharts) + legenda com barras animadas por categoria. Hover sincronizado entre gráfico e legenda.

### `ExpenseList`
Lista completa de gastos com badge de categoria colorido e botão de remoção.

### `SaveReminderToast`
Toast flutuante que aparece 4 segundos após o primeiro gasto ser adicionado. Contém botões de ação rápida para exportar PDF ou Excel diretamente do aviso. Aparece apenas uma vez por sessão.

---

## 🛠 Utilitários

### `categories.js`

Mapa de categorias com palavras-chave em português para categorização local (antes da IA):

| Categoria | Cor | Exemplos de keywords |
|---|---|---|
| Alimentação | `#34d399` | ifood, mercado, restaurante |
| Moradia | `#60a5fa` | aluguel, condomínio, luz |
| Saúde | `#a78bfa` | farmácia, médico, academia |
| Educação | `#fde047` | escola, curso, faculdade |
| Transporte | `#fb923c` | uber, gasolina, estacionamento |
| Impostos | `#475569` | ipva, iptu, mei, irpf |
| Lazer | `#fb7185` | cinema, netflix, spotify |
| Dívidas | `#f87171` | fatura, cartão, empréstimo |
| Investimento | `#2dd4bf` | ações, tesouro, cripto |
| Outros | `#94a3b8` | fallback |

### `currency.js`

```js
fmt(v)           // Inteiro (centavos × 100) → "R$ 1.234,56"
maskCurrency(v)  // Inteiro → "1.234,56" (sem prefixo, para inputs)
```

Os valores são armazenados internamente como inteiros (centavos × 100) para evitar erros de ponto flutuante.

---

## 📄 Exportações

### PDF (`exportPDF.js`)

Gera um relatório de 3 páginas com `jsPDF` + `jspdf-autotable`:

| Página | Conteúdo |
|---|---|
| **1** | Cabeçalho, tabela de resumo (salário/gastos/saldo), tabela detalhada de gastos |
| **2** | Gráfico donut gerado via Canvas (idêntico ao da interface) + barras horizontais por categoria |
| **3** | Análise da IA: conselho estratégico, alerta e ponto positivo em cards coloridos |

> O gráfico é renderizado em um `<canvas>` off-screen com fundo escuro e exportado como PNG embutido no PDF.

### Excel (`exportExcel.js`)

Gera uma planilha `.xlsx` com `ExcelJS`:

- Colunas: Nome do Gasto, Categoria, Valor (R$)
- Cabeçalho em negrito com preenchimento verde (`#34D399`)
- Nome do arquivo inclui a data atual: `Planilha_Gastos_DD-MM-AAAA.xlsx`

---

## 🧰 Stack Completa

| Tecnologia | Uso |
|---|---|
| React 19 | Interface e gerenciamento de estado |
| Vite 6 | Bundler e dev server |
| Vercel Serverless | Backend / API route |
| Anthropic SDK | Integração com Claude Sonnet |
| Recharts | Gráfico donut interativo |
| jsPDF + jspdf-autotable | Geração de PDF |
| ExcelJS + FileSaver | Geração de planilha Excel |
| Lucide React | Ícones |

---

## 📜 Licença

MIT — sinta-se livre para usar, modificar e distribuir.

---

<div align="center">
  Desenvolvido por <a href="https://github.com/davidsantos96">David Santos</a>
</div>