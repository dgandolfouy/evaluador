import { Criterion, AnalysisResult, Employee } from "../types";

const cleanJson = (text: string) => {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIdx = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
    const endIdx = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) { return null; }
};

export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const prompt = `
    Actúa como Auditor de Calidad ISO 9001:2015 en la industria flexográfica (RR Etiquetas).
    Analiza a ${employee.name} (${employee.jobtitle || employee.jobTitle}).
    Puntajes: ${criteria.map(c => `${c.name}: ${c.score}/10`).join(', ')}.

    Responde ÚNICAMENTE en JSON con este formato:
    {
      "summary": "Resumen técnico formal",
      "strengths": ["Fortaleza 1", "Fortaleza 2"],
      "weaknesses": ["Mejora 1", "Mejora 2"],
      "trainingPlan": ["Capacitación 1", "Capacitación 2"],
      "isoComplianceLevel": "Bajo/Medio/Alto/Excelente"
    }
  `;

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = text ? cleanJson(text) : null;
    if (!result) throw new Error();
    return result;
  } catch (e) {
    return {
      summary: "Evaluación procesada. Análisis ISO 9001 pendiente de sincronización.",
      strengths: ["Cumplimiento de estándares de RR Etiquetas", "Registro de evidencias operativas"],
      weaknesses: ["Análisis detallado de IA en mantenimiento"],
      trainingPlan: ["Revisión periódica con el responsable de área"],
      isoComplianceLevel: "Evaluado"
    };
  }
};
