import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // El "pool" es lo que Vercel te pide para no colapsar la base de datos
  const pool = createPool();

  if (req.method === 'GET') {
    try {
      const { rows: employees } = await pool.sql`SELECT * FROM employees;`;
      const { rows: departments } = await pool.sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await pool.sql`SELECT * FROM evaluations;`;

      return res.status(200).json({
        employees,
        departments,
        evaluations,
      });
    } catch (error) {
      console.error("Error en GET:", error);
      return res.status(500).json({ error: "Error obteniendo datos" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;

      // Usamos una transacción para que si algo falla, no se borre nada
      await pool.sql`BEGIN;`;
      await pool.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await pool.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        await pool.sql`
          INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore)
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle}, 
            ${emp.reportsTo}, 
            ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      if (evaluations && Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await pool.sql`
            INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments)
            VALUES (
              ${ev.id}, 
              ${ev.employeeId}, 
              ${ev.evaluatorId}, 
              ${ev.date}, 
              ${JSON.stringify(ev.criteria)}, 
              ${ev.analysis ? JSON.stringify(ev.analysis) : null}, 
              ${ev.comments || ''}
            );
          `;
        }
      }

      await pool.sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await pool.sql`ROLLBACK;`;
      console.error("Error en POST:", error);
      return res.status(500).json({ error: "Error guardando datos" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
