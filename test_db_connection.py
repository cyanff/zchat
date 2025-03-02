#!/usr/bin/env python3
"""
Database Connection Test Script

This script attempts to connect to a PostgreSQL database using the provided connection URI.
It validates that the connection can be established successfully.

Usage:
    python test_db_connection.py

Environment Variables:
    DB_PASSWORD: The database password to use in the connection string
"""

import os
import sys
import getpass

# Prompt for password if not provided as environment variable
password = os.environ.get("DB_PASSWORD")
if not password:
    # Use getpass for secure password input
    password = getpass.getpass("Enter the database password: ")

    # Verify that a password was actually entered
    if not password:
        print("Error: No password provided. A password is required to connect.")
        sys.exit(1)

# Construct the connection URI with the provided password
connection_uri = f"postgresql://postgres:{password}@db.jhqetjdtwjisjstphhwa.supabase.co:5432/postgres"

try:
    # Attempt to import psycopg2
    import psycopg2

    print("Successfully imported psycopg2")

    # Attempt to connect to the database
    print(f"Attempting to connect to PostgreSQL database...")
    conn = psycopg2.connect(connection_uri)

    # If we get here, the connection was successful
    print("Connection successful!")

    # Get server version
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    if version is not None:
        print(f"PostgreSQL server version: {version[0]}")
    else:
        print("Could not retrieve PostgreSQL version.")

    # Close the connection
    cursor.close()
    conn.close()
    print("Connection closed.")

except ImportError:
    print("Error: psycopg2 module not found.")
    print("Please install it using: pip install psycopg2-binary")
    sys.exit(1)
except Exception as e:
    # This will catch psycopg2.OperationalError if psycopg2 is imported
    print(f"Connection failed: {e}")
    sys.exit(1)
