// DOM Elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const todoEmptyState = document.getElementById('todoEmptyState');
const todoCount = document.getElementById('todoCount');
const totalTasks = document.getElementById('totalTasks');

const customerInput = document.getElementById('customer');
const productInput = document.getElementById('product');
const qtyInput = document.getElementById('qty');
const priceInput = document.getElementById('price');
const dueDateInput = document.getElementById('dueDate');
const debtList = document.getElementById('debtList');
const debtEmptyState = document.getElementById('debtEmptyState');
const debtTotalAmount = document.getElementById('debtTotalAmount');
const debtCount = document.getElementById('debtCount');
const totalDebt = document.getElementById('totalDebt');
const totalCustomers = document.getElementById('totalCustomers');

const confirmationModal = document.getElementById('confirmationModal');
const modalMessage = document.getElementById('modalMessage');
const confirmDeleteBtn = document.getElementById('confirmDelete');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let debts = JSON.parse(localStorage.getItem('debts')) || [];
let currentFilter = 'all';
let currentSort = 'date';
let itemToDelete = null;
let deleteType = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDate();
    loadTodos();
    loadDebts();
    setupEventListeners();
    updateStats();
});

// Setup event listeners
function setupEventListeners() {
    // Todo filter buttons
    document.getElementById('filterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('filterPending').addEventListener('click', () => setFilter('pending'));
    document.getElementById('filterCompleted').addEventListener('click', () => setFilter('completed'));
    
    // Debt sort buttons
    document.getElementById('sortByDate').addEventListener('click', () => setSort('date'));
    document.getElementById('sortByAmount').addEventListener('click', () => setSort('amount'));
    
    // Enter key for adding todo
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    // Enter key for adding debt (for any input in debt form)
    const debtInputs = [customerInput, productInput, qtyInput, priceInput, dueDateInput];
    debtInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addDebt();
        });
    });
    
    // Confirm delete button
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirmation);
    
    // Close modal when clicking outside
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) closeModal();
    });
}

// Initialize date input with today's date
function initializeDate() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    dueDateInput.min = today.toISOString().split('T')[0];
    dueDateInput.value = nextWeek.toISOString().split('T')[0];
}

// Todo Functions
function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        showAlert('Iltimos, vazifa nomini kiriting!', 'warning');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    loadTodos();
    
    todoInput.value = '';
    todoInput.focus();
    
    showAlert('Vazifa muvaffaqiyatli qo\'shildi!', 'success');
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    saveTodos();
    loadTodos();
    showAlert('Vazifa holati o\'zgartirildi!', 'info');
}

function deleteTodo(id) {
    itemToDelete = id;
    deleteType = 'todo';
    modalMessage.textContent = 'Ushbu vazifani o\'chirishni istaysizmi?';
    confirmationModal.style.display = 'flex';
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newText = prompt('Vazifa nomini tahrirlang:', todo.text);
    
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        saveTodos();
        loadTodos();
        showAlert('Vazifa muvaffaqiyatli tahrirlandi!', 'success');
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
        .classList.add('active');
    
    loadTodos();
}

function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        showAlert('Bajarilgan vazifalar mavjud emas!', 'info');
        return;
    }
    
    itemToDelete = 'completed';
    deleteType = 'completed_todos';
    modalMessage.textContent = `Hamma bajarilgan vazifalarni (${completedCount} ta) o'chirishni istaysizmi?`;
    confirmationModal.style.display = 'flex';
}

// Debt Functions
function addDebt() {
    const customer = customerInput.value.trim();
    const product = productInput.value.trim();
    const qty = parseInt(qtyInput.value);
    const price = parseInt(priceInput.value);
    const dueDate = dueDateInput.value;
    
    // Validation
    if (!customer) {
        showAlert('Iltimos, mijoz ismini kiriting!', 'warning');
        customerInput.focus();
        return;
    }
    
    if (!product) {
        showAlert('Iltimos, mahsulot nomini kiriting!', 'warning');
        productInput.focus();
        return;
    }
    
    if (!qty || qty <= 0) {
        showAlert('Iltimos, to\'g\'ri miqdorni kiriting!', 'warning');
        qtyInput.focus();
        return;
    }
    
    if (!price || price <= 0) {
        showAlert('Iltimos, to\'g\'ri narxni kiriting!', 'warning');
        priceInput.focus();
        return;
    }
    
    if (!dueDate) {
        showAlert('Iltimos, qaytarish sanasini tanlang!', 'warning');
        dueDateInput.focus();
        return;
    }
    
    const total = qty * price;
    const newDebt = {
        id: Date.now(),
        customer: customer,
        product: product,
        qty: qty,
        price: price,
        total: total,
        dueDate: dueDate,
        paid: false,
        createdAt: new Date().toISOString()
    };
    
    debts.unshift(newDebt);
    saveDebts();
    loadDebts();
    
    // Reset form
    customerInput.value = '';
    productInput.value = '';
    qtyInput.value = '';
    priceInput.value = '';
    initializeDate();
    
    customerInput.focus();
    showAlert('Nasiya muvaffaqiyatli qo\'shildi!', 'success');
}

function toggleDebtPaid(id) {
    debts = debts.map(debt => 
        debt.id === id ? { ...debt, paid: !debt.paid } : debt
    );
    
    saveDebts();
    loadDebts();
    showAlert('Nasiya holati o\'zgartirildi!', 'info');
}

function deleteDebt(id) {
    itemToDelete = id;
    deleteType = 'debt';
    modalMessage.textContent = 'Ushbu nasiyani o\'chirishni istaysizmi?';
    confirmationModal.style.display = 'flex';
}

function editDebt(id) {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    const newCustomer = prompt('Mijoz ismini tahrirlang:', debt.customer);
    if (newCustomer === null) return;
    
    const newProduct = prompt('Mahsulot nomini tahrirlang:', debt.product);
    if (newProduct === null) return;
    
    const newQty = prompt('Miqdorni tahrirlang:', debt.qty);
    if (newQty === null) return;
    
    const newPrice = prompt('Narxni tahrirlang:', debt.price);
    if (newPrice === null) return;
    
    if (newCustomer.trim() && newProduct.trim() && !isNaN(newQty) && !isNaN(newPrice)) {
        debt.customer = newCustomer.trim();
        debt.product = newProduct.trim();
        debt.qty = parseInt(newQty);
        debt.price = parseInt(newPrice);
        debt.total = debt.qty * debt.price;
        
        saveDebts();
        loadDebts();
        showAlert('Nasiya muvaffaqiyatli tahrirlandi!', 'success');
    } else {
        showAlert('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring!', 'warning');
    }
}

function setSort(sortType) {
    currentSort = sortType;
    
    // Update active button
    document.querySelectorAll('#sortByDate, #sortByAmount').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`sortBy${sortType.charAt(0).toUpperCase() + sortType.slice(1)}`)
        .classList.add('active');
    
    loadDebts();
}

function clearPaidDebts() {
    const paidCount = debts.filter(debt => debt.paid).length;
    
    if (paidCount === 0) {
        showAlert('To\'langan nasiyalar mavjud emas!', 'info');
        return;
    }
    
    itemToDelete = 'paid';
    deleteType = 'paid_debts';
    modalMessage.textContent = `Hamma to'langan nasiyalarni (${paidCount} ta) o'chirishni istaysizmi?`;
    confirmationModal.style.display = 'flex';
}

// Load and Display Functions
function loadTodos() {
    let filteredTodos = [...todos];
    
    // Apply filter
    if (currentFilter === 'pending') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }
    
    // Update UI
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        todoEmptyState.style.display = 'block';
    } else {
        todoEmptyState.style.display = 'none';
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-text">
                    <h4>${todo.text}</h4>
                    <p>${formatDate(todo.createdAt)}</p>
                </div>
                <div class="item-actions">
                    <button class="action-btn complete" onclick="toggleTodo(${todo.id})" 
                        title="${todo.completed ? 'Bajarilmagan deb belgilash' : 'Bajarilgan deb belgilash'}">
                        <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="action-btn edit" onclick="editTodo(${todo.id})" title="Tahrirlash">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteTodo(${todo.id})" title="O'chirish">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }
    
    // Update counters
    const total = todos.length;
    const pending = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;
    
    todoCount.textContent = total;
    totalTasks.textContent = total;
    
    // Update filter buttons text
    document.getElementById('filterAll').textContent = `Hammasi (${total})`;
    document.getElementById('filterPending').textContent = `Bajarilmagan (${pending})`;
    document.getElementById('filterCompleted').textContent = `Bajarilgan (${completed})`;
}

function loadDebts() {
    let sortedDebts = [...debts];
    
    // Apply sort
    if (currentSort === 'date') {
        sortedDebts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'amount') {
        sortedDebts.sort((a, b) => b.total - a.total);
    }
    
    // Update UI
    if (sortedDebts.length === 0) {
        debtList.innerHTML = '';
        debtEmptyState.style.display = 'block';
    } else {
        debtEmptyState.style.display = 'none';
        debtList.innerHTML = sortedDebts.map(debt => {
            const dueDate = new Date(debt.dueDate);
            const today = new Date();
            const isOverdue = !debt.paid && dueDate < today;
            
            return `
                <li class="debt-item ${debt.paid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="debt-info">
                        <h4>${debt.customer} - ${debt.product}</h4>
                        <div class="debt-details">
                            <span class="debt-detail">
                                <i class="fas fa-hashtag"></i> ${debt.qty} ta
                            </span>
                            <span class="debt-detail">
                                <i class="fas fa-money-bill-wave"></i> ${formatMoney(debt.price)} so'm
                            </span>
                            <span class="debt-detail">
                                <i class="fas fa-calendar"></i> ${formatDate(debt.dueDate)}
                            </span>
                            ${isOverdue ? '<span class="debt-detail" style="color: #f72585;"><i class="fas fa-exclamation-triangle"></i> Muddat o\'tgan</span>' : ''}
                        </div>
                    </div>
                    <div class="debt-amount">
                        ${formatMoney(debt.total)} so'm
                    </div>
                    <div class="item-actions">
                        <button class="action-btn pay" onclick="toggleDebtPaid(${debt.id})" 
                            title="${debt.paid ? 'To\'lanmagan deb belgilash' : 'To\'langan deb belgilash'}">
                            <i class="fas fa-${debt.paid ? 'undo' : 'check-circle'}"></i>
                        </button>
                        <button class="action-btn edit" onclick="editDebt(${debt.id})" title="Tahrirlash">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteDebt(${debt.id})" title="O'chirish">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }
    
    // Update counters
    const totalAmount = debts.reduce((sum, debt) => sum + debt.total, 0);
    const paidAmount = debts.filter(debt => debt.paid).reduce((sum, debt) => sum + debt.total, 0);
    const pendingAmount = totalAmount - paidAmount;
    const uniqueCustomers = [...new Set(debts.map(debt => debt.customer))].length;
    
    debtTotalAmount.textContent = formatMoney(pendingAmount);
    debtCount.textContent = debts.length;
    totalDebt.textContent = formatMoney(pendingAmount);
    totalCustomers.textContent = uniqueCustomers;
    
    // Update sort buttons text
    document.getElementById('sortByDate').innerHTML = `<i class="fas fa-calendar"></i> Sana bo'yicha (${debts.length})`;
    document.getElementById('sortByAmount').innerHTML = `<i class="fas fa-money-bill"></i> Summa bo'yicha`;
}

// Utility Functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function saveDebts() {
    localStorage.setItem('debts', JSON.stringify(debts));
}

function updateStats() {
    // Stats are updated in loadTodos and loadDebts
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function showAlert(message, type) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getIconByType(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: ${getComputedStyle(document.documentElement).getPropertyValue('--border-radius')};
        background: ${getColorByType(type)};
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function getIconByType(type) {
    const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle',
        'danger': 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

function getColorByType(type) {
    const colors = {
        'success': '#4cc9f0',
        'warning': '#f8961e',
        'info': '#4361ee',
        'danger': '#f72585'
    };
    return colors[type] || '#4361ee';
}

// Modal Functions
function handleDeleteConfirmation() {
    if (deleteType === 'todo') {
        todos = todos.filter(todo => todo.id !== itemToDelete);
        saveTodos();
        loadTodos();
        showAlert('Vazifa o\'chirildi!', 'success');
    } 
    else if (deleteType === 'completed_todos') {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        loadTodos();
        showAlert('Bajarilgan vazifalar o\'chirildi!', 'success');
    }
    else if (deleteType === 'debt') {
        debts = debts.filter(debt => debt.id !== itemToDelete);
        saveDebts();
        loadDebts();
        showAlert('Nasiya o\'chirildi!', 'success');
    }
    else if (deleteType === 'paid_debts') {
        debts = debts.filter(debt => !debt.paid);
        saveDebts();
        loadDebts();
        showAlert('To\'langan nasiyalar o\'chirildi!', 'success');
    }
    
    closeModal();
}

function closeModal() {
    confirmationModal.style.display = 'none';
    itemToDelete = null;
    deleteType = null;
}