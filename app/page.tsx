'use client';

import React, { useState } from 'react';

import { ContractUploader } from '@/components/ContractUploader';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { analyzeContract, AnalysisResult } from '@/lib/api';
import { History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeContract(text);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze contract. Please try again with a shorter snippet or check your connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center">
      <main className="flex-1 w-full max-w-5xl p-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full pt-12 space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-display font-bold tracking-tight text-zinc-900">
                  Legal Document Analyzer
                </h1>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-left max-w-2xl mx-auto space-y-3">
                  <p><strong className="text-zinc-900">Background:</strong> <span className="text-zinc-600">Law firms handle long contracts.</span></p>
                  <p><strong className="text-zinc-900">Problem:</strong> <span className="text-zinc-600">Extract key clauses and summarize legal documents.</span></p>
                  <p><strong className="text-zinc-900">Objectives:</strong> <span className="text-zinc-600">Clause extraction, risk detection.</span></p>
                  <p><strong className="text-zinc-900">Methodology:</strong> <span className="text-zinc-600">Domain-specific transformer fine-tuning.</span></p>
                  <p><strong className="text-zinc-900">Expected Outcome:</strong> <span className="text-zinc-600">Legal summarization system.</span></p>
                </div>
              </div>

              <ContractUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative pt-4"
            >
              <button
                onClick={() => setResult(null)}
                className="mb-8 flex items-center space-x-2 text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
              <AnalysisDashboard result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
