import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

let pool: pg.Pool | null = null;

const getPool = () => {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    let finalConnectionString = connectionString;
    if (!finalConnectionString.includes('pg-bouncer')) {
      finalConnectionString += (finalConnectionString.includes('?') ? '&' : '?') + 'pg-bouncer=true';
    }
    pool = new pg.Pool({
      connectionString: finalConnectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
};

async function ensureTablesExist() {
  const dbPool = getPool();
  if (!dbPool) return;
  
  const client = await dbPool.connect();
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
  } finally {
    client.release();
  }
}

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(503).json({ 
        error: 'DATABASE_NOT_CONFIGURED', 
        message: 'La base de datos Neon no está configurada. Por favor, añade POSTGRES_URL en los Secrets.' 
      });
    }
    await ensureTablesExist();
    const employees = await dbPool.query('SELECT * FROM employees;');
    const departments = await dbPool.query('SELECT * FROM departments;');
    const evaluations = await dbPool.query('SELECT * FROM evaluations;');
    const criteria = await dbPool.query('SELECT * FROM criteria;');
    
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

    res.json({ 
      employees: parsedEmployees, 
      departments: departments.rows.map(d => d.name), 
      evaluations: parsedEvaluations,
      criteria: parsedCriteria
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/data', async (req, res) => {
  const dbPool = getPool();
  if (!dbPool) {
    return res.status(503).json({ 
      error: 'DATABASE_NOT_CONFIGURED', 
      message: 'La base de datos Neon no está configurada. Por favor, añade POSTGRES_URL en los Secrets.' 
    });
  }
  const client = await dbPool.connect();
  try {
    await ensureTablesExist();
    const { employees, departments, evaluations, criteria } = req.body;

    await client.query('BEGIN');
    // We use a simple strategy: truncate and re-insert for this specific app's admin save
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
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error saving data:", error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/data', async (req, res) => {
  const { type, id, name } = req.query;
  const dbPool = getPool();
  if (!dbPool) {
    return res.status(503).json({ error: 'DATABASE_NOT_CONFIGURED' });
  }
  
  const client = await dbPool.connect();
  try {
    await ensureTablesExist();
    
    if (type === 'employee' && id) {
      await client.query('DELETE FROM employees WHERE id = $1', [id]);
      // Also delete associated evaluations? Maybe not strictly required but good practice
      await client.query('DELETE FROM evaluations WHERE employeeId = $1', [id]);
    } else if (type === 'department' && name) {
      await client.query('DELETE FROM departments WHERE name = $1', [name]);
      // Update employees in this department to have no department or a default?
      // For now, let's just delete the department.
    } else {
      return res.status(400).json({ error: 'Invalid delete request' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/evaluations/:id', async (req, res) => {
  const { id } = req.params;
  const dbPool = getPool();
  if (!dbPool) {
    return res.status(503).json({ error: 'DATABASE_NOT_CONFIGURED' });
  }

  const client = await dbPool.connect();
  try {
    await ensureTablesExist();
    await client.query('DELETE FROM evaluations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
