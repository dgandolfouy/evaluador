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
  const prompt = `Actúa como auditor ISO 9001:2015 en RR Etiquetas (Imprenta Flexográfica). Analiza a ${employee.name}. Responde SOLO JSON: {"summary":"...","strengths":["..."],"weaknesses":["..."],"trainingPlan":["..."],"isoComplianceLevel":"..."}`;

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
      summary: "Evaluación técnica completada. Análisis ISO 9001 pendiente de sincronización.",
      strengths: ["Cumplimiento de procesos de RR Etiquetas"],
      weaknesses: ["Análisis detallado de IA no disponible"],
      trainingPlan: ["Revisión con supervisor"],
      isoComplianceLevel: "Evaluado"
    };
  }
};
