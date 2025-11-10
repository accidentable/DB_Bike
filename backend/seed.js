
const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db.config');

const seedDatabase = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    console.log('Executing init.sql...');
    await pool.query(sql);
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    pool.end();
  }
};

seedDatabase();
