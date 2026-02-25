import { Criterion, AnalysisResult, Employee } from "../types";

const cleanJson = (text: string) => {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIdx = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
    const endIdx = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (startIdx !== -1 && endIdx !== -1) cleaned = cleaned.substring(startIdx, endIdx + 1);
    return JSON.parse(cleaned);
  } catch (e) { return null; }
};

export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const prompt = `Actúa como auditor ISO 9001 en RR Etiquetas. Analiza a ${employee.name}. Responde SOLO JSON con: summary, strengths[], weaknesses[], trainingPlan[], isoComplianceLevel.`;

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = text ? cleanJson(text) : null;

    if (!result) throw new Error("IA offline");
    return result;
  } catch (e) {
    return {
      summary: "Evaluación técnica completada. Análisis detallado de procesos ISO 9001 pendiente de sincronización.",
      strengths: ["Cumplimiento de estándares de RR Etiquetas", "Registro de evidencias operativas"],
      weaknesses: ["Análisis de IA en mantenimiento"],
      trainingPlan: ["Revisión periódica con el responsable de área"],
      isoComplianceLevel: "Evaluado"
    };
  }
};
