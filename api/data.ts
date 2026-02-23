import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await sql`SELECT * FROM evaluations;`;

      return res.status(200).json({ employees, departments, evaluations });
    } catch (error) {
      return res.status(500).json({ error: "Error al leer" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [], evaluations = [] } = req.body;

      // Usamos una transacción simple
      await sql`BEGIN;`;
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle || ''}, ${emp.reportsTo || ''}, ${JSON.stringify(emp.additionalRoles || [])}, ${emp.averageScore || 0});
        `;
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      console.error(error);
      return res.status(500).json({ error: "Error al guardar" });
    }
  }
}
