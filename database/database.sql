-- Advanced Calculator Database Schema
-- SQLite/PostgreSQL/MySQL compatible

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Calculations table
CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    expression TEXT NOT NULL,
    result DECIMAL(20,10) NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    operands TEXT, -- JSON array of operands
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Memory storage for calculator
CREATE TABLE IF NOT EXISTS memory_storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    memory_value DECIMAL(20,10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id) -- One memory value per user
);

-- User sessions for web authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Calculator themes/preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    decimal_places INTEGER DEFAULT 10,
    angle_unit VARCHAR(10) DEFAULT 'degrees', -- degrees or radians
    history_limit INTEGER DEFAULT 50,
    auto_save_history BOOLEAN DEFAULT TRUE,
    scientific_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Calculation history (extended from calculations for better organization)
CREATE TABLE IF NOT EXISTS calculation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id VARCHAR(100), -- Group calculations by session
    calculation_id INTEGER,
    sequence_number INTEGER, -- Order in session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (calculation_id) REFERENCES calculations(id) ON DELETE CASCADE
);

-- Error logs for debugging
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    error_type VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,
    request_data TEXT, -- JSON of request that caused error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Usage statistics
CREATE TABLE IF NOT EXISTS usage_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    operation_type VARCHAR(20),
    operation_count INTEGER DEFAULT 1,
    date_recorded DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, operation_type, date_recorded)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_calculations_operation_type ON calculations(operation_type);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_session_id ON calculation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_stats_user_date ON usage_stats(user_id, date_recorded);

-- Insert sample data
INSERT OR IGNORE INTO users (username, email, password_hash) VALUES 
('demo_user', 'demo@example.com', 'hashed_password_123'),
('test_user', 'test@example.com', 'hashed_password_456'),
('admin', 'admin@example.com', 'hashed_password_789');

INSERT OR IGNORE INTO user_preferences (user_id, theme, scientific_mode) VALUES 
(1, 'dark', TRUE),
(2, 'light', FALSE),
(3, 'dark', TRUE);

INSERT OR IGNORE INTO calculations (user_id, expression, result, operation_type, operands) VALUES 
(1, '5 + 3', 8.0, 'add', '[5, 3]'),
(1, '10 - 4', 6.0, 'subtract', '[10, 4]'),
(1, '7 × 6', 42.0, 'multiply', '[7, 6]'),
(2, '15 ÷ 3', 5.0, 'divide', '[15, 3]'),
(2, 'sin(30°)', 0.5, 'sin', '[30]'),
(2, '√16', 4.0, 'sqrt', '[16]'),
(3, '2^8', 256.0, 'power', '[2, 8]'),
(3, 'log(100)', 2.0, 'log', '[100]');

INSERT OR IGNORE INTO memory_storage (user_id, memory_value) VALUES 
(1, 42.0),
(2, 3.14159),
(3, 2.71828);

INSERT OR IGNORE INTO usage_stats (user_id, operation_type, operation_count, date_recorded) VALUES 
(1, 'add', 5, DATE('2025-01-01')),
(1, 'subtract', 3, DATE('2025-01-01')),
(1, 'multiply', 4, DATE('2025-01-01')),
(2, 'sin', 2, DATE('2025-01-01')),
(2, 'cos', 1, DATE('2025-01-01')),
(3, 'divide', 6, DATE('2025-01-01'));

-- Views for common queries
CREATE VIEW IF NOT EXISTS user_calculation_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(c.id) as total_calculations,
    MAX(c.created_at) as last_calculation,
    COUNT(CASE WHEN c.is_favorite = TRUE THEN 1 END) as favorite_calculations
FROM users u
LEFT JOIN calculations c ON u.id = c.user_id
GROUP BY u.id, u.username;

CREATE VIEW IF NOT EXISTS daily_operation_stats AS
SELECT 
    DATE(created_at) as date,
    operation_type,
    COUNT(*) as count,
    AVG(result) as avg_result
FROM calculations
GROUP BY DATE(created_at), operation_type
ORDER BY date DESC, operation_type;

CREATE VIEW IF NOT EXISTS recent_user_activity AS
SELECT 
    u.username,
    c.expression,
    c.result,
    c.operation_type,
    c.created_at
FROM users u
JOIN calculations c ON u.id = c.user_id
ORDER BY c.created_at DESC
LIMIT 50;