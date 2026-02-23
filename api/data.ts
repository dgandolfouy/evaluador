// En el bloque POST de api/data.ts
if (evaluations && Array.isArray(evaluations)) {
  for (const ev of evaluations) {
    await sql`
      INSERT INTO evaluations (id, "employeeId", "evaluatorId", date, criteria, "finalScore", comments)
      VALUES (
        ${ev.id}, 
        ${ev.employeeId}, 
        ${ev.evaluatorId}, 
        ${ev.date}, 
        ${JSON.stringify(ev.criteria || {})}, 
        ${ev.finalScore || 0}, 
        ${ev.comments || ''}
      );
    `;
  }
}
