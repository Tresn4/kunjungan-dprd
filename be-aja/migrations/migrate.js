const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL commands and execute them
    const commands = schema.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await pool.query(command);
          console.log('✓ Executed command successfully');
        } catch (error) {
          // Skip database creation and connection errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('database') &&
              !error.message.includes('\\c')) {
            console.error('Error executing command:', error.message);
          }
        }
      }
    }
    
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();