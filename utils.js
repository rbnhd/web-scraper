const fs = require('fs');
const path = require('path');

/**
 * Utility functions for the web scraper
 */

class ScraperUtils {
    /**
     * Load configuration from JSON file
     */
    static loadConfig(configPath = './config.json') {
        try {
            const configFile = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configFile);
        } catch (error) {
            console.warn('⚠️  Could not load config file, using defaults');
            return this.getDefaultConfig();
        }
    }

    /**
     * Get default configuration
     */
    static getDefaultConfig() {
        return {
            sites: {},
            defaultOptions: {
                headless: true,
                timeout: 30000,
                delay: 2000,
                maxRetries: 3,
                outputFile: 'scraped_products.csv'
            }
        };
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Clean and normalize price text
     */
    static cleanPrice(priceText) {
        if (!priceText) return { numeric: 0, original: 'N/A' };
        
        const original = priceText.trim();
        
        // Remove currency symbols and non-numeric characters except decimal points
        const numeric = original
            .replace(/[^\d.,]/g, '')
            .replace(/,/g, '')
            .replace(/\.(?=.*\.)/g, '') // Remove all but last decimal point
            || '0';
        
        return {
            numeric: parseFloat(numeric) || 0,
            original: original
        };
    }

    /**
     * Generate safe filename from search term
     */
    static generateFilename(searchTerm, site, extension = 'csv') {
        const safe = searchTerm
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
        
        const timestamp = new Date().toISOString().split('T')[0];
        return `${site}_${safe}_${timestamp}.${extension}`;
    }

    /**
     * Create directory if it doesn't exist
     */
    static ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Log scraping statistics
     */
    static logStats(data, startTime) {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log('\n📊 Scraping Statistics:');
        console.log(`   Total products: ${data.length}`);
        console.log(`   Duration: ${duration.toFixed(2)} seconds`);
        console.log(`   Average time per product: ${(duration / data.length).toFixed(2)} seconds`);
        
        if (data.length > 0) {
            const prices = data
                .map(item => this.cleanPrice(item.priceText).numeric)
                .filter(price => price > 0);
            
            if (prices.length > 0) {
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                console.log(`   Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
                console.log(`   Average price: $${avgPrice.toFixed(2)}`);
            }
        }
    }

    /**
     * Retry operation with exponential backoff
     */
    static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`🔄 Retry ${attempt}/${maxRetries} in ${delay}ms...`);
                await this.sleep(delay);
            }
        }
    }

    /**
     * Sleep for specified milliseconds
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if rate limit should be applied
     */
    static shouldApplyRateLimit(lastRequestTime, minInterval = 2000) {
        const now = Date.now();
        const timeSinceLastRequest = now - (lastRequestTime || 0);
        return timeSinceLastRequest < minInterval;
    }

    /**
     * Calculate optimal delay based on response time
     */
    static calculateOptimalDelay(responseTime, baseDelay = 2000) {
        // Increase delay if response was slow (might indicate server load)
        if (responseTime > 5000) {
            return baseDelay * 1.5;
        } else if (responseTime > 10000) {
            return baseDelay * 2;
        }
        return baseDelay;
    }

    /**
     * Validate product data
     */
    static validateProduct(product) {
        const required = ['title', 'price'];
        const isValid = required.every(field => 
            product[field] && product[field] !== 'N/A' && product[field].toString().trim().length > 0
        );
        
        return {
            isValid,
            issues: required.filter(field => 
                !product[field] || product[field] === 'N/A' || product[field].toString().trim().length === 0
            )
        };
    }

    /**
     * Filter and clean scraped data
     */
    static filterAndCleanData(rawData) {
        return rawData
            .map(product => {
                const cleaned = { ...product };
                
                // Clean price
                const priceInfo = this.cleanPrice(product.priceText);
                cleaned.price = priceInfo.numeric;
                cleaned.priceText = priceInfo.original;
                
                // Clean title
                cleaned.title = product.title ? product.title.trim() : 'N/A';
                
                // Validate URLs
                if (product.link && !this.isValidUrl(product.link)) {
                    cleaned.link = 'Invalid URL';
                }
                
                return cleaned;
            })
            .filter(product => {
                const validation = this.validateProduct(product);
                return validation.isValid;
            });
    }

    /**
     * Generate summary report
     */
    static generateSummaryReport(data, site, searchTerm, outputPath) {
        const report = {
            site,
            searchTerm,
            totalProducts: data.length,
            outputPath,
            scrapedAt: new Date().toISOString(),
            summary: {}
        };

        if (data.length > 0) {
            const prices = data
                .map(item => this.cleanPrice(item.priceText).numeric)
                .filter(price => price > 0);

            report.summary = {
                productsWithPrices: prices.length,
                priceRange: prices.length > 0 ? {
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                    average: prices.reduce((a, b) => a + b, 0) / prices.length
                } : null,
                uniqueTitles: new Set(data.map(item => item.title)).size,
                avgTitleLength: data.reduce((acc, item) => acc + item.title.length, 0) / data.length
            };
        }

        return report;
    }

    /**
     * Save summary report to JSON
     */
    static async saveSummaryReport(report, filename = null) {
        const reportPath = filename || `summary_${Date.now()}.json`;
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📋 Summary report saved to: ${reportPath}`);
            return reportPath;
        } catch (error) {
            console.error('❌ Failed to save summary report:', error.message);
            throw error;
        }
    }
}

module.exports = ScraperUtils;
