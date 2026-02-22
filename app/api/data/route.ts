import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  try {
    const employees = await sql`SELECT * FROM employees;`;
    const departments = await sql`SELECT * FROM departments;`;
    const evaluations = await sql`SELECT * FROM evaluations;`;
    return NextResponse.json({ employees: employees.rows, departments: departments.rows, evaluations: evaluations.rows });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employees, departments, evaluations } = await request.json();

    // Clear tables
    await sql`TRUNCATE TABLE evaluations, employees, departments RESTART IDENTITY;`;

    // Insert new data
    for (const dept of departments) {
      await sql`INSERT INTO departments (name) VALUES (${dept});`;
    }
    for (const emp of employees) {
      await sql`INSERT INTO employees (id, name, department, jobTitle, reportsTo, additionalRoles, averageScore) VALUES (${emp.id}, ${emp.name}, ${emp.department}, ${emp.jobTitle}, ${emp.reportsTo}, ${emp.additionalRoles ? JSON.stringify(emp.additionalRoles) : null}, ${emp.averageScore});`;
    }
    for (const ev of evaluations) {
      await sql`INSERT INTO evaluations (id, employeeId, evaluatorId, date, responses, finalScore, comments) VALUES (${ev.id}, ${ev.employeeId}, ${ev.evaluatorId}, ${ev.date}, ${ev.responses ? JSON.stringify(ev.responses) : null}, ${ev.finalScore}, ${ev.comments});`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
