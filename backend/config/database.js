const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/store_rater.db');

const getDB = () => {
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        }
    });
};

const db = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            const database = getDB();
            database.run(sql, params, function(err) {
                database.close();
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            const database = getDB();
            database.get(sql, params, (err, row) => {
                database.close();
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            const database = getDB();
            database.all(sql, params, (err, rows) => {
                database.close();
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = db;