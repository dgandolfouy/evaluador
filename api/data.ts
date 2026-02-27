import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

// Initialize pool
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function ensureTablesExist(client: any) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        name VARCHAR(255) PRIMARY KEY
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS criteria (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        score NUMERIC,
        feedback TEXT,
        category VARCHAR(255)
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
        criteria JSON,
        analysis JSON
      );
    `);
  } catch (err) {
    console.error("Error ensuring tables exist:", err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      await ensureTablesExist(client);
      const employees = await client.query('SELECT * FROM employees;');
      const departments = await client.query('SELECT * FROM departments;');
      const evaluations = await client.query('SELECT * FROM evaluations;');
      const criteria = await client.query('SELECT * FROM criteria;');
      
      // Parse JSON fields and map lowercase column names to camelCase
      const parsedEmployees = employees.rows.map(emp => ({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        jobTitle: emp.jobtitle || emp.jobTitle,
        reportsTo: emp.reportsto || emp.reportsTo,
        additionalRoles: emp.additionalroles || emp.additionalRoles,
        averageScore: parseFloat(emp.averagescore || emp.averageScore || 0)
      }));
      
      const parsedEvaluations = evaluations.rows.map(ev => ({
        id: ev.id,
        employeeId: ev.employeeid || ev.employeeId,
        evaluatorId: ev.evaluatorid || ev.evaluatorId,
        date: ev.date,
        criteria: ev.criteria,
        analysis: ev.analysis
      }));

      const parsedCriteria = criteria.rows.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        score: parseFloat(c.score || 0),
        feedback: c.feedback || '',
        category: c.category || ''
      }));

      return res.status(200).json({ 
        employees: parsedEmployees, 
        departments: departments.rows.map(d => d.name), 
        evaluations: parsedEvaluations,
        criteria: parsedCriteria
      });
    }

    if (req.method === 'POST') {
      await ensureTablesExist(client);
      const { employees, departments, evaluations, criteria } = req.body;

      await client.query('BEGIN');
      // Truncate and re-insert strategy
      await client.query('TRUNCATE TABLE evaluations, employees, departments, criteria RESTART IDENTITY CASCADE;');

      if (departments) {
        for (const dept of departments) {
          await client.query('INSERT INTO departments (name) VALUES ($1)', [dept]);
        }
      }
      if (criteria) {
        for (const c of criteria) {
          await client.query(
            'INSERT INTO criteria (id, name, description, score, feedback, category) VALUES ($1, $2, $3, $4, $5, $6)',
            [c.id, c.name, c.description, c.score, c.feedback, c.category]
          );
        }
      }
      if (employees) {
        for (const emp of employees) {
          await client.query(
            'INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [emp.id, emp.name, emp.department, emp.jobTitle, emp.reportsTo, emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null, emp.averageScore]
          );
        }
      }
      if (evaluations) {
        for (const ev of evaluations) {
          await client.query(
            'INSERT INTO evaluations (id, employeeId, evaluatorId, date, criteria, analysis) VALUES ($1, $2, $3, $4, $5, $6)',
            [ev.id, ev.employeeId, ev.evaluatorId, ev.date, ev.criteria ? JSON.stringify(ev.criteria) : null, ev.analysis ? JSON.stringify(ev.analysis) : null]
          );
        }
      }
      await client.query('COMMIT');
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { type, id, name } = req.query;
      await ensureTablesExist(client);
      
      if (type === 'employee' && id) {
        await client.query('DELETE FROM employees WHERE id = $1', [id]);
        await client.query('DELETE FROM evaluations WHERE employeeId = $1', [id]);
      } else if (type === 'department' && name) {
        await client.query('DELETE FROM departments WHERE name = $1', [name]);
      } else if (type === 'evaluation' && id) {
        await client.query('DELETE FROM evaluations WHERE id = $1', [id]);
      } else {
        return res.status(400).json({ error: 'Invalid delete request' });
      }
      
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end('Method Not Allowed');

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    client.release();
  }
}
