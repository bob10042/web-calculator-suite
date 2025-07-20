const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { MultiAgentOrchestrator } = require('./openrouter-agents');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize orchestrator
const orchestrator = new MultiAgentOrchestrator();

// Serve the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-interface.html'));
});

// API Routes
app.post('/api/agents/kimi', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const response = await orchestrator.singleAgent('kimi', query);
        res.json(response);
        
    } catch (error) {
        console.error('Kimi agent error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from Kimi agent',
            details: error.message 
        });
    }
});

app.post('/api/agents/gemini', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const response = await orchestrator.singleAgent('gemini', query);
        res.json(response);
        
    } catch (error) {
        console.error('Gemini agent error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from Gemini agent',
            details: error.message 
        });
    }
});

app.post('/api/agents/both', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const response = await orchestrator.consultBoth(query);
        res.json(response);
        
    } catch (error) {
        console.error('Both agents error:', error);
        res.status(500).json({ 
            error: 'Failed to get responses from agents',
            details: error.message 
        });
    }
});

app.post('/api/agents/collaborate', async (req, res) => {
    try {
        const { task, kimiRole, geminiRole } = req.body;
        
        if (!task) {
            return res.status(400).json({ error: 'Task is required' });
        }
        
        const response = await orchestrator.collaborativeTask(
            task,
            kimiRole || 'Analyze this task and provide detailed insights',
            geminiRole || 'Provide creative solutions and implementation strategies'
        );
        res.json(response);
        
    } catch (error) {
        console.error('Collaboration error:', error);
        res.status(500).json({ 
            error: 'Failed to execute collaborative task',
            details: error.message 
        });
    }
});

app.post('/api/agents/debate', async (req, res) => {
    try {
        const { topic } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        
        const response = await orchestrator.agentDebate(topic);
        res.json(response);
        
    } catch (error) {
        console.error('Debate error:', error);
        res.status(500).json({ 
            error: 'Failed to execute agent debate',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        openrouter_configured: !!process.env.OPENROUTER_API_KEY
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Multi-Agent Server running on http://localhost:${port}`);
    console.log(`🌐 Web interface: http://localhost:${port}`);
    console.log(`🔑 OpenRouter API Key configured: ${!!process.env.OPENROUTER_API_KEY}`);
    
    if (!process.env.OPENROUTER_API_KEY) {
        console.log('⚠️  Warning: OPENROUTER_API_KEY not found in environment variables');
        console.log('   Set it with: export OPENROUTER_API_KEY="your-key-here"');
    }
});

module.exports = app;