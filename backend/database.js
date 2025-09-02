const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./qwipo.db'); // Creates the database file

db.serialize(() => {
  // Create customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phoneNumber TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    hasOneAddress INTEGER DEFAULT 1
  )`);

  // Create addresses table
  db.run(`CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER,
    addressDetails TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pinCode TEXT NOT NULL,
    FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
  )`);
});

module.exports = db;