const mysql = require('mysql2/promise');
require('dotenv').config();

async function reseedDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'supermarket_admin',
            database: process.env.DB_NAME || 'defaultdb',
            port: process.env.DB_PORT || 3306,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected. Dropping tables to reseed fresh Pak data...');
        await connection.query('DROP TABLE IF EXISTS prices, promotions, products, supermarkets, admins;');

        // Recreate tables
        await connection.query(`
            CREATE TABLE admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE supermarkets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                logo_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(100),
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE promotions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supermarket_id INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supermarket_id) REFERENCES supermarkets(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE prices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                supermarket_id INT NOT NULL,
                promotion_id INT DEFAULT NULL,
                current_price DECIMAL(10, 2) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (supermarket_id) REFERENCES supermarkets(id) ON DELETE CASCADE,
                FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
                UNIQUE KEY unique_product_supermarket (product_id, supermarket_id)
            );
        `);

        console.log("Tables recreated.");

        // Seeding Imtiaz, Naheed, Chaseup
        console.log("Seeding Pakistani Supermarket data...");
        await connection.query(`INSERT INTO supermarkets (name) VALUES ('Imtiaz Super Market'), ('Naheed Supermarket'), ('Chase Up')`);

        const products = [
            ['Olpers Full Cream Milk 1L', 'Dairy', 'Premium UHT full cream milk'],
            ['Tapal Danedar Black Tea 800g', 'Beverages', 'Premium blend black tea'],
            ['National Tomato Ketchup 800g', 'Pantry', 'Rich tomato ketchup pouch'],
            ['Sufi Sunflower Cooking Oil 5L', 'Grocery', 'Healthy sunflower oil tin'],
            ['Shan Sindhi Biryani Masala 60g', 'Spices', 'Authentic biryani spice mix'],
            ['Dawn Bread Large', 'Bakery', 'Freshly baked plain bread'],
            ['Rooh Afza Syrup 800ml', 'Beverages', 'Refreshing summer drink'],
            ['Lipton Yellow Label Tea 380g', 'Beverages', 'Rich black tea blend'],
            ['Ariel Machine Wash Powder 1Kg', 'Household', 'Detergent powder for washing'],
            ['Lux Soap Pink 140g', 'Personal Care', 'Beauty soap with floral extract'],
            ['Youngs French Mayonnaise 1L', 'Pantry', 'Classic creamy mayonnaise'],
            ['Kolson Macaroni 400g', 'Pasta', 'Elbow macaroni pasta'],
            ['Mitchells Mixed Fruit Jam 400g', 'Breakfast', 'Delicious mixed fruit jam'],
            ['Knorr Chicken Noodles Family Pack', 'Snacks', 'Instant chicken noodles'],
            ['Nestle Fruita Vitals Chaunsa 1L', 'Beverages', 'Mango nectar juice'],
            ['Dalda Canola Oil 5L', 'Grocery', 'Premium canola oil tin'],
            ['Nestle Everyday Tea Whitener 900g', 'Dairy', 'Tea whitener powder'],
            ['EBM Peek Freans Rio 1/2 Roll', 'Snacks', 'Cream filled biscuits']
        ];

        let valStrings = products.map(p => `('${p[0]}', '${p[1]}', '${p[2]}')`).join(',');
        await connection.query(`INSERT INTO products (name, category, description) VALUES ${valStrings}`);

        // Promotions
        await connection.query(`
            INSERT INTO promotions (supermarket_id, title, description, start_date) 
            VALUES 
            (1, 'Mega Bachat', 'Flat 5% off on Groceries', CURDATE()),
            (2, 'Naheed Weekend Special', 'Exclusive discounts for loyalty members', CURDATE()),
            (3, 'Chase Up Wholesale Prices', 'Everyday low prices guaranteed', CURDATE())
        `);

        // Inserting prices
        // 1=Imtiaz, 2=Naheed, 3=ChaseUp
        // Format: [product_id, imtiaz_price, naheed_price, chaseup_price]
        // Imtiaz gets promo 1, Naheed gets promo 2, ChaseUp gets promo 3 for best values
        const prices = [
            [1, 290, 300, 285], // Olpers
            [2, 1450, 1500, 1430], // Tapal
            [3, 420, 450, 410], // National Ketchup
            [4, 2800, 2950, 2750], // Sufi
            [5, 120, 130, 115], // Shan
            [6, 220, 220, 210], // Dawn
            [7, 450, 480, 440], // Rooh Afza
            [8, 850, 880, 840], // Lipton
            [9, 890, 950, 880], // Ariel
            [10, 120, 130, 115], // Lux
            [11, 850, 900, 840], // Youngs
            [12, 210, 230, 200], // Kolson
            [13, 400, 420, 390], // Mitchells
            [14, 250, 270, 240], // Knorr
            [15, 260, 280, 255], // Nestle Fruita
            [16, 2900, 3050, 2850], // Dalda
            [17, 1350, 1400, 1320], // Everyday
            [18, 50, 55, 45] // Rio
        ];

        for (let i = 0; i < prices.length; i++) {
            const p = prices[i];
            const pId = p[0];
            
            // Randomly assign a promotion instead of statically, or give Naheed a big deal occasionally
            // Imtiaz
            await connection.query(`INSERT INTO prices (product_id, supermarket_id, promotion_id, current_price) VALUES (${pId}, 1, ${i%3===0 ? 1 : 'NULL'}, ${p[1]})`);
            // Naheed
            await connection.query(`INSERT INTO prices (product_id, supermarket_id, promotion_id, current_price) VALUES (${pId}, 2, ${i%4===0 ? 2 : 'NULL'}, ${p[2]})`);
            // ChaseUp
            await connection.query(`INSERT INTO prices (product_id, supermarket_id, promotion_id, current_price) VALUES (${pId}, 3, ${i%5===0 ? 3 : 'NULL'}, ${p[3]})`);
        }

        const placeholderHash = "$2b$10$tZ2Oq6p2S1u1/mO.IqR.4.nIqR.4.nIqR.4.nIqR.4.nIqR.4.nI"; // fake hash for simple equality check in our implementation
        await connection.query(`INSERT INTO admins (username, password_hash) VALUES ('admin', 'admin')`);
        
        console.log("Pakistani market seed data fully inserted!");
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error("Error reseeding:", error);
        process.exit(1);
    }
}

reseedDB();
