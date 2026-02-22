import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Conexión a la base de datos de Vercel
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
      console.error("Error en GET:", error);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations } = req.body;

      // Iniciamos una transacción para asegurar que no se borre nada si algo falla
      await client.sql`BEGIN;`;
      
      // Limpiamos con CASCADE por si hay dependencias de llaves foráneas
      await client.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      // Insertar Departamentos
      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        await client.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      // Insertar Empleados
      for (const emp of employees) {
        await client.sql`
          INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore)
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle}, 
            ${emp.reportsTo}, 
            ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, 
            ${emp.averageScore || 0}
          );
        `;
      }

      // Insertar Evaluaciones (si existen en el cuerpo del mensaje)
      if (evaluations && Array.isArray(evaluations)) {
        for (const ev of evaluations) {
          await client.sql`
            INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments)
            VALUES (
              ${ev.id}, 
              ${ev.employeeId}, 
              ${ev.evaluatorId}, 
              ${ev.date}, 
              ${JSON.stringify(ev.responses)}, 
              ${ev.finalScore}, 
              ${ev.comments}
            );
          `;
        }
      }

      await client.sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await client.sql`ROLLBACK;`;
      console.error("Error en POST:", error);
      return res.status(500).json({ error: "Error al guardar los datos" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
