import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inicializamos el pool de conexión con Neon
  const pool = createPool();

  if (req.method === 'GET') {
    try {
      // Usamos comillas dobles para que el SELECT respete las mayúsculas de los campos
      const { rows: employees } = await pool.sql`SELECT id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore" FROM employees;`;
      const { rows: departments } = await pool.sql`SELECT * FROM departments;`;
      const { rows: evaluations } = await pool.sql`SELECT * FROM evaluations;`;

      return res.status(200).json({
        employees,
        departments,
        evaluations,
      });
    } catch (error) {
      console.error("Error en GET:", error);
      return res.status(500).json({ error: "Error obteniendo datos del servidor" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;

      await pool.sql`BEGIN;`;
      
      // Limpiamos las tablas antes de la nueva carga (importante para mantener sincronía)
      await pool.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      // 1. Insertar Departamentos
      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await pool.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      // 2. Insertar Empleados (Asegurando Nombre, Puesto, Superior y Cargos)
      for (const emp of employees) {
        await pool.sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle || ''}, 
            ${emp.reportsTo || 'Sin superior'}, 
            ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : '[]'}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      // 3. Insertar Evaluaciones
      if (evaluations && Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await pool.sql`
            INSERT INTO evaluations (id, "employeeId", "evaluatorId", date, criteria, "finalScore", comments, analysis)
            VALUES (
              ${ev.id}, 
              ${ev.employeeId}, 
              ${ev.evaluatorId}, 
              ${ev.date}, 
              ${JSON.stringify(ev.criteria)}, 
              ${ev.finalScore || 0}, 
              ${ev.comments || ''},
              ${ev.analysis ? JSON.stringify(ev.analysis) : null}
            );
          `;
        }
      }

      await pool.sql`COMMIT;`;
      return res.status(200).json({ success: true });

    } catch (error) {
      await pool.sql`ROLLBACK;`;
      console.error("Error en POST:", error);
      return res.status(500).json({ error: "Error guardando la estructura completa" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
