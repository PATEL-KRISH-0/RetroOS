// Calculator Application
class Calculator {
    constructor() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.history = [];
        this.memory = 0;
    }

    getWindowConfig() {
        return {
            title: 'Calculator',
            icon: 'ri-calculator-line',
            width: 350,
            height: 500
        };
    }

    render() {
        return `
            <div class="calculator-content">
                <div class="calculator-display-container">
                    <div class="calculator-history"></div>
                    <input type="text" class="calculator-display" readonly value="${this.display}">
                </div>
                
                <div class="calculator-buttons">
                    <button class="calc-button memory" data-action="memory-clear">MC</button>
                    <button class="calc-button memory" data-action="memory-recall">MR</button>
                    <button class="calc-button memory" data-action="memory-add">M+</button>
                    <button class="calc-button memory" data-action="memory-subtract">M-</button>
                    
                    <button class="calc-button clear" data-action="clear">C</button>
                    <button class="calc-button clear" data-action="clear-entry">CE</button>
                    <button class="calc-button operator" data-action="backspace">⌫</button>
                    <button class="calc-button operator" data-action="divide">÷</button>
                    
                    <button class="calc-button number" data-number="7">7</button>
                    <button class="calc-button number" data-number="8">8</button>
                    <button class="calc-button number" data-number="9">9</button>
                    <button class="calc-button operator" data-action="multiply">×</button>
                    
                    <button class="calc-button number" data-number="4">4</button>
                    <button class="calc-button number" data-number="5">5</button>
                    <button class="calc-button number" data-number="6">6</button>
                    <button class="calc-button operator" data-action="subtract">−</button>
                    
                    <button class="calc-button number" data-number="1">1</button>
                    <button class="calc-button number" data-number="2">2</button>
                    <button class="calc-button number" data-number="3">3</button>
                    <button class="calc-button operator" data-action="add">+</button>
                    
                    <button class="calc-button function" data-action="sign">±</button>
                    <button class="calc-button number" data-number="0">0</button>
                    <button class="calc-button function" data-action="decimal">.</button>
                    <button class="calc-button equals" data-action="equals">=</button>
                    
                    <button class="calc-button function" data-action="sqrt">√</button>
                    <button class="calc-button function" data-action="square">x²</button>
                    <button class="calc-button function" data-action="reciprocal">1/x</button>
                    <button class="calc-button function" data-action="percent">%</button>
                </div>
                
                <div class="calculator-footer">
                    <button class="history-button" data-action="show-history">
                        <i class="ri-history-line"></i>
                        History
                    </button>
                    <div class="memory-indicator" style="display: none;">
                        <i class="ri-save-line"></i>
                        Memory: <span class="memory-value">0</span>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Button clicks
        window.querySelectorAll('.calc-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleButtonClick(button);
            });
        });
        
        // History button
        const historyButton = window.querySelector('.history-button');
        historyButton.addEventListener('click', () => {
            this.showHistory();
        });
        
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Focus on calculator for keyboard input
        window.addEventListener('click', () => {
            window.focus();
        });
    }

    handleButtonClick(button) {
        if (button.dataset.number !== undefined) {
            this.inputNumber(button.dataset.number);
        } else if (button.dataset.action) {
            this.performAction(button.dataset.action);
        }
        
        this.updateDisplay();
        this.addButtonAnimation(button);
    }

    handleKeyDown(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else {
            switch (e.key) {
                case '+':
                    this.performAction('add');
                    break;
                case '-':
                    this.performAction('subtract');
                    break;
                case '*':
                    this.performAction('multiply');
                    break;
                case '/':
                    this.performAction('divide');
                    break;
                case '=':
                case 'Enter':
                    this.performAction('equals');
                    break;
                case '.':
                    this.performAction('decimal');
                    break;
                case 'Escape':
                    this.performAction('clear');
                    break;
                case 'Backspace':
                    this.performAction('backspace');
                    break;
                case '%':
                    this.performAction('percent');
                    break;
            }
        }
        
        this.updateDisplay();
    }

    inputNumber(number) {
        if (this.waitingForOperand) {
            this.display = number;
            this.waitingForOperand = false;
        } else {
            this.display = this.display === '0' ? number : this.display + number;
        }
    }

    performAction(action) {
        const inputValue = parseFloat(this.display);
        
        switch (action) {
            case 'clear':
                this.display = '0';
                this.previousValue = null;
                this.operation = null;
                this.waitingForOperand = false;
                break;
                
            case 'clear-entry':
                this.display = '0';
                break;
                
            case 'backspace':
                if (this.display.length > 1) {
                    this.display = this.display.slice(0, -1);
                } else {
                    this.display = '0';
                }
                break;
                
            case 'decimal':
                if (this.waitingForOperand) {
                    this.display = '0.';
                    this.waitingForOperand = false;
                } else if (this.display.indexOf('.') === -1) {
                    this.display += '.';
                }
                break;
                
            case 'sign':
                if (this.display !== '0') {
                    this.display = this.display.startsWith('-') ? 
                        this.display.slice(1) : 
                        '-' + this.display;
                }
                break;
                
            case 'percent':
                this.display = String(inputValue / 100);
                break;
                
            case 'sqrt':
                if (inputValue >= 0) {
                    this.display = String(Math.sqrt(inputValue));
                    this.addToHistory(`√${inputValue} = ${this.display}`);
                } else {
                    this.display = 'Error';
                }
                break;
                
            case 'square':
                this.display = String(inputValue * inputValue);
                this.addToHistory(`${inputValue}² = ${this.display}`);
                break;
                
            case 'reciprocal':
                if (inputValue !== 0) {
                    this.display = String(1 / inputValue);
                    this.addToHistory(`1/${inputValue} = ${this.display}`);
                } else {
                    this.display = 'Error';
                }
                break;
                
            case 'memory-clear':
                this.memory = 0;
                this.updateMemoryIndicator();
                break;
                
            case 'memory-recall':
                this.display = String(this.memory);
                break;
                
            case 'memory-add':
                this.memory += inputValue;
                this.updateMemoryIndicator();
                break;
                
            case 'memory-subtract':
                this.memory -= inputValue;
                this.updateMemoryIndicator();
                break;
                
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                if (this.previousValue === null) {
                    this.previousValue = inputValue;
                } else if (this.operation && !this.waitingForOperand) {
                    const result = this.calculate(this.previousValue, inputValue, this.operation);
                    this.display = String(result);
                    this.previousValue = result;
                }
                
                this.operation = action;
                this.waitingForOperand = true;
                break;
                
            case 'equals':
                if (this.previousValue !== null && this.operation && !this.waitingForOperand) {
                    const result = this.calculate(this.previousValue, inputValue, this.operation);
                    const calculation = `${this.previousValue} ${this.getOperatorSymbol(this.operation)} ${inputValue} = ${result}`;
                    
                    this.display = String(result);
                    this.addToHistory(calculation);
                    this.previousValue = null;
                    this.operation = null;
                    this.waitingForOperand = true;
                }
                break;
        }
    }

    calculate(firstValue, secondValue, operation) {
        switch (operation) {
            case 'add':
                return firstValue + secondValue;
            case 'subtract':
                return firstValue - secondValue;
            case 'multiply':
                return firstValue * secondValue;
            case 'divide':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            default:
                return secondValue;
        }
    }

    getOperatorSymbol(operation) {
        switch (operation) {
            case 'add': return '+';
            case 'subtract': return '−';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    updateDisplay() {
        const displayElement = document.querySelector(`#${this.windowId} .calculator-display`);
        if (displayElement) {
            // Format large numbers
            let displayValue = this.display;
            if (!isNaN(displayValue) && displayValue !== '') {
                const num = parseFloat(displayValue);
                if (Math.abs(num) >= 1000000000) {
                    displayValue = num.toExponential(6);
                } else if (Math.abs(num) >= 1000) {
                    displayValue = num.toLocaleString();
                } else if (num % 1 !== 0) {
                    displayValue = num.toFixed(8).replace(/\.?0+$/, '');
                }
            }
            
            displayElement.value = displayValue;
        }
    }

    addToHistory(calculation) {
        this.history.unshift(calculation);
        
        // Limit history size
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        // Update history display
        const historyElement = document.querySelector(`#${this.windowId} .calculator-history`);
        if (historyElement && this.history.length > 0) {
            historyElement.textContent = this.history[0];
            historyElement.style.display = 'block';
        }
    }

    updateMemoryIndicator() {
        const indicator = document.querySelector(`#${this.windowId} .memory-indicator`);
        const memoryValue = document.querySelector(`#${this.windowId} .memory-value`);
        
        if (indicator && memoryValue) {
            if (this.memory !== 0) {
                indicator.style.display = 'flex';
                memoryValue.textContent = this.memory;
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    showHistory() {
        if (this.history.length === 0) {
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('History', 'No calculations in history', 'info');
            }
            return;
        }
        
        // Create history modal
        const modal = document.createElement('div');
        modal.className = 'calculator-history-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Calculation History</h3>
                    <button class="modal-close">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="history-list">
                        ${this.history.map(calc => `
                            <div class="history-item">${calc}</div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="clear-history-button">Clear History</button>
                </div>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.clear-history-button').addEventListener('click', () => {
            this.history = [];
            modal.remove();
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('History Cleared', 'Calculation history cleared', 'success');
            }
        });
    }

    addButtonAnimation(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease-out';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }

    cleanup() {
        // Clean up any resources
        this.history = [];
        this.memory = 0;
    }
}

// Add calculator-specific styles
const calculatorStyles = document.createElement('style');
calculatorStyles.textContent = `
    .calculator-display-container {
        padding: var(--spacing-lg);
        background: #0f172a;
        border-radius: var(--radius-lg);
        margin-bottom: var(--spacing-lg);
    }
    
    .calculator-history {
        color: #64748b;
        font-size: 0.875rem;
        margin-bottom: var(--spacing-sm);
        min-height: 20px;
        text-align: right;
        display: none;
    }
    
    .calculator-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md) 0;
        border-top: 1px solid #475569;
        margin-top: var(--spacing-lg);
    }
    
    .history-button {
        background: none;
        border: 1px solid #475569;
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.875rem;
        transition: all var(--transition-fast);
    }
    
    .history-button:hover {
        background: #475569;
    }
    
    .memory-indicator {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: #10b981;
        font-size: 0.875rem;
    }
    
    .calc-button.memory {
        background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
        border-color: #0d9488;
    }
    
    .calc-button.function {
        background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
        border-color: #8b5cf6;
    }
    
    .calculator-history-modal .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    }
    
    .calculator-history-modal .modal-content {
        background: white;
        border-radius: var(--radius-xl);
        width: 400px;
        max-height: 500px;
        box-shadow: var(--shadow-xl);
        position: relative;
        z-index: 1;
    }
    
    .calculator-history-modal .modal-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .calculator-history-modal .modal-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
    }
    
    .calculator-history-modal .modal-close:hover {
        background: #f1f5f9;
    }
    
    .calculator-history-modal .modal-body {
        padding: var(--spacing-lg);
        max-height: 300px;
        overflow-y: auto;
    }
    
    .calculator-history-modal .history-item {
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-xs);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        background: #f8fafc;
        border: 1px solid var(--border-color);
    }
    
    .calculator-history-modal .modal-footer {
        padding: var(--spacing-lg);
        border-top: 1px solid var(--border-color);
        text-align: center;
    }
    
    .clear-history-button {
        background: #ef4444;
        color: white;
        border: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .clear-history-button:hover {
        background: #dc2626;
    }
`;
document.head.appendChild(calculatorStyles);