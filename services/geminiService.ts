export const analyzeEvaluation = async (employee: any, criteria: any) => {
  const prompt = `Actúa como auditor ISO 9001 en RR Etiquetas. Analiza a ${employee.name}. Responde SOLO JSON con: summary, strengths[], weaknesses[], trainingPlan[], isoComplianceLevel.`;
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text.replace(/```json/g, "").replace(/```/g, "")) : null;
  } catch (e) {
    return {
      summary: "Evaluación técnica completada. Análisis ISO 9001 pendiente de sincronización.",
      strengths: ["Cumplimiento de estándares de RR Etiquetas"],
      weaknesses: ["Análisis de IA en mantenimiento"],
      trainingPlan: ["Revisión con supervisor"],
      isoComplianceLevel: "Evaluado"
    };
  }
};
