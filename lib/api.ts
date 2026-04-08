export interface AnalysisResult {
  summary: string;
  clauses: {
    type: string;
    text: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskExplanation: string;
    recommendation: string;
  }[];
  overallRiskScore: number;
  riskScoreBreakdown: {
    category: string;
    score: number;
    maxScore: number;
  }[];
  keyObligations: string[];
}

export async function analyzeContract(text: string): Promise<AnalysisResult> {
  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to analyze contract via local backend. Status: ${response.status}`);
  }
  
  const result = await response.json();
  return result as AnalysisResult;
}
