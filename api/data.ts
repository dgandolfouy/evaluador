import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await sql`SELECT * FROM evaluations;`;

      // Aseguramos que additionalRoles sea un objeto real antes de mandarlo a la App
      const parsedEmployees = employees.map(emp => ({
        ...emp,
        additionalRoles: typeof emp.additionalRoles === 'string' 
          ? JSON.parse(emp.additionalRoles) 
          : (emp.additionalRoles || [])
      }));

      return res.status(200).json({ employees: parsedEmployees, departments, evaluations });
    } catch (error) {
      return res.status(500).json({ error: "Error de lectura" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [], evaluations = [] } = req.body;
      await sql`BEGIN;`;
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        // Guardamos el array de cargos adicionales como JSON puro
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, ${emp.name}, ${emp.department}, 
            ${emp.jobTitle || ''}, ${emp.reportsTo || ''}, 
            ${JSON.stringify(emp.additionalRoles || [])}, 
            ${emp.averageScore || 0}
          );
        `;
      }
      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      return res.status(500).json({ error: "Error de guardado" });
    }
  }
}
