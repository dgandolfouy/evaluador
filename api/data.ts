import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const employees = await sql`SELECT * FROM employees;`;
      const departments = await sql`SELECT * FROM departments;`;
      const evaluations = await sql`SELECT * FROM evaluations;`;

      return res.status(200).json({
        employees: employees.rows,
        departments: departments.rows,
        evaluations: evaluations.rows,
      });
    } catch (error) {
      return res.status(500).json({ error: "Error en GET" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;

      await sql`BEGIN;`;
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        await sql`
          INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore)
          VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle}, ${emp.reportsTo}, ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, ${emp.averageScore || 0});
        `;
      }

      if (evaluations && Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await sql`
            INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments)
            VALUES (${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, ${JSON.stringify(ev.responses)}, ${ev.finalScore}, ${ev.comments});
          `;
        }
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      return res.status(500).json({ error: "Error en POST" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
