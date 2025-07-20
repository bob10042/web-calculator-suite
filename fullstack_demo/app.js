const express = require('express');
const cors = require('cors');
const path = require('path');
const CalculatorDatabase = require('../database/database.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new CalculatorDatabase('./fullstack_calculator.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database on startup
db.init().then(() => {
    console.log('🗄️ Database ready for full-stack demo');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});

// API Routes with Database Integration

// Health check with database status
app.get('/api/health', async (req, res) => {
    try {
        const analytics = await db.getAnalytics();
        res.json({ 
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            stats: analytics
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected',
            error: error.message
        });
    }
});

// User Management with Database
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        // Check if user exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Create user (in production, hash the password!)
        const user = await db.createUser(username, email, `hashed_${password}`);
        
        // Create default preferences
        await db.updateUserPreferences(user.id, {
            theme: 'light',
            scientific_mode: false,
            decimal_places: 10
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        await db.logError(null, 'registration_error', error.message, error.stack, req.body);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await db.getUserByEmail(email);
        if (!user || user.password_hash !== `hashed_${password}`) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        await db.updateLastLogin(user.id);
        
        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        await db.logError(null, 'login_error', error.message, error.stack, req.body);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Enhanced Calculation API with Database Storage
app.post('/api/calculate', async (req, res) => {
    try {
        const { operation, operand1, operand2, userId } = req.body;
        
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
        let operands;

        switch (operation) {
            case 'add':
                result = num1 + num2;
                expression = `${num1} + ${num2}`;
                operands = [num1, num2];
                break;
            case 'subtract':
                result = num1 - num2;
                expression = `${num1} - ${num2}`;
                operands = [num1, num2];
                break;
            case 'multiply':
                result = num1 * num2;
                expression = `${num1} × ${num2}`;
                operands = [num1, num2];
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
                operands = [num1, num2];
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
                operands = [num1];
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation'
                });
        }

        const calculationResult = {
            expression,
            result: parseFloat(result.toFixed(10)),
            operation,
            operands,
            timestamp: new Date().toISOString()
        };

        // Save to database if user provided
        if (userId) {
            const savedCalc = await db.saveCalculation(userId, expression, calculationResult.result, operation, operands);
            await db.updateUsageStats(userId, operation);
            calculationResult.id = savedCalc.id;
        }

        res.json({
            success: true,
            data: calculationResult
        });

    } catch (error) {
        const { userId } = req.body;
        await db.logError(userId, 'calculation_error', error.message, error.stack, req.body);
        res.status(500).json({
            success: false,
            error: 'Calculation failed'
        });
    }
});

// User-specific calculation history
app.get('/api/users/:userId/calculations', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const limit = parseInt(req.query.limit) || 50;
        
        const calculations = await db.getCalculationsByUser(userId, limit);
        
        res.json({
            success: true,
            data: calculations,
            count: calculations.length
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'history_fetch_error', error.message, error.stack, req.params);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch calculations'
        });
    }
});

// Memory operations with database persistence
app.get('/api/users/:userId/memory', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const memoryValue = await db.getMemoryValue(userId);
        
        res.json({
            success: true,
            data: { value: memoryValue }
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'memory_fetch_error', error.message, error.stack, req.params);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch memory value'
        });
    }
});

app.post('/api/users/:userId/memory', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { value } = req.body;
        
        await db.setMemoryValue(userId, parseFloat(value));
        
        res.json({
            success: true,
            message: 'Memory value updated'
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'memory_update_error', error.message, error.stack, { ...req.params, ...req.body });
        res.status(500).json({
            success: false,
            error: 'Failed to update memory value'
        });
    }
});

app.delete('/api/users/:userId/memory', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        await db.clearMemory(userId);
        
        res.json({
            success: true,
            message: 'Memory cleared'
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'memory_clear_error', error.message, error.stack, req.params);
        res.status(500).json({
            success: false,
            error: 'Failed to clear memory'
        });
    }
});

// User preferences
app.get('/api/users/:userId/preferences', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const preferences = await db.getUserPreferences(userId);
        
        res.json({
            success: true,
            data: preferences
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'preferences_fetch_error', error.message, error.stack, req.params);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch preferences'
        });
    }
});

app.put('/api/users/:userId/preferences', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        await db.updateUserPreferences(userId, req.body);
        
        res.json({
            success: true,
            message: 'Preferences updated'
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'preferences_update_error', error.message, error.stack, { ...req.params, ...req.body });
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});

// Dashboard with rich statistics
app.get('/api/users/:userId/dashboard', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const [dashboardStats, usageStats, recentCalculations, preferences] = await Promise.all([
            db.getDashboardStats(userId),
            db.getUsageStats(userId, 7), // Last 7 days
            db.getCalculationsByUser(userId, 10),
            db.getUserPreferences(userId)
        ]);
        
        res.json({
            success: true,
            data: {
                stats: dashboardStats,
                usageStats,
                recentCalculations,
                preferences
            }
        });
    } catch (error) {
        const userId = req.params.userId;
        await db.logError(userId, 'dashboard_error', error.message, error.stack, req.params);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard'
        });
    }
});

// Toggle favorite calculation
app.post('/api/calculations/:id/favorite', async (req, res) => {
    try {
        const calculationId = parseInt(req.params.id);
        const { userId } = req.body;
        
        const success = await db.toggleFavorite(calculationId, userId);
        
        if (success) {
            res.json({
                success: true,
                message: 'Favorite status toggled'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Calculation not found'
            });
        }
    } catch (error) {
        const { userId } = req.body;
        await db.logError(userId, 'favorite_toggle_error', error.message, error.stack, { ...req.params, ...req.body });
        res.status(500).json({
            success: false,
            error: 'Failed to toggle favorite'
        });
    }
});

// Admin analytics endpoint
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const analytics = await db.getAnalytics();
        const usageStats = await db.getUsageStats(null, 30); // All users, last 30 days
        
        res.json({
            success: true,
            data: {
                ...analytics,
                usageStats
            }
        });
    } catch (error) {
        await db.logError(null, 'admin_analytics_error', error.message, error.stack, req.query);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});

// Database maintenance endpoint
app.post('/api/admin/cleanup', async (req, res) => {
    try {
        const { daysToKeep = 365 } = req.body;
        await db.cleanup(daysToKeep);
        
        res.json({
            success: true,
            message: `Database cleaned up, keeping ${daysToKeep} days of data`
        });
    } catch (error) {
        await db.logError(null, 'cleanup_error', error.message, error.stack, req.body);
        res.status(500).json({
            success: false,
            error: 'Database cleanup failed'
        });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use(async (err, req, res, next) => {
    console.error(err.stack);
    
    // Log error to database
    try {
        await db.logError(null, 'server_error', err.message, err.stack, { url: req.url, method: req.method });
    } catch (logError) {
        console.error('Failed to log error to database:', logError);
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Full-Stack Calculator running on http://localhost:${PORT}`);
    console.log(`📊 Database: SQLite with full persistence`);
    console.log(`🔧 Features enabled:`);
    console.log(`   ✅ User registration and login`);
    console.log(`   ✅ Persistent calculation history`);
    console.log(`   ✅ Memory operations with database storage`);
    console.log(`   ✅ User preferences and settings`);
    console.log(`   ✅ Usage statistics and analytics`);
    console.log(`   ✅ Error logging and monitoring`);
    console.log(`   ✅ Admin dashboard and maintenance`);
});

module.exports = app;