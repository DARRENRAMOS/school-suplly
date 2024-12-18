const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());  // This will allow your React app to communicate with the API

// Create a MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password if needed
  database: 'inventory' // Replace with your database name
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Fetch all categories
app.get('/categories', (req, res) => {
  connection.query('SELECT * FROM category', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Add a new category
app.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Category name is required' });
    return;
  }

  connection.query('INSERT INTO category (name) VALUES (?)', [name], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.status(201).json({ message: 'Category added successfully', id: results.insertId });
  });
});

// Update an existing category
app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Category name is required' });
    return;
  }

  connection.query('UPDATE category SET name = ? WHERE id = ?', [name, id], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete a category
app.delete('/categories/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM category WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  });
});

// Fetch all products
app.get('/products', (req, res) => {
  connection.query(`
    SELECT Products.id, Products.products_name, Products.price, Products.stock, Category.name AS category_name
    FROM Products
    JOIN Category ON Products.category_id = Category.id
  `, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Add a new product
app.post('/products', (req, res) => {
  const { products_name, category_id, price, stock } = req.body;
  if (!products_name || !category_id || !price || !stock) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  connection.query('INSERT INTO Products (products_name, category_id, price, stock) VALUES (?, ?, ?, ?)', 
  [products_name, category_id, price, stock], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    res.status(201).json({ message: 'Product added successfully', id: results.insertId });
  });
});

// Update an existing product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { products_name, category_id, price, stock } = req.body;
  if (!products_name || !category_id || !price || !stock) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  connection.query('UPDATE Products SET products_name = ?, category_id = ?, price = ?, stock = ? WHERE id = ?', 
  [products_name, category_id, price, stock, id], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM Products WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
