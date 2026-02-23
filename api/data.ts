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
        // FLEXIBILIDAD: Mapeamos los cargos adicionales para que no se pierdan
        const rolesMapeados = (emp.additionalRoles || []).map((r: any) => ({
          jobTitle: r.jobTitle || r.role || r.name || 'Cargo extra',
          reportsTo: r.reportsTo || r.superior || 'Sin asignar',
          department: r.department || r.area || emp.department
        }));

        await sql`
          INSERT INTO employees (id, name, department, "jobTitle", "reportsTo", "additionalRoles", "averageScore")
          VALUES (
            ${emp.id}, 
            ${emp.name}, 
            ${emp.department}, 
            ${emp.jobTitle || ''}, 
            ${emp.reportsTo || ''}, 
            ${JSON.stringify(rolesMapeados)}, 
            ${emp.averageScore || 0}
          );
        `;
      }
      await sql`COMMIT;`;
      return res.status(200).json({ success: true });
    } catch (error) {
      await sql`ROLLBACK;`;
      console.error("Error al guardar:", error);
      return res.status(500).json({ error: "Error de guardado" });
    }
  }
