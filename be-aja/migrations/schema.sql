-- Drop tabel jika sudah ada
DROP TABLE IF EXISTS kunjungan;
DROP TABLE IF EXISTS users;

-- Create users table for admin authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create kunjungan (visits) table
CREATE TABLE kunjungan (
    id SERIAL PRIMARY KEY,
    nama_institusi VARCHAR(255) NOT NULL,
    kebutuhan_kunjungan TEXT NOT NULL,
    jumlah_pengunjung INTEGER NOT NULL,
    jadwal_kunjungan DATE NOT NULL,
    nomor_telepon VARCHAR(20) NOT NULL,
    file_pengantar VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    tanggal_kirim DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_kunjungan_jadwal ON kunjungan(jadwal_kunjungan);
CREATE INDEX idx_kunjungan_status ON kunjungan(status);
CREATE INDEX idx_kunjungan_created ON kunjungan(created_at);

-- Insert default admin user (password: admin123), but ensure it's unique
INSERT INTO users (email, password, role)
SELECT 'admin@humas.lampung.go.id', '$2a$10$9ZX.Ld8n8kY3qZ4p2H1.1uQkv7YxJ8k6L5m4N3o2P9q8R7s6T4u3v', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@humas.lampung.go.id');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_kunjungan_updated_at
    BEFORE UPDATE ON kunjungan
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
