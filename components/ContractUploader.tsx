'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContractUploaderProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export function ContractUploader({ onAnalyze, isAnalyzing }: ContractUploaderProps) {
  const [text, setText] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setIsExtractingPdf(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/extract-pdf', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (res.ok) {
            setText(data.text);
            setIsManual(true);
          } else {
            console.error('Extraction error:', data.error);
            alert(`Failed to extract PDF text: ${data.error}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error extracting PDF.');
        } finally {
          setIsExtractingPdf(false);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setText(content);
          setIsManual(true);
        };
        reader.readAsText(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isExtractingPdf,
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!isManual ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
            isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
            {isExtractingPdf ? (
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          <div className="text-center">
            {isExtractingPdf ? (
              <p className="text-lg font-medium text-zinc-900">Extracting PDF text...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-zinc-900">Drop your contract here</p>
                <p className="text-sm text-zinc-500">Support .txt and .pdf files</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsManual(true);
            }}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
          >
            Or paste text manually
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
        >
          <div className="p-4 border-bottom border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center space-y-1">
              <FileText className="w-4 h-4 text-zinc-500 mr-2" />
              <span className="text-sm font-medium text-zinc-700">Contract Text</span>
            </div>
            <button
              onClick={() => {
                setIsManual(false);
                setText('');
              }}
              className="p-1 hover:bg-zinc-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your contract text here..."
            className="w-full h-64 p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed"
          />
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
            <button
              onClick={() => onAnalyze(text)}
              disabled={!text || isAnalyzing}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Start Analysis</span>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
