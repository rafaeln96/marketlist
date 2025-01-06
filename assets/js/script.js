let itemsArray = []; // Array para armazenar os itens

// Gera opções para o seletor de quantidade (1 a 100)
function populateQuantityOptions() {
    const quantitySelect = document.getElementById('item-quantity');
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }
}

// Converte o valor formatado (ex.: 1.234,56) para um número decimal
function parseMoeda(valorFormatado) {
    if (!valorFormatado) return 0;
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.'));
}

// Formata o valor como moeda durante a digitação
function formatarMoeda(input) {
    // Remove todos os caracteres que não sejam números
    let valor = input.value.replace(/\D/g, '');
    
    // Converte para um valor decimal dividido por 100
    let decimal = (valor / 100).toFixed(2);

    // Formata o número no padrão brasileiro (com vírgula e pontos)
    let formatado = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(decimal);

    // Atualiza o valor do campo
    input.value = formatado;
}

// Adiciona um item à lista e calcula o valor total
function addItem(event) {
    event.preventDefault();

    const itemName = document.getElementById('item-name').value;
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseMoeda(document.getElementById('item-price').value); // Usa a função parseMoeda

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const itemTotal = itemQuantity * itemPrice;
    
    // Cria um objeto para o item
    const item = {
        name: itemName,
        quantity: itemQuantity,
        price: itemPrice,
        total: itemTotal
    };

    // Adiciona o item ao array
    itemsArray.push(item);

    // Atualiza a exibição dos itens
    updateItemList();
    
    // Atualiza o valor total após adicionar o item
    updateTotalValue();

    // Limpa o formulário após adicionar o item
    document.getElementById('market-list-form').reset();
}

// Remove um item da lista e atualiza o valor total
function removeItem(index) {
    itemsArray.splice(index, 1); // Remove o item do array
    updateItemList(); // Atualiza a lista
    updateTotalValue(); // Atualiza o valor total após remover o item
}

// Atualiza a lista de itens e organiza em ordem alfabética
function updateItemList() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = ''; // Limpa a lista atual

    // Ordena o array por nome
    itemsArray.sort((a, b) => a.name.localeCompare(b.name));

    itemsArray.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <strong>Nome:</strong> ${item.name}<br>
            <strong>Quantidade:</strong> ${item.quantity}<br>
            <strong>Valor Unitário:</strong> R$ ${item.price.toFixed(2).replace('.', ',')}<br>
            <strong>Total:</strong> R$ ${item.total.toFixed(2).replace('.', ',')}
            <button onclick="removeItem(${index})">Remover</button>
        `;
        itemList.appendChild(itemDiv);
    });
}

// Atualiza o valor total geral
function updateTotalValue() {
    const totalValue = itemsArray.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('total-value').textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
}

// Exibe ou oculta o menu mobile
function menuShow() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('open');
}

// Popula o seletor de quantidade quando a página é carregada
document.addEventListener('DOMContentLoaded', function() {
    populateQuantityOptions();
    document.getElementById('market-list-form').addEventListener('submit', addItem);
});
