-- Database schema for Low Level Quest

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_problem_status CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS hints CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50),
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_problem_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    problem_id INTEGER REFERENCES problems(id),
    status VARCHAR(50) DEFAULT 'not_attempted',
    attempts INTEGER DEFAULT 0,
    solved_at TIMESTAMP WITH TIME ZONE,
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    problems_solved INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

CREATE TABLE discussions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hints (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    content TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES
('Memory Management', 'Problems related to memory allocation, deallocation, and management'),
('Data Structures', 'Implementation of fundamental data structures'),
('Algorithms', 'Basic to advanced algorithm implementations');

INSERT INTO problems (title, description, difficulty, category_id) VALUES
('Memory Management', E'Implement a simple memory allocator in C with the following requirements:\n\n1. Create a fixed-size memory pool of 1024 bytes\n2. Implement function that allocates memory from this pool\n3. Implement function that frees memory\n4. Your allocator should return NULL when:\n   - Requested size is 0\n   - Requested size is larger than available memory\n   - Less than 4 bytes remain in the pool\n5. For this simple implementation, your function should only reset the allocator when freeing the first allocated block\n\nExample:\n```c\n// Allocate memory for an integer\nint* x = (int*)my_malloc(sizeof(int));\n*x = 42;\nprintf("%d\\n", *x);  // Outputs: 42\nmy_free(x);\n\n// Memory allocation failure cases\nvoid* ptr1 = my_malloc(0);  // Returns NULL (zero size)\nvoid* ptr2 = my_malloc(2000);  // Returns NULL (too large)\n```', 'Easy', 1);

INSERT INTO test_cases (problem_id, input, expected_output, description) VALUES
(1, E'int* x = (int*)my_malloc(sizeof(int));\n*x = 42;\nprintf("%d\\n", *x);\nmy_free(x);', '42', 'Basic allocation and use of memory for a single integer'),
(1, E'int* x = (int*)my_malloc(sizeof(int));\nint* y = (int*)my_malloc(sizeof(int));\n*x = 10;\n*y = 20;\nprintf("%d %d\\n", *x, *y);\nmy_free(y);\nmy_free(x);', '10 20', 'Allocate and use multiple memory blocks'),
(1, E'void* ptr = my_malloc(0);\nprintf("%s\\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', 'Allocating zero bytes should return NULL'),
(1, E'void* ptr = my_malloc(2000);\nprintf("%s\\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', 'Allocating more than pool size should return NULL'),
(1, E'char* str1 = (char*)my_malloc(6);\nchar* str2 = (char*)my_malloc(4);\nstrcpy(str1, "Hello");\nstrcpy(str2, "Hi!");\nprintf("%s %s\\n", str1, str2);\nmy_free(str2);\nmy_free(str1);', 'Hello Hi!', 'Allocate and use memory for strings'),
(1, E'void* ptr1 = my_malloc(1020);\nvoid* ptr2 = my_malloc(4);\nprintf("%s %s\\n",\n       ptr1 != NULL ? "ALLOCATED" : "NULL",\n       ptr2 != NULL ? "ALLOCATED" : "NULL");', 'ALLOCATED NULL', 'Edge case: After allocating 1020 bytes, a request for 4 more bytes should fail (reserved space)');

-- Insert sample hints
INSERT INTO hints (problem_id, content, order_number) VALUES
(1, 'Start by declaring a static array of bytes as your memory pool', 1),
(1, 'Keep track of allocated memory using a simple counter', 2),
(1, 'Remember to check for NULL conditions before allocating', 3);

-- Create indexes
CREATE INDEX idx_user_problem_status_user_id ON user_problem_status(user_id);
CREATE INDEX idx_user_problem_status_problem_id ON user_problem_status(problem_id);
CREATE INDEX idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX idx_discussions_problem_id ON discussions(problem_id);
CREATE INDEX idx_comments_discussion_id ON comments(discussion_id);
CREATE INDEX idx_hints_problem_id ON hints(problem_id); 