DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS problem_details;
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

CREATE TABLE problem_details (
    id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES problems(id),
    examples JSON NOT NULL,
    constraints TEXT[] NOT NULL,
    hints TEXT[],
    starter_code TEXT NOT NULL,
    solution_code TEXT NOT NULL
);

CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES problems(id),
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false
);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    problem_id INT REFERENCES problems(id),
    code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    runtime_ms INT,
    memory_kb INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 3 easy problems
INSERT INTO problems (title, description, difficulty, acceptance, tags, category) VALUES
('Simple Stack Implementation', 'Implement a basic stack data structure with push, pop, and peek operations.', 'Easy', 85.5, ARRAY['C', 'Data Structures', 'Stack'], 'Data Structures'),
('Linked List Traversal', 'Write a program to traverse a singly linked list and print all elements.', 'Easy', 90.2, ARRAY['C', 'Data Structures', 'Linked List'], 'Data Structures'),
('Binary Search', 'Implement binary search algorithm to find an element in a sorted array.', 'Easy', 88.7, ARRAY['C', 'Algorithms', 'Searching'], 'Algorithms');

-- Insert problem details
INSERT INTO problem_details (problem_id, examples, constraints, hints, starter_code, solution_code) VALUES
(1,
 '[{"input": "push(1)\npush(2)\npop()\npeek()", "output": "2", "explanation": "After pushing 1 and 2, pop removes 2, and peek shows 1"}]',
 ARRAY['Stack size should not exceed 100', 'All elements are integers'],
 ARRAY['Think about using an array to store elements', 'Keep track of the top element'],
 '#include <stdio.h>\n\nstruct Stack {\n    int arr[100];\n    int top;\n};\n\nvoid push(struct Stack* stack, int value) {\n    // Your code here\n}\n\nint pop(struct Stack* stack) {\n    // Your code here\n}\n\nint peek(struct Stack* stack) {\n    // Your code here\n}',
 '#include <stdio.h>\n\nstruct Stack {\n    int arr[100];\n    int top;\n};\n\nvoid push(struct Stack* stack, int value) {\n    if (stack->top < 99) {\n        stack->arr[++stack->top] = value;\n    }\n}\n\nint pop(struct Stack* stack) {\n    if (stack->top >= 0) {\n        return stack->arr[stack->top--];\n    }\n    return -1;\n}\n\nint peek(struct Stack* stack) {\n    if (stack->top >= 0) {\n        return stack->arr[stack->top];\n    }\n    return -1;\n}'
);

-- Insert test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
(1, 'push(1)\npush(2)\npop()', '2', false),
(1, 'push(1)\npush(2)\npush(3)\npop()\npeek()', '2', false),
(1, 'push(5)\npop()\npush(10)\npeek()', '10', true);
