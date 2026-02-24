import { Criterion, AnalysisResult, Employee } from "../types";

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
  return data.candidates[0].content.parts[0].text;
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
    const textContent = await callAiBridge(prompt, 'criteria');
    const rawCriteria = cleanJson(textContent);

    return rawCriteria.map((c: any) => ({ ...c, score: 5, feedback: '' }));
  } catch (error: any) {
    console.error("AI Criteria Error:", error.message);
    // Fallback profesional en caso de fallo del puente
    return [
      { id: 'f1', name: 'Eficiencia Operativa', description: 'Capacidad para cumplir con los tiempos de producción y minimizar desperdicios de material en RR Etiquetas.', score: 5, feedback: '', category: 'Desempeño' },
      { id: 'f2', name: 'Cumplimiento de Estándares ISO', description: 'Apego a los procesos documentados y registros de calidad del sistema de gestión comercial y operativo.', score: 5, feedback: '', category: 'Calidad' },
      { id: 'f3', name: 'Conciencia de Riesgos', description: 'Prevención de errores en la línea de producción y reporte proactivo de no conformidades.', score: 5, feedback: '', category: 'Calidad' },
      { id: 'f4', name: 'Comunicación Técnica', description: 'Habilidad para transmitir incidencias de maquinaria y colaborar eficientemente con otras áreas.', score: 5, feedback: '', category: 'Competencias Blandas' },
      { id: 'f5', name: 'Mantenimiento y Orden (5S)', description: 'Estado técnico del puesto de trabajo y cuidado preventivo de las herramientas/maquinaria.', score: 5, feedback: '', category: 'Actitud' },
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
    Actúa como Auditor Líder ISO 9001 de RR Etiquetas (Fábrica de Etiquetas). 
    Tu misión es realizar un análisis profesional de competencia para el colaborador ${employee.name}, quien desempeña las funciones de: ${rolesStr}.

    DATOS DE LA EVALUACIÓN:
    ${criteria.map(c => `[CRITERIO: ${c.name}] Puntaje: ${c.score}/10. Categoría: ${c.category}. Observaciones: "${c.feedback || 'Sin observaciones detalladas'}".`).join('\n')}

    TU ANÁLISIS DEBE SER TÉCNICO Y RIGUROSO:
    - Contexto Industrial: RR Etiquetas utiliza maquinaria de impresión, tintas y materiales complejos. El análisis debe reflejar procesos de manufactura reales.
    - Norma ISO 9001:7.2 (Competencia): Identifica brechas que afecten directamente la calidad o los costos (mermas, tiempos).
    - Valor Agregado: Evita frases genéricas como "buen trabajo". Si el puntaje es alto, explica por qué beneficia al sistema de calidad. Si es bajo, sugiere una capacitación técnica específica.

    DEVUELVE ESTRICTAMENTE UN JSON CON ESTA ESTRUCTURA:
    {
      "summary": "Resumen ejecutivo de auditoría resaltando el impacto del colaborador en los objetivos de calidad de RR Etiquetas. Máximo 3 frases.",
      "strengths": ["Mínimo 3 fortalezas técnicas basadas en los puntajes y el desempeño observado."],
      "weaknesses": ["Mínimo 2 áreas de mejora que representen un riesgo para el producto final o el proceso."],
      "trainingPlan": ["3 acciones de capacitación específicas (ej: 'Entrenamiento en calibración de rodillos', 'Taller de gestión de residuos ISO', etc.)"],
      "isoComplianceLevel": "Bajo | Medio | Alto | Excelente (Basado en el promedio ponderado de Calidad y Desempeño)"
    }
  `;

  try {
    const textContent = await callAiBridge(prompt, 'analysis');
    return cleanJson(textContent);
  } catch (error: any) {
    console.error("AI Analysis Backend Error:", error.message);
    throw new Error(`La IA no pudo procesar el análisis: ${error.message}`);
  }
};
