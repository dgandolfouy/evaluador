import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

// Self-healing function to ensure tables and columns exist
async function ensureSchema() {
  try {
    // 1. Ensure basic tables exist
    await sql`CREATE TABLE IF NOT EXISTS departments (name VARCHAR(255) PRIMARY KEY);`;
    await sql`CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      department VARCHAR(255),
      jobtitle VARCHAR(255),
      reportsto VARCHAR(255),
      additionalroles JSON,
      averagescore NUMERIC
    );`;
    await sql`CREATE TABLE IF NOT EXISTS evaluations (
      id VARCHAR(255) PRIMARY KEY,
      employeeid VARCHAR(255) NOT NULL,
      evaluatorid VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      criteria JSON,
      finalscore NUMERIC,
      analysis JSON
    );`;
    await sql`CREATE TABLE IF NOT EXISTS settings (key VARCHAR(255) PRIMARY KEY, value JSON);`;

    // 2. Add missing columns to evaluations if they are using old schema
    try {
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS criteria JSON;`;
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS analysis JSON;`;
    } catch (e) { /* Likely already exists */ }

    try {
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS additionalroles JSON;`;
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS averagescore NUMERIC;`;
    } catch (e) { /* Likely already exists */ }

  } catch (err: any) {
    console.error("Schema initialization warning:", err.message);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();

  if (req.method === 'GET') {
    try {
      const { rows: employees = [] } = await sql`SELECT * FROM employees ORDER BY name ASC;`;
      const { rows: departments = [] } = await sql`SELECT * FROM departments ORDER BY name ASC;`;
      const { rows: evaluations = [] } = await sql`SELECT * FROM evaluations ORDER BY date DESC;`;
      const { rows: settings = [] } = await sql`SELECT * FROM settings;`;

      return res.status(200).json({ employees, departments, evaluations, settings });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Error al leer BD", details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations, settings } = req.body;

      // LOG: Received update for keys: [${Object.keys(req.body).join(', ')}]
      await sql`BEGIN;`;

      // 1. DELETE in order of dependency
      if (evaluations !== undefined) {
        await sql`DELETE FROM evaluations;`;
      }
      if (employees !== undefined) {
        await sql`DELETE FROM employees;`;
      }
      if (departments !== undefined) {
        await sql`DELETE FROM departments;`;
      }
      if (settings !== undefined) {
        await sql`DELETE FROM settings;`;
      }

      // 2. INSERT in order of dependency
      if (departments) {
        for (const dept of departments) {
          const dName = typeof dept === 'string' ? dept : dept.name;
          if (dName) {
            await sql`INSERT INTO departments (name) VALUES (${dName}) ON CONFLICT (name) DO NOTHING;`;
          }
        }
      }

      if (employees) {
        for (const emp of employees) {
          const id = String(emp.id);
          const name = String(emp.name);
          const dept = emp.department || null;
          const jt = String(emp.jobtitle || emp.jobTitle || '');
          const repTo = emp.reportsto || emp.reportsTo || null;
          const addRoles = JSON.stringify(emp.additionalroles || emp.additionalRoles || []);
          const score = Number(emp.averagescore || emp.averageScore || 0);

          await sql`
            INSERT INTO employees (id, name, department, jobtitle, reportsto, additionalroles, averagescore)
            VALUES (${id}, ${name}, ${dept}, ${jt}, ${repTo}, ${addRoles}, ${score})
            ON CONFLICT (id) DO UPDATE SET 
              name = EXCLUDED.name,
              department = EXCLUDED.department,
              jobtitle = EXCLUDED.jobtitle,
              reportsto = EXCLUDED.reportsto,
              additionalroles = EXCLUDED.additionalroles,
              averagescore = EXCLUDED.averagescore;
          `;
        }
      }

      if (evaluations) {
        for (const ev of evaluations) {
          const id = String(ev.id);
          const empId = String(ev.employeeid || ev.employeeId);
          const evalId = String(ev.evaluatorid || ev.evaluatorId);
          const date = String(ev.date);
          const crit = typeof ev.criteria === 'string' ? ev.criteria : JSON.stringify(ev.criteria || []);
          const score = Number(ev.finalscore || ev.finalScore || 0);
          const analysis = typeof ev.analysis === 'string' ? ev.analysis : JSON.stringify(ev.analysis || {});

          await sql`
            INSERT INTO evaluations (id, employeeid, evaluatorid, date, criteria, finalscore, analysis)
            VALUES (${id}, ${empId}, ${evalId}, ${date}, ${crit}, ${score}, ${analysis})
            ON CONFLICT (id) DO UPDATE SET
              employeeid = EXCLUDED.employeeid,
              evaluatorid = EXCLUDED.evaluatorid,
              date = EXCLUDED.date,
              criteria = EXCLUDED.criteria,
              finalscore = EXCLUDED.finalscore,
              analysis = EXCLUDED.analysis;
          `;
        }
      }

      if (settings) {
        for (const s of settings) {
          await sql`
            INSERT INTO settings (key, value) 
            VALUES (${s.key}, ${typeof s.value === 'string' ? s.value : JSON.stringify(s.value)})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
          `;
        }
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      await sql`ROLLBACK;`;
      console.error("Transacción fallida detallada:", error.message);
      return res.status(500).json({
        error: "Fallo al guardar en la base de datos",
        details: error.message,
        hint: "Verifique que todos los IDs sean únicos y que los departamentos existan."
      });
    }
  }
}
