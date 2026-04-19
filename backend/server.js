const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API: Search Products
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        let queryStr = `
            SELECT p.id as product_id, p.name as product_name, p.category, p.image_url,
                   s.id as supermarket_id, s.name as supermarket_name, s.logo_url,
                   pr.current_price, 
                   prom.title as promotion_title, prom.description as promotion_desc
            FROM products p
            JOIN prices pr ON p.id = pr.product_id
            JOIN supermarkets s ON pr.supermarket_id = s.id
            LEFT JOIN promotions prom ON pr.promotion_id = prom.id
        `;
        let queryParams = [];

        if (q) {
            queryStr += ' WHERE p.name LIKE ?';
            queryParams.push(`%${q}%`);
        }

        const [results] = await pool.query(queryStr, queryParams);

        // Group by product to easily send to frontend
        const groupedResults = {};
        for (const row of results) {
            if (!groupedResults[row.product_id]) {
                groupedResults[row.product_id] = {
                    id: row.product_id,
                    name: row.product_name,
                    category: row.category,
                    image_url: row.image_url,
                    prices: []
                };
            }
            groupedResults[row.product_id].prices.push({
                supermarket_id: row.supermarket_id,
                supermarket_name: row.supermarket_name,
                logo_url: row.logo_url,
                price: parseFloat(row.current_price),
                promotion: row.promotion_title ? {
                    title: row.promotion_title,
                    description: row.promotion_desc
                } : null
            });
        }

        // Convert obj to array and calculate "best deal" 
        const responseData = Object.values(groupedResults).map(prod => {
            // Find lowest price
            const lowest = Math.min(...prod.prices.map(p => p.price));
            prod.prices = prod.prices.map(p => ({
                ...p,
                is_lowest: p.price === lowest,
                // Simple logic for best value: if it has promotion and is lowest or near lowest
                is_best_value: p.price === lowest && p.promotion !== null
            }));
            
            // If no promotions combined with lowest price, base best value just on lowest price
            if (!prod.prices.some(p => p.is_best_value)) {
               const lowestP = prod.prices.find(p => p.is_lowest);
               if(lowestP) lowestP.is_best_value = true;
            }

            return prod;
        });

        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- ADMIN ROUTES ---

// 1. Admin Login (Mock simplified)
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (admins.length > 0) {
            // using exact match since we used a mock hash of the string for simplicity
            if (password === admins[0].password_hash) {
                return res.json({ success: true, message: "Login successful", token: "mock-jwt-token-123" });
            }
        }
        res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. CRUD Products
app.get('/api/admin/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/products', async (req, res) => {
    const { name, category, description, image_url } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, category, description, image_url) VALUES (?, ?, ?, ?)',
            [name, category, description, image_url]
        );
        res.json({ id: result.insertId, name, category, description });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. CRUD Supermarkets
app.get('/api/admin/supermarkets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM supermarkets ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. CRUD Prices
app.get('/api/admin/prices', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pr.*, p.name as product_name, s.name as supermarket_name 
            FROM prices pr
            JOIN products p ON pr.product_id = p.id
            JOIN supermarkets s ON pr.supermarket_id = s.id
            ORDER BY pr.id DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/prices', async (req, res) => {
    const { product_id, supermarket_id, promotion_id, current_price } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO prices (product_id, supermarket_id, promotion_id, current_price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE current_price=VALUES(current_price), promotion_id=VALUES(promotion_id)',
            [product_id, supermarket_id, promotion_id || null, current_price]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
const initializeScraper = require('./scraper_service');

app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
    initializeScraper();
});
