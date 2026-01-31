#!/usr/bin/env python3
"""
Database Initialization Script
Runs the schema.sql to create all tables, indexes, and triggers
"""

import os
import sys
import psycopg2
from psycopg2 import sql

def init_database():
    """Initialize the database with schema.sql"""

    # Get database URL from environment
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Set it with: export DATABASE_URL='your-neon-connection-string'")
        sys.exit(1)

    # Read schema file
    schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
    try:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
    except FileNotFoundError:
        print(f"❌ Schema file not found at {schema_path}")
        sys.exit(1)

    print("🔵 Connecting to database...")

    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("✅ Connected to database")
        print("🔵 Creating tables, indexes, and triggers...")

        # Execute schema
        cursor.execute(schema_sql)

        print("✅ Database initialized successfully!")
        print("\n📊 Checking created tables:")

        # List all tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        for table in tables:
            print(f"   ✓ {table[0]}")

        cursor.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 60)
    print("ALICE Database Initialization")
    print("=" * 60)
    init_database()
