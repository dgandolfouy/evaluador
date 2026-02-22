import { GoogleGenAI, Type } from "@google/genai";
import { Criterion, AnalysisResult, Employee } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateIsoCriteria = async (employee: Employee): Promise<Criterion[]> => {
  const ai = getAI();
  const allRoles = [
    { jobTitle: employee.jobTitle, department: employee.department },
    ...(employee.additionalRoles || [])
  ];
  const rolesStr = allRoles.map(r => `"${r.jobTitle}" en el departamento de "${r.department}"`).join(', ');

  try {
    const prompt = `
      Genera 5 criterios de evaluación de desempeño específicos para un colaborador que desempeña las siguientes funciones: ${rolesStr} para una empresa de impresión de etiquetas (RR Etiquetas).
      Los criterios deben ser relevantes para la norma ISO 9001 (competencia, toma de conciencia, calidad).
      
      Devuelve un JSON con los criterios. Para cada criterio, incluye una propiedad "category" que sea una de: "Competencias Técnicas", "Calidad", "Desempeño", "Competencias Blandas", "Actitud".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Nombre corto del criterio (ej. Competencia Técnica)" },
              description: { type: Type.STRING, description: "Breve descripción de qué se evalúa" },
              category: { type: Type.STRING, description: "Categoría del criterio" },
            },
            required: ["id", "name", "description", "category"],
          },
        },
      },
    });

    const rawCriteria = JSON.parse(response.text || "[]");
    
    // Add default score of 5 to each
    return rawCriteria.map((c: any) => ({ ...c, score: 5, feedback: '' }));

  } catch (error) {
    console.error("Error generating criteria:", error);
    // Fallback criteria if AI fails
    return [
      { id: '1', name: 'Calidad del Trabajo', description: 'Precisión y cumplimiento de estándares ISO.', score: 5, category: 'Calidad' },
      { id: '2', name: 'Competencia Técnica', description: 'Conocimiento de maquinaria y procesos.', score: 5, category: 'Competencias Técnicas' },
      { id: '3', name: 'Seguridad e Higiene', description: 'Adherencia a normas de seguridad.', score: 5, category: 'Calidad' },
      { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración con pares y supervisores.', score: 5, category: 'Competencias Blandas' },
      { id: '5', name: 'Resolución de Problemas', description: 'Capacidad para identificar y reportar no conformidades.', score: 5, category: 'Desempeño' },
    ];
  }
};

export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const ai = getAI();
  const allRoles = [
    { jobTitle: employee.jobTitle, department: employee.department },
    ...(employee.additionalRoles || [])
  ];
  const rolesStr = allRoles.map(r => `${r.jobTitle} (${r.department})`).join(', ');

  try {
    const prompt = `
      Actúa como un Auditor Experto en Calidad e ISO 9001 para RR Etiquetas.
      Analiza la siguiente evaluación de desempeño:
      Empleado: ${employee.name}, Funciones: ${rolesStr}.
      
      Detalle de la evaluación:
      ${criteria.map(c => `- Criterio: ${c.name}
        Puntaje: ${c.score}/10
        Evidencia/Observaciones: ${c.feedback || 'Sin observaciones'}`).join('\n')}

      Genera un reporte constructivo basado en los puntajes y las observaciones ingresadas.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumen ejecutivo del desempeño." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de fortalezas detectadas." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Áreas de oportunidad." },
            trainingPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 acciones formativas recomendadas para cerrar brechas de competencia (ISO 9001:7.2)." },
            isoComplianceLevel: { type: Type.STRING, description: "Nivel estimado de cumplimiento (Bajo, Medio, Alto, Excelente)." },
          },
          required: ["summary", "strengths", "weaknesses", "trainingPlan", "isoComplianceLevel"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing evaluation:", error);
    return {
      summary: "No se pudo generar el análisis automático.",
      strengths: [],
      weaknesses: [],
      trainingPlan: ["Revisión manual requerida."],
      isoComplianceLevel: "Pendiente"
    };
  }
};