let itemsArray = []; // Array para armazenar os itens
let editIndex = null; // Índice do item sendo editado
let previousScrollPosition = 0; // Variável para armazenar a posição anterior de rolagem
let searchQuery = ''; // Query de busca atual

// ===== LocalStorage Functions =====

// Salva os itens no localStorage
function saveToLocalStorage() {
    localStorage.setItem('marketListItems', JSON.stringify(itemsArray));
}

// Carrega os itens do localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('marketListItems');
    if (saved) {
        itemsArray = JSON.parse(saved);
    }
    // Sempre atualiza a lista (mostra estado vazio se necessário)
    updateItemList();
    updateTotalValue();
}

// ===== Utility Functions =====

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

// Atualiza os botões do formulário (Adicionar/Atualizar/Cancelar)
function toggleFormButtons(isEditing) {
    const addButton = document.getElementById('add-item-button');
    const updateButton = document.getElementById('update-item-button');
    const cancelButton = document.getElementById('cancel-edit-button');

    if (isEditing) {
        addButton.style.display = 'none';
        updateButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
    } else {
        addButton.style.display = 'inline-block';
        updateButton.style.display = 'none';
        cancelButton.style.display = 'none';
    }
}

// Cancela a edição e volta ao estado normal
function cancelEdit() {
    editIndex = null;
    document.getElementById('market-list-form').reset();
    toggleFormButtons(false);

    // Volta para a posição anterior
    window.scrollTo({
        top: previousScrollPosition,
        behavior: 'smooth'
    });

    showNotification('Edição cancelada.', 'info');
}

// ===== Search Function =====

// Filtra itens por nome
function searchItems(query) {
    searchQuery = query.toLowerCase().trim();
    updateItemList();
}

// ===== CRUD Operations =====

// Adiciona um item à lista
function addItem(event) {
    event.preventDefault();

    const itemName = document.getElementById('item-name').value.trim();
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseMoeda(document.getElementById('item-price').value);

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice) || itemPrice <= 0) {
        showNotification('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }

    // Verifica se já existe um item com o mesmo nome (case-insensitive)
    const itemExists = itemsArray.some(item =>
        item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (itemExists) {
        showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
        return;
    }

    const itemTotal = itemQuantity * itemPrice;

    itemsArray.push({
        name: itemName,
        quantity: itemQuantity,
        price: itemPrice,
        total: itemTotal
    });

    // Salva, atualiza a exibição e limpa o formulário
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();
    document.getElementById('market-list-form').reset();

    showNotification(`"${itemName}" adicionado com sucesso!`, 'success');
}

// Atualiza um item existente
function updateItem(event) {
    event.preventDefault();

    if (editIndex === null) return;

    const itemName = document.getElementById('item-name').value.trim();
    const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
    const itemPrice = parseMoeda(document.getElementById('item-price').value);

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice) || itemPrice <= 0) {
        showNotification('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }

    // Verifica se já existe outro item com o mesmo nome (case-insensitive)
    const itemExists = itemsArray.some((item, index) =>
        index !== editIndex && item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (itemExists) {
        showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
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

    // Salva, atualiza a exibição e limpa o formulário
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();
    document.getElementById('market-list-form').reset();

    // Alterna os botões para o estado normal
    toggleFormButtons(false);

    // Volta para a posição anterior após a atualização
    window.scrollTo({
        top: previousScrollPosition,
        behavior: 'smooth'
    });

    showNotification('Item atualizado com sucesso!', 'success');
}

// Remove um item da lista
function removeItem(index) {
    const itemName = itemsArray[index].name;
    itemsArray.splice(index, 1);
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();
    showNotification(`"${itemName}" removido.`, 'info');
}

// Carrega os dados de um item no formulário para edição
function editItem(index) {
    const item = itemsArray[index];
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-price').value = item.price.toFixed(2).replace('.', ',');

    editIndex = index;

    // Alterna os botões para o modo de edição
    toggleFormButtons(true);

    // Salva a posição atual de rolagem antes de ir para o topo
    previousScrollPosition = window.scrollY;

    // Faz a rolagem para o topo da página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Foca no campo de nome
    document.getElementById('item-name').focus();
}

// ===== Display Functions =====

// Atualiza a lista de itens e organiza em ordem alfabética
function updateItemList() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';

    // Ordena o array por nome
    const sortedItems = [...itemsArray].sort((a, b) => a.name.localeCompare(b.name));

    // Filtra por busca se houver query
    const filteredItems = searchQuery
        ? sortedItems.filter(item => item.name.toLowerCase().includes(searchQuery))
        : sortedItems;

    // Mostra estado vazio se não houver itens
    if (filteredItems.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18C5.9 18 5 18.9 5 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15 18.9 15 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z" fill="currentColor"/>
            </svg>
            <p>${searchQuery ? 'Nenhum item encontrado para sua busca.' : 'Sua lista está vazia. Adicione itens acima!'}</p>
        `;
        itemList.appendChild(emptyState);
        return;
    }

    filteredItems.forEach((item) => {
        // Encontra o índice original no array
        const originalIndex = itemsArray.findIndex(i =>
            i.name === item.name &&
            i.quantity === item.quantity &&
            i.price === item.price
        );

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <p><strong>Nome:</strong> <span>${escapeHtml(item.name)}</span></p>
                <p><strong>Quantidade:</strong> <span>${item.quantity}</span></p>
                <p><strong>Valor Unitário:</strong> <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span></p>
                <p class="item-subtotal"><strong>Subtotal:</strong> <span>R$ ${item.total.toFixed(2).replace('.', ',')}</span></p>
            </div>
            <div class="item-actions">
                <button class="edit-button" onclick="editItem(${originalIndex})">Editar</button>
                <button class="remove-button" onclick="removeItem(${originalIndex})">Remover</button>
            </div>
        `;
        itemList.appendChild(itemDiv);
    });
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Atualiza o valor total geral e contador de itens
function updateTotalValue() {
    const totalValue = itemsArray.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('total-value').textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;

    // Atualiza contador de itens
    const itemsCountElement = document.getElementById('items-count');
    if (itemsCountElement) {
        itemsCountElement.textContent = itemsArray.length;
    }
}

// ===== Notification System =====

function showNotification(message, type = 'info') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos inline para a notificação
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;

    // Cores baseadas no tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#20a69a'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adiciona estilos de animação para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// ===== Mobile Menu =====

function menuShow() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('open');
}

// ===== Initialization =====

document.addEventListener('DOMContentLoaded', function () {
    populateQuantityOptions();
    loadFromLocalStorage();
    document.getElementById('market-list-form').addEventListener('submit', addItem);
    document.getElementById('update-item-button').addEventListener('click', updateItem);
    document.getElementById('cancel-edit-button').addEventListener('click', cancelEdit);
});
