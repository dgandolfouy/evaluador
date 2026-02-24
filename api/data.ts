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

    // 2. Add missing columns to employees if they are using old schema (CamelCase)
    try {
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS jobtitle VARCHAR(255);`;
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS reportsto VARCHAR(255);`;
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS additionalroles JSON;`;
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS averagescore NUMERIC;`;
    } catch (e: any) { console.warn("Schema Employees Update Warn:", e.message); }

    // 3. Add missing columns to evaluations if they are using old schema
    try {
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS criteria JSON;`;
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS analysis JSON;`;
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS employeeid VARCHAR(255);`;
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluatorid VARCHAR(255);`;
      await sql`ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS finalscore NUMERIC;`;
    } catch (e: any) { console.warn("Schema Evaluations Update Warn:", e.message); }

  } catch (err: any) {
    console.error("Critical Schema initialization FAIL:", err.message);
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

      await sql`BEGIN;`;

      if (evaluations !== undefined) await sql`DELETE FROM evaluations;`;
      if (employees !== undefined) await sql`DELETE FROM employees;`;
      if (departments !== undefined) await sql`DELETE FROM departments;`;
      if (settings !== undefined) await sql`DELETE FROM settings;`;

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
          await sql`
            INSERT INTO employees (id, name, department, jobtitle, reportsto, additionalroles, averagescore)
            VALUES (
              ${String(emp.id)}, 
              ${String(emp.name)}, 
              ${emp.department || null}, 
              ${String(emp.jobtitle || emp.jobTitle || '')}, 
              ${emp.reportsto || emp.reportsTo || null}, 
              ${JSON.stringify(emp.additionalroles || emp.additionalRoles || [])}, 
              ${Number(emp.averagescore || emp.averageScore || 0)}
            )
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
          await sql`
            INSERT INTO evaluations (id, employeeid, evaluatorid, date, criteria, finalscore, analysis)
            VALUES (
              ${String(ev.id)}, 
              ${String(ev.employeeid || ev.employeeId)}, 
              ${String(ev.evaluatorid || ev.evaluatorId)}, 
              ${String(ev.date)}, 
              ${typeof ev.criteria === 'string' ? ev.criteria : JSON.stringify(ev.criteria || [])}, 
              ${Number(ev.finalscore || ev.finalScore || 0)}, 
              ${typeof ev.analysis === 'string' ? ev.analysis : JSON.stringify(ev.analysis || {})}
            )
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
      console.error("Manual ROLLBACK executed:", error.message);
      return res.status(500).json({
        error: "Fallo al guardar en la base de datos",
        details: error.message,
        hint: "Si este error persiste, intente crear las tablas manualmente o contacte a soporte."
      });
    }
  }
}
