const EcommerceScraper = require('./scraper');

/**
 * Example usage of the E-commerce Scraper
 */

async function exampleBasicScrape() {
  console.log('=== Basic Scraping Example ===\n');

  const scraper = new EcommerceScraper({
    headless: true,
    delay: 1500,
    outputFile: 'example_products.csv'
  });

  try {
    const result = await scraper.scrape('amazon', 'bluetooth speaker');

    if (result.success) {
      console.log('✅ Scraping successful!');
      console.log(`📊 Products found: ${result.count}`);
      console.log(`📁 File saved: ${result.outputPath}`);
    } else {
      console.log('❌ Scraping failed:', result.error);
    }
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

async function exampleMultipleSites() {
  console.log('\n=== Multiple Sites Example ===\n');

  const searchTerm = 'wireless mouse';
  const sites = ['amazon', 'ebay'];

  for (const site of sites) {
    console.log(`\n🔍 Scraping ${site} for "${searchTerm}"...`);

    const scraper = new EcommerceScraper({
      headless: true,
      delay: 2000,
      outputFile: `${site}_${searchTerm.replace(/\s+/g, '_')}.csv`
    });

    try {
      const result = await scraper.scrape(site, searchTerm);

      if (result.success) {
        console.log(`✅ ${site}: Found ${result.count} products`);
      } else {
        console.log(`❌ ${site}: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error(`❌ ${site}: Fatal error:`, error.message);
    }

    // Add delay between different sites
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

async function exampleCustomConfiguration() {
  console.log('\n=== Custom Configuration Example ===\n');

  const scraper = new EcommerceScraper({
    headless: false, // Show browser for debugging
    delay: 3000, // 3 second delay
    timeout: 60000, // 1 minute timeout
    maxRetries: 5, // 5 retry attempts
    outputFile: 'custom_config_products.csv',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  try {
    const result = await scraper.scrape('amazon', 'gaming keyboard');

    if (result.success) {
      console.log('✅ Custom configuration scraping successful!');
      console.log(`📊 Products: ${result.count}`);

      // Show first few products
      result.data.slice(0, 3).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   Price: ${product.priceText}`);
        console.log(`   URL: ${product.link}`);
      });
    }
  } catch (error) {
    console.error('Custom configuration failed:', error);
  }
}

async function exampleErrorHandling() {
  console.log('\n=== Error Handling Example ===\n');

  const scraper = new EcommerceScraper({
    headless: true,
    delay: 1000,
    timeout: 5000, // Very short timeout to trigger errors
    maxRetries: 2,
    outputFile: 'error_test.csv'
  });

  try {
    // Try to scrape with intentionally problematic settings
    const result = await scraper.scrape('amazon', 'test product xyz123');

    if (result.success) {
      console.log('✅ Surprisingly successful despite short timeout!');
    } else {
      console.log(
        '❌ Expected failure occurred:',
        result.error || result.message
      );
    }
  } catch (error) {
    console.log('❌ Caught expected error:', error.message);
  }
}

// Main execution
async function runExamples() {
  try {
    await exampleBasicScrape();
    await exampleMultipleSites();
    await exampleCustomConfiguration();
    await exampleErrorHandling();

    console.log('\n🎉 All examples completed!');
  } catch (error) {
    console.error('Examples failed:', error);
  }
}

// Export functions for individual use
module.exports = {
  exampleBasicScrape,
  exampleMultipleSites,
  exampleCustomConfiguration,
  exampleErrorHandling,
  runExamples
};

// Run examples if script is executed directly
if (require.main === module) {
  console.log('🚀 Running E-commerce Scraper Examples...\n');
  runExamples();
}
