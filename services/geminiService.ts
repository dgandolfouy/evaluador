import { Criterion, AnalysisResult, Employee } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const cleanJson = (text: string) => {
  try {
    // Elimina bloques de código markdown si existen
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Clean Error:", e, "Text:", text);
    throw e;
  }
};

/**
 * Genera criterios de evaluación específicos para el empleado via fetch nativo
 * Enfocado en la industria de impresión de etiquetas y normas ISO.
 */
export const generateIsoCriteria = async (employee: Employee): Promise<Criterion[]> => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurada");

  const allRoles = [
    { jobtitle: employee.jobtitle || employee.jobTitle, department: employee.department },
    ...(employee.additionalroles || employee.additionalRoles || [])
  ];
  const rolesStr = allRoles.map(r => `"${r.jobtitle || r.jobTitle}" en el área de "${r.department}"`).join(', ');

  const prompt = `
    Actúa como un Consultor Senior de Calidad experto en la norma ISO 9001:2015 para la industria gráfica y de impresión de etiquetas (RR Etiquetas).
    Tu objetivo es generar 5 criterios de evaluación críticos y técnicos para un colaborador con las siguientes funciones: ${rolesStr}.

    REQUISITOS DE LOS CRITERIOS:
    1. Deben ser específicos para el rol (ej. si es producción, enfócate en mermas, tiempos de set-up o calidad de impresión).
    2. Deben estar alineados con el pensamiento basado en riesgos de ISO 9001.
    3. Deben ser medibles y objetivos.

    FORMATO DE SALIDA (Estrictamente JSON - Array de objetos):
    [
      {
        "id": "string único",
        "name": "Nombre corto y profesional del criterio",
        "description": "Explicación técnica de qué se evalúa y por qué es importante para RR Etiquetas",
        "category": "Una de: Competencias Técnicas, Calidad, Desempeño, Competencias Blandas, Actitud"
      }
    ]
  `;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2 // Baja temperatura para mayor consistencia técnica
        }
      })
    });

    const data = await response.json();
    if (!data.candidates?.[0]) throw new Error("Sin respuesta de Gemini");

    const textContent = data.candidates[0].content.parts[0].text;
    const rawCriteria = cleanJson(textContent);

    return rawCriteria.map((c: any) => ({ ...c, score: 5, feedback: '' }));
  } catch (error) {
    console.error("AI Criteria Error:", error);
    // Fallback genérico pero profesional
    return [
      { id: '1', name: 'Eficiencia Operativa', description: 'Capacidad para cumplir con los tiempos de producción y minimizar desperdicios de material.', score: 5, feedback: '', category: 'Desempeño' },
      { id: '2', name: 'Cumplimiento de Estándares ISO', description: 'Apego a los procesos documentados y registros de calidad del sistema de gestión.', score: 5, feedback: '', category: 'Calidad' },
      { id: '3', name: 'Conciencia de Riesgos', description: 'Prevención de errores en la línea de producción y reporte de no conformidades.', score: 5, feedback: '', category: 'Calidad' },
      { id: '4', name: 'Comunicación Técnica', description: 'Habilidad para transmitir incidencias y colaborar eficientemente con otras áreas.', score: 5, feedback: '', category: 'Competencias Blandas' },
      { id: '5', name: 'Mantenimiento y Orden (5S)', description: 'Estado del puesto de trabajo y cuidado de las herramientas/maquinaria.', score: 5, feedback: '', category: 'Actitud' },
    ];
  }
};

/**
 * Analiza una evaluación completa para generar fortalezas, debilidades y plan.
 * Enfocado en dar valor real al negocio (RR Etiquetas).
 */
export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurada");

  const rolesStr = [
    { jobtitle: employee.jobtitle || employee.jobTitle, department: employee.department },
    ...(employee.additionalroles || employee.additionalRoles || [])
  ].map(r => `${r.jobtitle || r.jobTitle} (${r.department})`).join(', ');

  const prompt = `
    Actúa como Auditor Líder ISO 9001 de RR Etiquetas (Fábrica de Etiquetas). 
    Tu misión es realizar un análisis profesional y de alto valor para el colaborador ${employee.name}, quien desempeña las funciones de: ${rolesStr}.

    DATOS DE LA EVALUACIÓN:
    ${criteria.map(c => `[CRITERIO: ${c.name}] Puntaje: ${c.score}/10. Categoría: ${c.category}. Observaciones: "${c.feedback || 'Sin observaciones detalladas'}".`).join('\n')}

    TU ANÁLISIS DEBE TENER EN CUENTA:
    - Contexto Industrial: RR Etiquetas utiliza maquinaria de impresión y materiales específicos. El análisis debe oler a fábrica y procesos de manufactura.
    - Norma ISO 9001:7.2 (Competencia): Identifica brechas reales que afecten la calidad del producto final.
    - Valor Agregado: No uses frases genéricas. Sé específico. Si tiene un score bajo en Calidad, sugiere una acción técnica concreta.

    DEVUELVE ESTRICTAMENTE UN JSON CON ESTA ESTRUCTURA:
    {
      "summary": "Resumen ejecutivo profesional resaltando el impacto del colaborador en la cadena de valor de RR Etiquetas. Máximo 3 frases.",
      "strengths": ["Mínimo 3 fortalezas específicas basadas en los puntajes más altos y feedback."],
      "weaknesses": ["Mínimo 2 áreas de mejora críticas que representan un riesgo para el sistema de calidad."],
      "trainingPlan": ["3 acciones de formación concretas (ej: 'Taller de ajuste de tintas', 'Capacitación en control de variables ISO', etc.)"],
      "isoComplianceLevel": "Bajo | Medio | Alto | Excelente (Basado en el promedio y cumplimiento de criterios de Calidad)"
    }
  `;

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4 // Un poco de creatividad para el análisis cualitativo
        }
      })
    });

    const data = await response.json();
    if (!data.candidates?.[0]) throw new Error("Sin respuesta de Gemini");

    const textContent = data.candidates[0].content.parts[0].text;
    return cleanJson(textContent);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Evaluación procesada. Se requiere revisión manual de los criterios debido a un fallo en el motor de análisis.",
      strengths: ["Puntajes registrados en el sistema."],
      weaknesses: ["Análisis automático no disponible en este momento."],
      trainingPlan: ["Revisión del desempeño con el supervisor directo."],
      isoComplianceLevel: "Pendiente de Auditoría"
    };
  }
};
