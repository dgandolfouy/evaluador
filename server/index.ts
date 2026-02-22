import express from 'express';
import { sql } from '@vercel/postgres';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

async function ensureTablesExist() {
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
      responses JSON,
      finalScore NUMERIC,
      comments TEXT,
      analysis JSON
    );
  `;
}

app.get('/api/data', async (req, res) => {
  try {
    await ensureTablesExist();
    const employees = await sql`SELECT * FROM employees;`;
    const departments = await sql`SELECT * FROM departments;`;
    const evaluations = await sql`SELECT * FROM evaluations;`;
    res.json({ employees: employees.rows, departments: departments.rows, evaluations: evaluations.rows });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    await ensureTablesExist();
    const { employees, departments, evaluations } = req.body;

    await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY;`;

    for (const dept of departments) {
      await sql`INSERT INTO departments (name) VALUES (${dept});`;
    }
    for (const emp of employees) {
      await sql`INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore) VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle}, ${emp.reportsTo}, ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, ${emp.averageScore});`;
    }
    for (const ev of evaluations) {
      const finalScore = ev.analysis?.finalScore ?? 0;
      const comments = ev.analysis?.comments ?? '';
      await sql`INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments, analysis) VALUES (${ev.id}, ${ev.id}, ${ev.evaluatorId}, ${ev.date}, ${ev.criteria ? JSON.stringify(ev.criteria) : null}, ${finalScore}, ${comments}, ${ev.analysis ? JSON.stringify(ev.analysis) : null});`;
    }

    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Serve static files from the 'dist' directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
