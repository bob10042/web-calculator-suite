class AdvancedCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.operationDisplay = document.getElementById('operationDisplay');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = JSON.parse(localStorage.getItem('calcHistory')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateHistory();
        this.loadTheme();
    }

    setupEventListeners() {
        // Button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.handleButtonClick.bind(this));
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));
        
        // History toggle
        document.getElementById('historyToggle').addEventListener('click', this.toggleHistory.bind(this));
        
        // Clear history
        document.getElementById('clearHistory').addEventListener('click', this.clearHistory.bind(this));
        
        // Export history
        document.getElementById('exportHistory').addEventListener('click', this.exportHistory.bind(this));
        
        // About modal
        document.getElementById('aboutBtn').addEventListener('click', this.showAbout.bind(this));
        
        // Terminal modal
        document.getElementById('terminalBtn').addEventListener('click', this.showTerminal.bind(this));
        
        // Modal close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.closeModal.bind(this));
        });
        document.getElementById('aboutModal').addEventListener('click', (e) => {
            if (e.target.id === 'aboutModal') this.closeModal();
        });
        document.getElementById('terminalModal').addEventListener('click', (e) => {
            if (e.target.id === 'terminalModal') this.closeModal();
        });

        // Keyboard support
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('keyup', this.handleKeyboardUp.bind(this));

        // History item clicks
        this.historyList.addEventListener('click', this.handleHistoryClick.bind(this));
    }

    handleButtonClick(e) {
        const button = e.target;
        this.animateButton(button);
        
        if (button.dataset.number) {
            this.inputNumber(button.dataset.number);
        } else if (button.dataset.action) {
            this.performAction(button.dataset.action);
        }
    }

    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 150);
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    performAction(action) {
        const current = parseFloat(this.currentValue);

        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clearEntry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'plusMinus':
                this.toggleSign();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.performCalculation();
                this.operator = action;
                this.previousValue = current;
                this.waitingForOperand = true;
                this.updateOperationDisplay();
                break;
            case 'equals':
                this.performCalculation();
                this.addToHistory();
                this.operator = null;
                this.previousValue = null;
                this.waitingForOperand = true;
                this.operationDisplay.textContent = '';
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'sqrt':
            case 'log':
            case 'ln':
                this.performScientificOperation(action, current);
                break;
            case 'power':
                this.performPowerOperation();
                break;
            case 'threephase':
                this.performThreePhaseCalculation();
                break;
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'ms':
                this.memoryStore();
                break;
            case 'mplus':
                this.memoryAdd();
                break;
        }
    }

    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        if (this.previousValue === null || this.operator === null) {
            return;
        }

        let result;
        switch (this.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
        this.updateDisplay();
    }

    performScientificOperation(operation, value) {
        let result;
        const calculation = `${operation}(${value})`;

        switch (operation) {
            case 'sin':
                result = Math.sin(this.toRadians(value));
                break;
            case 'cos':
                result = Math.cos(this.toRadians(value));
                break;
            case 'tan':
                result = Math.tan(this.toRadians(value));
                break;
            case 'sqrt':
                if (value < 0) {
                    this.showError('Invalid input for square root');
                    return;
                }
                result = Math.sqrt(value);
                break;
            case 'log':
                if (value <= 0) {
                    this.showError('Logarithm requires positive number');
                    return;
                }
                result = Math.log10(value);
                break;
            case 'ln':
                if (value <= 0) {
                    this.showError('Natural logarithm requires positive number');
                    return;
                }
                result = Math.log(value);
                break;
        }

        this.currentValue = this.formatResult(result);
        this.addToHistory(`${calculation} = ${this.currentValue}`);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    performPowerOperation() {
        const base = parseFloat(this.currentValue);
        const exponent = parseFloat(prompt('Enter exponent:'));
        
        if (isNaN(base) || isNaN(exponent)) {
            this.showError('Invalid input for power operation');
            return;
        }

        const result = Math.pow(base, exponent);
        const calculation = `${base}^${exponent} = ${result}`;
        
        this.currentValue = this.formatResult(result);
        this.addToHistory(calculation);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    performThreePhaseCalculation() {
        const voltage = parseFloat(prompt('Enter line voltage (V):'));
        const current = parseFloat(prompt('Enter line current (A):'));
        const powerFactor = parseFloat(prompt('Enter power factor (0-1):') || '0.8');
        
        if (isNaN(voltage) || isNaN(current) || isNaN(powerFactor)) {
            this.showError('Invalid input for 3-phase calculation');
            return;
        }

        const sqrt3 = Math.sqrt(3);
        const realPower = sqrt3 * voltage * current * powerFactor;
        const apparentPower = sqrt3 * voltage * current;
        const reactivePower = sqrt3 * voltage * current * Math.sqrt(1 - Math.pow(powerFactor, 2));

        const calculation = `3-Phase: ${voltage}V, ${current}A, PF=${powerFactor}`;
        
        // Show detailed results
        const results = `3-Phase Power Calculation:
Line Voltage: ${voltage} V
Line Current: ${current} A
Power Factor: ${powerFactor}

Real Power (P): ${realPower.toFixed(2)} W
Apparent Power (S): ${apparentPower.toFixed(2)} VA
Reactive Power (Q): ${reactivePower.toFixed(2)} VAR`;

        alert(results);
        
        this.currentValue = this.formatResult(realPower);
        this.addToHistory(`${calculation} → P=${realPower.toFixed(2)}W`);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    formatResult(result) {
        if (isNaN(result)) return 'Error';
        if (!isFinite(result)) return 'Infinity';
        
        // Format to avoid floating point issues
        const formatted = parseFloat(result.toPrecision(12));
        return formatted.toString();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    toggleSign() {
        if (this.currentValue !== '0') {
            this.currentValue = this.currentValue.startsWith('-') 
                ? this.currentValue.slice(1) 
                : '-' + this.currentValue;
        }
        this.updateDisplay();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.operationDisplay.textContent = '';
        this.updateDisplay();
    }

    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    // Memory Operations
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
        this.showMessage('Memory cleared');
    }

    memoryRecall() {
        this.currentValue = this.memory.toString();
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.showMessage('Value stored in memory');
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.showMessage('Value added to memory');
    }

    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicator.classList.add('active');
        } else {
            this.memoryIndicator.classList.remove('active');
        }
    }

    updateDisplay() {
        // Format large numbers with commas
        const formatted = this.formatDisplayNumber(this.currentValue);
        this.display.textContent = formatted;
    }

    formatDisplayNumber(num) {
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    updateOperationDisplay() {
        if (this.operator && this.previousValue !== null) {
            const operatorSymbol = {
                'add': '+',
                'subtract': '-',
                'multiply': '×',
                'divide': '÷'
            };
            this.operationDisplay.textContent = `${this.previousValue} ${operatorSymbol[this.operator]}`;
        }
    }

    // History Management
    addToHistory(customText = null) {
        const timestamp = new Date().toLocaleString();
        let calculation;

        if (customText) {
            calculation = customText;
        } else if (this.operator && this.previousValue !== null) {
            const operatorSymbol = {
                'add': '+',
                'subtract': '-',
                'multiply': '×',
                'divide': '÷'
            };
            calculation = `${this.previousValue} ${operatorSymbol[this.operator]} ${this.currentValue} = ${this.currentValue}`;
        } else {
            return;
        }

        this.history.unshift({ calculation, timestamp });
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.updateHistory();
    }

    updateHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No calculations yet</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-calculation="${item.calculation}">
                <div class="calculation">${item.calculation}</div>
                <div class="timestamp">${item.timestamp}</div>
            </div>
        `).join('');
    }

    handleHistoryClick(e) {
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            const calculation = historyItem.dataset.calculation;
            const result = calculation.split(' = ').pop();
            if (result && !isNaN(parseFloat(result))) {
                this.currentValue = result;
                this.updateDisplay();
                this.waitingForOperand = true;
            }
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistory();
            this.showMessage('History cleared');
        }
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showMessage('No history to export');
            return;
        }

        const csvContent = 'Calculation,Timestamp\n' + 
            this.history.map(item => `"${item.calculation}","${item.timestamp}"`).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculator_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showMessage('History exported successfully');
    }

    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('active');
        const button = document.getElementById('historyToggle');
        if (this.historyPanel.classList.contains('active')) {
            button.innerHTML = '<i class="fas fa-times"></i> Close History';
        } else {
            button.innerHTML = '<i class="fas fa-history"></i> History';
        }
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const button = document.getElementById('themeToggle');
        if (newTheme === 'dark') {
            button.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            button.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const button = document.getElementById('themeToggle');
        if (savedTheme === 'dark') {
            button.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            button.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }

    // Keyboard Support
    handleKeyboard(e) {
        const key = e.key;
        let button = null;

        if (/[0-9]/.test(key)) {
            button = document.querySelector(`[data-number="${key}"]`);
        } else {
            switch (key) {
                case '+':
                    button = document.querySelector('[data-action="add"]');
                    break;
                case '-':
                    button = document.querySelector('[data-action="subtract"]');
                    break;
                case '*':
                    button = document.querySelector('[data-action="multiply"]');
                    break;
                case '/':
                    button = document.querySelector('[data-action="divide"]');
                    e.preventDefault();
                    break;
                case 'Enter':
                case '=':
                    button = document.querySelector('[data-action="equals"]');
                    e.preventDefault();
                    break;
                case '.':
                    button = document.querySelector('[data-action="decimal"]');
                    break;
                case 'Backspace':
                    button = document.querySelector('[data-action="backspace"]');
                    break;
                case 'Escape':
                    button = document.querySelector('[data-action="clear"]');
                    break;
            }
        }

        if (button) {
            this.animateButton(button);
            button.click();
        }
    }

    handleKeyboardUp(e) {
        // Remove pressed state from any buttons
        document.querySelectorAll('.btn.pressed').forEach(btn => {
            btn.classList.remove('pressed');
        });
    }

    // Modal Management
    showAbout() {
        document.getElementById('aboutModal').style.display = 'block';
    }

    showTerminal() {
        document.getElementById('terminalModal').style.display = 'block';
        document.getElementById('terminalInput').focus();
        this.initializeTerminal();
    }

    closeModal() {
        document.getElementById('aboutModal').style.display = 'none';
        document.getElementById('terminalModal').style.display = 'none';
    }

    // Terminal Management
    initializeTerminal() {
        if (!this.terminalInitialized) {
            this.terminalOutput = document.getElementById('terminalOutput');
            this.terminalInput = document.getElementById('terminalInput');
            this.terminalHistory = [];
            this.terminalHistoryIndex = -1;
            this.physicsConstants = this.loadPhysicsConstants();
            this.terminalVariables = {};
            
            this.setupTerminalEventListeners();
            this.displayWelcomeMessage();
            this.terminalInitialized = true;
        }
    }

    setupTerminalEventListeners() {
        // Terminal input handling
        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeTerminalCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateTerminalHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateTerminalHistory(1);
            }
        });

        // Terminal control buttons
        document.getElementById('clearTerminal').addEventListener('click', () => {
            this.clearTerminal();
        });

        document.getElementById('terminalHelp').addEventListener('click', () => {
            this.showTerminalHelp();
        });

        document.getElementById('physicsConstants').addEventListener('click', () => {
            this.showPhysicsConstants();
        });

    }

    executeTerminalCommand() {
        const command = this.terminalInput.value.trim();
        if (!command) return;

        this.addToTerminalHistory(command);
        this.addTerminalOutput(`>>> ${command}`, 'terminal-command');

        try {
            const result = this.processTerminalCommand(command);
            if (result !== undefined) {
                this.addTerminalOutput(result, 'terminal-result');
            }
        } catch (error) {
            this.addTerminalOutput(`Error: ${error.message}`, 'terminal-error');
        }

        this.terminalInput.value = '';
        this.terminalHistoryIndex = -1;
    }

    processTerminalCommand(command) {
        const cmd = command.toLowerCase().trim();

        // Special commands
        if (cmd === 'help') {
            return this.getHelpText();
        }
        if (cmd === 'clear') {
            this.clearTerminal();
            return;
        }
        if (cmd === 'constants') {
            return this.getConstantsText();
        }
        if (cmd === 'variables') {
            return this.getVariablesText();
        }
        if (cmd.startsWith('const ')) {
            return this.lookupConstant(cmd.substring(6));
        }

        // Variable assignment
        if (command.includes('=') && !command.includes('==')) {
            return this.assignVariable(command);
        }

        // Mathematical expressions
        return this.evaluateExpression(command);
    }

    evaluateExpression(expr) {
        // Replace physics constants
        let processedExpr = expr;
        for (const [name, value] of Object.entries(this.physicsConstants)) {
            const regex = new RegExp(`\\b${name}\\b`, 'g');
            processedExpr = processedExpr.replace(regex, value.toString());
        }

        // Replace variables
        for (const [name, value] of Object.entries(this.terminalVariables)) {
            const regex = new RegExp(`\\b${name}\\b`, 'g');
            processedExpr = processedExpr.replace(regex, value.toString());
        }

        // Add common math functions
        processedExpr = processedExpr.replace(/\bsin\(/g, 'Math.sin(');
        processedExpr = processedExpr.replace(/\bcos\(/g, 'Math.cos(');
        processedExpr = processedExpr.replace(/\btan\(/g, 'Math.tan(');
        processedExpr = processedExpr.replace(/\bsqrt\(/g, 'Math.sqrt(');
        processedExpr = processedExpr.replace(/\blog\(/g, 'Math.log10(');
        processedExpr = processedExpr.replace(/\bln\(/g, 'Math.log(');
        processedExpr = processedExpr.replace(/\bpow\(/g, 'Math.pow(');
        processedExpr = processedExpr.replace(/\babs\(/g, 'Math.abs(');
        
        // Handle power operator (^)
        processedExpr = processedExpr.replace(/\^/g, '**');

        // Evaluate safely
        try {
            const result = Function(`"use strict"; return (${processedExpr})`)();
            return this.formatResult(result);
        } catch (error) {
            throw new Error(`Invalid expression: ${error.message}`);
        }
    }

    assignVariable(command) {
        const [varName, expression] = command.split('=').map(s => s.trim());
        
        if (!varName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            throw new Error('Invalid variable name');
        }

        const value = this.evaluateExpression(expression);
        this.terminalVariables[varName] = parseFloat(value);
        return `${varName} = ${value}`;
    }

    lookupConstant(name) {
        const constant = this.physicsConstants[name];
        if (constant !== undefined) {
            return `${name} = ${constant}`;
        } else {
            return `Constant '${name}' not found. Type 'constants' to see all available constants.`;
        }
    }

    loadPhysicsConstants() {
        return {
            // Fundamental constants
            'c': 2.99792458e8,        // Speed of light (m/s)
            'h': 6.62607015e-34,      // Planck constant (J⋅s)
            'hbar': 1.054571817e-34,  // Reduced Planck constant
            'e': 1.602176634e-19,     // Elementary charge (C)
            'me': 9.1093837015e-31,   // Electron mass (kg)
            'mp': 1.67262192369e-27,  // Proton mass (kg)
            'mn': 1.67492749804e-27,  // Neutron mass (kg)
            'k': 1.380649e-23,        // Boltzmann constant (J/K)
            'NA': 6.02214076e23,      // Avogadro constant (1/mol)
            'R': 8.314462618,         // Gas constant (J/(mol⋅K))
            'G': 6.67430e-11,         // Gravitational constant (m³/(kg⋅s²))
            'epsilon0': 8.8541878128e-12, // Vacuum permittivity (F/m)
            'mu0': 1.25663706212e-6,  // Vacuum permeability (H/m)
            'sigma': 5.670374419e-8,  // Stefan-Boltzmann constant (W/(m²⋅K⁴))
            'alpha': 7.2973525693e-3, // Fine structure constant
            
            // Mathematical constants
            'pi': Math.PI,
            'e_math': Math.E,
            
            // Derived constants
            'ke': 8.9875517923e9,     // Coulomb constant (N⋅m²/C²)
            'a0': 5.29177210903e-11,  // Bohr radius (m)
            'Ry': 1.0973731568160e7,  // Rydberg constant (1/m)
            'g': 9.80665              // Standard gravity (m/s²)
        };
    }

    addToTerminalHistory(command) {
        this.terminalHistory.unshift(command);
        if (this.terminalHistory.length > 50) {
            this.terminalHistory = this.terminalHistory.slice(0, 50);
        }
    }

    navigateTerminalHistory(direction) {
        if (direction === -1 && this.terminalHistoryIndex < this.terminalHistory.length - 1) {
            this.terminalHistoryIndex++;
            this.terminalInput.value = this.terminalHistory[this.terminalHistoryIndex];
        } else if (direction === 1 && this.terminalHistoryIndex > -1) {
            this.terminalHistoryIndex--;
            if (this.terminalHistoryIndex === -1) {
                this.terminalInput.value = '';
            } else {
                this.terminalInput.value = this.terminalHistory[this.terminalHistoryIndex];
            }
        }
    }

    addTerminalOutput(text, className = '') {
        const line = document.createElement('div');
        line.textContent = text;
        if (className) {
            line.className = className;
        }
        this.terminalOutput.appendChild(line);
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    clearTerminal() {
        this.terminalOutput.innerHTML = '';
        this.displayWelcomeMessage();
    }

    displayWelcomeMessage() {
        this.addTerminalOutput('Scientific Programming Console v1.0', 'terminal-info');
        this.addTerminalOutput('Type "help" for commands, "constants" for physics constants', 'terminal-info');
        this.addTerminalOutput('Examples: 2 + 3, c * 1e-9, E = me * c^2', 'terminal-info');
        this.addTerminalOutput('', '');
    }

    showTerminalHelp() {
        this.addTerminalOutput(this.getHelpText(), 'terminal-info');
    }

    showPhysicsConstants() {
        this.addTerminalOutput(this.getConstantsText(), 'terminal-info');
    }

    getHelpText() {
        return `Available Commands:
help - Show this help text
clear - Clear terminal output
constants - Show all physics constants
variables - Show all stored variables
const <name> - Look up specific constant

Mathematical Operations:
Basic: +, -, *, /, ^, ()
Functions: sin(), cos(), tan(), sqrt(), log(), ln(), pow(), abs()
Constants: c, h, e, me, mp, k, G, pi, etc.
Variables: x = 5, result = x * c

Examples:
E = me * c^2
lambda = h / (me * c)
F = ke * e^2 / (4 * pi * epsilon0 * r^2)`;
    }

    getConstantsText() {
        const constants = Object.entries(this.physicsConstants)
            .map(([name, value]) => `${name.padEnd(12)} = ${value.toExponential(6)}`)
            .join('\n');
        return `Physics Constants:\n${constants}`;
    }

    getVariablesText() {
        if (Object.keys(this.terminalVariables).length === 0) {
            return 'No variables stored';
        }
        const variables = Object.entries(this.terminalVariables)
            .map(([name, value]) => `${name} = ${value}`)
            .join('\n');
        return `Stored Variables:\n${variables}`;
    }

    // Utility Methods
    showMessage(message) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 2000);
    }

    showError(message) {
        this.currentValue = 'Error';
        this.updateDisplay();
        this.showMessage(message);
        
        setTimeout(() => {
            this.clear();
        }, 2000);
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedCalculator();
});