-- -- backend/models/schema.sql
-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   username VARCHAR(50) UNIQUE NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE problems (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(255) NOT NULL,
--   description TEXT NOT NULL,
--   difficulty VARCHAR(50) NOT NULL,
--   category VARCHAR(100) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE submissions (
--   id SERIAL PRIMARY KEY,
--   user_id INT REFERENCES users(id),
--   problem_id INT REFERENCES problems(id),
--   code TEXT NOT NULL,
--   result VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    solved_count INT DEFAULT 0,
    attempted_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    acceptance DECIMAL(5,2) NOT NULL,
    tags TEXT[] NOT NULL,
    category VARCHAR(100) NOT NULL,
    bookmarked BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'unsolved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    problem_id INT REFERENCES problems(id),
    code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample problems
INSERT INTO problems (title, description, difficulty, acceptance, tags, category) VALUES
('Buffer Overflow Analysis', 'Analyze and exploit a buffer overflow vulnerability in a given C program.', 'Medium', 70.0, ARRAY['Security', 'C', 'Memory'], 'Binary Exploitation'),
('Assembly Code Optimization', 'Optimize x86 assembly code for better performance while maintaining functionality.', 'Hard', 45.2, ARRAY['Assembly', 'x86', 'Optimization'], 'Computer Architecture'),
('Process Scheduler', 'Implement a round-robin process scheduler with priority queues.', 'Medium', 65.8, ARRAY['OS', 'Scheduling', 'C'], 'Operating Systems'),
('Memory Allocator', 'Design a custom memory allocator with specific constraints.', 'Hard', 38.9, ARRAY['Memory Management', 'C', 'OS'], 'Operating Systems'),
('Cache Simulator', 'Build a cache simulator supporting different replacement policies.', 'Medium', 72.3, ARRAY['Cache', 'C++', 'Architecture'], 'Computer Architecture'),
('System Call Implementation', 'Implement a custom system call in the Linux kernel.', 'Hard', 41.5, ARRAY['Kernel', 'C', 'Linux'], 'Operating Systems'),
('Binary Parser', 'Create a parser for ELF binary format files.', 'Medium', 68.7, ARRAY['Binary Analysis', 'C', 'ELF'], 'Reverse Engineering'),
('Stack Frame Analysis', 'Analyze and manipulate stack frames in x86_64 assembly.', 'Medium', 64.9, ARRAY['Assembly', 'x86_64', 'Debug'], 'Computer Architecture'),
('Shellcode Development', 'Develop shellcode for x86 architecture with size constraints.', 'Hard', 35.8, ARRAY['Security', 'Assembly', 'Exploit'], 'Binary Exploitation'),
('Virtual Memory Manager', 'Implement a virtual memory management system with paging.', 'Hard', 43.2, ARRAY['Memory', 'C', 'OS'], 'Operating Systems'),
('Interrupt Handler', 'Write an interrupt handler for keyboard input.', 'Medium', 69.5, ARRAY['Interrupts', 'Assembly', 'OS'], 'Operating Systems'),
('Format String Exploit', 'Identify and exploit format string vulnerabilities.', 'Hard', 38.4, ARRAY['Security', 'C', 'Exploit'], 'Binary Exploitation'),
('CPU Pipeline Simulator', 'Implement a basic CPU pipeline simulator.', 'Medium', 58.7, ARRAY['Pipeline', 'C++', 'CPU'], 'Computer Architecture'),
('Bootloader Development', 'Create a simple bootloader in assembly.', 'Hard', 41.9, ARRAY['Assembly', 'Boot', 'OS'], 'Operating Systems'),
('Return-Oriented Programming', 'Implement ROP chains for given binaries.', 'Hard', 36.3, ARRAY['Security', 'Exploit', 'Assembly'], 'Binary Exploitation');
