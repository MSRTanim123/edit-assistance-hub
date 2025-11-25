import { pipeline } from '@huggingface/transformers';
import diseases from '@/data/diseases.json';

let embeddingPipeline: any = null;
let diseaseEmbeddings: Map<string, number[]> = new Map();

// Initialize the model - this will download and cache it
export async function initializeModel() {
  if (embeddingPipeline) return;
  
  console.log("Loading AI model...");
  
  // Use a lightweight sentence-transformer model optimized for browser
  embeddingPipeline = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    { device: 'wasm' } // Use WASM for better compatibility, can use 'webgpu' for better performance
  );
  
  console.log("Model loaded successfully");
  
  // Pre-compute disease embeddings
  console.log("Computing disease embeddings...");
  for (const disease of diseases) {
    const embedding = await getEmbedding(disease.symptom_text);
    diseaseEmbeddings.set(disease.id, embedding);
  }
  console.log("Disease embeddings computed");
}

// Get embedding for text
async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    throw new Error("Model not initialized");
  }
  
  const output = await embeddingPipeline(text, { 
    pooling: 'mean', 
    normalize: true 
  });
  
  return Array.from(output.data);
}

// Compute cosine similarity between two embeddings
function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export interface DiagnosisResult {
  id: string;
  name: string;
  confidence: number;
  redFlags: string[];
  triage: string;
  medications: string[];
  contraindications: string[];
}

export interface RedFlagAlert {
  condition: string;
  severity: 'critical' | 'high' | 'moderate';
  action: string;
}

// Main diagnosis function
export async function performDiagnosis(
  symptoms: string,
  vitals: {
    temperature?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    spo2?: number;
    pulse?: number;
  }
): Promise<{
  diagnoses: DiagnosisResult[];
  redFlags: RedFlagAlert[];
}> {
  // Ensure model is initialized
  if (!embeddingPipeline) {
    await initializeModel();
  }
  
  // Get embedding for input symptoms
  const symptomsEmbedding = await getEmbedding(symptoms);
  
  // Calculate similarities with all diseases
  const similarities: Array<{ disease: typeof diseases[0]; score: number }> = [];
  
  for (const disease of diseases) {
    const diseaseEmb = diseaseEmbeddings.get(disease.id);
    if (!diseaseEmb) continue;
    
    const score = cosineSimilarity(symptomsEmbedding, diseaseEmb);
    similarities.push({ disease, score });
  }
  
  // Sort by similarity score
  similarities.sort((a, b) => b.score - a.score);
  
  // Take top 3
  const topDiagnoses: DiagnosisResult[] = similarities.slice(0, 3).map((item) => ({
    id: item.disease.id,
    name: item.disease.name,
    confidence: Math.round(item.score * 100),
    redFlags: item.disease.red_flags,
    triage: item.disease.triage,
    medications: item.disease.medications,
    contraindications: item.disease.contraindications,
  }));
  
  // Check for red flags based on vitals
  const redFlags: RedFlagAlert[] = [];
  
  if (vitals.temperature && vitals.temperature > 103) {
    redFlags.push({
      condition: "High Fever",
      severity: "critical",
      action: "Temperature >103°F - Start cooling measures, check for sepsis, consider blood cultures"
    });
  }
  
  if (vitals.spo2 && vitals.spo2 < 90) {
    redFlags.push({
      condition: "Low Oxygen Saturation",
      severity: "critical",
      action: "SpO2 <90% - START OXYGEN IMMEDIATELY. Monitor continuously. Prepare for referral."
    });
  }
  
  if (vitals.bpSystolic && vitals.bpSystolic < 90) {
    redFlags.push({
      condition: "Hypotension",
      severity: "critical",
      action: "Low BP - Check for shock. Start IV fluids. Monitor urine output. Consider sepsis."
    });
  }
  
  if (vitals.bpSystolic && vitals.bpSystolic > 180) {
    redFlags.push({
      condition: "Hypertensive Crisis",
      severity: "high",
      action: "Very high BP - Risk of stroke/MI. Antihypertensive needed. Refer urgently."
    });
  }
  
  if (vitals.pulse && (vitals.pulse > 120 || vitals.pulse < 50)) {
    redFlags.push({
      condition: vitals.pulse > 120 ? "Tachycardia" : "Bradycardia",
      severity: "high",
      action: `Abnormal heart rate (${vitals.pulse} bpm) - Check for cardiac issues, dehydration, or medication effects`
    });
  }
  
  return {
    diagnoses: topDiagnoses,
    redFlags,
  };
}