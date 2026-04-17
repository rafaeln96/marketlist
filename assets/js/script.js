let itemsArray = []; // Array para armazenar os itens
let editIndex = null; // Índice do item sendo editado
let previousScrollPosition = 0; // Variável para armazenar a posição anterior de rolagem
let searchQuery = ''; // Query de busca atual
let currentMode = 'unit'; // Modo atual do formulário: 'unit' ou 'weight'
let currentPhotoUnit = null;   // Foto capturada no modo unidade
let currentPhotoWeight = null; // Foto capturada no modo peso
let searchPhotoFilterIndex = null; // Armazena índice do item ao filtrar por foto

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
        removePhoto('weight');
    } else {
        unitFields.style.display = 'none';
        weightFields.style.display = 'grid';
        unitBtn.classList.remove('active');
        weightBtn.classList.add('active');
        // Limpa campos do modo unidade
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '1';
        document.getElementById('item-price').value = '';
        removePhoto('unit');
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

// ===== Funções de Foto =====

// Abre o seletor de câmera/arquivo
function openCamera(mode) {
    const input = document.getElementById(`camera-input-${mode}`);
    input.click();
}

// Redimensiona uma imagem e retorna o dataUrl via callback
function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
            } else {
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
            }

            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Processa a foto capturada/selecionada
function handlePhoto(input, mode) {
    const file = input.files[0];
    if (!file) return;

    resizeImage(file, function (dataUrl) {
        if (mode === 'unit') {
            currentPhotoUnit = dataUrl;
        } else {
            currentPhotoWeight = dataUrl;
        }

        // Exibe a foto no container inline (injetada dentro do wrapper do input)
        const wrapper = document.getElementById(`name-wrapper-${mode}`);
        const thumbnail = document.getElementById(`photo-thumbnail-${mode}`);
        
        document.getElementById(`photo-img-${mode}`).src = dataUrl;
        thumbnail.style.display = 'block';
        wrapper.classList.add('has-photo');
        
        // Opcional: altera o placeholder para indicar que o nome pode ser digitado
        const nameInput = mode === 'unit'
            ? document.getElementById('item-name')
            : document.getElementById('item-name-weight');
        if (nameInput && !nameInput.value) {
            nameInput.placeholder = 'Nome do produto...';
            nameInput.focus();
        }

        // Reset para permitir selecionar o mesmo arquivo novamente
        input.value = '';
    });
}

// Remove a foto capturada e restaura o campo de nome
function removePhoto(mode) {
    if (mode === 'unit') {
        currentPhotoUnit = null;
    } else {
        currentPhotoWeight = null;
    }

    // Restaura o layout padrão removendo a classe e ocultando a miniatura
    const wrapper = document.getElementById(`name-wrapper-${mode}`);
    const thumbnail = document.getElementById(`photo-thumbnail-${mode}`);
    
    if (thumbnail) thumbnail.style.display = 'none';
    if (wrapper) wrapper.classList.remove('has-photo');

    // Restaura o placeholder
    const nameInput = mode === 'unit'
        ? document.getElementById('item-name')
        : document.getElementById('item-name-weight');
    if (nameInput) {
        nameInput.placeholder = mode === 'unit' ? 'Ex: Leite Integral' : 'Ex: Banana Prata';
    }
}

// ===== Modal de Visualização de Foto ===== 

function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function saveApiKey() {
    closeSettings();
}

function removeApiKey() {
    showNotification('Chave removida.', 'info');
    closeSettings();
}

let viewingPhotoIndex = null;

// Abre o modal de visualização de foto
function openPhotoViewer(index) {
    viewingPhotoIndex = index;
    const item = itemsArray[index];
    document.getElementById('photo-viewer-img').src = item.photo;
    const modal = document.getElementById('photo-viewer-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

// Fecha o modal de visualização
function closePhotoViewer() {
    const modal = document.getElementById('photo-viewer-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        viewingPhotoIndex = null;
    }, 300);
}

// Permite tirar outra foto diretamente do modal de visualização
function retakePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function () {
        const file = this.files[0];
        if (!file || viewingPhotoIndex === null) return;

        resizeImage(file, function (dataUrl) {
            itemsArray[viewingPhotoIndex].photo = dataUrl;

            saveToLocalStorage();
            updateItemList();

            // Atualiza a imagem no modal
            document.getElementById('photo-viewer-img').src = dataUrl;
            showNotification('Foto atualizada!', 'success');
        });
    };
    input.click();
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

    // Limpa fotos
    removePhoto('unit');
    removePhoto('weight');

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
    searchPhotoFilterIndex = null; // Remove o filtro de foto se começar a digitar
    updateItemList();
}

// Remove classes de erro de um modo específico
function clearValidationErrors(mode) {
    const fields = mode === 'unit' 
        ? ['item-name', 'item-quantity', 'item-price']
        : ['item-name-weight', 'item-quantity-weight', 'item-price-kg', 'item-weight'];
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('input-error');
    });
}

// Adiciona um novo item à lista
function addItem(event) {
    event.preventDefault();

    const formMode = currentMode;
    let newItem;
    let itemTotal = 0;
    let hasError = false;

    clearValidationErrors(formMode);

    if (formMode === 'unit') {
        const itemName = document.getElementById('item-name').value.trim();
        const itemQuantity = parseInt(document.getElementById('item-quantity').value);
        const itemPriceStr = document.getElementById('item-price').value.trim();
        const itemPrice = parseMoeda(itemPriceStr);

        if (!itemName && !currentPhotoUnit) {
            document.getElementById('item-name').classList.add('input-error');
            hasError = true;
        }
        if (isNaN(itemQuantity) || itemQuantity <= 0) {
            document.getElementById('item-quantity').classList.add('input-error');
            hasError = true;
        }
        if (!itemPriceStr || isNaN(itemPrice) || itemPrice <= 0) {
            document.getElementById('item-price').classList.add('input-error');
            hasError = true;
        }

        if (hasError) {
            showNotification('Por favor, preencha os campos destacados em vermelho.', 'error');
            return;
        }

        // Verifica duplicidade (apenas se tiver nome)
        if (itemName && itemsArray.some(item => item.name && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        itemTotal = itemQuantity * itemPrice;

        newItem = {
            name: itemName,
            type: 'unit',
            photo: currentPhotoUnit,
            quantity: itemQuantity,
            price: itemPrice,
            total: itemTotal
        };
    } else {
        // Modo peso
        const itemName = document.getElementById('item-name-weight').value.trim();
        const itemQuantityStr = document.getElementById('item-quantity-weight').value;
        const itemQuantity = parseInt(itemQuantityStr, 10);
        const itemPriceKgStr = document.getElementById('item-price-kg').value;
        const itemPriceKg = parseMoeda(itemPriceKgStr);
        const itemWeightStr = document.getElementById('item-weight').value;
        const itemWeight = parsePeso(itemWeightStr);
        const hasPhoto = currentPhotoWeight !== null;

        if (!itemName && !hasPhoto) {
            document.getElementById('item-name-weight').classList.add('input-error');
            hasError = true;
        }
        if (!itemQuantityStr || isNaN(itemQuantity) || itemQuantity <= 0) {
            document.getElementById('item-quantity-weight').classList.add('input-error');
            hasError = true;
        }
        if (!itemPriceKgStr || isNaN(itemPriceKg) || itemPriceKg <= 0) {
            document.getElementById('item-price-kg').classList.add('input-error');
            hasError = true;
        }
        if (!itemWeightStr || isNaN(itemWeight) || itemWeight <= 0) {
            document.getElementById('item-weight').classList.add('input-error');
            hasError = true;
        }

        if (hasError) {
            showNotification('Por favor, preencha os campos destacados em vermelho.', 'error');
            return;
        }

        // Verifica duplicidade (apenas se tiver nome)
        if (itemName && itemsArray.some(item => item.name && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        // Cálculo: Valor/Kg × Peso (quantidade é apenas para exibição)
        itemTotal = itemPriceKg * itemWeight;

        newItem = {
            name: itemName,
            type: 'weight',
            photo: currentPhotoWeight,
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
        removePhoto('unit');
    } else {
        document.getElementById('item-name-weight').value = '';
        document.getElementById('item-quantity-weight').value = '1';
        document.getElementById('item-price-kg').value = '';
        document.getElementById('item-weight').value = '';
        removePhoto('weight');
    }

    const displayName = itemName || 'Produto (foto)';
    showNotification(`"${displayName}" adicionado com sucesso!`, 'success');
}

// Atualiza um item existente
function updateItem(event) {
    event.preventDefault();

    if (editIndex === null) return;

    const editingItem = itemsArray[editIndex];
    let itemName, updatedItem;
    let hasError = false;

    clearValidationErrors(editingItem.type);

    if (editingItem.type === 'weight') {
        // Modo peso
        itemName = document.getElementById('item-name-weight').value.trim();
        const itemQuantityStr = document.getElementById('item-quantity-weight').value;
        const itemQuantity = parseInt(itemQuantityStr, 10);
        const itemPriceKgStr = document.getElementById('item-price-kg').value;
        const itemPriceKg = parseMoeda(itemPriceKgStr);
        const itemWeightStr = document.getElementById('item-weight').value;
        const itemWeight = parsePeso(itemWeightStr);
        const hasPhoto = currentPhotoWeight !== null;
        const hadPhoto = editingItem.photo !== null && editingItem.photo !== undefined;

        if (!itemName && !hasPhoto && !hadPhoto) {
            document.getElementById('item-name-weight').classList.add('input-error');
            hasError = true;
        }
        if (!itemQuantityStr || isNaN(itemQuantity) || itemQuantity <= 0) {
            document.getElementById('item-quantity-weight').classList.add('input-error');
            hasError = true;
        }
        if (!itemPriceKgStr || isNaN(itemPriceKg) || itemPriceKg <= 0) {
            document.getElementById('item-price-kg').classList.add('input-error');
            hasError = true;
        }
        if (!itemWeightStr || isNaN(itemWeight) || itemWeight <= 0) {
            document.getElementById('item-weight').classList.add('input-error');
            hasError = true;
        }

        if (hasError) {
            showNotification('Por favor, preencha os campos destacados em vermelho.', 'error');
            return;
        }

        // Verifica duplicidade (apenas se tiver nome)
        if (itemName && itemsArray.some((item, index) => index !== editIndex && item.name && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        updatedItem = {
            name: itemName,
            type: 'weight',
            photo: hasPhoto ? currentPhotoWeight : (editingItem.photo || null),
            quantity: itemQuantity,
            pricePerKg: itemPriceKg,
            weight: itemWeight,
            total: itemPriceKg * itemWeight
        };
    } else {
        // Modo unidade
        itemName = document.getElementById('item-name').value.trim();
        const itemQuantityStr = document.getElementById('item-quantity').value;
        const itemQuantity = parseInt(itemQuantityStr, 10);
        const itemPriceStr = document.getElementById('item-price').value.trim();
        const itemPrice = parseMoeda(itemPriceStr);
        const hasPhoto = currentPhotoUnit !== null;
        const hadPhoto = editingItem.photo !== null && editingItem.photo !== undefined;

        if (!itemName && !hasPhoto && !hadPhoto) {
            document.getElementById('item-name').classList.add('input-error');
            hasError = true;
        }
        if (!itemQuantityStr || isNaN(itemQuantity) || itemQuantity <= 0) {
            document.getElementById('item-quantity').classList.add('input-error');
            hasError = true;
        }
        if (!itemPriceStr || isNaN(itemPrice) || itemPrice <= 0) {
            document.getElementById('item-price').classList.add('input-error');
            hasError = true;
        }

        if (hasError) {
            showNotification('Por favor, preencha os campos destacados em vermelho.', 'error');
            return;
        }

        // Verifica duplicidade (apenas se tiver nome)
        if (itemName && itemsArray.some((item, index) => index !== editIndex && item.name && item.name.toLowerCase() === itemName.toLowerCase())) {
            showNotification(`O item "${itemName}" já está cadastrado na lista!`, 'error');
            return;
        }

        updatedItem = {
            name: itemName,
            type: 'unit',
            photo: hasPhoto ? currentPhotoUnit : (editingItem.photo || null),
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
        removePhoto('weight');
    } else {
        document.getElementById('item-name').value = '';
        document.getElementById('item-quantity').value = '1';
        document.getElementById('item-price').value = '';
        removePhoto('unit');
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
let modalAction = 'remove'; // 'remove' ou 'clearAll'

// Remove um item da lista (abre modal de confirmação)
function removeItem(index) {
    pendingRemovalIndex = index;
    modalAction = 'remove';
    document.getElementById('modal-title').textContent = 'Tem certeza?';
    document.getElementById('modal-message').textContent = 'Deseja realmente remover este item da lista? Esta ação não pode ser desfeita.';
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';
    // Pequeno delay para ativar a animação de entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Abre modal para limpar toda a lista
function requestClearAll() {
    modalAction = 'clearAll';
    document.getElementById('modal-title').textContent = 'Limpar toda a lista?';
    document.getElementById('modal-message').textContent = 'Deseja realmente remover todos os itens da lista? Esta ação não pode ser desfeita.';
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex';
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
        modalAction = 'remove';
    }, 300);
}

// Confirma a ação do modal (remoção individual ou limpar tudo)
function confirmAction() {
    if (modalAction === 'remove' && pendingRemovalIndex !== null) {
        const index = pendingRemovalIndex;
        const itemName = itemsArray[index].name || 'Produto (foto)';

        itemsArray.splice(index, 1);
        saveToLocalStorage();
        updateItemList();
        updateTotalValue();

        closeModal();

        // Mostra a notificação
        setTimeout(() => {
            showNotification(`"${itemName}" removido.`, 'error');
        }, 350);
    } else if (modalAction === 'clearAll') {
        itemsArray = [];
        saveToLocalStorage();
        updateItemList();
        updateTotalValue();

        closeModal();

        setTimeout(() => {
            showNotification('Lista limpa com sucesso!', 'error');
        }, 350);
    }
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

        // Carrega foto se existir (aplica classe has-photo)
        if (item.photo) {
            currentPhotoWeight = item.photo;
            const wrapper = document.getElementById('name-wrapper-weight');
            const thumbnail = document.getElementById('photo-thumbnail-weight');
            document.getElementById('photo-img-weight').src = item.photo;
            thumbnail.style.display = 'block';
            wrapper.classList.add('has-photo');
        } else {
            // Foca no campo de nome
            setTimeout(() => document.getElementById('item-name-weight').focus(), 100);
        }
    } else {
        // Modo unidade (default para itens antigos sem type)
        setFormMode('unit', true);
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-price').value = item.price.toFixed(2).replace('.', ',');

        // Carrega foto se existir (aplica classe has-photo)
        if (item.photo) {
            currentPhotoUnit = item.photo;
            const wrapper = document.getElementById('name-wrapper-unit');
            const thumbnail = document.getElementById('photo-thumbnail-unit');
            document.getElementById('photo-img-unit').src = item.photo;
            thumbnail.style.display = 'block';
            wrapper.classList.add('has-photo');
        } else {
            // Foca no campo de nome
            setTimeout(() => document.getElementById('item-name').focus(), 100);
        }
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

// Executada ao digitar na barra de busca (agora salva a query e reseta o filtro de foto)
function searchItems(query) {
    searchQuery = query.toLowerCase().trim();
    searchPhotoFilterIndex = null; // Remove o filtro de foto se começar a digitar
    updateItemList();
}

// Atualiza a lista de itens e organiza em ordem alfabética
function updateItemList() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';

    // Mostra/oculta botão Limpar Tudo
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.style.display = itemsArray.length > 0 ? 'flex' : 'none';
    }

    // Mapeia os itens mantendo o índice original, depois ordena
    const sortedItems = itemsArray.map((item, index) => ({ item, index })).sort((a, b) => {
        const nameA = a.item.name || 'zzz';
        const nameB = b.item.name || 'zzz';
        return nameA.localeCompare(nameB);
    });

    // Filtra por busca (texto) ou por foto (searchPhotoFilterIndex)
    let filteredItems = sortedItems;
    if (searchQuery) {
        filteredItems = sortedItems.filter(obj => (obj.item.name || '').toLowerCase().includes(searchQuery));
    } else if (searchPhotoFilterIndex !== null) {
        filteredItems = sortedItems.filter(obj => obj.index === searchPhotoFilterIndex);
    }

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

    filteredItems.forEach((obj) => {
        const item = obj.item;
        const originalIndex = obj.index;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.id = `item-card-${originalIndex}`; // ID para navegação

        // Monta HTML da foto clicável (se existir)
        const photoHtml = item.photo
            ? `<div class="item-photo" onclick="openPhotoViewer(${originalIndex})" title="Clique para ampliar"><img src="${item.photo}" alt="Foto do produto"></div>`
            : '';
        // Mostra o nome, independentemente de ter foto (se o nome foi preenchido)
        const nameHtml = item.name
            ? `<p><strong>Nome:</strong> <span>${escapeHtml(item.name)}</span></p>`
            : '';

        let itemInfoHtml;
        if (item.type === 'weight') {
            // Item por peso
            itemInfoHtml = `
                <div class="item-info">
                    ${photoHtml}
                    ${nameHtml}
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
                    ${photoHtml}
                    ${nameHtml}
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
                item.name || 'Produto (foto)',
                qty,
                unitPrice,
                `R$ ${item.total.toFixed(2).replace('.', ',')}`
            ];
        });
        // Guarda referência das fotos para renderizar no PDF
        const photoRefs = items.map(item => item.photo || null);

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
            // Aumenta altura das linhas que têm foto
            didParseCell: (data) => {
                if (data.column.index === 1 && data.section === 'body') {
                    const photo = photoRefs[data.row.index];
                    if (photo) {
                        data.cell.styles.minCellHeight = 20;
                    }
                }
            },
            // Desenha foto na célula PRODUTO
            didDrawCell: (data) => {
                if (data.column.index === 1 && data.section === 'body') {
                    const photo = photoRefs[data.row.index];
                    if (photo) {
                        const imgSize = 14;
                        const x = data.cell.x + 2;
                        const y = data.cell.y + (data.cell.height - imgSize) / 2;
                        doc.addImage(photo, 'JPEG', x, y, imgSize, imgSize);
                    }
                }
            },
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

    // Fechar modal de visualização de foto ao clicar fora
    document.getElementById('photo-viewer-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closePhotoViewer();
        }
    });

    // Bloquear letras nos campos de preço (apenas dígitos permitidos)
    ['item-price', 'item-price-kg'].forEach(function (id) {
        document.getElementById(id).addEventListener('keypress', function (e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    });

    // Bloquear letras no campo de peso (dígitos e vírgula permitidos)
    document.getElementById('item-weight').addEventListener('keypress', function (e) {
        if (!/[0-9,]/.test(e.key)) {
            e.preventDefault();
        }
    });

    // Eventos para a Galeria de Busca por Foto
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', populateSearchGallery);
        searchInput.addEventListener('blur', hideSearchGallery);
    }

    // Remove erro visual ao interagir com o campo
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('input-error');
        });
        input.addEventListener('input', function() {
            this.classList.remove('input-error');
        });
    });

    // Permite rolar a galeria de busca lateralmente usando o scroll do mouse (vertical -> horizontal)
    const gallery = document.getElementById('search-photo-gallery');
    if (gallery) {
        gallery.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault(); // Impede a rolagem da página inteira
                this.scrollLeft += e.deltaY; // Move a barra de rolagem horizontal
            }
        });
    }
});

// ===== Funções da Galeria de Busca =====

function populateSearchGallery() {
    const gallery = document.getElementById('search-photo-gallery');
    if (!gallery) return;

    // Filtra apenas itens que têm foto
    const itemsWithPhotos = itemsArray.map((item, index) => ({ item, index })).filter(obj => obj.item.photo);

    // Se não houver fotos na lista, não mostra o dropdown
    if (itemsWithPhotos.length === 0) {
        gallery.style.display = 'none';
        return;
    }

    gallery.innerHTML = '';
    
    // Adiciona as miniaturas
    itemsWithPhotos.forEach(obj => {
        const img = document.createElement('img');
        img.src = obj.item.photo;
        img.className = 'search-photo-thumbnail';
        img.alt = obj.item.name || 'Produto';
        img.title = obj.item.name || 'Ir para o produto';
        
        // No mousedown em vez de click, porque o blur do input acontece antes do click, fechando a galeria.
        img.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Impede que o input perca o foco imediatamente
            scrollToItem(obj.index);
        });

        gallery.appendChild(img);
    });

    gallery.style.display = 'flex';
}

function hideSearchGallery() {
    const gallery = document.getElementById('search-photo-gallery');
    if (gallery) {
        // Pequeno atraso para garantir que cliques na galeria sejam processados
        setTimeout(() => {
            gallery.style.display = 'none';
        }, 150);
    }
}

function scrollToItem(index) {
    hideSearchGallery();
    
    // Agora, em vez de apenas rolar, vamos FILTRAR a lista por este item
    searchPhotoFilterIndex = index;
    const item = itemsArray[index];
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Formata o ID da imagem (ex: P-01, P-02) baseando-se no originalIndex + 1
        const photoId = "P-" + String(index + 1).padStart(2, '0');
        
        // Insere o nome ou o ID formatado para o usuário poder "Limpar" apagando o texto
        searchInput.value = item.name ? item.name : photoId;
        searchQuery = ''; // limpa a query de texto para não conflitar
    }

    // Atualiza a lista com o filtro aplicado
    updateItemList();

    // Procura o card e rola até ele
    setTimeout(() => {
        const itemCard = document.getElementById(`item-card-${index}`);
        if (itemCard) {
            itemCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Adiciona a classe de destaque e remove depois que a animação (2s) terminar
            itemCard.classList.remove('highlight-item'); // reseta caso já tenha
            void itemCard.offsetWidth; // força reflow
            itemCard.classList.add('highlight-item');
            
            setTimeout(() => {
                if(itemCard) itemCard.classList.remove('highlight-item');
            }, 2000);
        }
    }, 50);
}
