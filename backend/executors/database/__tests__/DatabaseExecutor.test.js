const { DatabaseExecutor } = require('../DatabaseExecutor');
const fs = require('fs');
const path = require('path');

describe('DatabaseExecutor', () => {
  let executor;
  
  const createTableCode = `
import sqlite3

def create_tables():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            age INTEGER
        )
    ''')
    
    # Create orders table
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            product TEXT,
            amount REAL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    return conn

def main():
    conn = create_tables()
    print("Tables created successfully")
    conn.close()

if __name__ == "__main__":
    main()`;

  const insertDataCode = `
import sqlite3

def insert_data():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            age INTEGER
        )
    ''')
    
    # Insert users
    users = [
        (1, 'John Doe', 'john@example.com', 30),
        (2, 'Jane Smith', 'jane@example.com', 25),
        (3, 'Bob Johnson', 'bob@example.com', 35)
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', users)
    
    # Create and populate orders table
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            product TEXT,
            amount REAL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    orders = [
        (1, 1, 'Laptop', 999.99),
        (2, 1, 'Mouse', 29.99),
        (3, 2, 'Keyboard', 59.99)
    ]
    cursor.executemany('INSERT INTO orders VALUES (?, ?, ?, ?)', orders)
    
    conn.commit()
    return conn

def main():
    conn = insert_data()
    print("Data inserted successfully")
    conn.close()

if __name__ == "__main__":
    main()`;

  const queryDataCode = `
import sqlite3

def query_data():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create and populate tables
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            age INTEGER
        )
    ''')
    
    users = [
        (1, 'John Doe', 'john@example.com', 30),
        (2, 'Jane Smith', 'jane@example.com', 25),
        (3, 'Bob Johnson', 'bob@example.com', 35)
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', users)
    
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            product TEXT,
            amount REAL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    orders = [
        (1, 1, 'Laptop', 999.99),
        (2, 1, 'Mouse', 29.99),
        (3, 2, 'Keyboard', 59.99)
    ]
    cursor.executemany('INSERT INTO orders VALUES (?, ?, ?, ?)', orders)
    
    # Query: Get user orders with total amount
    cursor.execute('''
        SELECT u.name, COUNT(o.id) as order_count, SUM(o.amount) as total_amount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.name
        ORDER BY total_amount DESC
    ''')
    
    results = cursor.fetchall()
    for row in results:
        print(f"User: {row[0]}, Orders: {row[1]}, Total: ${row[2]:.2f}")
    
    conn.close()

if __name__ == "__main__":
    query_data()`;

  beforeEach(() => {
    executor = new DatabaseExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should create tables successfully', async () => {
    const result = await executor.execute(createTableCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Tables created successfully');
  });

  test('should insert data successfully', async () => {
    const result = await executor.execute(insertDataCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Data inserted successfully');
  });

  test('should execute complex query successfully', async () => {
    const result = await executor.execute(queryDataCode);
    expect(result.success).toBe(true);
    const expectedOutput = [
      'User: John Doe, Orders: 2, Total: $1029.98',
      'User: Jane Smith, Orders: 1, Total: $59.99',
      'User: Bob Johnson, Orders: 0, Total: $0.00'
    ].join('\n');
    expect(result.output.trim()).toBe(expectedOutput);
  });

  test('should handle foreign key constraints', async () => {
    const foreignKeyCode = `
import sqlite3

def test_foreign_keys():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert valid user
    cursor.execute('INSERT INTO users VALUES (1, "John")')
    
    # Try to insert order with non-existent user
    try:
        cursor.execute('INSERT INTO orders VALUES (1, 999)')
        print("Foreign key constraint failed")
    except sqlite3.IntegrityError:
        print("Foreign key constraint enforced")
    
    conn.close()

if __name__ == "__main__":
    test_foreign_keys()`;

    const result = await executor.execute(foreignKeyCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Foreign key constraint enforced');
  });

  test('should handle unique constraints', async () => {
    const uniqueConstraintCode = `
import sqlite3

def test_unique_constraint():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create table with unique email
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE
        )
    ''')
    
    # Insert first user
    cursor.execute('INSERT INTO users VALUES (1, "test@example.com")')
    
    # Try to insert duplicate email
    try:
        cursor.execute('INSERT INTO users VALUES (2, "test@example.com")')
        print("Unique constraint failed")
    except sqlite3.IntegrityError:
        print("Unique constraint enforced")
    
    conn.close()

if __name__ == "__main__":
    test_unique_constraint()`;

    const result = await executor.execute(uniqueConstraintCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Unique constraint enforced');
  });

  test('should handle transaction rollback', async () => {
    const transactionCode = `
import sqlite3

def test_transaction():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT
        )
    ''')
    
    # Start transaction
    conn.execute('BEGIN')
    
    # Insert first user
    cursor.execute('INSERT INTO users VALUES (1, "John")')
    
    # Try to insert duplicate primary key
    try:
        cursor.execute('INSERT INTO users VALUES (1, "Jane")')
        conn.commit()
        print("Transaction completed")
    except sqlite3.IntegrityError:
        conn.rollback()
        print("Transaction rolled back")
    
    # Verify no data was committed
    cursor.execute('SELECT COUNT(*) FROM users')
    count = cursor.fetchone()[0]
    print(f"User count: {count}")
    
    conn.close()

if __name__ == "__main__":
    test_transaction()`;

    const result = await executor.execute(transactionCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Transaction rolled back\nUser count: 0');
  });
}); 