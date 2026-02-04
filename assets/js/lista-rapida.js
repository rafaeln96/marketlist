// ===== Estado da Lista Rápida =====
let quickItems = [];
let currentMode = 'qty'; // 'qty' ou 'weight'
let pendingRemovalIndex = null;

// ===== LocalStorage =====
function saveQuickList() {
    localStorage.setItem('quickListItems', JSON.stringify(quickItems));
}

function loadQuickList() {
    const saved = localStorage.getItem('quickListItems');
    if (saved) {
        quickItems = JSON.parse(saved);
    }
    renderQuickList();
}

// ===== Alternador de Modo =====
function setQuickMode(mode) {
    currentMode = mode;

    const qtyBtn = document.getElementById('mode-qty-btn');
    const weightBtn = document.getElementById('mode-weight-btn');
    const qtyFields = document.getElementById('qty-mode-fields');
    const weightFields = document.getElementById('weight-mode-fields');

    if (mode === 'qty') {
        qtyBtn.classList.add('active');
        weightBtn.classList.remove('active');
        qtyFields.style.display = 'grid';
        weightFields.style.display = 'none';
    } else {
        qtyBtn.classList.remove('active');
        weightBtn.classList.add('active');
        qtyFields.style.display = 'none';
        weightFields.style.display = 'grid';
    }
}

// ===== Operações CRUD =====

function addQuickItem(e) {
    e.preventDefault();

    let name, displayQty, type;

    if (currentMode === 'qty') {
        const nameInput = document.getElementById('quick-item-name');
        const qtyInput = document.getElementById('quick-item-qty');

        name = nameInput.value.trim();
        const qty = parseInt(qtyInput.value) || 1;
        displayQty = `${qty}x`;
        type = 'qty';

        if (!name) {
            showNotification('Por favor, digite o nome do item.', 'error');
            nameInput.focus();
            return;
        }

        // Verifica duplicatas
        if (quickItems.some(item => item.name.toLowerCase() === name.toLowerCase() && !item.checked)) {
            showNotification(`"${name}" já está na lista!`, 'error');
            return;
        }

        quickItems.push({
            name: name,
            displayQty: displayQty,
            type: type,
            checked: false
        });

        // Limpa os campos
        nameInput.value = '';
        qtyInput.value = '1';
        nameInput.focus();

    } else {
        const nameInput = document.getElementById('quick-item-name-weight');
        const weightInput = document.getElementById('quick-item-weight');

        name = nameInput.value.trim();
        const weightStr = weightInput.value.replace(',', '.');
        const weightKg = parseFloat(weightStr) || 0;

        if (!name) {
            showNotification('Por favor, digite o nome do item.', 'error');
            nameInput.focus();
            return;
        }

        if (weightKg <= 0) {
            showNotification('Por favor, digite o peso em Kg.', 'error');
            weightInput.focus();
            return;
        }

        // Formata a exibição do peso
        displayQty = `${weightKg.toFixed(3).replace('.', ',')}kg`;
        type = 'weight';

        // Verifica duplicatas
        if (quickItems.some(item => item.name.toLowerCase() === name.toLowerCase() && !item.checked)) {
            showNotification(`"${name}" já está na lista!`, 'error');
            return;
        }

        quickItems.push({
            name: name,
            displayQty: displayQty,
            type: type,
            checked: false
        });

        // Limpa os campos
        nameInput.value = '';
        weightInput.value = '';
        nameInput.focus();
    }

    saveQuickList();
    renderQuickList();
    showNotification(`"${name}" adicionado!`, 'success');
}

function toggleChecked(index) {
    quickItems[index].checked = !quickItems[index].checked;
    saveQuickList();
    renderQuickList();
}

// ===== Ações do Modal =====
let modalAction = 'remove'; // 'remove' ou 'clearAll'

function requestRemoval(index) {
    pendingRemovalIndex = index;
    modalAction = 'remove';
    document.getElementById('modal-title').textContent = 'Tem certeza?';
    document.getElementById('modal-message').textContent = 'Deseja realmente remover este item da lista?';
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function requestClearAll() {
    modalAction = 'clearAll';
    document.getElementById('modal-title').textContent = 'Limpar toda a lista?';
    document.getElementById('modal-message').textContent = 'Deseja realmente remover todos os itens da lista? Esta ação não pode ser desfeita.';
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        pendingRemovalIndex = null;
        modalAction = 'remove';
    }, 300);
}

function confirmAction() {
    if (modalAction === 'remove' && pendingRemovalIndex !== null) {
        const itemName = quickItems[pendingRemovalIndex].name;
        quickItems.splice(pendingRemovalIndex, 1);
        saveQuickList();
        renderQuickList();
        closeModal();
        showNotification(`"${itemName}" removido.`, 'error');
    } else if (modalAction === 'clearAll') {
        quickItems = [];
        saveQuickList();
        renderQuickList();
        closeModal();
        showNotification('Lista limpa com sucesso!', 'error');
    }
}

// ===== Formatação de Peso =====
function formatarPesoKg(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    if (valor.length === 0) {
        input.value = '';
        return;
    }
    let decimal = (parseInt(valor) / 1000).toFixed(3);
    input.value = decimal.replace('.', ',');
}

// ===== Renderização =====

function renderQuickList() {
    const listContainer = document.getElementById('quick-list');
    const containerWrapper = document.getElementById('quick-list-container');
    const countElement = document.getElementById('quick-count');
    const clearAllBtn = document.getElementById('clear-all-btn');

    listContainer.innerHTML = '';
    countElement.textContent = quickItems.length;

    // Mostra/oculta botão limpar tudo
    if (clearAllBtn) {
        clearAllBtn.style.display = quickItems.length > 0 ? 'flex' : 'none';
    }

    if (quickItems.length === 0) {
        containerWrapper.style.display = 'none';
        listContainer.innerHTML = `
            <div class="quick-empty-state">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 12C13.65 12 15 10.65 15 9C15 7.35 13.65 6 12 6C10.35 6 9 7.35 9 9C9 10.65 10.35 12 12 12ZM12 8C12.55 8 13 8.45 13 9C13 9.55 12.55 10 12 10C11.45 10 11 9.55 11 9C11 8.45 11.45 8 12 8ZM18 16.58C18 14.08 14.03 13 12 13C9.97 13 6 14.08 6 16.58V18H18V16.58ZM8.48 16C9.22 15.49 10.71 15 12 15C13.29 15 14.78 15.49 15.52 16H8.48Z" fill="currentColor"/>
                </svg>
                <p>Sua lista está vazia.<br>Adicione itens acima!</p>
            </div>
        `;
        // Move estado vazio para fora do container
        const section = containerWrapper.parentElement;
        const emptyState = listContainer.innerHTML;
        listContainer.innerHTML = '';
        containerWrapper.insertAdjacentHTML('afterend', emptyState);
        return;
    }

    // Remove qualquer estado vazio existente fora do container
    const existingEmpty = containerWrapper.parentElement.querySelector('.quick-empty-state');
    if (existingEmpty) existingEmpty.remove();

    containerWrapper.style.display = 'block';

    // Ordena itens alfabeticamente por nome
    const sortedItems = [...quickItems].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    );

    sortedItems.forEach((item) => {
        // Encontra o índice original para toggle/remoção correta
        const originalIndex = quickItems.indexOf(item);
        const itemDiv = document.createElement('div');
        itemDiv.className = `quick-item ${item.checked ? 'checked' : ''}`;

        itemDiv.innerHTML = `
            <div class="quick-item-content">
                <span class="quick-item-name">${escapeHtml(item.name)}</span>
                <span class="quick-item-qty">${item.displayQty}</span>
            </div>
            <div class="quick-item-actions">
                <button class="quick-action-btn quick-check-btn" onclick="toggleChecked(${originalIndex})" title="${item.checked ? 'Desmarcar' : 'Marcar como pego'}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="quick-action-btn quick-remove-btn" onclick="requestRemoval(${originalIndex})" title="Remover">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        `;

        listContainer.appendChild(itemDiv);
    });
}

// ===== Funções Utilitárias =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Sistema de Notificações =====

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideInTop 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 90%;
        text-align: center;
    `;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#20a69a'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutTop 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animações de notificação
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInTop {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideOutTop {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// ===== Mobile Menu =====

function menuShow() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('open');
}

// ===== Inicialização =====

document.addEventListener('DOMContentLoaded', function () {
    loadQuickList();

    document.getElementById('quick-list-form').addEventListener('submit', addQuickItem);

    // Tecla Enter nos campos envia o formulário
    document.getElementById('quick-item-qty').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('quick-list-form').dispatchEvent(new Event('submit'));
        }
    });

    document.getElementById('quick-item-weight').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('quick-list-form').dispatchEvent(new Event('submit'));
        }
    });

    // Fecha modal ao clicar no overlay
    document.getElementById('confirmation-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
});
