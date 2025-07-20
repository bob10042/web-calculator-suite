const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class CalculatorDatabase {
    constructor(dbPath = './calculator.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    // Initialize database connection and create tables
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('📊 Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // Create tables from SQL file
    async createTables() {
        try {
            const sqlPath = path.join(__dirname, 'database.sql');
            const sql = await fs.readFile(sqlPath, 'utf8');
            
            return new Promise((resolve, reject) => {
                this.db.exec(sql, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('✅ Database tables created/verified');
                        resolve();
                    }
                });
            });
        } catch (error) {
            throw new Error(`Failed to create tables: ${error.message}`);
        }
    }

    // User Management
    async createUser(username, email, passwordHash) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            `);
            
            stmt.run([username, email, passwordHash], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        username,
                        email,
                        created_at: new Date().toISOString()
                    });
                }
            });
            
            stmt.finalize();
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, username, email, created_at, last_login, is_active FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // Calculation Management
    async saveCalculation(userId, expression, result, operationType, operands) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO calculations (user_id, expression, result, operation_type, operands)
                VALUES (?, ?, ?, ?, ?)
            `);
            
            stmt.run([userId, expression, result, operationType, JSON.stringify(operands)], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        user_id: userId,
                        expression,
                        result,
                        operation_type: operationType,
                        operands,
                        created_at: new Date().toISOString()
                    });
                }
            });
            
            stmt.finalize();
        });
    }

    async getCalculationsByUser(userId, limit = 50) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM calculations 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [userId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => ({
                    ...row,
                    operands: JSON.parse(row.operands)
                })));
            });
        });
    }

    async getAllCalculations(limit = 100) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT c.*, u.username 
                FROM calculations c
                LEFT JOIN users u ON c.user_id = u.id
                ORDER BY c.created_at DESC 
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => ({
                    ...row,
                    operands: JSON.parse(row.operands)
                })));
            });
        });
    }

    async deleteCalculation(id, userId = null) {
        return new Promise((resolve, reject) => {
            let query = 'DELETE FROM calculations WHERE id = ?';
            let params = [id];
            
            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }
            
            this.db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    async toggleFavorite(calculationId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE calculations 
                SET is_favorite = NOT is_favorite 
                WHERE id = ? AND user_id = ?
            `, [calculationId, userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    // Memory Management
    async getMemoryValue(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT memory_value FROM memory_storage WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.memory_value : 0);
                }
            );
        });
    }

    async setMemoryValue(userId, value) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT OR REPLACE INTO memory_storage (user_id, memory_value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `, [userId, value], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async clearMemory(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM memory_storage WHERE user_id = ?',
                [userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    // User Preferences
    async getUserPreferences(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM user_preferences WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {
                        theme: 'light',
                        decimal_places: 10,
                        angle_unit: 'degrees',
                        history_limit: 50,
                        auto_save_history: true,
                        scientific_mode: false
                    });
                }
            );
        });
    }

    async updateUserPreferences(userId, preferences) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(preferences).map(key => `${key} = ?`).join(', ');
            const values = Object.values(preferences);
            values.push(userId);

            this.db.run(`
                INSERT OR REPLACE INTO user_preferences 
                (user_id, ${Object.keys(preferences).join(', ')}, updated_at)
                VALUES (?, ${Object.keys(preferences).map(() => '?').join(', ')}, CURRENT_TIMESTAMP)
            `, [userId, ...Object.values(preferences)], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Statistics and Analytics
    async getUsageStats(userId = null, days = 30) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    operation_type,
                    SUM(operation_count) as total_count,
                    date_recorded
                FROM usage_stats 
                WHERE date_recorded >= DATE('now', '-${days} days')
            `;
            let params = [];

            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }

            query += ' GROUP BY operation_type, date_recorded ORDER BY date_recorded DESC';

            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async updateUsageStats(userId, operationType) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT OR REPLACE INTO usage_stats (user_id, operation_type, operation_count, date_recorded)
                VALUES (?, ?, 
                    COALESCE((SELECT operation_count FROM usage_stats 
                             WHERE user_id = ? AND operation_type = ? AND date_recorded = DATE('now')), 0) + 1,
                    DATE('now'))
            `, [userId, operationType, userId, operationType], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async getDashboardStats(userId = null) {
        return new Promise((resolve, reject) => {
            const queries = [
                // Total calculations
                userId ? 
                    ['SELECT COUNT(*) as count FROM calculations WHERE user_id = ?', [userId]] :
                    ['SELECT COUNT(*) as count FROM calculations', []],
                
                // Calculations today
                userId ?
                    ['SELECT COUNT(*) as count FROM calculations WHERE user_id = ? AND DATE(created_at) = DATE("now")', [userId]] :
                    ['SELECT COUNT(*) as count FROM calculations WHERE DATE(created_at) = DATE("now")', []],
                
                // Most used operation
                userId ?
                    ['SELECT operation_type, COUNT(*) as count FROM calculations WHERE user_id = ? GROUP BY operation_type ORDER BY count DESC LIMIT 1', [userId]] :
                    ['SELECT operation_type, COUNT(*) as count FROM calculations GROUP BY operation_type ORDER BY count DESC LIMIT 1', []],
                
                // Average calculations per day
                userId ?
                    ['SELECT COUNT(*) / MAX(1, julianday("now") - julianday(MIN(created_at))) as avg_per_day FROM calculations WHERE user_id = ?', [userId]] :
                    ['SELECT COUNT(*) / MAX(1, julianday("now") - julianday(MIN(created_at))) as avg_per_day FROM calculations', []]
            ];

            Promise.all(queries.map(([query, params]) => 
                new Promise((res, rej) => {
                    this.db.get(query, params, (err, row) => {
                        if (err) rej(err);
                        else res(row);
                    });
                })
            )).then(results => {
                resolve({
                    totalCalculations: results[0].count,
                    calculationsToday: results[1].count,
                    mostUsedOperation: results[2] || { operation_type: 'none', count: 0 },
                    avgCalculationsPerDay: Math.round((results[3].avg_per_day || 0) * 100) / 100
                });
            }).catch(reject);
        });
    }

    // Error Logging
    async logError(userId, errorType, errorMessage, stackTrace, requestData) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO error_logs (user_id, error_type, error_message, stack_trace, request_data)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, errorType, errorMessage, stackTrace, JSON.stringify(requestData)], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Database Maintenance
    async cleanup(daysToKeep = 365) {
        return new Promise((resolve, reject) => {
            const queries = [
                `DELETE FROM calculations WHERE created_at < DATE('now', '-${daysToKeep} days')`,
                `DELETE FROM calculation_history WHERE created_at < DATE('now', '-${daysToKeep} days')`,
                `DELETE FROM error_logs WHERE created_at < DATE('now', '-90 days')`,
                `DELETE FROM user_sessions WHERE expires_at < datetime('now')`
            ];

            Promise.all(queries.map(query => 
                new Promise((res, rej) => {
                    this.db.run(query, (err) => {
                        if (err) rej(err);
                        else res();
                    });
                })
            )).then(() => {
                console.log('🧹 Database cleanup completed');
                resolve();
            }).catch(reject);
        });
    }

    async getAnalytics() {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
                    (SELECT COUNT(*) FROM calculations) as total_calculations,
                    (SELECT COUNT(*) FROM calculations WHERE DATE(created_at) = DATE('now')) as calculations_today,
                    (SELECT COUNT(DISTINCT DATE(created_at)) FROM calculations) as active_days,
                    (SELECT operation_type FROM calculations GROUP BY operation_type ORDER BY COUNT(*) DESC LIMIT 1) as most_popular_operation
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) reject(err);
                    else {
                        console.log('📊 Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = CalculatorDatabase;