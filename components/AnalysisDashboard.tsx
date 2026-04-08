'use client';

import React from 'react';
import { AnalysisResult } from '@/lib/api';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

export function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <ShieldAlert className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const displayScore = result.overallRiskScore <= 1 && result.overallRiskScore > 0
    ? Math.round(result.overallRiskScore * 100)
    : Math.round(result.overallRiskScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Overall Risk Score</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-6xl font-display font-bold ${displayScore > 70 ? 'text-red-600' : displayScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {displayScore}
            </span>
            <span className="text-zinc-400 font-medium">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${displayScore}%` }}
              className={`h-full ${displayScore > 70 ? 'bg-red-500' : displayScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>

          {result.riskScoreBreakdown && result.riskScoreBreakdown.length > 0 && (
            <div className="pt-4 border-t border-zinc-100 space-y-3 flex-1 flex flex-col justify-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Risk Score Breakdown</span>
              {result.riskScoreBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600 font-medium">{item.category}</span>
                  <span className="font-bold text-zinc-900">{item.score}/{item.maxScore}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm md:col-span-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 block">Executive Summary</span>
          <div className="prose prose-zinc max-w-none">
            <div className="text-zinc-700 leading-relaxed">
              <ReactMarkdown>
                {result.summary}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Obligations */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A1A1A] text-white p-10 rounded-3xl overflow-hidden relative"
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-display font-bold mb-8">Critical Obligations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {result.keyObligations.map((ob, i) => (
              <div key={i} className="flex space-x-4 group">
                <span className="text-emerald-400 font-mono text-xl font-bold opacity-50 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <p className="text-zinc-300 text-sm leading-relaxed">{ob}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
      </motion.div>

      {/* Clause Analysis */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-display font-bold">Clause Breakdown</h3>
          <div className="flex space-x-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <span className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-red-500" /> <span>High Risk</span></span>
            <span className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span>Medium</span></span>
            <span className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span>Low</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {result.clauses.map((clause, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Metadata */}
                <div className="lg:col-span-3 p-6 bg-zinc-50/50 border-r border-zinc-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Category</span>
                    <h4 className="text-lg font-bold text-zinc-900 mb-4">{clause.type}</h4>
                    
                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${getRiskColor(clause.riskLevel)}`}>
                      {getRiskIcon(clause.riskLevel)}
                      <span className="text-xs font-bold uppercase tracking-wider">{clause.riskLevel} Risk</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Text & Analysis */}
                <div className="lg:col-span-6 p-8 space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Contract Language</span>
                    <p className="text-sm font-mono text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-100 leading-relaxed italic">
                      &ldquo;{clause.text}&rdquo;
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Analysis</span>
                    <p className="text-sm text-zinc-700 leading-relaxed">{clause.riskExplanation}</p>
                  </div>
                </div>

                {/* Right: Recommendation */}
                <div className="lg:col-span-3 p-8 bg-emerald-50/30 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Mitigation Strategy</span>
                    </div>
                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                      {clause.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
