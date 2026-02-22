import { sql } from '@vercel/postgres';

async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        name VARCHAR(255) PRIMARY KEY
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) REFERENCES departments(name),
        jobTitle VARCHAR(255) NOT NULL,
        reportsTo VARCHAR(255),
        additionalRoles JSON,
        averageScore NUMERIC
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id VARCHAR(255) PRIMARY KEY,
        employeeId VARCHAR(255) NOT NULL,
        evaluatorId VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        responses JSON NOT NULL,
        finalScore NUMERIC NOT NULL,
        comments TEXT
      );
    `;

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
