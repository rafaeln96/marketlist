# 📘 Documentação Técnica - Market List

> Documentação detalhada para desenvolvedores que precisam manter ou estender o projeto.

---

## Arquitetura da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Header    │  │    Main     │  │      Scripts        │  │
│  │  (nav-bar)  │  │ (sections)  │  │    (script.js)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
    style.css         DOM Elements         localStorage
```

---

## Estrutura de Dados

### Item Object

```javascript
{
    name: string,      // Nome do produto (ex: "Arroz Integral")
    quantity: number,  // Quantidade (1-100)
    price: number,     // Valor unitário em decimal (ex: 4.50)
    total: number      // Subtotal calculado (quantity * price)
}
```

### itemsArray (Estado Global)

```javascript
let itemsArray = [
    { name: "Arroz", quantity: 2, price: 4.50, total: 9.00 },
    { name: "Feijão", quantity: 1, price: 8.00, total: 8.00 }
];
```

### localStorage Key

- **Chave**: `marketListItems`
- **Valor**: JSON stringificado do `itemsArray`

---

## Fluxo de Dados

### Adicionar Item

```
[Formulário] → addItem() → itemsArray.push() → saveToLocalStorage()
                                             → updateItemList()
                                             → updateTotalValue()
```

### Editar Item

```
[Botão Editar] → editItem(index) → Preenche formulário
                                 → toggleFormButtons(true)
                                 → scrollTo(top)

[Botão Atualizar] → updateItem() → itemsArray[index] = {...}
                                 → saveToLocalStorage()
                                 → toggleFormButtons(false)
```

### Buscar Item

```
[Input Busca] → searchItems(query) → searchQuery = query
                                   → updateItemList() (filtrado)
```

---

## Estrutura HTML

### Seções Principais

```html
<body>
    <header>
        <nav class="nav-bar">...</nav>
        <div class="mobile-menu">...</div>
    </header>
    
    <main>
        <section class="market-list-section">   <!-- Formulário -->
        <section class="item-display-section">  <!-- Lista de itens -->
        <section class="total-display-section"> <!-- Total -->
    </main>
    
    <script src="assets/js/script.js"></script>
</body>
```

### IDs Importantes

| ID | Elemento | Descrição |
|----|----------|-----------|
| `market-list-form` | form | Formulário de entrada |
| `item-name` | input | Campo nome do item |
| `item-quantity` | select | Seletor de quantidade |
| `item-price` | input | Campo de valor |
| `add-item-button` | button | Botão adicionar |
| `update-item-button` | button | Botão atualizar (hidden por padrão) |
| `search-input` | input | Campo de busca |
| `item-list` | div | Container dos cards |
| `total-value` | span | Exibe valor total |

---

## Estrutura CSS

### Variáveis CSS (Custom Properties)

```css
:root {
    /* Cores principais */
    --primary-dark: #1a2634;
    --primary-teal: #20a69a;
    --primary-teal-hover: #1a8a80;
    
    /* Cores de destaque */
    --accent-gold: #d4a534;
    --accent-gold-light: #e8c76a;
    
    /* Cores de ação */
    --danger-red: #dc3545;
    --danger-red-hover: #c82333;
    --success-green: #28a745;
    --success-green-hover: #218838;
    
    /* Backgrounds */
    --bg-light: #e8ecef;
    --bg-white: #ffffff;
    
    /* Texto */
    --text-dark: #333333;
    --text-muted: #666666;
    
    /* Sombras */
    --shadow-light: rgba(0, 0, 0, 0.1);
    --shadow-medium: rgba(0, 0, 0, 0.15);
}
```

### Classes Principais

| Classe | Elemento | Descrição |
|--------|----------|-----------|
| `.nav-bar` | nav | Barra de navegação |
| `.market-list-section` | section | Container do formulário |
| `.item-display-section` | section | Container da lista |
| `.item` | div | Card de item individual |
| `.item-info` | div | Informações do item |
| `.item-actions` | div | Botões de ação |
| `.edit-button` | button | Botão verde editar |
| `.remove-button` | button | Botão vermelho remover |

### Breakpoints

| Largura | Comportamento |
|---------|---------------|
| > 900px | Layout completo, grid 3 colunas |
| 730-900px | Grid 2 colunas no formulário |
| < 730px | Mobile: menu hambúrguer, layout empilhado |

---

## Funções JavaScript Detalhadas

### populateQuantityOptions()

```javascript
// Gera opções 1-100 no select de quantidade
// Chamada: DOMContentLoaded
// Modifica: #item-quantity
function populateQuantityOptions() {
    const quantitySelect = document.getElementById('item-quantity');
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }
}
```

### formatarMoeda(input)

```javascript
// Formata valor monetário durante digitação
// Entrada: "450" → Saída: "4,50"
// Chamada: oninput do campo #item-price
function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    let decimal = (valor / 100).toFixed(2);
    input.value = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(decimal);
}
```

### parseMoeda(valorFormatado)

```javascript
// Converte string BRL para número
// Entrada: "1.234,56" → Saída: 1234.56
function parseMoeda(valorFormatado) {
    if (!valorFormatado) return 0;
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.'));
}
```

### updateItemList()

```javascript
// Renderiza lista de itens
// 1. Limpa container
// 2. Ordena por nome (localeCompare)
// 3. Filtra por searchQuery (se existir)
// 4. Renderiza cards ou estado vazio
function updateItemList() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';
    
    const sortedItems = [...itemsArray].sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    const filteredItems = searchQuery 
        ? sortedItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery))
        : sortedItems;
    
    // ... renderização
}
```

---

## Eventos

### DOMContentLoaded

```javascript
document.addEventListener('DOMContentLoaded', function() {
    populateQuantityOptions();  // Preenche select
    loadFromLocalStorage();      // Carrega dados salvos
    
    // Event listeners
    document.getElementById('market-list-form')
        .addEventListener('submit', addItem);
    document.getElementById('update-item-button')
        .addEventListener('click', updateItem);
});
```

### Eventos Inline (HTML)

| Elemento | Evento | Handler |
|----------|--------|---------|
| `#item-price` | oninput | `formatarMoeda(this)` |
| `#search-input` | oninput | `searchItems(this.value)` |
| `.edit-button` | onclick | `editItem(index)` |
| `.remove-button` | onclick | `removeItem(index)` |
| `.mobile-menu-icon button` | onclick | `menuShow()` |

---

## Segurança

### Prevenção de XSS

```javascript
// Escape de HTML antes de renderizar
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Uso na renderização
`<p><strong>Nome:</strong> <span>${escapeHtml(item.name)}</span></p>`
```

---

## Extensibilidade

### Adicionando Novos Campos

1. Adicione input no HTML (dentro de `.form-row`)
2. Atualize objeto em `addItem()` e `updateItem()`
3. Atualize renderização em `updateItemList()`
4. Estilize no CSS se necessário

### Adicionando Novas Funcionalidades

1. Crie função no `script.js`
2. Adicione event listener ou handler inline
3. Documente neste arquivo
4. Atualize README.md

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Itens não salvam | localStorage desabilitado | Verificar permissões do navegador |
| Busca não funciona | ID incorreto | Verificar `#search-input` |
| Estilo quebrado | Cache do navegador | Ctrl+F5 para hard refresh |
| Menu mobile não abre | JS não carregado | Verificar console |

---

## Changelog

### [2.0.1] - 2026-01-24
- Layout do section-header centralizado
- Removido max-height e overflow do item-list
- Adicionado min-height e justify-content ao item-list

### [2.0.0] - 2026-01-24
- Redesign completo da interface
- Adicionada busca de itens
- Implementado localStorage
- Sistema de notificações
- Prevenção de XSS

### [1.0.0] - Versão inicial
- CRUD básico de itens
- Interface original
