import pkg from 'pg';
const { Pool } = pkg;
import { logger } from '../utils/logger.js';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cattle_breed_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', (client) => {
  logger.info('New client connected to database');
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database with PostGIS extension
export async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Enable PostGIS extension
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Create tables if they don't exist
    await createTables(client);
    
    client.release();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// Create database tables
async function createTables(client) {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      role VARCHAR(20) DEFAULT 'FLW' CHECK (role IN ('FLW', 'Expert', 'Admin')),
      location GEOMETRY(POINT, 4326),
      language_preference VARCHAR(10) DEFAULT 'en',
      accuracy_score DECIMAL(5,2) DEFAULT 0,
      registrations_count INTEGER DEFAULT 0,
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Breeds table
    `CREATE TABLE IF NOT EXISTS breeds (
      id SERIAL PRIMARY KEY,
      species_type VARCHAR(20) NOT NULL CHECK (species_type IN ('cattle', 'buffalo')),
      breed_name VARCHAR(255) NOT NULL UNIQUE,
      local_names JSONB DEFAULT '[]',
      characteristics JSONB DEFAULT '{}',
      avg_weight_range JSONB DEFAULT '{}',
      milk_yield_range JSONB DEFAULT '{}',
      identifying_features JSONB DEFAULT '[]',
      origin_region VARCHAR(255),
      images JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Animals table
    `CREATE TABLE IF NOT EXISTS animals (
      id SERIAL PRIMARY KEY,
      breed_id INTEGER REFERENCES breeds(id),
      owner_id INTEGER REFERENCES users(id),
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      location GEOMETRY(POINT, 4326),
      age INTEGER,
      sex VARCHAR(10) CHECK (sex IN ('Male', 'Female')),
      weight DECIMAL(8,2),
      health_status VARCHAR(50),
      tag_number VARCHAR(50) UNIQUE,
      images JSONB DEFAULT '[]',
      ai_confidence_score DECIMAL(5,2),
      verified_by_expert BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Identification logs table
    `CREATE TABLE IF NOT EXISTS identification_logs (
      id SERIAL PRIMARY KEY,
      animal_id INTEGER REFERENCES animals(id),
      user_id INTEGER REFERENCES users(id),
      ai_predictions JSONB DEFAULT '{}',
      final_breed_selected INTEGER REFERENCES breeds(id),
      correction_made BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      image_quality_score DECIMAL(5,2),
      processing_time INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // Offline queue table
    `CREATE TABLE IF NOT EXISTS offline_queue (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      data_payload JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      synced_at TIMESTAMP,
      retry_count INTEGER DEFAULT 0,
      error_log TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
    );`,

    // Expert reviews table
    `CREATE TABLE IF NOT EXISTS expert_reviews (
      id SERIAL PRIMARY KEY,
      animal_id INTEGER REFERENCES animals(id),
      expert_id INTEGER REFERENCES users(id),
      review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
      review_notes TEXT,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const tableQuery of tables) {
    await client.query(tableQuery);
  }

  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_animals_breed_id ON animals(breed_id);',
    'CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);',
    'CREATE INDEX IF NOT EXISTS idx_animals_location ON animals USING GIST(location);',
    'CREATE INDEX IF NOT EXISTS idx_animals_registration_date ON animals(registration_date);',
    'CREATE INDEX IF NOT EXISTS idx_identification_logs_user_id ON identification_logs(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_identification_logs_timestamp ON identification_logs(timestamp);',
    'CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);',
    'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
    'CREATE INDEX IF NOT EXISTS idx_breeds_species_type ON breeds(species_type);',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);'
  ];

  for (const indexQuery of indexes) {
    await client.query(indexQuery);
  }

  logger.info('Database tables and indexes created successfully');
}

// Get database connection
export async function getConnection() {
  return await pool.connect();
}

// Execute query with error handling
export async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute transaction
export async function executeTransaction(queries) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params || []);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close database connection
export async function closeDatabase() {
  await pool.end();
  logger.info('Database connection closed');
}

export { pool };
