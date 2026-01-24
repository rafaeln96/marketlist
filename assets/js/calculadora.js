// ===== Calculator State =====
let currentExpression = '';
let lastResult = '';

// ===== Calculator Functions =====

// Append a value to the current expression
function appendValue(value) {
    currentExpression += value;
    updateDisplay();
}

// Append an operator to the current expression
function appendOperator(operator) {
    // Prevent starting with an operator (except minus)
    if (currentExpression === '' && operator !== '-') {
        return;
    }

    // Prevent consecutive operators
    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1);
    }

    currentExpression += operator;
    updateDisplay();
}

// Clear the calculator
function clearCalc() {
    currentExpression = '';
    lastResult = '';
    document.getElementById('calc-expression').textContent = '';
    document.getElementById('calc-result').textContent = '0';
}

// Backspace - remove last character
function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

// Calculate the result
function calculate() {
    if (currentExpression === '') return;

    try {
        // Replace display operators with JS operators
        let expression = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');

        // Evaluate the expression
        let result = eval(expression);

        // Handle division by zero
        if (!isFinite(result)) {
            throw new Error('Divisão por zero');
        }

        // Format the result
        if (Number.isInteger(result)) {
            lastResult = result.toString();
        } else {
            lastResult = parseFloat(result.toFixed(10)).toString();
        }

        document.getElementById('calc-expression').textContent = currentExpression + ' =';
        document.getElementById('calc-result').textContent = formatNumber(lastResult);

        // Set expression to result for continued calculations
        currentExpression = lastResult;

    } catch (error) {
        document.getElementById('calc-result').textContent = 'Erro';
        currentExpression = '';
    }
}

// Format number with thousands separator
function formatNumber(num) {
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
}

// Update the display
function updateDisplay() {
    const expressionDisplay = document.getElementById('calc-expression');
    const resultDisplay = document.getElementById('calc-result');

    // Format expression for display
    let displayExpression = currentExpression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');

    expressionDisplay.textContent = displayExpression;

    // Try to show live preview of result
    if (currentExpression) {
        try {
            let expression = currentExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');

            // Only evaluate if expression ends with a number or closing parenthesis
            const lastChar = expression.slice(-1);
            if (/[0-9)]/.test(lastChar)) {
                let result = eval(expression);
                if (isFinite(result)) {
                    if (Number.isInteger(result)) {
                        resultDisplay.textContent = formatNumber(result.toString());
                    } else {
                        resultDisplay.textContent = formatNumber(parseFloat(result.toFixed(10)).toString());
                    }
                }
            }
        } catch (e) {
            // Expression not complete, show current input
            resultDisplay.textContent = displayExpression || '0';
        }
    } else {
        resultDisplay.textContent = '0';
    }
}

// ===== Mobile Menu =====
function menuShow() {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('open');
}

// ===== Keyboard Support =====
document.addEventListener('keydown', function (event) {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        appendValue(key);
    } else if (key === '.') {
        appendValue('.');
    } else if (key === '+') {
        appendOperator('+');
    } else if (key === '-') {
        appendOperator('-');
    } else if (key === '*') {
        appendOperator('*');
    } else if (key === '/') {
        event.preventDefault();
        appendOperator('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearCalc();
    } else if (key === '(' || key === ')') {
        appendValue(key);
    }
});
