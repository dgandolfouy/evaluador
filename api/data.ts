import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- MÉTODO GET: Leer datos ---
  if (req.method === 'GET') {
    try {
      const { rows: employees } = await sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await sql`SELECT * FROM evaluations;`;

      // Aseguramos que additionalRoles sea un objeto para React
      const parsedEmployees = employees.map(emp => ({
        ...emp,
        additionalRoles: Array.isArray(emp.additionalRoles) ? emp.additionalRoles : []
      }));

      return res.status(200).json({ 
        employees: parsedEmployees, 
        departments, 
        evaluations 
      });
    } catch (error) {
      console.error("Error en GET:", error);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
  }

  // --- MÉTODO POST: Guardar datos ---
  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [], evaluations = [] } = req.body;

      await sql`BEGIN;`;
      
      // Limpiamos todo para insertar la nueva estructura de RR Etiquetas
      await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      // 1. Departamentos
      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        if (name) {
          await sql`INSERT INTO departments (name) VALUES (${name});`;
        }
      }

      // 2. Colaboradores y sus múltiples funciones
      for (const emp of employees) {
        const rolesJson = JSON.stringify(Array.isArray(emp.additionalRoles) ? emp.additionalRoles : []);
        
        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle || ''}, 
            ${emp.reportsTo || ''}, 
            ${rolesJson}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      // 3. Evaluaciones (si existen)
      if (Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await sql`
            INSERT INTO evaluations (id, "employeeId", "evaluatorId", date, criteria, "finalScore", comments)
            VALUES (${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, ${JSON.stringify(ev.criteria)}, ${ev.finalScore}, ${ev.comments});
          `;
        }
      }

      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      console.error("Error en POST:", error);
      return res.status(500).json({ error: "Error de sincronización" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
