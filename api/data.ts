import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = createPool();

  if (req.method === 'GET') {
    try {
      const { rows: employees } = await pool.sql`SELECT * FROM employees;`;
      const { rows: departments } = await pool.sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await pool.sql`SELECT * FROM evaluations;`;
      return res.status(200).json({ employees, departments, evaluations });
    } catch (error) {
      return res.status(500).json({ error: "Error al leer datos" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;
      await pool.sql`BEGIN;`;
      await pool.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await pool.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        // Mapeo detallado de cada campo que mencionaste
        await pool.sql`
          INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore)
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle || 'Sin puesto'}, 
            ${emp.reportsTo || 'Sin superior'}, 
            ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : '[]'}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      if (evaluations && Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await pool.sql`
            INSERT INTO evaluations (id, employeeId, evaluatorId, date, criteria, finalScore, comments, analysis)
            VALUES (
              ${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, 
              ${JSON.stringify(ev.criteria)}, ${ev.finalScore || 0}, 
              ${ev.comments || ''}, ${ev.analysis ? JSON.stringify(ev.analysis) : null}
            );
          `;
        }
      }

      await pool.sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await pool.sql`ROLLBACK;`;
      console.error(error);
      return res.status(500).json({ error: "Error al guardar todos los campos" });
    }
  }
  return res.status(405).json({ error: "Método no permitido" });
}
