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
  } catch (e) {
    console.error("Error parseando JSON de IA:", e);
    return null;
  }
};

export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const prompt = `
    Actúa como Auditor Líder de Calidad ISO 9001:2015 experto en procesos de impresión flexográfica (RR Etiquetas).
    Analiza el desempeño de ${employee.name} (Cargo: ${employee.jobTitle}).
    
    Datos evaluados:
    ${criteria.map(c => `- ${c.name}: ${c.score}/10. Evidencia: ${c.feedback}`).join('\n')}

    Genera un informe técnico estructurado para exportar a PDF. 
    Responde ÚNICAMENTE con este formato JSON:
    {
      "summary": "Resumen ejecutivo profesional centrado en procesos certificados.",
      "strengths": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
      "weaknesses": ["Punto de mejora 1", "Punto de mejora 2"],
      "trainingPlan": ["Acción formativa específica para flexografía (ej: control de viscosidad, mermas, etc)"],
      "isoComplianceLevel": "Nivel (Bajo, Medio, Alto, Excelente)"
    }
  `;

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = text ? cleanJson(text) : null;

    if (!result) throw new Error("Formato inválido");
    return result;

  } catch (e) {
    return {
      summary: "Análisis técnico manual requerido (Servicio de IA temporalmente fuera de línea).",
      strengths: ["Competencia operativa en el puesto"],
      weaknesses: ["Documentación de evidencias"],
      trainingPlan: ["Revisión de procedimientos operativos estándar"],
      isoComplianceLevel: "Evaluado"
    };
  }
};
