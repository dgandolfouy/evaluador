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
    } catch (e) { /* Likely already exists or table busy */ }

  } catch (err) {
    console.error("Schema initialization warning:", err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Run schema check on every request (Vercel serverless might restart often)
  await ensureSchema();

  if (req.method === 'GET') {
    try {
      const { rows: employees = [] } = await sql`SELECT * FROM employees;`;
      const { rows: departments = [] } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations = [] } = await sql`SELECT * FROM evaluations;`;
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

      await sql`BEGIN;`;

      // 1. DELETE everything in correct reverse-dependency order
      // We only delete if corresponding array is provided in body
      if (evaluations !== undefined) await sql`DELETE FROM evaluations;`;
      if (employees !== undefined) await sql`DELETE FROM employees;`;
      if (departments !== undefined) await sql`DELETE FROM departments;`;
      if (settings !== undefined) await sql`DELETE FROM settings;`;

      // 2. INSERT everything in correct dependency order
      if (departments) {
        for (const dept of departments) {
          const dName = typeof dept === 'string' ? dept : dept.name;
          if (dName) await sql`INSERT INTO departments (name) VALUES (${dName}) ON CONFLICT DO NOTHING;`;
        }
      }

      if (employees) {
        for (const emp of employees) {
          await sql`
            INSERT INTO employees (id, name, department, jobtitle, reportsto, additionalroles, averagescore)
            VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobtitle || emp.jobTitle || ''}, ${emp.reportsto || emp.reportsTo || ''}, ${JSON.stringify(emp.additionalroles || emp.additionalRoles || [])}, ${emp.averagescore || emp.averageScore || 0});
          `;
        }
      }

      if (evaluations) {
        for (const ev of evaluations) {
          await sql`
            INSERT INTO evaluations (id, employeeid, evaluatorid, date, criteria, finalscore, analysis)
            VALUES (
              ${ev.id}, 
              ${ev.employeeid || ev.employeeId}, 
              ${ev.evaluatorid || ev.evaluatorId}, 
              ${ev.date}, 
              ${typeof ev.criteria === 'string' ? ev.criteria : JSON.stringify(ev.criteria)}, 
              ${ev.finalscore || ev.finalScore}, 
              ${typeof ev.analysis === 'string' ? ev.analysis : JSON.stringify(ev.analysis || {})}
            );
          `;
        }
      }

      if (settings) {
        for (const s of settings) {
          await sql`INSERT INTO settings (key, value) VALUES (${s.key}, ${typeof s.value === 'string' ? s.value : JSON.stringify(s.value)});`;
        }
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      await sql`ROLLBACK;`;
      console.error("Transacción fallida", error);
      return res.status(500).json({ error: "Fallo al guardar", details: error.message });
    }
  }
}
