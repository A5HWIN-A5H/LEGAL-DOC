import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Google Generative AI
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY not found in environment. The API will fail if not provided.")
else:
    genai.configure(api_key=API_KEY)

app = FastAPI(title="Legal Contract Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContractRequest(BaseModel):
    text: str

class Clause(BaseModel):
    type: str = Field(description="One of the strictly required 12 categories: Termination, Payment, Liability, Indemnity, Intellectual Property, Confidentiality, Data Rights, Governing Law, Dispute Resolution, Force Majeure, Audit Rights, Non-Solicitation")
    text: str = Field(description="The extracted exact clause text")
    riskLevel: str = Field(description="LOW, MEDIUM, HIGH, or CRITICAL")
    riskExplanation: str = Field(description="Explanation of asymmetric obligations or toxic patterns")
    recommendation: str = Field(description="Mitigation recommendation")

class RiskScoreBreakdown(BaseModel):
    category: str = Field(description="Must be exactly: Liability Risk, Financial Risk, or Operational Risk")
    score: int
    maxScore: int

class AnalysisResult(BaseModel):
    summary: str
    clauses: List[Clause]
    overallRiskScore: int
    riskScoreBreakdown: List[RiskScoreBreakdown]
    keyObligations: List[str]

@app.get("/")
async def root():
    return {"message": "Legal Contract Analyzer API is running. Please use the frontend at http://localhost:3000"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_contract(request: ContractRequest):
    text = request.text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Contract text cannot be empty.")

    prompt = f"""You are a senior contract risk analyst. 
Your task is NOT to summarize the contract.

You MUST:
1. Identify every legal clause category from this exact list:
   - Termination
   - Payment
   - Liability
   - Indemnity
   - Intellectual Property
   - Confidentiality
   - Data Rights
   - Governing Law
   - Dispute Resolution
   - Force Majeure
   - Audit Rights
   - Non-Solicitation

2. Extract ONLY the actual clause text for each identified section.

3. Detect asymmetric obligations where one party has stronger rights.

4. Flag toxic patterns:
   - unilateral termination
   - unlimited indemnity
   - data ownership transfer
   - excessive penalties
   - liability caps
   - non-refundable payments

5. Assign risk level for each clause: LOW / MEDIUM / HIGH / CRITICAL

6. Produce numerical risk scores strictly as follows:
   - Liability Risk (0-30)
   - Financial Risk (0-30)
   - Operational Risk (0-40)

7. Write mitigation recommendations for each clause.

8. Provide a list of keyObligations.

Do NOT provide a summary of the contract text. Provide "Summary generation disabled to focus on risk analysis." for the summary field.

Analyze the following contract:
---
{text[:20000]}
---
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=AnalysisResult,
                temperature=0.0
            )
        )
        
        result_json = json.loads(response.text)
        return result_json
        
    except Exception as e:
        print(f"Error during generative AI analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
