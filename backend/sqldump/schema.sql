-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create problems table
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    initial_code TEXT,
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test_cases table
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hints table
CREATE TABLE hints (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    problem_id INTEGER REFERENCES problems(id),
    status VARCHAR(20) NOT NULL,
    submitted_solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_problem_status table
CREATE TABLE IF NOT EXISTS user_problem_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('attempted', 'solved')),
    attempts INTEGER DEFAULT 0,
    run_code_count INTEGER DEFAULT 0,
    last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    solved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_problem_status_user_id ON user_problem_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_status_problem_id ON user_problem_status(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_status_status ON user_problem_status(status);

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
    ('Operating Systems', 'Problems related to OS concepts, system calls, and kernel programming'),
    ('Computer Architecture', 'Problems focusing on CPU architecture, memory hierarchy, and assembly language'),
    ('Reverse Engineering', 'Challenges involving binary analysis and understanding compiled code'),
    ('Binary Exploitation', 'Problems related to security vulnerabilities and exploit development'),
    ('DevOps', 'Tasks involving system administration, automation, and deployment'),
    ('Machine Learning', 'Problems related to ML algorithms, neural networks, and data processing'); 