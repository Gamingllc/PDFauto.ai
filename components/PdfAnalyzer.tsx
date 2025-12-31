
import React, { useState } from 'react';
import { Button } from './Button';
import { FileText, Search, AlertCircle, CheckCircle2, MessageCircle, MessageSquare, Loader2 } from 'lucide-react';
import { analyzeDocumentImages } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from "pdfjs-dist";

// Resolve library for ESM
const lib = pdfjsLib as any;
const pdfJs = lib.default || lib;
if (pdfJs.GlobalWorkerOptions) {
    pdfJs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export const PdfAnalyzer: React.FC = () => {
  const [file, setFile] = useState<{name: string, arrayBuffer: ArrayBuffer} | null>(null);
  const [prompt, setPrompt] = useState("Summarize this document in 3 key bullet points.");
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') { setError("Only PDF files are supported."); return; }
      if (selectedFile.size > MAX_FILE_SIZE) { setError("Limit is 5MB per upload."); return; }
      setError(null);
      const buffer = await selectedFile.arrayBuffer();
      setFile({ name: selectedFile.name, arrayBuffer: buffer });
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setStatus("Preparing document...");
    
    try {
      const pdf = await pdfJs.getDocument({ data: file.arrayBuffer }).promise;
      const pagesToProcess = Math.min(pdf.numPages, 10); // Process first 10 pages
      const pageImages: string[] = [];

      for (let i = 1; i <= pagesToProcess; i++) {
        setStatus(`Rendering page ${i} of ${pagesToProcess}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
        }
      }

      setStatus("AI is analyzing content...");
      const analysis = await analyzeDocumentImages(pageImages, prompt);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try a different document.");
    } finally {
      setIsProcessing(false);
      setStatus("");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full">
      {!file ? (
        <div className="relative border-2 border-dashed border-purple-500/40 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center bg-gradient-to-br from-purple-500/5 to-transparent hover:from-purple-500/10 hover:border-purple-500/60 transition-all duration-500 group">
          <input type="file" id="pdf-upload" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
            <div className="bg-purple-600/20 p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
               <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">Chat with your PDF</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-sm leading-relaxed">
              Upload a document to summarize content, extract data, or ask specific questions using Pro AI.
            </p>
            <div className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-purple-500/30 group-hover:bg-purple-700 transition-colors">
              Choose Document
            </div>
          </label>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start animate-in fade-in duration-500">
          <div className="w-full lg:w-1/3 space-y-4 sm:space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-neutral-900/60 p-4 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
               <div className="flex items-center space-x-3 mb-4">
                 <div className="bg-purple-500/10 p-2.5 rounded-xl">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mt-0.5">Document Selected</p>
                 </div>
               </div>
               <button onClick={() => { setFile(null); setResult(null); }} className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest hover:underline transition-colors">
                 Change File
               </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
               <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-semibold pl-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask AI Assistant</span>
               </div>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 className="w-full h-24 sm:h-32 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-sm text-neutral-900 dark:text-neutral-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 focus:outline-none transition-all resize-none shadow-sm"
                 placeholder="How can I help you with this document?"
               />
               <Button onClick={handleAnalyze} isLoading={isProcessing} className="w-full text-sm py-4 !bg-purple-600 !text-white rounded-2xl shadow-lg shadow-purple-500/20" icon={<Search className="w-4 h-4" />}>
                 {isProcessing ? "Thinking..." : "Analyze with Pro AI"}
               </Button>
               {isProcessing && (
                   <p className="text-[10px] text-center text-neutral-500 font-bold uppercase tracking-widest animate-pulse">{status}</p>
               )}
            </div>
            
             {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
          </div>

          <div className="flex-1 w-full bg-white dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 min-h-[400px] sm:min-h-[600px] shadow-sm transition-colors duration-300">
             {result ? (
                 <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none animate-in fade-in duration-700">
                     <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-800">Intelligence Report</h3>
                     <div className="prose-neutral prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-headings:text-neutral-900 dark:prose-headings:text-white">
                        <ReactMarkdown>{result}</ReactMarkdown>
                     </div>
                 </div>
             ) : (
                 <div className="h-full min-h-[300px] sm:min-h-[500px] flex flex-col items-center justify-center text-neutral-300 dark:text-neutral-700 space-y-4 opacity-50">
                     <div className="p-6 bg-neutral-100 dark:bg-neutral-900/50 rounded-full">
                        <Search className="w-12 h-12" />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center">Awaiting Analysis</p>
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
