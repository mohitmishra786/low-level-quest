-- Seed data for users
INSERT INTO users (username, email, password_hash, created_at, updated_at)
VALUES 
('testuser', 'test@example.com', '$2b$10$6jM7.1R8dVZTcVBCRZg/QOwI9U3jqA.gx2rmY.oqHX9ENCyDMArTi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 