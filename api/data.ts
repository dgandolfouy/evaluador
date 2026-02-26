import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, VercelPoolClient } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        let client: VercelPoolClient | undefined;
        try {
            client = await db.connect();
            const employees = (await client.sql`SELECT * FROM employees`).rows;
            const evaluations = (await client.sql`SELECT * FROM evaluations`).rows;
            const criteria = (await client.sql`SELECT * FROM criteria`).rows;
            const departments = (await client.sql`SELECT DISTINCT department FROM employees WHERE department IS NOT NULL`).rows.map(r => r.department);

            for (const ev of evaluations) {
                const criteriaResult = await client.sql`SELECT * FROM evaluation_criteria WHERE evaluation_id = ${ev.id}`;
                ev.criteria = criteriaResult.rows;
            }

            return res.status(200).json({ employees, departments, criteria, evaluations });
        } catch (error: any) {
            if (error.message.includes('relation "employees" does not exist')) {
                return res.status(404).json({ error: 'DATABASE_NOT_CONFIGURED', message: 'La base de datos no está configurada. Contacta al administrador.' });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        } finally {
            client?.release();
        }
    }

    if (req.method === 'DELETE') {
      const { type, id, name } = req.query;
      let client: VercelPoolClient | undefined;
      try {
        client = await db.connect();
        if (type === 'employee' && typeof id === 'string') {
          await client.sql`BEGIN`;
          const evaluationsResult = await client.sql`SELECT id FROM evaluations WHERE employee_id = ${id}`;
          const evaluationIds = evaluationsResult.rows.map(r => r.id);
          if (evaluationIds.length > 0) {
            for (const evaluationId of evaluationIds) {
              await client.sql`DELETE FROM evaluation_criteria WHERE evaluation_id = ${evaluationId}`;
            }
          }
          await client.sql`DELETE FROM evaluations WHERE employee_id = ${id}`;
          await client.sql`UPDATE employees SET reports_to = NULL WHERE reports_to = ${id}`;
          await client.sql`DELETE FROM employees WHERE id = ${id}`;
          await client.sql`COMMIT`;
          return res.status(200).json({ message: 'Employee deleted' });
        } else if (type === 'department' && typeof name === 'string') {
          await client.sql`BEGIN`;
          await client.sql`UPDATE employees SET department = NULL WHERE department = ${name}`;
          await client.sql`COMMIT`;
          return res.status(200).json({ message: 'Department updated' });
        }
        return res.status(400).json({ error: 'Invalid delete request' });
      } catch (error) {
        if (client) await client.sql`ROLLBACK`;
        return res.status(500).json({ error: 'Server error' });
      } finally {
        client?.release();
      }
    }

    if (req.method === 'POST') {
      const { type } = req.query;
      const body = req.body;
      let client: VercelPoolClient | undefined;

      interface Employee {
        id: string;
        name: string;
        department: string;
        jobTitle: string;
        reportsTo?: string;
        additionalRoles?: string[];
        averageScore?: number;
      }

      try {
        client = await db.connect();
        await client.sql`BEGIN`;

        if (type === 'employee' && body) {
          const emp: Employee = body;
          await client.sql`
            INSERT INTO employees (id, name, department, job_title, reports_to, additional_roles, average_score)
            VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle}, ${emp.reportsTo || null}, ${JSON.stringify(emp.additionalRoles || [])}, ${emp.averageScore || 0})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              department = EXCLUDED.department,
              job_title = EXCLUDED.job_title,
              reports_to = EXCLUDED.reports_to,
              additional_roles = EXCLUDED.additional_roles,
              average_score = EXCLUDED.average_score;
          `;
        } else if (type === 'department_edit' && body) {
          const { oldName, newName } = body;
          if (!oldName || !newName) throw new Error('oldName and newName are required for department_edit');
          await client.sql`UPDATE employees SET department = ${newName} WHERE department = ${oldName}`;
        } else {
          return res.status(400).json({ error: `Invalid or missing POST type. Received: ${type}` });
        }

        await client.sql`COMMIT`;
        return res.status(200).json({ message: 'Update successful' });

      } catch (error) {
        if (client) await client.sql`ROLLBACK`;
        console.error('API POST Error:', error);
        return res.status(500).json({ error: 'Server error while saving data' });
      } finally {
        client?.release();
      }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
}
