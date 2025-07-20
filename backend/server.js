const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory storage (replace with database in production)
let calculations = [];
let users = [];

// Routes

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// Calculator API Routes

// Get all calculations
app.get('/api/calculations', (req, res) => {
    res.json({
        success: true,
        data: calculations,
        count: calculations.length
    });
});

// Save a calculation
app.post('/api/calculations', (req, res) => {
    try {
        const { expression, result, timestamp } = req.body;
        
        if (!expression || result === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Expression and result are required'
            });
        }

        const calculation = {
            id: Date.now().toString(),
            expression,
            result,
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        calculations.unshift(calculation);
        
        // Keep only last 100 calculations
        if (calculations.length > 100) {
            calculations = calculations.slice(0, 100);
        }

        res.status(201).json({
            success: true,
            data: calculation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get calculation by ID
app.get('/api/calculations/:id', (req, res) => {
    const calculation = calculations.find(calc => calc.id === req.params.id);
    
    if (!calculation) {
        return res.status(404).json({
            success: false,
            error: 'Calculation not found'
        });
    }

    res.json({
        success: true,
        data: calculation
    });
});

// Delete calculation
app.delete('/api/calculations/:id', (req, res) => {
    const index = calculations.findIndex(calc => calc.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Calculation not found'
        });
    }

    calculations.splice(index, 1);
    
    res.json({
        success: true,
        message: 'Calculation deleted'
    });
});

// Clear all calculations
app.delete('/api/calculations', (req, res) => {
    calculations = [];
    res.json({
        success: true,
        message: 'All calculations cleared'
    });
});

// User Management Routes

// Get all users
app.get('/api/users', (req, res) => {
    // Don't return passwords in response
    const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    }));

    res.json({
        success: true,
        data: safeUsers,
        count: safeUsers.length
    });
});

// Create user
app.post('/api/users', (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = users.find(user => 
            user.username === username || user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Username or email already exists'
            });
        }

        const user = {
            id: Date.now().toString(),
            username,
            email,
            password, // In production, hash this password!
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Return user without password
        const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            data: safeUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Mathematical Operations API

// Basic arithmetic
app.post('/api/calculate', (req, res) => {
    try {
        const { operation, operand1, operand2 } = req.body;
        
        const num1 = parseFloat(operand1);
        const num2 = parseFloat(operand2);
        
        if (isNaN(num1) || (operation !== 'sqrt' && isNaN(num2))) {
            return res.status(400).json({
                success: false,
                error: 'Invalid numbers provided'
            });
        }

        let result;
        let expression;

        switch (operation) {
            case 'add':
                result = num1 + num2;
                expression = `${num1} + ${num2}`;
                break;
            case 'subtract':
                result = num1 - num2;
                expression = `${num1} - ${num2}`;
                break;
            case 'multiply':
                result = num1 * num2;
                expression = `${num1} × ${num2}`;
                break;
            case 'divide':
                if (num2 === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Division by zero is not allowed'
                    });
                }
                result = num1 / num2;
                expression = `${num1} ÷ ${num2}`;
                break;
            case 'sqrt':
                if (num1 < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Square root of negative number is not allowed'
                    });
                }
                result = Math.sqrt(num1);
                expression = `√${num1}`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation'
                });
        }

        const calculationResult = {
            expression,
            result: parseFloat(result.toFixed(10)), // Avoid floating point issues
            operation,
            operands: operation === 'sqrt' ? [num1] : [num1, num2],
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: calculationResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Scientific operations
app.post('/api/calculate/scientific', (req, res) => {
    try {
        const { operation, value, unit = 'degrees' } = req.body;
        
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid number provided'
            });
        }

        let result;
        let expression;
        
        // Convert to radians if needed
        const radianValue = unit === 'degrees' ? num * (Math.PI / 180) : num;

        switch (operation) {
            case 'sin':
                result = Math.sin(radianValue);
                expression = `sin(${num}°)`;
                break;
            case 'cos':
                result = Math.cos(radianValue);
                expression = `cos(${num}°)`;
                break;
            case 'tan':
                result = Math.tan(radianValue);
                expression = `tan(${num}°)`;
                break;
            case 'log':
                if (num <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Logarithm of non-positive number is not allowed'
                    });
                }
                result = Math.log10(num);
                expression = `log(${num})`;
                break;
            case 'ln':
                if (num <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Natural logarithm of non-positive number is not allowed'
                    });
                }
                result = Math.log(num);
                expression = `ln(${num})`;
                break;
            case 'exp':
                result = Math.exp(num);
                expression = `e^${num}`;
                break;
            case 'power':
                const { exponent } = req.body;
                const exp = parseFloat(exponent);
                if (isNaN(exp)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid exponent provided'
                    });
                }
                result = Math.pow(num, exp);
                expression = `${num}^${exp}`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid scientific operation'
                });
        }

        const calculationResult = {
            expression,
            result: parseFloat(result.toFixed(10)),
            operation,
            operands: [num],
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: calculationResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Statistics API
app.get('/api/stats', (req, res) => {
    const stats = {
        totalCalculations: calculations.length,
        totalUsers: users.length,
        operationCounts: {},
        recentCalculations: calculations.slice(0, 10),
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };

    // Count operations
    calculations.forEach(calc => {
        // Extract operation from expression or use a default
        const operation = calc.expression.includes('+') ? 'add' :
                         calc.expression.includes('-') ? 'subtract' :
                         calc.expression.includes('×') ? 'multiply' :
                         calc.expression.includes('÷') ? 'divide' :
                         calc.expression.includes('√') ? 'sqrt' :
                         calc.expression.includes('sin') ? 'sin' :
                         calc.expression.includes('cos') ? 'cos' :
                         calc.expression.includes('tan') ? 'tan' : 'other';
        
        stats.operationCounts[operation] = (stats.operationCounts[operation] || 0) + 1;
    });

    res.json({
        success: true,
        data: stats
    });
});

// Export data
app.get('/api/export/:format', async (req, res) => {
    try {
        const format = req.params.format.toLowerCase();
        
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=calculator_data.json');
            res.json({
                calculations,
                users: users.map(user => ({ // Don't export passwords
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt
                })),
                exportDate: new Date().toISOString()
            });
        } else if (format === 'csv') {
            let csv = 'Expression,Result,Timestamp\n';
            calculations.forEach(calc => {
                csv += `"${calc.expression}","${calc.result}","${calc.timestamp}"\n`;
            });
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=calculations.csv');
            res.send(csv);
        } else {
            res.status(400).json({
                success: false,
                error: 'Unsupported format. Use json or csv.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Export failed'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/calculations - Get all calculations`);
    console.log(`   POST /api/calculations - Save calculation`);
    console.log(`   POST /api/calculate - Perform calculation`);
    console.log(`   POST /api/calculate/scientific - Scientific operations`);
    console.log(`   GET  /api/users - Get all users`);
    console.log(`   POST /api/users - Create user`);
    console.log(`   GET  /api/stats - Get statistics`);
    console.log(`   GET  /api/export/:format - Export data (json/csv)`);
    console.log(`💡 Frontend available at http://localhost:${PORT}`);
});

module.exports = app;