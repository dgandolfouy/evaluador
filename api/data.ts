import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees } = await sql`SELECT * FROM employees;`;
      const { rows: departments } = await sql`SELECT * FROM departments;`;
      
      const fixedEmployees = employees.map(emp => ({
        ...emp,
        // Forzamos que jobTitle y reportsTo usen las mayúsculas que React espera
        jobTitle: emp.jobTitle || emp.jobtitle || '',
        reportsTo: emp.reportsTo || emp.reportsto || '',
        // Si additionalRoles viene como string, lo convertimos a objeto
        additionalRoles: typeof emp.additionalRoles === 'string' 
          ? JSON.parse(emp.additionalRoles) 
          : (emp.additionalRoles || emp.additionalroles || [])
      }));

      return res.status(200).json({ employees: fixedEmployees, departments });
    } catch (error) {
      return res.status(500).json({ error: "Error al leer" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [] } = req.body;
      await sql`BEGIN;`;
      await sql`TRUNCATE TABLE employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        // CONVERTIMOS A JSON STRING PARA QUE NEON NO SE QUEJE
        const rolesStr = JSON.stringify(emp.additionalRoles || []);
        
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle || ''}, 
            ${emp.reportsTo || ''}, 
            ${rolesStr}, 
            ${emp.averageScore || 0}
          );
        `;
      }
      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      console.error("DEBUG - Error al guardar:", error);
      return res.status(500).json({ error: "Error al guardar" });
    }
  }
}
