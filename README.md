# 🛒 Market List

Uma aplicação web para gerenciamento de lista de compras de mercado, desenvolvida com HTML, CSS e JavaScript puros.

> **Última atualização:** 24 de Janeiro de 2026

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Guia de Estilos](#-guia-de-estilos)
- [Referência de Funções JavaScript](#-referência-de-funções-javascript)
- [Como Executar](#-como-executar)
- [Contribuição](#-contribuição)

---

## 🎯 Visão Geral

O **Market List** é uma aplicação web que permite aos usuários criar e gerenciar listas de compras de mercado. Os usuários podem adicionar itens com nome, quantidade e valor unitário, e a aplicação calcula automaticamente o subtotal de cada item e o valor total da lista.

### Principais Características

- ✅ Interface moderna e responsiva (mobile-first)
- ✅ Cálculo automático de valores
- ✅ Busca de itens em tempo real
- ✅ Persistência de dados (localStorage)
- ✅ Ordenação alfabética automática
- ✅ Notificações visuais de feedback
- ✨ Validação de duplicidade de itens (case-insensitive)
- ✨ Contador de itens ao lado do total
- ✨ Efeito glassmorphism na calculadora
- 📦 **Suporte a itens por Peso (Kg)**
- 📄 **Exportação PDF Profissional** com agrupamento inteligente
- 📱 Responsividade 100% para dispositivos móveis

---

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| HTML5 | - | Estrutura semântica da página |
| CSS3 | - | Estilização com variáveis CSS e animações |
| JavaScript | ES6+ | Lógica da aplicação (vanilla, sem frameworks) |
| jsPDF | 2.5.1 | Geração de documentos PDF |
| AutoTable | 3.5.23 | Tabelas profissionais no PDF |
| Google Fonts | Poppins | Tipografia moderna |

> ⚠️ **Importante**: O projeto deve manter o uso exclusivo de HTML, CSS e JavaScript puros para compatibilidade com hospedagem estática no GitHub Pages.

---

## 📁 Estrutura do Projeto

```
marketlist-main/
├── index.html              # Página principal da aplicação
├── calculadora.html        # Página da calculadora
├── sobre.html              # Página sobre o projeto
├── README.md               # Esta documentação
├── DOCS.md                 # Documentação técnica detalhada
└── assets/
    ├── css/
    │   └── style.css       # Estilos da aplicação
    ├── js/
    │   ├── script.js       # Lógica da lista de compras
    │   └── calculadora.js  # Lógica da calculadora
    └── img/
        └── (ícones legados)
```

> **Nota**: Os ícones em `/assets/img/` são legados. O projeto atualmente usa ícones SVG inline no HTML.

---

## ⚡ Funcionalidades

### 1. Adicionar Itens
- **Modos**: Unidade ou Peso (Kg)
- Campos: Nome, Qtd (1-100), Preço Un/Kg, Peso (se modo peso)
- Formatação automática de moeda (R$) e peso (0,000)

### 2. Editar Itens
- Carrega dados preservando o modo (unidade/peso)
- Alterna botão para "Atualizar Item"
- Rolagem suave para o topo

### 3. Remover Itens
- Remove item do array e localStorage
- Notificação de confirmação (confirm)

### 4. Exportação PDF
- **Design Premium**: Cores do site e efeito glassmorphism
- **Agrupamento**: Tabelas separadas por tipo de item
- **Resumo**: Valor total e contador destacados

### 5. Buscar Itens
- Filtro em tempo real por nome
- Campo de busca na seção de itens

### 6. Persistência
- Dados salvos automaticamente no localStorage
- Carregamento automático ao abrir a página

### 7. Cálculos Automáticos
- Subtotal dinâmico (Qtd × Preço ou Preço/Kg × Peso)
- Total geral e contador de itens real-time

---

## 🎨 Guia de Estilos

### Paleta de Cores

| Variável CSS | Valor | Uso |
|--------------|-------|-----|
| `--primary-dark` | `#1a2634` | Header, elementos escuros |
| `--primary-teal` | `#20a69a` | Botões principais, destaques |
| `--accent-gold` | `#d4a534` | Bordas dos cards |
| `--danger-red` | `#dc3545` | Botão remover, valor total |
| `--success-green` | `#28a745` | Botão editar, atualizar |
| `--bg-light` | `#e8ecef` | Fundo da página |

### Tipografia

- **Fonte**: Poppins (Google Fonts)
- **Pesos utilizados**: 300, 400, 500, 600, 700

### Componentes

#### Cards de Item
- Borda dourada com efeito zigzag (CSS)
- Hover com elevação e sombra
- Animação de entrada (fadeIn)

#### Botões
- Border-radius: 6-8px
- Transições suaves (0.3s)
- Estados: default, hover, focus

---

## 📖 Referência de Funções JavaScript

### Utilitárias

| Função | Descrição |
|--------|-----------|
| `populateQuantityOptions()` | Gera opções 1-100 no select de quantidade |
| `parseMoeda(valor)` | Converte string formatada ("1.234,56") para número |
| `formatarMoeda(input)` | Formata input para padrão BRL durante digitação |
| `escapeHtml(text)` | Previne XSS escapando caracteres HTML |

### CRUD

| Função | Descrição |
|--------|-----------|
| `addItem(event)` | Adiciona novo item ao array e localStorage |
| `updateItem(event)` | Atualiza item existente pelo índice |
| `removeItem(index)` | Remove item do array e localStorage |
| `editItem(index)` | Carrega item no formulário para edição |

### Display

| Função | Descrição |
|--------|-----------|
| `updateItemList()` | Renderiza lista de itens (ordenada e filtrada) |
| `updateTotalValue()` | Calcula e exibe o valor total |
| `showNotification(msg, type)` | Exibe notificação toast (success/error/info) |
| `searchItems(query)` | Filtra itens por nome |

### Persistência

| Função | Descrição |
|--------|-----------|
| `saveToLocalStorage()` | Salva itemsArray no localStorage |
| `loadFromLocalStorage()` | Carrega itens salvos ao iniciar |

### UI

| Função | Descrição |
|--------|-----------|
| `toggleFormButtons(isEditing)` | Alterna entre botões Adicionar/Atualizar |
| `menuShow()` | Toggle do menu mobile |

---

## 🚀 Como Executar

### Localmente
1. Clone o repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno

### GitHub Pages
O projeto está configurado para deploy automático via GitHub Pages:
- URL: `https://rafaeln96.github.io/marketlist-main`

---

## 🔄 Histórico de Atualizações

### v2.3.0 (24/01/2026)
- ✨ **Suporte a itens por Peso (Kg)** com cálculo dinâmico
- ✨ **Exportação PDF Profissional** com agrupamento e design glassmorphism
- 🎨 Refinamento do Layout Grid (3 colunas) para centralização de títulos
- 📱 Melhoria na responsividade do cabeçalho e empilhamento mobile

### v2.2.0 (24/01/2026)
- ✨ Validação de duplicidade de itens (case-insensitive)
- ✨ Contador de itens ao lado do total
- ✨ Efeito glassmorphism na calculadora
- 📱 Responsividade 100% para dispositivos móveis

### v2.1.0 (24/01/2026)
- ✨ Valor total movido para o header da seção
- ✨ Nova página de Calculadora
- 🎨 Links de navegação funcionais

### v2.0.2 (24/01/2026)
- 🎨 Cards com scroll horizontal
- ✨ Botão "Cancelar" na edição

### v2.0.1 (24/01/2026)
- 🎨 Layout otimizado

### v2.0.0 (24/01/2026)
- ✨ Redesign completo da interface
- ✨ Busca, persistência, notificações
- 🔒 Segurança XSS

### v1.0.0 (Versão inicial)
- Funcionalidades básicas de CRUD

---

## 🤝 Contribuição

Ao contribuir com o projeto, siga estas diretrizes:

1. **Mantenha a stack**: HTML, CSS e JavaScript puros apenas
2. **Atualize a documentação**: Sempre atualize este README ao fazer alterações
3. **Siga o guia de estilos**: Use as variáveis CSS definidas
4. **Teste responsividade**: Verifique em telas < 730px

---

## 📄 Licença

Este projeto é de código aberto e disponível para uso educacional e pessoal.
