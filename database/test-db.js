const CalculatorDatabase = require('./database.js');

async function testDatabase() {
    console.log('🧪 Testing Calculator Database...\n');
    
    const db = new CalculatorDatabase('./test_calculator.db');
    
    try {
        // Initialize database
        await db.init();
        console.log('✅ Database initialized');

        // Test user creation
        const user = await db.createUser('testuser', 'test@example.com', 'hashed_password');
        console.log('✅ User created:', user);

        // Test calculation saving
        const calc = await db.saveCalculation(
            user.id, 
            '5 + 3', 
            8, 
            'add', 
            [5, 3]
        );
        console.log('✅ Calculation saved:', calc);

        // Test memory operations
        await db.setMemoryValue(user.id, 42.5);
        const memoryValue = await db.getMemoryValue(user.id);
        console.log('✅ Memory operations:', memoryValue);

        // Test preferences
        await db.updateUserPreferences(user.id, {
            theme: 'dark',
            scientific_mode: true
        });
        const prefs = await db.getUserPreferences(user.id);
        console.log('✅ User preferences:', prefs);

        // Test calculations retrieval
        const calculations = await db.getCalculationsByUser(user.id);
        console.log('✅ User calculations:', calculations);

        // Test usage stats
        await db.updateUsageStats(user.id, 'add');
        await db.updateUsageStats(user.id, 'multiply');
        const stats = await db.getUsageStats(user.id);
        console.log('✅ Usage stats:', stats);

        // Test dashboard stats
        const dashboardStats = await db.getDashboardStats(user.id);
        console.log('✅ Dashboard stats:', dashboardStats);

        // Test analytics
        const analytics = await db.getAnalytics();
        console.log('✅ Analytics:', analytics);

        // Test error logging
        await db.logError(user.id, 'test_error', 'Test error message', 'stack trace', {test: true});
        console.log('✅ Error logged');

        console.log('\n🎉 All database tests passed!');

    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        await db.close();
    }
}

// Run tests
testDatabase();