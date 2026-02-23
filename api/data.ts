import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees = [] } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments = [] } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations = [] } = await sql`SELECT * FROM evaluations;`;
      
      return res.status(200).json({ 
        employees, 
        departments,
        evaluations
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al leer de la base de datos" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [], evaluations = [] } = req.body;
      await sql`BEGIN;`;
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const dName = typeof dept === 'string' ? dept : dept.name;
        if (dName) await sql`INSERT INTO departments (name) VALUES (${dName});`;
      }

      for (const emp of employees) {
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, ${emp.name}, ${emp.department}, 
            ${emp.jobTitle}, ${emp.reportsTo || ''}, 
            ${JSON.stringify(emp.additionalRoles || [])}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      for (const ev of evaluations) {
        await sql`
          INSERT INTO evaluations (id, "employeeId", "evaluatorId", date, criteria, "finalScore", comments)
          VALUES (${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, ${JSON.stringify(ev.criteria)}, ${ev.finalScore}, ${ev.comments || ''});
        `;
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      return res.status(500).json({ error: "Fallo al guardar" });
    }
  }
}
