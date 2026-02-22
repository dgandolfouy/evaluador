import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const employees = await sql`SELECT * FROM employees;`;
    const departments = await sql`SELECT * FROM departments;`;
    const evaluations = await sql`SELECT * FROM evaluations;`;

    return NextResponse.json({
      employees: employees.rows,
      departments: departments.rows,
      evaluations: evaluations.rows,
    });
  } catch (error) {
    console.error("Error en GET:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employees, departments, evaluations } = await request.json();

    // Limpiar tablas (Ojo con el orden por las foreign keys)
    await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY CASCADE;`;

    // 1. Insertar departamentos
    for (const dept of departments) {
      // Verificamos si dept es un objeto {name: '...'} o un string directo
      const name = typeof dept === 'object' ? dept.name : dept;
      await sql`INSERT INTO departments (name) VALUES (${name});`;
    }

    // 2. Insertar empleados
    for (const emp of employees) {
      await sql`
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

    // 3. Insertar evaluaciones (si existen)
    if (evaluations && evaluations.length > 0) {
      for (const ev of evaluations) {
        await sql`
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en POST:", error);
    return NextResponse.json({ error: "Error al guardar datos" }, { status: 500 });
  }
}
