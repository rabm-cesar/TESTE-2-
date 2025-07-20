document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const balanceValueEl = document.getElementById('balance-value');
    const transactionListEl = document.getElementById('transaction-list');
    
    // Modal de Transação
    const transactionModalOverlay = document.getElementById('transaction-modal-overlay');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const closeTransactionModalBtn = document.getElementById('close-transaction-modal-btn');
    const transactionForm = document.getElementById('transaction-form');
    const typeExpenseBtn = document.getElementById('type-expense');
    const typeIncomeBtn = document.getElementById('type-income');
    const amountInput = document.getElementById('modal-amount');
    const descriptionInput = document.getElementById('modal-description');
    const categoryInput = document.getElementById('modal-category');

    // Modal de Relatório
    const reportModalOverlay = document.getElementById('report-modal-overlay');
    const openReportModalBtn = document.getElementById('open-report-modal-btn');
    const closeReportModalBtn = document.getElementById('close-report-modal-btn');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportOutputArea = document.getElementById('report-output-area');

    // --- ESTADO DA APLICAÇÃO ---
    let transactions = [];
    let transactionType = 'despesa';

    // --- FUNÇÕES ---

    // Funções do Modal de Transação
    const openTransactionModal = () => transactionModalOverlay.classList.remove('hidden');
    const closeTransactionModal = () => {
        transactionModalOverlay.classList.add('hidden');
        transactionForm.reset();
        typeExpenseBtn.classList.add('active');
        typeIncomeBtn.classList.remove('active');
        transactionType = 'despesa';
    };

    // Funções do Modal de Relatório
    const openReportModal = () => reportModalOverlay.classList.remove('hidden');
    const closeReportModal = () => reportModalOverlay.classList.add('hidden');

    // Função para atualizar o saldo
    function updateBalance() {
        const total = transactions.reduce((acc, t) => t.type === 'receita' ? acc + t.amount : acc - t.amount, 0);
        balanceValueEl.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    const categoryIcons = {'Alimentação': '🍔', 'Transporte': '🚗', 'Moradia': '🏠', 'Lazer': '🎬', 'Salário': '💰', 'Educação': '📚', 'Saúde': '💊', 'Outros': '📦'};

    // Função para renderizar as transações
    function renderTransactions() {
        transactionListEl.innerHTML = '';
        if (transactions.length === 0) {
            transactionListEl.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Nenhuma transação ainda.</p>';
            return;
        }

        transactions.slice().reverse().forEach(t => {
            const li = document.createElement('li');
            li.className = 'transaction-item';

            const valueClass = t.type === 'receita' ? 'income' : 'expense';
            const sign = t.type === 'receita' ? '+' : '-';
            const formattedValue = t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const formattedDate = new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
            
            li.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-icon">${categoryIcons[t.category] || '❓'}</div>
                    <div class="transaction-info">
                        <p class="transaction-category">${t.description}</p>
                        <p class="transaction-date">${t.category} • ${formattedDate}</p>
                    </div>
                </div>
                <div class="transaction-value ${valueClass}">
                    <p>${sign} ${formattedValue}</p>
                </div>
            `;
            transactionListEl.appendChild(li);
        });
    }

    // Função para adicionar uma nova transação
    function addTransaction(e) {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        if (!descriptionInput.value || !amount || !categoryInput.value) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        transactions.push({
            id: Date.now(),
            type: transactionType,
            amount,
            description: descriptionInput.value,
            category: categoryInput.value,
            date: new Date().toISOString().slice(0, 10)
        });
        updateBalance();
        renderTransactions();
        closeTransactionModal();
    }
    
    // Função para gerar o relatório
    function generateReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;

        if (!startDate || !endDate) {
            alert('Por favor, selecione a data de início e de fim.');
            return;
        }
        if (startDate > endDate) {
            alert('A data de início não pode ser posterior à data de fim.');
            return;
        }

        const filteredExpenses = transactions.filter(t => t.type === 'despesa' && t.date >= startDate && t.date <= endDate);

        if (filteredExpenses.length === 0) {
            reportOutputArea.innerHTML = '<p>Nenhuma despesa encontrada no período selecionado.</p>';
            return;
        }

        const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        let reportHTML = '<ul>';
        for (const category in expensesByCategory) {
            const totalAmount = expensesByCategory[category].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            reportHTML += `<li><span>${categoryIcons[category] || '❓'} ${category}</span> <strong>${totalAmount}</strong></li>`;
        }
        reportHTML += '</ul>';
        reportOutputArea.innerHTML = reportHTML;
    }

    // --- EVENT LISTENERS ---

    // Modal de Transação
    addTransactionBtn.addEventListener('click', openTransactionModal);
    closeTransactionModalBtn.addEventListener('click', closeTransactionModal);
    typeExpenseBtn.addEventListener('click', () => { transactionType = 'despesa'; typeExpenseBtn.classList.add('active'); typeIncomeBtn.classList.remove('active'); });
    typeIncomeBtn.addEventListener('click', () => { transactionType = 'receita'; typeIncomeBtn.classList.add('active'); typeExpenseBtn.classList.remove('active'); });
    transactionForm.addEventListener('submit', addTransaction);
    
    // Modal de Relatório
    openReportModalBtn.addEventListener('click', openReportModal);
    closeReportModalBtn.addEventListener('click', closeReportModal);
    generateReportBtn.addEventListener('click', generateReport);
    
    // Fechar modais ao clicar fora
    [transactionModalOverlay, reportModalOverlay].forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                closeTransactionModal();
                closeReportModal();
            }
        });
    });

    // --- INICIALIZAÇÃO ---
    updateBalance();
    renderTransactions();
});
