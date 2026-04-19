const cron = require('node-cron');
const pool = require('./db');

// This simulates a real-time web-scraper queue running every minute.
const initializeScraper = () => {
    console.log("[Scraper Service] Initialized to run every 1 minute.");

    cron.schedule('* * * * *', async () => {
        console.log("[Scraper Service] 🔍 Running simulated scrape job on Imtiaz, Naheed, and Chase Up websites...");
        
        try {
            // Get all current prices
            const [prices] = await pool.query('SELECT * FROM prices');

            let updateCount = 0;
            
            // Randomly update 10% of products to simulate dynamic market changes
            for (const priceRow of prices) {
                // 15% chance to fluctuate price
                if (Math.random() < 0.15) {
                    // Fluctuate price by up to +/- 5%
                    const variation = 1 + (Math.random() * 0.10 - 0.05);
                    const newPrice = (priceRow.current_price * variation).toFixed(2);
                    
                    await pool.query('UPDATE prices SET current_price = ? WHERE id = ?', [newPrice, priceRow.id]);
                    updateCount++;
                }
            }

            console.log(`[Scraper Service] ✅ Successfully scraped websites and updated ${updateCount} prices in real-time.`);
        } catch (error) {
            console.error("[Scraper Service] ❌ Error scraping prices:", error);
        }
    });
};

module.exports = initializeScraper;
