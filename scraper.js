const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

class EcommerceScraper {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false, // Default to headless
            timeout: options.timeout || 30000,
            delay: options.delay || 2000, // Rate limiting delay between requests
            maxRetries: options.maxRetries || 3,
            outputFile: options.outputFile || 'scraped_products.csv',
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            ...options
        };
        
        this.browser = null;
        this.page = null;
        this.scrapedData = [];
    }

    /**
     * Initialize the browser and page
     */
    async init() {
        try {
            console.log('🚀 Initializing browser...');
            
            this.browser = await puppeteer.launch({
                headless: this.options.headless !== false, // Default to headless
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--start-maximized',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ]
            });

            this.page = await this.browser.newPage();
            
            // Enhanced stealth settings
            await this.page.setUserAgent(this.options.userAgent);
            await this.page.setViewport({ width: 1366, height: 768 });
            
            // Set extra HTTP headers
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            });

            // Override permissions (if available)
            try {
                await this.page.overridePermissions('https://www.amazon.com', ['geolocation', 'notifications']);
            } catch (error) {
                // Method not available in older Puppeteer versions, skip
            }
            
            // Set request interception for better performance and stealth
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'image') {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Handle page errors gracefully
            this.page.on('error', (error) => {
                console.log('⚠️  Page error:', error.message);
            });

            this.page.on('pageerror', (error) => {
                console.log('⚠️  Page script error:', error.message);
            });

            console.log('✅ Browser initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error.message);
            throw error;
        }
    }

    /**
     * Navigate to a URL with retry logic
     */
    async navigateToPage(url, retries = 0) {
        try {
            console.log(`🌐 Navigating to: ${url}`);
            
            // Add random delay to seem more human-like
            await this.page.waitForTimeout(Math.random() * 2000 + 1000);
            
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.options.timeout
            });

            // Wait for page to be fully loaded with random delay
            await this.page.waitForTimeout(Math.random() * 3000 + 2000);
            
            // Check if page loaded successfully
            const title = await this.page.title();
            if (title.toLowerCase().includes('robot') || title.toLowerCase().includes('captcha')) {
                throw new Error('Bot detection triggered - CAPTCHA or robot check detected');
            }
            
            console.log('✅ Page loaded successfully');
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to navigate to ${url}:`, error.message);
            
            if (retries < this.options.maxRetries) {
                console.log(`🔄 Retrying... (${retries + 1}/${this.options.maxRetries})`);
                await this.page.waitForTimeout(5000 + Math.random() * 5000); // Random backoff
                return this.navigateToPage(url, retries + 1);
            }
            
            throw error;
        }
    }

    /**
     * Wait for dynamic content to load
     */
    async waitForDynamicContent(selectors = []) {
        try {
            console.log('⏳ Waiting for dynamic content to load...');
            
            // Wait for any of the provided selectors with shorter timeout
            if (selectors.length > 0) {
                await Promise.race([
                    ...selectors.map(selector => 
                        this.page.waitForSelector(selector, { timeout: 8000 }).catch(() => null)
                    ),
                    this.page.waitForTimeout(8000) // Fallback timeout
                ]);
            }

            // Scroll to load lazy-loaded content
            await this.autoScroll();
            
            // Additional wait to ensure content is loaded
            await this.page.waitForTimeout(2000);
            
            console.log('✅ Dynamic content loading completed');
            
        } catch (error) {
            console.log('⚠️  Dynamic content wait failed:', error.message);
            // Continue anyway, don't fail the entire scraping process
        }
    }

    /**
     * Auto-scroll to trigger lazy loading
     */
    async autoScroll() {
        await this.page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    /**
     * Generic scraper for different e-commerce sites
     */
    async scrapeProducts(url, selectors) {
        try {
            await this.navigateToPage(url);
            
            // Wait for product elements to load
            await this.waitForDynamicContent([
                selectors.productContainer,
                selectors.title,
                selectors.price
            ]);

            console.log('🔍 Scraping products...');
            
            const products = await this.page.evaluate((selectors) => {
                const productElements = document.querySelectorAll(selectors.productContainer);
                const products = [];

                productElements.forEach((element, index) => {
                    try {
                        const titleElement = element.querySelector(selectors.title);
                        const priceElement = element.querySelector(selectors.price);
                        const linkElement = element.querySelector(selectors.link) || element.querySelector('a');
                        const imageElement = element.querySelector(selectors.image);

                        const title = titleElement ? titleElement.textContent.trim() : 'N/A';
                        const priceText = priceElement ? priceElement.textContent.trim() : 'N/A';
                        const link = linkElement ? linkElement.href : 'N/A';
                        const image = imageElement ? imageElement.src : 'N/A';

                        // Clean price text to extract numeric value
                        const price = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '') || '0';

                        if (title !== 'N/A' && title.length > 0) {
                            products.push({
                                id: index + 1,
                                title,
                                price: price,
                                priceText,
                                link,
                                image,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (error) {
                        console.error('Error processing product element:', error);
                    }
                });

                return products;
            }, selectors);

            console.log(`✅ Found ${products.length} products`);
            
            // Add rate limiting delay
            await this.page.waitForTimeout(this.options.delay);
            
            return products;
            
        } catch (error) {
            console.error('❌ Error scraping products:', error.message);
            return [];
        }
    }

    /**
     * Scrape Amazon products (example implementation)
     */
    async scrapeAmazon(searchTerm) {
        try {
            // Use a more specific and less bot-detected URL pattern
            const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&ref=sr_pg_1`;
            
            // Add human-like delay before starting
            await this.page.waitForTimeout(Math.random() * 3000 + 2000);
            
            await this.navigateToPage(url);
            
            // Check for CAPTCHA or robot detection
            const pageContent = await this.page.content();
            if (pageContent.includes('robot') || pageContent.includes('captcha') || pageContent.includes('blocked')) {
                throw new Error('Amazon has detected automated browsing - please try again later');
            }
            
            const selectors = {
                productContainer: '[data-component-type="s-search-result"], .s-result-item',
                title: 'h2 a span, .a-size-mini span, .a-size-base-plus, [data-cy="title-recipe-title"]',
                price: '.a-price-whole, .a-offscreen, .a-price .a-offscreen',
                link: 'h2 a, .a-link-normal',
                image: '.s-image, img[data-image-latency]'
            };

            // Wait specifically for Amazon's search results
            await this.waitForDynamicContent([
                '[data-component-type="s-search-result"]',
                '.s-result-item',
                '[data-testid="result"]'
            ]);

            // Add random mouse movements to seem more human
            await this.page.mouse.move(Math.random() * 200, Math.random() * 200);
            await this.page.waitForTimeout(500);
            
            return await this.scrapeProducts(url, selectors);
            
        } catch (error) {
            console.error('❌ Amazon scraping failed:', error.message);
            
            if (error.message.includes('detected')) {
                console.log('💡 Tip: Amazon has strong bot detection. Try:');
                console.log('   - Using longer delays (--delay=5000)');
                console.log('   - Running in non-headless mode (--headless=false)');
                console.log('   - Using the demo scraper instead: node demo.js');
            }
            
            return [];
        }
    }

    /**
     * Scrape eBay products (example implementation)
     */
    async scrapeEbay(searchTerm) {
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}`;
        const selectors = {
            productContainer: '.s-item',
            title: '.s-item__title',
            price: '.s-item__price',
            link: '.s-item__link',
            image: '.s-item__image'
        };

        return await this.scrapeProducts(url, selectors);
    }

    /**
     * Export data to CSV
     */
    async exportToCSV(data, filename = null) {
        try {
            const outputFile = filename || this.options.outputFile;
            const outputPath = path.resolve(outputFile);
            
            console.log(`📄 Exporting ${data.length} products to ${outputPath}...`);

            const csvWriter = createCsvWriter({
                path: outputPath,
                header: [
                    { id: 'id', title: 'ID' },
                    { id: 'title', title: 'Product Title' },
                    { id: 'price', title: 'Price (Numeric)' },
                    { id: 'priceText', title: 'Price (Original)' },
                    { id: 'link', title: 'Product URL' },
                    { id: 'image', title: 'Image URL' },
                    { id: 'scrapedAt', title: 'Scraped At' }
                ]
            });

            await csvWriter.writeRecords(data);
            console.log(`✅ Data exported successfully to ${outputPath}`);
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ Error exporting to CSV:', error.message);
            throw error;
        }
    }

    /**
     * Close browser and cleanup
     */
    async close() {
        try {
            if (this.browser) {
                await this.browser.close();
                console.log('✅ Browser closed');
            }
        } catch (error) {
            console.error('❌ Error closing browser:', error.message);
        }
    }

    /**
     * Main scraping workflow
     */
    async scrape(site, searchTerm) {
        try {
            await this.init();
            
            let products = [];
            
            switch (site.toLowerCase()) {
                case 'amazon':
                    products = await this.scrapeAmazon(searchTerm);
                    break;
                case 'ebay':
                    products = await this.scrapeEbay(searchTerm);
                    break;
                default:
                    throw new Error(`Unsupported site: ${site}`);
            }

            if (products.length > 0) {
                this.scrapedData = [...this.scrapedData, ...products];
                const outputPath = await this.exportToCSV(this.scrapedData);
                
                console.log(`\n🎉 Scraping completed successfully!`);
                console.log(`📊 Total products scraped: ${this.scrapedData.length}`);
                console.log(`📄 Data saved to: ${outputPath}`);
                
                return {
                    success: true,
                    count: this.scrapedData.length,
                    data: this.scrapedData,
                    outputPath
                };
            } else {
                console.log('⚠️  No products found');
                return {
                    success: false,
                    count: 0,
                    data: [],
                    message: 'No products found'
                };
            }
            
        } catch (error) {
            console.error('❌ Scraping failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await this.close();
        }
    }
}

// Usage example and CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
Usage: node scraper.js <site> <search_term> [options]

Sites supported:
  - amazon
  - ebay

Examples:
  node scraper.js amazon "wireless headphones"
  node scraper.js ebay "vintage camera"

Options:
  --headless=false    Run browser in non-headless mode
  --delay=3000       Set delay between requests (ms)
  --output=file.csv  Set output filename
        `);
        process.exit(1);
    }

    const site = args[0];
    const searchTerm = args[1];
    
    // Parse additional options
    const options = {};
    args.slice(2).forEach(arg => {
        if (arg.startsWith('--headless=')) {
            options.headless = arg.split('=')[1] === 'true';
        } else if (arg.startsWith('--delay=')) {
            options.delay = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--output=')) {
            options.outputFile = arg.split('=')[1];
        }
    });

    console.log(`🎯 Starting scraper for ${site} with search term: "${searchTerm}"`);
    
    const scraper = new EcommerceScraper(options);
    const result = await scraper.scrape(site, searchTerm);
    
    if (result.success) {
        console.log(`\n✅ Scraping completed successfully!`);
    } else {
        console.log(`\n❌ Scraping failed: ${result.error || result.message}`);
        process.exit(1);
    }
}

// Export the class for use as a module
module.exports = EcommerceScraper;

// Run main function if script is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}
