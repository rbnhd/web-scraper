const EcommerceScraper = require('./scraper');
const ScraperUtils = require('./utils');

/**
 * Simple test to verify the scraper works
 */

async function testBasicFunctionality() {
    console.log('🧪 Testing basic scraper functionality...\n');
    
    try {
        // Test utility functions
        console.log('1. Testing utility functions...');
        
        const price = ScraperUtils.cleanPrice('$19.99');
        console.log(`   Price cleaning: $19.99 → ${price.numeric} (${price.original})`);
        
        const filename = ScraperUtils.generateFilename('test search', 'amazon');
        console.log(`   Filename generation: ${filename}`);
        
        const isValid = ScraperUtils.isValidUrl('https://example.com');
        console.log(`   URL validation: ${isValid}`);
        
        // Test scraper initialization
        console.log('\n2. Testing scraper initialization...');
        
        const scraper = new EcommerceScraper({
            headless: true,
            delay: 1000,
            timeout: 10000,
            outputFile: 'test_output.csv'
        });
        
        console.log('   ✅ Scraper created successfully');
        
        // Test browser initialization (without actual scraping)
        console.log('\n3. Testing browser initialization...');
        
        await scraper.init();
        console.log('   ✅ Browser initialized');
        
        await scraper.close();
        console.log('   ✅ Browser closed');
        
        console.log('\n🎉 All basic tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
    
    return true;
}

async function testConfigurationLoading() {
    console.log('\n🧪 Testing configuration loading...\n');
    
    try {
        const config = ScraperUtils.loadConfig('./config.json');
        console.log('✅ Configuration loaded successfully');
        console.log(`   Sites configured: ${Object.keys(config.sites).join(', ')}`);
        
        return true;
    } catch (error) {
        console.error('❌ Configuration test failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Running Web Scraper Tests...\n');
    
    const results = [];
    
    results.push(await testBasicFunctionality());
    results.push(await testConfigurationLoading());
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! The scraper is ready to use.');
        console.log('\nTry running:');
        console.log('  node scraper.js amazon "test product"');
        console.log('  node examples.js');
    } else {
        console.log('❌ Some tests failed. Please check the setup.');
    }
    
    return passed === total;
}

// Run tests if script is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testBasicFunctionality,
    testConfigurationLoading,
    runAllTests
};
