import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees = [] } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments = [] } = await sql`SELECT * FROM departments;`;
      
      // Mapeo ultra-seguro para que el frontend nunca reciba un 'undefined'
      const safeEmployees = employees.map(emp => ({
        id: emp.id || String(Math.random()),
        name: emp.name || '',
        department: emp.department || '',
        jobTitle: emp.jobTitle || emp.jobtitle || '',
        reportsTo: emp.reportsTo || emp.reportsto || '',
        additionalRoles: Array.isArray(emp.additionalRoles) ? emp.additionalRoles : [],
        averageScore: Number(emp.averageScore || 0)
      }));

      return res.status(200).json({ 
        employees: safeEmployees, 
        departments: departments.map(d => typeof d === 'string' ? d : d.name) 
      });
    } catch (error) {
      console.error(error);
      return res.status(200).json({ employees: [], departments: [] }); // Devolvemos vacío pero no error 500
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [] } = req.body;
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
      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      return res.status(500).json({ error: "Fallo al guardar" });
    }
  }
}
