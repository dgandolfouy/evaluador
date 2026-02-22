import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: pg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    let connectionString = process.env.POSTGRES_URL;
    if (connectionString && !connectionString.includes('pg-bouncer')) {
        connectionString += (connectionString.includes('?') ? '&' : '?') + 'pg-bouncer=true';
    }
    pool = new pg.Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
};

async function ensureTablesExist() {
  const dbPool = getPool();
  const client = await dbPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        name VARCHAR(255) PRIMARY KEY
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) REFERENCES departments(name),
        jobTitle VARCHAR(255) NOT NULL,
        reportsTo VARCHAR(255),
        additionalRoles JSON,
        averageScore NUMERIC
      );
    `);
    await client.query(`
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
    `);
  } finally {
    client.release();
  }
}

const handleGet = async (req: VercelRequest, res: VercelResponse) => {
    const dbPool = getPool();
    await ensureTablesExist();
    const employees = await dbPool.query('SELECT * FROM employees;');
    const departments = await dbPool.query('SELECT * FROM departments;');
    const evaluations = await dbPool.query('SELECT * FROM evaluations;');
    res.json({ employees: employees.rows, departments: departments.rows, evaluations: evaluations.rows });
};

const handlePost = async (req: VercelRequest, res: VercelResponse) => {
    const dbPool = getPool();
    const client = await dbPool.connect();
    try {
        await ensureTablesExist();
        const { employees, departments, evaluations } = req.body;

        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY;');

        for (const dept of departments) {
            await client.query('INSERT INTO departments (name) VALUES ($1)', [dept]);
        }
        for (const emp of employees) {
            await client.query(
                'INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [emp.id, emp.name, emp.department, emp.jobTitle, emp.reportsTo, emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null, emp.averageScore]
            );
        }
        for (const ev of evaluations) {
            const finalScore = ev.analysis?.finalScore ?? 0;
            const comments = ev.analysis?.comments ?? '';
            await client.query(
                'INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments, analysis) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [ev.id, ev.employeeId, ev.evaluatorId, ev.date, ev.criteria ? JSON.stringify(ev.criteria) : null, finalScore, comments, ev.analysis ? JSON.stringify(ev.analysis) : null]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving data:", error);
        throw error;
    } finally {
        client.release();
    }
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      await handleGet(req, res);
    } else if (req.method === 'POST') {
      await handlePost(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("[VERCEL_FUNCTION_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    res.status(500).json({ error: errorMessage });
  }
}
