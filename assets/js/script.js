let itemsArray = []; // Array para armazenar os itens
let editIndex = null; // Índice do item sendo editado
let previousScrollPosition = 0; // Variável para armazenar a posição anterior de rolagem
let searchQuery = ''; // Query de busca atual
let currentMode = 'unit'; // Modo atual do formulário: 'unit' ou 'weight'

// ===== Funções de Modo do Formulário =====

// Alterna entre modo unidade e modo peso
// skipCancelEdit: quando true, não cancela edição em andamento (usado ao carregar item para edição)
function setFormMode(mode, skipCancelEdit = false) {
    currentMode = mode;

    const unitFields = document.getElementById('unit-mode-fields');
    const weightFields = document.getElementById('weight-mode-fields');
    const unitBtn = document.getElementById('mode-unit-btn');
    const weightBtn = document.getElementById('mode-weight-btn');

    if (mode === 'unit') {
        unitFields.style.display = 'grid';
        weightFields.style.display = 'none';
        unitBtn.classList.add('active');
        weightBtn.classList.remove('active');
        // Limpa campos do modo peso
        document.getElementById('item-name-weight').value = '';
        document.getElementById('item-quantity-weight').value = '1';
        document.getElementById('item-price-kg').value = '';
        document.getElementById('item-weight').value = '';
    } else {
        unitFields.style.display = 'none';
        weightFields.style.display = 'grid';
        unitBtn.classList.remove('active');
        weightBtn.classList.add('active');
        // Limpa campos do modo unidade
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '1';
        document.getElementById('item-price').value = '';
    }

    // Reseta estado de edição se estiver editando (exceto quando skipCancelEdit é true)
    if (!skipCancelEdit && editIndex !== null) {
        cancelEdit();
    }
}

// Formata o peso durante a digitação (3 casas decimais, similar à moeda)
function formatarPeso(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo exceto dígitos
    if (valor === '') {
        input.value = '';
        return;
    }
    let decimal = (valor / 1000).toFixed(3); // Divide por 1000 para 3 casas decimais
    input.value = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(decimal);
}

// Converte peso formatado (ex: "1,250") para número decimal
function parsePeso(valorFormatado) {
    if (!valorFormatado) return 0;
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.'));
}

// ===== Funções de LocalStorage =====

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

// ===== Funções Utilitárias =====

// Nota: Campos de quantidade agora usam <input type="number"> ao invés de <select>,
// então populateQuantityOptions não é mais necessário

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

// ===== Função de Busca =====

// Filtra itens por nome
function searchItems(query) {
    searchQuery = query.toLowerCase().trim();
    updateItemList();
}

// ===== Operações CRUD =====

// Adiciona um item à lista
function addItem(event) {
    event.preventDefault();

    let itemName, itemTotal, newItem;

    if (currentMode === 'unit') {
        // Modo unidade
        itemName = document.getElementById('item-name').value.trim();
        const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
        const itemPrice = parseMoeda(document.getElementById('item-price').value);

        if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice) || itemPrice <= 0) {
            showNotification('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }

        // Verifica duplicidade
        if (itemsArray.some(item => item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        itemTotal = itemQuantity * itemPrice;

        newItem = {
            name: itemName,
            type: 'unit',
            quantity: itemQuantity,
            price: itemPrice,
            total: itemTotal
        };
    } else {
        // Modo peso
        itemName = document.getElementById('item-name-weight').value.trim();
        const itemQuantity = parseInt(document.getElementById('item-quantity-weight').value, 10);
        const itemPriceKg = parseMoeda(document.getElementById('item-price-kg').value);
        const itemWeight = parsePeso(document.getElementById('item-weight').value);

        if (!itemName || isNaN(itemQuantity) || isNaN(itemPriceKg) || itemPriceKg <= 0 || isNaN(itemWeight) || itemWeight <= 0) {
            showNotification('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }

        // Verifica duplicidade
        if (itemsArray.some(item => item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        // Cálculo: Valor/Kg × Peso (quantidade é apenas para exibição)
        itemTotal = itemPriceKg * itemWeight;

        newItem = {
            name: itemName,
            type: 'weight',
            quantity: itemQuantity,
            pricePerKg: itemPriceKg,
            weight: itemWeight,
            total: itemTotal
        };
    }

    itemsArray.push(newItem);

    // Salva, atualiza a exibição e limpa o formulário
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();

    // Limpa os campos do modo atual
    if (currentMode === 'unit') {
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '1';
        document.getElementById('item-price').value = '';
    } else {
        document.getElementById('item-name-weight').value = '';
        document.getElementById('item-quantity-weight').value = '1';
        document.getElementById('item-price-kg').value = '';
        document.getElementById('item-weight').value = '';
    }

    showNotification(`"${itemName}" adicionado com sucesso!`, 'success');
}

// Atualiza um item existente
function updateItem(event) {
    event.preventDefault();

    if (editIndex === null) return;

    const editingItem = itemsArray[editIndex];
    let itemName, updatedItem;

    if (editingItem.type === 'weight') {
        // Modo peso
        itemName = document.getElementById('item-name-weight').value.trim();
        const itemPriceKg = parseMoeda(document.getElementById('item-price-kg').value);
        const itemWeight = parsePeso(document.getElementById('item-weight').value);

        if (!itemName || isNaN(itemPriceKg) || itemPriceKg <= 0 || isNaN(itemWeight) || itemWeight <= 0) {
            showNotification('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }

        // Verifica duplicidade
        if (itemsArray.some((item, index) => index !== editIndex && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        updatedItem = {
            name: itemName,
            type: 'weight',
            quantity: parseInt(document.getElementById('item-quantity-weight').value, 10),
            pricePerKg: itemPriceKg,
            weight: itemWeight,
            total: itemPriceKg * itemWeight
        };
    } else {
        // Modo unidade (default para itens antigos sem type)
        itemName = document.getElementById('item-name').value.trim();
        const itemQuantity = parseInt(document.getElementById('item-quantity').value, 10);
        const itemPrice = parseMoeda(document.getElementById('item-price').value);

        if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice) || itemPrice <= 0) {
            showNotification('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }

        // Verifica duplicidade
        if (itemsArray.some((item, index) => index !== editIndex && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        updatedItem = {
            name: itemName,
            type: 'unit',
            quantity: itemQuantity,
            price: itemPrice,
            total: itemQuantity * itemPrice
        };
    }

    // Atualiza o item no array
    itemsArray[editIndex] = updatedItem;

    // Reseta o índice de edição
    editIndex = null;

    // Salva, atualiza a exibição e limpa o formulário
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();

    // Limpa campos apropriados
    if (editingItem.type === 'weight') {
        document.getElementById('item-name-weight').value = '';
        document.getElementById('item-quantity-weight').value = '1';
        document.getElementById('item-price-kg').value = '';
        document.getElementById('item-weight').value = '';
    } else {
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '1';
        document.getElementById('item-price').value = '';
    }

    // Alterna os botões para o estado normal
    toggleFormButtons(false);

    // Volta para a posição anterior após a atualização
    window.scrollTo({
        top: previousScrollPosition,
        behavior: 'smooth'
    });

    showNotification('Item atualizado com sucesso!', 'success');
}

// Remove um item da lista (com confirmação)
// Variável para armazenar o índice do item a ser removido
let pendingRemovalIndex = null;

// Remove um item da lista (abre modal de confirmação)
function removeItem(index) {
    pendingRemovalIndex = index;
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';
    // Pequeno delay para ativar a animação de entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Fecha o modal de confirmação
function closeModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('active');
    // Aguarda a animação terminar antes de esconder
    setTimeout(() => {
        modal.style.display = 'none';
        pendingRemovalIndex = null;
    }, 300);
}

// Confirma a remoção e executa a exclusão
function confirmRemoval() {
    if (pendingRemovalIndex === null) return;

    const index = pendingRemovalIndex;
    const itemName = itemsArray[index].name;

    itemsArray.splice(index, 1);
    saveToLocalStorage();
    updateItemList();
    updateTotalValue();

    closeModal();

    // Mostra a notificação
    setTimeout(() => {
        showNotification(`"${itemName}" removido.`, 'error');
    }, 350);
}

// Carrega os dados de um item no formulário para edição
function editItem(index) {
    const item = itemsArray[index];
    editIndex = index;

    if (item.type === 'weight') {
        // Muda para modo peso e preenche campos (skip cancel para não mostrar notificação)
        setFormMode('weight', true);
        document.getElementById('item-name-weight').value = item.name;
        document.getElementById('item-quantity-weight').value = item.quantity || 1;
        document.getElementById('item-price-kg').value = item.pricePerKg.toFixed(2).replace('.', ',');
        document.getElementById('item-weight').value = item.weight.toFixed(3).replace('.', ',');

        // Foca no campo de nome
        setTimeout(() => document.getElementById('item-name-weight').focus(), 100);
    } else {
        // Modo unidade (default para itens antigos sem type)
        setFormMode('unit', true);
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-price').value = item.price.toFixed(2).replace('.', ',');

        // Foca no campo de nome
        setTimeout(() => document.getElementById('item-name').focus(), 100);
    }

    // Alterna os botões para o modo de edição
    toggleFormButtons(true);

    // Salva a posição atual de rolagem antes de ir para o topo
    previousScrollPosition = window.scrollY;

    // Faz a rolagem para o topo da página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== Funções de Exibição =====

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
        const originalIndex = itemsArray.findIndex(i => i.name === item.name && i.total === item.total);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        let itemInfoHtml;
        if (item.type === 'weight') {
            // Item por peso
            itemInfoHtml = `
                <div class="item-info">
                    <p><strong>Nome:</strong> <span>${escapeHtml(item.name)}</span></p>
                    <p><strong>Quantidade:</strong> <span>${item.quantity || 1}</span></p>
                    <p><strong>Valor/Kg:</strong> <span>R$ ${item.pricePerKg.toFixed(2).replace('.', ',')}</span></p>
                    <p><strong>Peso:</strong> <span>${item.weight.toFixed(3).replace('.', ',')} Kg</span></p>
                    <p class="item-subtotal"><strong>Subtotal:</strong> <span>R$ ${item.total.toFixed(2).replace('.', ',')}</span></p>
                </div>
            `;
        } else {
            // Item por unidade (default para itens antigos)
            itemInfoHtml = `
                <div class="item-info">
                    <p><strong>Nome:</strong> <span>${escapeHtml(item.name)}</span></p>
                    <p><strong>Quantidade:</strong> <span>${item.quantity}</span></p>
                    <p><strong>Valor Unit.:</strong> <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span></p>
                    <p class="item-subtotal"><strong>Subtotal:</strong> <span>R$ ${item.total.toFixed(2).replace('.', ',')}</span></p>
                </div>
            `;
        }

        itemDiv.innerHTML = `
            ${itemInfoHtml}
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

// ===== Sistema de Notificações =====

function showNotification(message, type = 'info') {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos inline para a notificação (topo centralizado)
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
        notification.style.animation = 'slideOutTop 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adiciona estilos de animação para notificações
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

// ===== Menu Mobile =====

function menuShow() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('open');
}

// ===== Função de Exportação =====

async function exportToPDF() {
    if (itemsArray.length === 0) {
        showNotification('Sua lista está vazia. Adicione itens antes de exportar.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Palette do Projeto
    const primaryDark = [26, 38, 52]; // #1a2634 (Azul Escuro)
    const primaryTeal = [32, 166, 154]; // #20a69a (Verde/Teal)
    const dangerRed = [220, 53, 69];

    // --- Cabeçalho com Efeito de Degradê Simulado ---
    // Fundo principal azul escuro
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, 210, 45, 'F');

    // Pequena faixa teal na base para simular transição/degradê
    doc.setFillColor(...primaryTeal);
    doc.rect(0, 40, 210, 5, 'F');

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Market List', 20, 25);

    const today = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`CUPOM DE COMPRAS • EMITIDO EM: ${today}`, 20, 33);

    // Separar itens por tipo
    const unitItems = itemsArray.filter(i => i.type !== 'weight');
    const weightItems = itemsArray.filter(i => i.type === 'weight');

    let currentY = 60;

    const generateTable = (title, items) => {
        if (items.length === 0) return;

        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 20, currentY);
        currentY += 6;

        const tableData = items.map((item, idx) => {
            let qty = item.type === 'weight'
                ? `${item.weight.toFixed(3).replace('.', ',')} Kg`
                : item.quantity;

            let unitPrice = item.type === 'weight'
                ? `R$ ${item.pricePerKg.toFixed(2).replace('.', ',')}/Kg`
                : `R$ ${item.price.toFixed(2).replace('.', ',')}`;

            if (item.type === 'weight' && item.quantity > 1) {
                qty = `${item.quantity}x (${qty})`;
            }

            return [
                idx + 1,
                item.name,
                qty,
                unitPrice,
                `R$ ${item.total.toFixed(2).replace('.', ',')}`
            ];
        });

        doc.autoTable({
            startY: currentY,
            head: [['#', 'PRODUTO', 'QTD / PESO', 'VLR. UNITÁRIO', 'SUBTOTAL']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: primaryDark,
                fontSize: 8,
                halign: 'center',
                fontStyle: 'bold',
                lineWidth: 0.1
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
                lineWidth: 0.1, // Linhas mais finas
                lineColor: [220, 220, 220]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { fontStyle: 'bold', cellWidth: 'auto' },
                2: { halign: 'center' },
                3: { halign: 'right' },
                4: { halign: 'right', fontStyle: 'bold', textColor: primaryTeal }
            },
            margin: { left: 20, right: 20 },
            didDrawPage: (data) => {
                currentY = data.cursor.y;
            }
        });
        currentY += 15;
    };

    // Renderizar tabelas
    generateTable('Itens por Unidade', unitItems);
    generateTable('Itens por Peso', weightItems);

    // --- Seção de Resumo (Simulação de Glassmorphism) ---
    if (currentY > 240) doc.addPage();

    // Fundo muito claro com borda fina (Efeito elegante)
    doc.setDrawColor(...primaryDark);
    doc.setLineWidth(0.1);
    doc.setFillColor(250, 250, 250); // Quase branco
    doc.roundedRect(20, currentY, 170, 30, 2, 2, 'FD');

    // Linha de detalhe teal lateral
    doc.setFillColor(...primaryTeal);
    doc.rect(20, currentY, 2, 30, 'F');

    const totalValue = itemsArray.reduce((sum, item) => sum + item.total, 0);
    const count = itemsArray.length;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Resumo da Compra: ${count} itens registrados`, 30, currentY + 12);

    doc.setFontSize(18);
    doc.setTextColor(...dangerRed);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: R$ ${totalValue.toFixed(2).replace('.', ',')}`, 180, currentY + 20, { align: 'right' });

    // Rodapé refinado
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150); // Mais legível
        doc.setFont('helvetica', 'italic');
        // Alinhamento centralizado para o texto legal e direita para página
        doc.text('Este documento é um registro de aprendizagem de Rafael Nunes. Desenvolvido com carinho e auxílio de IA.', 105, 288, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, 192, 288, { align: 'right' });
    }

    doc.save(`Market-List-${today.replace(/\//g, '-')}.pdf`);
    showNotification('PDF gerado com sucesso!', 'success');
}

// ===== Inicialização =====

document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    document.getElementById('market-list-form').addEventListener('submit', addItem);
    document.getElementById('update-item-button').addEventListener('click', updateItem);
    document.getElementById('cancel-edit-button').addEventListener('click', cancelEdit);

    // Fechar modal ao clicar fora dele
    document.getElementById('confirmation-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
});
