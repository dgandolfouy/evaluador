import { Criterion, AnalysisResult, Employee } from "../types";

/**
 * Extrae y limpia el JSON de una respuesta de texto, incluso si tiene basura alrededor.
 */
const cleanJson = (text: string) => {
  try {
    // 1. Intento rápido: Limpiar bloques markdown
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Intento profundo: Buscar el primer '{' o '[' y el último '}' o ']'
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = (lastBrace !== -1 && lastBrace > lastBracket) ? lastBrace : lastBracket;

    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Critical JSON Parse Error:", e, "Original Text:", text);
    throw new Error("No se pudo procesar el formato de respuesta de la IA.");
  }
};

/**
 * Llama al puente de IA en el backend para procesar el prompt de forma segura.
 */
const callAiBridge = async (prompt: string, type: 'criteria' | 'analysis'): Promise<any> => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.details || errData.error || `Fallo en el servidor de IA (Status: ${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("La IA devolvió una respuesta vacía.");
  return text;
};

/**
 * Genera criterios de evaluación específicos para el empleado via el puente de IA.
 */
export const generateIsoCriteria = async (employee: Employee): Promise<Criterion[]> => {
  const allRoles = [
    { jobtitle: employee.jobtitle || employee.jobTitle, department: employee.department },
    ...(employee.additionalroles || employee.additionalRoles || [])
  ];
  const rolesStr = allRoles.map(r => `"${r.jobtitle || r.jobTitle}" en el área de "${r.department}"`).join(', ');

  const prompt = `
    Actúa como un Consultor Senior de Calidad experto en la norma ISO 9001:2015 para la industria gráfica y de impresión de etiquetas (RR Etiquetas).
    Objetivo: Genera 5 criterios de evaluación críticos y técnicos para: ${rolesStr}.

    REQUISITOS:
    - Específicos para el rol (ej. mermas, tiempos de set-up, calidad de impresión).
    - Alineados con los riesgos de ISO 9001.
    - Medibles y técnicos.

    DEVUELVE ÚNICAMENTE EL SIGUIENTE FORMATO JSON (Sin texto adicional):
    [
      {
        "id": "string",
        "name": "Nombre corto",
        "description": "Explicación técnica para RR Etiquetas",
        "category": "Competencias Técnicas | Calidad | Desempeño | Competencias Blandas | Actitud"
      }
    ]
  `;

  try {
    const textContent = await callAiBridge(prompt, 'criteria');
    const rawCriteria = cleanJson(textContent);
    return rawCriteria.map((c: any) => ({ ...c, score: 5, feedback: '' }));
  } catch (error: any) {
    console.warn("AI Criteria Fallback:", error.message);
    return [
      { id: 'f1', name: 'Eficiencia Operativa', description: 'Capacidad para cumplir con los tiempos de producción y minimizar desperdicios en RR Etiquetas.', score: 5, feedback: '', category: 'Desempeño' },
      { id: 'f2', name: 'Cumplimiento ISO', description: 'Apego a los procesos documentados y registros de calidad del sistema.', score: 5, feedback: '', category: 'Calidad' },
      { id: 'f3', name: 'Conciencia de Riesgo', description: 'Prevención de errores en línea y reporte de no conformidades.', score: 5, feedback: '', category: 'Calidad' },
      { id: 'f4', name: 'Comunicación Técnica', description: 'Transmisión de incidencias de maquinaria y colaboración entre áreas.', score: 5, feedback: '', category: 'Competencias Blandas' },
      { id: 'f5', name: 'Orden y Limpieza', description: 'Estado técnico del puesto y cuidado preventivo de herramientas.', score: 5, feedback: '', category: 'Actitud' },
    ];
  }
};

/**
 * Analiza una evaluación completa para generar un informe de auditoría de competencia.
 */
export const analyzeEvaluation = async (employee: Employee, criteria: Criterion[]): Promise<AnalysisResult> => {
  const rolesStr = [
    { jobtitle: employee.jobtitle || employee.jobTitle, department: employee.department },
    ...(employee.additionalroles || employee.additionalRoles || [])
  ].map(r => `${r.jobtitle || r.jobTitle} (${r.department})`).join(', ');

  const prompt = `
    Actúa como Auditor Líder ISO 9001 de RR Etiquetas. Realiza un análisis de competencia técnica para ${employee.name} (${rolesStr}).

    DATOS:
    ${criteria.map(c => `- ${c.name}: ${c.score}/10. [${c.feedback || 'Sin obs'}]`).join('\n')}

    INSTRUCCIONES:
    - Contexto de impresión de etiquetas (maquinaria, tintas, calidad ISO).
    - Basado en ISO 9001:7.2.
    - Acciones de capacitación realistas para una fábrica.

    DEVUELVE ÚNICAMENTE EL SIGUIENTE FORMATO JSON (Sin texto adicional antes ni después):
    {
      "summary": "Resumen ejecutivo profesional (máx 3 frases).",
      "strengths": ["Mínimo 3 fortalezas técnicas."],
      "weaknesses": ["Mínimo 2 riesgos o áreas de mejora."],
      "trainingPlan": ["3 acciones de capacitación específicas"],
      "isoComplianceLevel": "Bajo | Medio | Alto | Excelente"
    }
  `;

  try {
    const textContent = await callAiBridge(prompt, 'analysis');
    return cleanJson(textContent);
  } catch (error: any) {
    console.error("AI Analysis Final Error:", error.message);
    throw new Error(`La IA no pudo procesar el análisis: ${error.message}`);
  }
};
