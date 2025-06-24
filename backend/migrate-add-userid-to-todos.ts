import { sequelize } from './database';

async function migrate() {
  try {
    // Add userId column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE todos ADD COLUMN userId VARCHAR(36) REFERENCES users(id) NOT NULL DEFAULT '';
    `);
    console.log('Migration complete: userId column added to todos.');
  } catch (err: any) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('userId column already exists. No migration needed.');
    } else {
      console.error('Migration failed:', err);
    }
  }
  process.exit(0);
}

migrate(); 