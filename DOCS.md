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
    type: string,      // "unit" ou "weight"
    quantity: number,  // Quantidade (1-100)
    price: number,     // Valor unitário (apenas se type="unit")
    pricePerKg: number,// Valor por Kg (apenas se type="weight")
    weight: number,    // Peso decimal (apenas se type="weight")
    total: number      // Subtotal calculado
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
### Remover Item
    
```
[Botão Remover] → removeItem(index) → pendingRemovalIndex = index
                                    → modal.style.display = 'flex'
    
[Modal: Confirmar] → confirmRemoval() → itemsArray.splice()
                                      → saveToLocalStorage()
                                      → closeModal()
                                      → showNotification()
                                      
[Modal: Cancelar] → closeModal() → Oculta modal
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
    <main>
        <section class="market-list-section">   <!-- Formulário -->
        <section class="item-display-section">  <!-- Lista de itens -->
        <section class="total-display-section"> <!-- Total -->
    </main>

    <!-- Modal de Confirmação -->
    <div id="confirmation-modal">...</div>
    
    <script src="assets/js/script.js"></script>
</body>
```

### IDs Importantes

| ID | Elemento | Descrição |
|----|----------|-----------|
| `market-list-form` | form | Formulário de entrada |
| `mode-unit-btn`/`mode-weight-btn` | button | Alternadores de modo de entrada |
| `item-name`/`item-name-weight` | input | Campos nome do item |
| `item-quantity`/`-weight` | input | Campos de quantidade (numérico) |
| `item-price`/`item-price-kg` | input | Campos de valor (moeda) |
| `item-weight` | input | Campo de peso (Kg) |
| `add-item-button` | button | Botão adicionar |
| `update-item-button` | button | Botão atualizar |
| `search-input` | input | Campo de busca |
| `item-list` | div | Container dos cards |
| `total-value` | span | Exibe valor total |
| `export-pdf-button` | button | Botão para gerar PDF |

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

### Campo de Quantidade

```javascript
// O campo de quantidade agora usa <input type="number"> com valor padrão 1
// Permite entrada livre de quantidade pelo usuário
<input type="number" id="item-quantity" value="1" min="1">

// Após adicionar ou atualizar item, o campo é resetado para '1'
document.getElementById('item-quantity').value = '1';
```

> **Nota:** A função `populateQuantityOptions()` foi removida pois não é mais necessária com o uso de input numérico.

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

### [3.0.2] - 2026-02-04
- 🔧 Fix: Campo "Qtd" da Lista Rápida agora empilha corretamente abaixo do nome em mobile
- 📱 Fix: Adicionado breakpoint para tablets (iPad Air ~820px) com layout responsivo
- 📐 Fix: Container da lista agora cresce dinamicamente com os itens (removido min-height fixo)
- 🔄 Refactor: Campo de quantidade na página inicial alterado de dropdown (select) para input numérico livre
- 🌍 i18n: Todos os comentários do código traduzidos de inglês para português
- 🎴 Clean: Removida função `populateQuantityOptions()` obsoleta

### [3.0.1] - 2026-02-03
- 🎨 Feat: Header redesenhado - logo alinhado à esquerda, navegação centralizada
- 📱 Fix: Layout mobile do hamburger menu restaurado (à direita)
- 📱 Fix: Botões de ação alinhados com texto dos itens no mobile
- 📱 Fix: Título "Sua Lista" centralizado no mobile

### [3.0.0] - 2026-02-03
- 🆕 Feat: Nova página **Lista Rápida** (`lista-rapida.html`) para adicionar itens rapidamente durante as compras
- 🆕 Feat: Suporte a itens por Unidade ou Peso (Kg) na Lista Rápida
- 🆕 Feat: Itens exibidos em container estilo "nota fiscal" com ordenação alfabética
- 🆕 Feat: Marcar items como "pego" (riscado em vermelho)
- 🆕 Feat: Botão "Limpar Tudo" com modal de confirmação
- 🆕 Feat: Persistência via localStorage
- 🗑️ Removed: Página da Calculadora substituída por Lista Rápida
- 🗑️ Removed: Botão "Entrar" removido de todas as páginas

### [2.3.1] - 2026-01-24
- 🐛 Fix: Posicionamento do pop-up de notificação em dispositivos móveis corrigido para o topo da tela.
- ✨ Feat: Substituição do `confirm()` nativo por um Modal de Confirmação Personalizado estilizado.
- 📱 Fix: Ajuste de regras CSS conflitantes que esticavam notificações no mobile.

### [2.3.0] - 2026-01-24
- Suporte a itens por Peso (Kg) com botões de modo
- Geração de PDF profissional com jsPDF e AutoTable
- Design System do PDF sincronizado com as variáveis CSS
- Grid Layout 3-colunas no header da lista

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
