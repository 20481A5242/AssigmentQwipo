const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./customers.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create 'customers' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pinCode TEXT NOT NULL
    )`);
  }
});

// API endpoint to create a new customer
app.post('/api/customers', (req, res) => { // Renamed the endpoint to be more RESTful
  const { firstName, lastName, phoneNumber, address, city, state, pinCode } = req.body;

  if (!firstName || !lastName || !phoneNumber || !address || !city || !state || !pinCode) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const sql = `INSERT INTO customers (firstName, lastName, phoneNumber, address, city, state, pinCode) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [firstName, lastName, phoneNumber, address, city, state, pinCode];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error inserting customer:', err.message);
      return res.status(500).json({ error: 'Failed to create customer.' });
    }
    res.status(201).json({ message: 'Customer created successfully!', customerId: this.lastID });
  });
});

// API endpoint to get all customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', (err, rows) => {
    if (err) {
      console.error('Error fetching customers:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve customers.' });
    }
    res.json(rows);
  });
});

// API endpoint to get a single customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  db.get('SELECT * FROM customers WHERE id = ?', [customerId], (err, row) => {
    if (err) {
      console.error('Error fetching customer:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve customer.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json(row);
  });
});

// API endpoint to update a customer
app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { firstName, lastName, phoneNumber, address, city, state, pinCode } = req.body;

  if (!firstName || !lastName || !phoneNumber || !address || !city || !state || !pinCode) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const sql = `UPDATE customers SET firstName = ?, lastName = ?, phoneNumber = ?, address = ?, city = ?, state = ?, pinCode = ? WHERE id = ?`;
  const params = [firstName, lastName, phoneNumber, address, city, state, pinCode, customerId];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating customer:', err.message);
      return res.status(500).json({ error: 'Failed to update customer.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ message: 'Customer updated successfully!' });
  });
});

// NEW: API endpoint to delete a customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  
  const sql = `DELETE FROM customers WHERE id = ?`;
  
  db.run(sql, customerId, function(err) {
    if (err) {
      console.error('Error deleting customer:', err.message);
      return res.status(500).json({ error: 'Failed to delete customer.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ message: 'Customer deleted successfully!' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});