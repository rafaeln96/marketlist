let itemsArray = []; // Array para armazenar os itens
let editIndex = null; // Índice do item sendo editado

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
    let valor = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    let decimal = (valor / 100).toFixed(2); // Divide por 100 para obter o decimal
    input.value = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(decimal); // Formata no padrão brasileiro
}

// Atualiza os botões do formulário (Adicionar/Atualizar)
function toggleFormButtons(isEditing) {
    const addButton = document.getElementById('add-item-button');
    const updateButton = document.getElementById('update-item-button');

    if (isEditing) {
        addButton.style.display = 'none'; // Esconde o botão Adicionar
        updateButton.style.display = 'inline-block'; // Mostra o botão Atualizar
    } else {
        addButton.style.display = 'inline-block'; // Mostra o botão Adicionar
        updateButton.style.display = 'none'; // Esconde o botão Atualizar
    }
}

// Adiciona um item à lista
function addItem(event) {
    event.preventDefault();

    const itemName = document.getElementById('item-name').value;
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseMoeda(document.getElementById('item-price').value);

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const itemTotal = itemQuantity * itemPrice;

    itemsArray.push({
        name: itemName,
        quantity: itemQuantity,
        price: itemPrice,
        total: itemTotal
    });

    // Atualiza a exibição e limpa o formulário
    updateItemList();
    updateTotalValue();
    document.getElementById('market-list-form').reset();
}

// Atualiza um item existente
function updateItem(event) {
    event.preventDefault();

    if (editIndex === null) return;

    const itemName = document.getElementById('item-name').value;
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseMoeda(document.getElementById('item-price').value);

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const itemTotal = itemQuantity * itemPrice;

    // Atualiza o item no array
    itemsArray[editIndex] = {
        name: itemName,
        quantity: itemQuantity,
        price: itemPrice,
        total: itemTotal
    };

    // Reseta o índice de edição
    editIndex = null;

    // Atualiza a exibição e limpa o formulário
    updateItemList();
    updateTotalValue();
    document.getElementById('market-list-form').reset();

    // Alterna os botões para o estado normal
    toggleFormButtons(false);
}

// Remove um item da lista
function removeItem(index) {
    itemsArray.splice(index, 1);
    updateItemList();
    updateTotalValue();
}

// Carrega os dados de um item no formulário para edição
function editItem(index) {
    const item = itemsArray[index];
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-price').value = item.price.toFixed(2).replace('.', ',');

    editIndex = index; // Define o índice do item sendo editado

    // Alterna os botões para o modo de edição
    toggleFormButtons(true);
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
            <strong>Total:</strong> R$ ${item.total.toFixed(2).replace('.', ',')}<br>
            <button class="edit-button" onclick="editItem(${index})">Editar</button>
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
    document.getElementById('update-item-button').addEventListener('click', updateItem);
});
