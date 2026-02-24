import { Criterion, AnalysisResult, Employee } from "../types";

/**
 * Extractor de JSON ultra-robusto para entornos inestables.
 */
const cleanJson = (text: string) => {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIdx = cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf('}') !== -1 ? cleaned.lastIndexOf('}') : cleaned.lastIndexOf(']');

    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Parse Error:", e, "Text:", text);
    throw new Error("Formato de respuesta inválido.");
  }
};

const callAiBridge = async (prompt: string, type: 'criteria' | 'analysis'): Promise<any> => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.details || errData.error || "Error de servidor");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("IA sin respuesta");
  return text;
};

export const generateIsoCriteria = async (employee: Employee): Promise<Criterion[]> => {
  const roles = [employee.jobtitle || employee.jobTitle, ...(employee.additionalroles || []).map((r: any) => r.jobtitle)].join(', ');
  const prompt = `Genera 5 criterios técnicos ISO 9001 para: ${roles} en RR Etiquetas. Devuelve SOLO JSON: [{"id":"1","name":"...","description":"...","category":"..."}]`;

  try {
    const text = await callAiBridge(prompt, 'criteria');
    return cleanJson(text).map((c: any) => ({ ...c, score: 5, feedback: '' }));
  } catch (e) {
    return [
      { id: 'f1', name: 'Calidad ISO', description: 'Cumplimiento de estándares en RR Etiquetas.', score: 5, feedback: '', category: 'Calidad' },
      { id: 'f2', name: 'Productividad', description: 'Eficiencia en tiempos y mermas.', score: 5, feedback: '', category: 'Desempeño' },
      { id: 'f3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden.', score: 5, feedback: '', category: 'Actitud' },
      { id: 'f4', name: 'Trabajo en Equipo', description: 'Colaboración efectiva.', score: 5, feedback: '', category: 'Competencias Blandas' },
      { id: 'f5', name: 'Mantenimiento', description: 'Cuidado de maquinaria.', score: 5, feedback: '', category: 'Actitud' }
    ];
  }
};

export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const prompt = `Analiza competencia ISO 9001 para ${employee.name}. Datos: ${criteria.map(c => `${c.name}:${c.score}`).join(', ')}. 
  Devuelve SOLO JSON: {"summary":"...","strengths":["..."],"weaknesses":["..."],"trainingPlan":["..."],"isoComplianceLevel":"..."}`;

  try {
    const text = await callAiBridge(prompt, 'analysis');
    return cleanJson(text);
  } catch (e: any) {
    console.error("Analysis failed, using backup:", e.message);
    return {
      summary: "Análisis generado por sistema (IA no disponible). Se observa un desempeño general basado en las puntuaciones registradas.",
      strengths: ["Puntajes registrados en el sistema.", "Cumplimiento de evaluación periódica."],
      weaknesses: ["Análisis detallado de IA no disponible en este momento."],
      trainingPlan: ["Revisión del desempeño con el supervisor directo."],
      isoComplianceLevel: "Pendiente de Auditoría"
    };
  }
};
