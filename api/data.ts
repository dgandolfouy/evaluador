import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments } = await sql`SELECT * FROM departments;`;
      
      const fixedEmployees = employees.map(emp => ({
        ...emp,
        // Nos aseguramos de que additionalRoles sea un Array para que la App no explote
        additionalRoles: Array.isArray(emp.additionalRoles) ? emp.additionalRoles : []
      }));

      return res.status(200).json({ employees: fixedEmployees, departments });
    } catch (error) {
      return res.status(500).json({ error: "Error de lectura" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [] } = req.body;
      
      // 1. Limpieza total rápida
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      // 2. Insertar Departamentos
      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      // 3. Insertar Empleados con sus múltiples cargos
      for (const emp of employees) {
        // Importante: Convertimos el array de roles adicionales a JSON String
        const rolesJson = JSON.stringify(emp.additionalRoles || []);
        
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle}, 
            ${emp.reportsTo || null}, 
            ${rolesJson}, 
            ${emp.averageScore || 0}
          );
        `;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error al guardar:", error);
      return res.status(500).json({ error: "Error al guardar en Neon" });
    }
  }
}
