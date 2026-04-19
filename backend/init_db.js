const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        // First connection without DB selection to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'supermarket_admin',
            // Do not specify database here yet
        });

        console.log('Connected to MySQL server.');

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`supermarket_db\`;`);
        console.log('Database supermarket_db ensured.');
        
        await connection.query(`USE \`supermarket_db\`;`);

        // 1. Admins Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Supermarkets Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS supermarkets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                logo_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Products Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(100),
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Promotions Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS promotions (
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

        // 5. Prices Table (Many-to-Many resolver)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS prices (
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

        console.log("All tables created successfully (3NF format).");

        // -- Optional Dummy Data Seed --
        const [supermarkets] = await connection.query(`SELECT id FROM supermarkets LIMIT 1`);
        if (supermarkets.length === 0) {
            console.log("Seeding initial data...");
            await connection.query(`INSERT INTO supermarkets (name) VALUES ('Walmart'), ('Target'), ('Costco')`);

            await connection.query(`
                INSERT INTO products (name, category, description) VALUES 
                ('Milk 1 Gal', 'Dairy', 'Whole milk 1 gallon'),
                ('Eggs 1 Dozen', 'Dairy', 'Large grade A eggs'),
                ('Bread', 'Bakery', 'Whole wheat bread')
            `);

            await connection.query(`
                INSERT INTO promotions (supermarket_id, title, description, start_date) 
                VALUES 
                (1, 'Weekend Sale', 'Discount on Dairy products', CURDATE()),
                (2, 'Target Circle', 'Special members price', CURDATE())
            `);

            await connection.query(`
                INSERT INTO prices (product_id, supermarket_id, promotion_id, current_price) VALUES
                (1, 1, 1, 3.49),
                (1, 2, NULL, 3.99),
                (1, 3, NULL, 3.29),
                (2, 1, NULL, 2.99),
                (2, 2, 2, 2.49),
                (3, 1, NULL, 1.99),
                (3, 2, NULL, 2.19)
            `);
            
            // Default admin: admin / password
            const placeholderHash = "$2b$10$tZ2Oq6p2S1u1/mO.IqR.4.nIqR.4.nIqR.4.nIqR.4.nIqR.4.nI"; // fake hash
            await connection.query(`INSERT INTO admins (username, password_hash) VALUES ('admin', 'admin')`);
            
            console.log("Seed data inserted.");
        }

        await connection.end();
        console.log('Database initialization script completed.');
        process.exit(0);

    } catch (error) {
        console.error("Error initializing the database:", error);
        process.exit(1);
    }
}

initDB();
