import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows: employees = [] } = await sql`SELECT * FROM employees;`;
      const { rows: departments = [] } = await sql`SELECT * FROM departments;`;
      const { rows: evaluations = [] } = await sql`SELECT * FROM evaluations;`;

      let settings = [];
      try {
        const { rows } = await sql`SELECT * FROM settings;`;
        settings = rows;
      } catch (e) {
        console.warn("Settings table not found");
      }

      return res.status(200).json({ employees, departments, evaluations, settings });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Error al leer BD", details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employees, departments, evaluations, settings } = req.body;

      if (evaluations) {
        // Borramos evaluaciones primero para evitar conflictos de llave foránea con employees
        await sql`DELETE FROM evaluations;`;
        for (const ev of evaluations) {
          await sql`
            INSERT INTO evaluations (id, employeeid, evaluatorid, date, criteria, finalscore, analysis)
            VALUES (
              ${ev.id}, 
              ${ev.employeeid || ev.employeeId}, 
              ${ev.evaluatorid || ev.evaluatorId}, 
              ${ev.date}, 
              ${typeof ev.criteria === 'string' ? ev.criteria : JSON.stringify(ev.criteria)}, 
              ${ev.finalscore || ev.finalScore}, 
              ${typeof ev.analysis === 'string' ? ev.analysis : JSON.stringify(ev.analysis || {})}
            );
          `;
        }
      }

      if (departments) {
        await sql`DELETE FROM departments;`;
        for (const dept of departments) {
          const dName = typeof dept === 'string' ? dept : dept.name;
          if (dName) await sql`INSERT INTO departments (name) VALUES (${dName});`;
        }
      }

      if (employees) {
        await sql`DELETE FROM employees;`;
        for (const emp of employees) {
          await sql`
            INSERT INTO employees (id, name, department, jobtitle, reportsto, additionalroles, averagescore)
            VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobtitle || emp.jobTitle || ''}, ${emp.reportsto || emp.reportsTo || ''}, ${JSON.stringify(emp.additionalroles || emp.additionalRoles || [])}, ${emp.averagescore || emp.averageScore || 0});
          `;
        }
      }

      if (settings) {
        try {
          await sql`DELETE FROM settings;`;
          for (const s of settings) {
            await sql`INSERT INTO settings (key, value) VALUES (${s.key}, ${typeof s.value === 'string' ? s.value : JSON.stringify(s.value)});`;
          }
        } catch (e) {
          console.error("No se pudo guardar settings", e);
        }
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Fallo al guardar", details: error.message });
    }
  }
}
