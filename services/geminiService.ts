import { Criterion, AnalysisResult, Employee } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Genera criterios de evaluación específicos para el empleado via fetch nativo
 */
export const generateIsoCriteria = async (employee: Employee): Promise<Criterion[]> => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurada");

  const allRoles = [
    { jobTitle: employee.jobTitle, department: employee.department },
    ...(employee.additionalRoles || [])
  ];
  const rolesStr = allRoles.map(r => `"${r.jobTitle}" en "${r.department}"`).join(', ');

  const prompt = `
    Genera 5 criterios de evaluación de desempeño específicos para: ${rolesStr}.
    Empresa: RR Etiquetas (Impresión de etiquetas).
    Relacionados con ISO 9001.
    Devuelve estrictamente un JSON (array de objetos) con: id, name, description, category.
    Categorías: "Competencias Técnicas", "Calidad", "Desempeño", "Competencias Blandas", "Actitud".
  `;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    const rawCriteria = JSON.parse(textContent);

    return rawCriteria.map((c: any) => ({ ...c, score: 5, feedback: '' }));
  } catch (error) {
    console.error("AI Criteria Error:", error);
    return [
      { id: '1', name: 'Productividad', description: 'Eficiencia operativa.', score: 5, category: 'Desempeño' },
      { id: '2', name: 'Calidad ISO', description: 'Cumplimiento de estándares Calidad.', score: 5, category: 'Calidad' },
      { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden.', score: 5, category: 'Calidad' },
      { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración.', score: 5, category: 'Competencias Blandas' },
      { id: '5', name: 'Mantenimiento de Puesto', description: 'Limpieza y 5S.', score: 5, category: 'Actitud' },
    ];
  }
};

/**
 * Analiza una evaluación completa para generar fortalezas, debilidades y plan.
 */
export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurada");

  const rolesStr = [
    { jobTitle: employee.jobTitle, department: employee.department },
    ...(employee.additionalRoles || [])
  ].map(r => `${r.jobTitle} (${r.department})`).join(', ');

  const prompt = `
    Como Auditor ISO 9001 de RR Etiquetas, analiza:
    Empleado: ${employee.name}, Funciones: ${rolesStr}.
    
    Evaluación:
    ${criteria.map(c => `- ${c.name}: ${c.score}/10. Evidencia: ${c.feedback || 'N/A'}`).join('\n')}

    Genera un JSON con:
    "summary": (Resumen ejecutivo)
    "strengths": (Array de fortalezas)
    "weaknesses": (Array de áreas de mejora)
    "trainingPlan": (Array con 3 acciones formativas)
    "isoComplianceLevel": ("Bajo", "Medio", "Alto", "Excelente")
  `;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    return JSON.parse(textContent);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Error en análisis automático.",
      strengths: [],
      weaknesses: [],
      trainingPlan: ["Revisión manual necesaria."],
      isoComplianceLevel: "Pendiente"
    };
  }
};
