# E-commerce Web Scraper

A powerful Node.js web scraper built with Puppeteer for extracting product data from various
e-commerce websites.

## 🚨 Important Note

**For learning and testing purposes, use the demo scraper first:**

```bash
npm run demo
```

This uses safe testing websites (books.toscrape.com and quotes.toscrape.com) that are designed for
scraping practice.

## ✨ Features

- 🚀 **Multi-site Support**: Scrape from Amazon, eBay, Etsy, Walmart, and more
- 🔄 **Dynamic Content Handling**: Waits for dynamic content to load using intelligent selectors
- 🛡️ **Error Handling**: Robust retry logic and error recovery
- 📊 **CSV Export**: Exports scraped data to well-formatted CSV files
- ⏱️ **Rate Limiting**: Built-in delays to avoid being blocked
- 🎭 **Stealth Mode**: User-agent rotation and request optimization
- 🖥️ **CLI Interface**: Easy-to-use command-line interface
- 📝 **Configurable**: JSON-based configuration for different sites
- 🧪 **Demo Mode**: Safe testing environment with demo websites

## 🛠️ Installation

### Prerequisites

- **Node.js 18.0.0 or higher** (required for latest Puppeteer version)
- npm (comes with Node.js)

### Setup

1. Clone or download the project files
2. Install dependencies:

```bash
npm install
```

> **Note**: If you're using Node.js < 18, you may see compatibility warnings. The code will still
> work in CI/CD environments running Node.js 18+.

## 🚀 Quick Start

### Safe Demo (Recommended for Learning)

```bash
# Run the demo with safe testing websites
npm run demo

# Or directly
node demo.js
```

### Real E-commerce Sites (Use Responsibly)

```bash
# Test the scraper functionality
npm test

# Scrape Amazon for wireless headphones (may trigger bot detection)
node scraper.js amazon "wireless headphones" --delay=5000

# Scrape eBay for vintage cameras
node scraper.js ebay "vintage camera"
```

### Advanced Usage

```bash
# Run in non-headless mode (visible browser) for debugging
node scraper.js amazon "laptop" --headless=false --delay=3000

# Custom output filename
node scraper.js ebay "smartphone" --output=my_products.csv
```

## ⚠️ Bot Detection & Limitations

**Amazon and other major e-commerce sites have sophisticated bot detection:**

- ✅ **Demo sites work perfectly** (books.toscrape.com, quotes.toscrape.com)
- ⚠️ **Amazon may block requests** - use longer delays and respect robots.txt
- 📧 **eBay and others may require special handling**

**If you encounter bot detection:**

1. Increase delay: `--delay=5000` (5 seconds)
2. Use non-headless mode: `--headless=false`
3. Try the demo sites first: `npm run demo`
4. Consider using official APIs instead

## 📋 Available Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run demo`    | Run safe demo scraper with test sites |
| `npm test`        | Run functionality tests               |
| `npm start`       | Run main scraper (requires arguments) |
| `npm run example` | Run example scripts                   |

## 🎯 Supported Sites

### Demo Sites (Safe for Testing)

- **books.toscrape.com** - Book catalog for scraping practice
- **quotes.toscrape.com** - Famous quotes for scraping practice

### E-commerce Sites (Use Responsibly)

- **Amazon** (`amazon`) - May require special handling
- **eBay** (`ebay`)
- **Etsy** (`etsy`)
- **Walmart** (`walmart`)

## Configuration

The scraper uses `config.json` for site-specific configurations:

```json
{
  "sites": {
    "amazon": {
      "name": "Amazon",
      "selectors": {
        "productContainer": "[data-component-type=\"s-search-result\"]",
        "title": "h2 a span",
        "price": ".a-price-whole"
      }
    }
  }
}
```

## Options

| Option         | Description                  | Default                |
| -------------- | ---------------------------- | ---------------------- |
| `--headless`   | Run browser in headless mode | `true`                 |
| `--delay`      | Delay between requests (ms)  | `2000`                 |
| `--output`     | Output CSV filename          | `scraped_products.csv` |
| `--timeout`    | Page load timeout (ms)       | `30000`                |
| `--maxRetries` | Maximum retry attempts       | `3`                    |

## Output Format

The scraper exports data to CSV with the following columns:

- **ID**: Sequential product ID
- **Product Title**: Product name/title
- **Price (Numeric)**: Cleaned numeric price
- **Price (Original)**: Original price text
- **Product URL**: Link to the product page
- **Image URL**: Product image URL
- **Scraped At**: Timestamp of when data was scraped

## Error Handling

The scraper includes comprehensive error handling:

- **Retry Logic**: Automatically retries failed requests
- **Timeout Handling**: Handles page load timeouts gracefully
- **Network Issues**: Recovers from network connectivity problems
- **Element Detection**: Continues scraping even if some elements are missing

## Rate Limiting

To avoid being blocked by websites:

- **Default delay**: 2 seconds between requests
- **Request optimization**: Blocks unnecessary resources (images, CSS, fonts)
- **User-agent rotation**: Uses realistic browser user agents
- **Burst protection**: Limits rapid successive requests

## Programming Interface

You can also use the scraper as a module in your own code:

```javascript
const EcommerceScraper = require('./scraper');

async function customScrape() {
  const scraper = new EcommerceScraper({
    headless: true,
    delay: 3000,
    outputFile: 'my_products.csv'
  });

  const result = await scraper.scrape('amazon', 'wireless mouse');

  if (result.success) {
    console.log(`Scraped ${result.count} products`);
    console.log(`Data saved to: ${result.outputPath}`);
  }
}
```

## Best Practices

1. **Respect robots.txt**: Check the website's robots.txt file
2. **Use reasonable delays**: Don't overwhelm servers with requests
3. **Handle errors gracefully**: Always implement proper error handling
4. **Monitor rate limits**: Watch for 429 (Too Many Requests) responses
5. **Rotate user agents**: Use different user agents to avoid detection

## Legal Considerations

- Always check the website's Terms of Service
- Respect robots.txt files
- Don't scrape personal or sensitive information
- Use scraped data responsibly and ethically
- Consider reaching out to websites for API access instead

## Troubleshooting

### Common Issues

1. **No products found**
   - Check if the website structure has changed
   - Verify selectors in `config.json`
   - Try running with `--headless=false` to see what's happening

2. **Timeout errors**
   - Increase timeout with `--timeout=60000`
   - Check your internet connection
   - Some sites may be blocking automated requests

3. **Rate limiting issues**
   - Increase delay with `--delay=5000`
   - Check if the site has implemented bot detection

### Debug Mode

Run with visible browser to debug:

```bash
node scraper.js amazon "test" --headless=false
```

## Contributing

To add support for a new e-commerce site:

1. Add site configuration to `config.json`
2. Add a new scraping method to the `EcommerceScraper` class
3. Test thoroughly with the new site

## Dependencies

- **puppeteer**: Web automation and scraping
- **csv-writer**: CSV file generation
- **fs**: File system operations
- **path**: Path utilities

## License

MIT License - feel free to use and modify as needed.

## Disclaimer

This tool is for educational and research purposes. Always ensure you comply with website terms of
service and applicable laws when scraping data.
