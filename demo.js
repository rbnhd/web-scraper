const EcommerceScraper = require('./scraper');

/**
 * Demo scraper that uses books.toscrape.com - a safe testing website
 */

class DemoScraper extends EcommerceScraper {
    constructor(options = {}) {
        super(options);
    }

    /**
     * Scrape products from books.toscrape.com (demo site)
     */
    async scrapeBooksDemo() {
        const url = 'http://books.toscrape.com/';
        const selectors = {
            productContainer: 'article.product_pod',
            title: 'h3 a',
            price: 'p.price_color',
            link: 'h3 a',
            image: 'div.image_container img'
        };

        return await this.scrapeProducts(url, selectors);
    }

    /**
     * Scrape quotes from quotes.toscrape.com (another demo site)
     */
    async scrapeQuotesDemo() {
        try {
            await this.navigateToPage('http://quotes.toscrape.com/');
            
            await this.waitForDynamicContent(['.quote']);

            console.log('🔍 Scraping quotes...');
            
            const quotes = await this.page.evaluate(() => {
                const quoteElements = document.querySelectorAll('.quote');
                const quotes = [];

                quoteElements.forEach((element, index) => {
                    try {
                        const textElement = element.querySelector('.text');
                        const authorElement = element.querySelector('.author');
                        const tagsElements = element.querySelectorAll('.tag');

                        const text = textElement ? textElement.textContent.trim() : 'N/A';
                        const author = authorElement ? authorElement.textContent.trim() : 'N/A';
                        const tags = Array.from(tagsElements).map(tag => tag.textContent.trim());

                        if (text !== 'N/A' && text.length > 0) {
                            quotes.push({
                                id: index + 1,
                                title: `Quote by ${author}`,
                                price: '0', // No price for quotes
                                priceText: 'Free',
                                link: 'http://quotes.toscrape.com/',
                                image: 'N/A',
                                quote: text,
                                author: author,
                                tags: tags.join(', '),
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (error) {
                        console.error('Error processing quote element:', error);
                    }
                });

                return quotes;
            });

            console.log(`✅ Found ${quotes.length} quotes`);
            
            // Add rate limiting delay
            await this.page.waitForTimeout(this.options.delay);
            
            return quotes;
            
        } catch (error) {
            console.error('❌ Error scraping quotes:', error.message);
            return [];
        }
    }

    /**
     * Demo scraping workflow
     */
    async scrapeDemo(type = 'books') {
        try {
            await this.init();
            
            let products = [];
            
            switch (type.toLowerCase()) {
                case 'books':
                    products = await this.scrapeBooksDemo();
                    break;
                case 'quotes':
                    products = await this.scrapeQuotesDemo();
                    break;
                default:
                    throw new Error(`Unsupported demo type: ${type}`);
            }

            if (products.length > 0) {
                this.scrapedData = [...this.scrapedData, ...products];
                const outputPath = await this.exportToCSV(this.scrapedData, `demo_${type}_${Date.now()}.csv`);
                
                console.log(`\n🎉 Demo scraping completed successfully!`);
                console.log(`📊 Total items scraped: ${this.scrapedData.length}`);
                console.log(`📄 Data saved to: ${outputPath}`);
                
                return {
                    success: true,
                    count: this.scrapedData.length,
                    data: this.scrapedData,
                    outputPath
                };
            } else {
                console.log('⚠️  No items found');
                return {
                    success: false,
                    count: 0,
                    data: [],
                    message: 'No items found'
                };
            }
            
        } catch (error) {
            console.error('❌ Demo scraping failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await this.close();
        }
    }
}

// Usage example
async function runDemo() {
    console.log('🎯 Starting demo scraper...\n');
    
    const scraper = new DemoScraper({
        headless: true,
        delay: 1000,
        outputFile: 'demo_results.csv'
    });

    // Test books scraping
    console.log('📚 Testing books scraping...');
    const booksResult = await scraper.scrapeDemo('books');
    
    if (booksResult.success) {
        console.log(`✅ Books demo successful: ${booksResult.count} books scraped`);
    }

    // Test quotes scraping
    console.log('\n💬 Testing quotes scraping...');
    const quotesScraper = new DemoScraper({
        headless: true,
        delay: 1000,
        outputFile: 'demo_quotes.csv'
    });
    
    const quotesResult = await quotesScraper.scrapeDemo('quotes');
    
    if (quotesResult.success) {
        console.log(`✅ Quotes demo successful: ${quotesResult.count} quotes scraped`);
    }
}

// Export the class
module.exports = DemoScraper;

// Run demo if script is executed directly
if (require.main === module) {
    runDemo().catch(error => {
        console.error('❌ Demo failed:', error);
        process.exit(1);
    });
}
