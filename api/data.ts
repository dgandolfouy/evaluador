import { VercelRequest, VercelResponse } from '@vercel/node';
import { createPool } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = createPool();

  if (req.method === 'POST') {
    try {
      const { employees = [], departments = [], evaluations = [] } = req.body;
      await pool.sql`BEGIN;`;
      
      // Borramos todo para que la lista que tenés en tu App sea la ÚNICA que valga
      await pool.sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

      for (const dept of departments) {
        const name = typeof dept === 'object' ? dept.name : dept;
        if (name) await pool.sql`INSERT INTO departments (name) VALUES (${name});`;
      }

      for (const emp of employees) {
        await pool.sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle || ''}, ${emp.reportsTo || ''}, ${JSON.stringify(emp.additionalRoles || [])}, ${emp.averageScore || 0});
        `;
      }

      await pool.sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await pool.sql`ROLLBACK;`;
      console.error(error);
      return res.status(500).json({ error: "Error de sincronización profunda" });
    }
  }
  // ... resto del GET
}
