-- Cattle Breed Identification Database Initialization
-- This file sets up the PostgreSQL database with PostGIS extension

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cattle_profiles table
CREATE TABLE IF NOT EXISTS cattle_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    animal_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    breed VARCHAR(100),
    breed_confidence DECIMAL(5,2),
    type VARCHAR(20) CHECK (type IN ('cattle', 'buffalo')),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    age_months INTEGER,
    weight_kg DECIMAL(8,2),
    location POINT,
    image_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create identification_results table
CREATE TABLE IF NOT EXISTS identification_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    cattle_profile_id INTEGER REFERENCES cattle_profiles(id),
    image_url VARCHAR(500) NOT NULL,
    predicted_breed VARCHAR(100),
    confidence_score DECIMAL(5,2),
    alternative_breeds JSONB,
    processing_time_ms INTEGER,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cattle_profiles_user_id ON cattle_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cattle_profiles_breed ON cattle_profiles(breed);
CREATE INDEX IF NOT EXISTS idx_identification_results_user_id ON identification_results(user_id);
CREATE INDEX IF NOT EXISTS idx_identification_results_created_at ON identification_results(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@cattlebreed.com', '$2a$10$rQZ8K9mN2pL1vX3yW4uJ5e.6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', 'System Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;
