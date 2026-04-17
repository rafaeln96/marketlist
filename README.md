# 🛒 Market List

Uma aplicação web para gerenciamento de lista de compras de mercado, desenvolvida com HTML, CSS e JavaScript puros.

> **Última atualização:** 17 de Fevereiro de 2026

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
- ✨ **Busca Visual:** Dropdown de fotos inteligente com rolagem lateral que funciona como filtro
- 📸 **Fotos Inline (S/ APIs)**: Tire fotos dos itens usando a câmera ou anexo com nomes opcionais
- 🚨 **Validação Visual de Erros**: Feedback imersivo via bordas vermelhas nos campos esquecidos
- 📦 **Suporte a itens por Peso (Kg)**
- 📄 **Exportação PDF Profissional** com agrupamento inteligente
- 📱 Responsividade 100% para dispositivos móveis
- 🆕 **Lista Rápida**: Adicione itens rapidamente durante as compras
- 🆕 **Limpar Tudo**: Botão para limpar toda a lista com confirmação
- 🆕 **Edição na Lista Rápida**: Edite itens já adicionados com botão de lápis
- 📱 **Teclado numérico**: Campos de números abrem teclado numérico no mobile

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
├── index.html              # Página principal (lista de compras)
├── lista-rapida.html       # Página da lista rápida
├── sobre.html              # Página sobre o projeto
├── README.md               # Esta documentação
├── DOCS.md                 # Documentação técnica detalhada
└── assets/
    ├── css/
    │   └── style.css       # Estilos da aplicação
    ├── js/
    │   ├── script.js       # Lógica da lista de compras
    │   └── lista-rapida.js # Lógica da lista rápida
    └── img/
        └── (ícones legados)
```

> **Nota**: Os ícones em `/assets/img/` são legados. O projeto atualmente usa ícones SVG inline no HTML.

---

## ⚡ Funcionalidades

### 1. Adicionar Itens
- **Modos**: Unidade ou Peso (Kg)
- Campos: Nome, Qtd (entrada livre), Preço Un/Kg, Peso (se modo peso)
- Formatação automática de moeda (R$) e peso (0,000)

### 2. Editar Itens
- Carrega dados preservando o modo (unidade/peso)
- Alterna botão para "Atualizar Item"
- Rolagem suave para o topo

### 3. Remover Itens
- Remove item do array e localStorage
- **Modal Personalizado**: Confirmação visual elegante (sem alertas nativos)

### 4. Busca Visual e Filtros
- Barra de busca dinâmica para filtrar por nomes
- Galeria tipo carrossel (Scroll Lateral) de miniaturas para todos os produtos com foto
- Ao clicar na miniatura, aplica-se um filtro exclusivo no item correspondente e ele pisca na tela para fácil visualização

### 5. Exportação PDF
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
| `parseMoeda(valor)` | Converte string formatada ("1.234,56") para número |
| `formatarMoeda(input)` | Formata input para padrão BRL durante digitação |
| `formatarPeso(input)` | Formata campo de peso para 3 casas decimais |
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

### v3.0.3 (17/02/2026)
- 🆕 **Limpar Tudo na Index**: Botão para limpar toda a lista de compras com modal de confirmação, alinhado ao título
- 🆕 **Edição na Lista Rápida**: Itens podem ser editados com botão de lápis — formulário alterna para modo Atualizar/Cancelar
- 🔒 **Bloqueio de Letras**: Campos numéricos (preço, peso, quantidade) não aceitam mais letras
- 📱 **Teclado Numérico Mobile**: Atributos `inputmode` garantem teclado numérico/decimal em dispositivos móveis
- 🔄 **Modal Dinâmico**: Modal de confirmação reutilizado com textos dinâmicos para diferentes ações

### v3.0.2 (04/02/2026)
- 🔧 **Campo de Quantidade Livre**: Alterado de dropdown (1-100) para input numérico com entrada livre
- 📱 **Correção Responsiva**: Campo "Qtd" da Lista Rápida agora empilha corretamente abaixo do nome em dispositivos móveis
- 📱 **Suporte a Tablets**: Adicionado breakpoint para iPad Air (~820px) com layout otimizado
- 📐 **Lista Dinâmica**: Container da lista agora cresce automaticamente conforme itens são adicionados
- 🌍 **Tradução de Comentários**: Todos os comentários do código traduzidos de inglês para português
- 🧹 Limpeza de código obsoleto (removida função `populateQuantityOptions()`)

### v2.3.1 (24/01/2026)
- ✨ **Modal de Confirmação Personalizado**: Substituição dos alertas nativos por modais modernos (glassmorphism)
- 🐛 **Correção Mobile**: Ajuste no posicionamento das notificações toast em telas pequenas
- 📱 Melhoria na experiência de exclusão de itens

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
