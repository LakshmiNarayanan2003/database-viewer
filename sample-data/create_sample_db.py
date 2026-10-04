#!/usr/bin/env python3
import sqlite3
import os

# Create a sample SQLite database
conn = sqlite3.connect('sample-data/sample.db')
cursor = conn.cursor()

# Create a users table
cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        age INTEGER,
        city TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Insert sample data
users = [
    (1, 'John Doe', 'john@example.com', 30, 'New York'),
    (2, 'Jane Smith', 'jane@example.com', 25, 'Los Angeles'),
    (3, 'Bob Johnson', 'bob@example.com', 35, 'Chicago'),
    (4, 'Alice Williams', 'alice@example.com', 28, 'Houston'),
    (5, 'Charlie Brown', 'charlie@example.com', 32, 'Phoenix'),
    (6, 'Diana Prince', 'diana@example.com', 29, 'Washington'),
    (7, 'Eve Adams', 'eve@example.com', 31, 'Boston'),
    (8, 'Frank Miller', 'frank@example.com', 27, 'Seattle'),
    (9, 'Grace Lee', 'grace@example.com', 33, 'San Francisco'),
    (10, 'Henry Wilson', 'henry@example.com', 26, 'Denver'),
]

cursor.executemany('INSERT INTO users (id, name, email, age, city) VALUES (?, ?, ?, ?, ?)', users)

# Create an orders table
cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        product TEXT NOT NULL,
        amount REAL,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
''')

orders = [
    (1, 1, 'Laptop', 999.99, 'completed'),
    (2, 1, 'Mouse', 29.99, 'completed'),
    (3, 2, 'Keyboard', 79.99, 'pending'),
    (4, 3, 'Monitor', 299.99, 'completed'),
    (5, 4, 'Headphones', 149.99, 'shipped'),
    (6, 5, 'Webcam', 89.99, 'completed'),
    (7, 6, 'Desk', 499.99, 'pending'),
    (8, 7, 'Chair', 399.99, 'shipped'),
    (9, 8, 'Tablet', 599.99, 'completed'),
    (10, 9, 'Phone', 799.99, 'pending'),
]

cursor.executemany('INSERT INTO orders (id, user_id, product, amount, status) VALUES (?, ?, ?, ?, ?)', orders)

conn.commit()
conn.close()

print('Sample database created: sample-data/sample.db')
