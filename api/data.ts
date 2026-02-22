import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = await db.connect();

  if (req.method === 'GET') {
    try {
      const employees = await client.sql`SELECT * FROM employees;`;
      const departments = await client.sql`SELECT * FROM departments;`;
      const evaluations = await client.sql`SELECT * FROM evaluations;`;

      return res.status(200).json({
        employees: employees.rows,
        departments: departments.rows,
        evaluations: evaluations.rows,
      });
    } catch (error) {
      return res.status(500).json({ error: "Error obteniendo datos" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;

      await client.sql`BEGIN;`;
      await client.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await client.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        await client.sql`
          INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore)
          VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle}, ${emp.reportsTo}, ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, ${emp.averageScore || 0});
        `;
      }

      if (evaluations && evaluations.length > 0) {
        for (const ev of evaluations) {
          await client.sql`
            INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments)
            VALUES (${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, ${JSON.stringify(ev.responses)}, ${ev.finalScore}, ${ev.comments});
          `;
        }
      }

      await client.sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await client.sql`ROLLBACK;`;
      console.error(error);
      return res.status(500).json({ error: "Error guardando datos" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
