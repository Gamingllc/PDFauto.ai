
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { FileText, ArrowRight, FileType, CheckCircle2, AlertCircle, Loader2, ArrowRightLeft } from 'lucide-react';
import { analyzeDocumentImages } from '../services/geminiService';
import { generateDocxFromMarkdown } from '../services/docxService';
import * as pdfjsLib from "pdfjs-dist";

const lib = pdfjsLib as any;
const pdfJs = lib.default || lib;
if (pdfJs.GlobalWorkerOptions) {
  pdfJs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export const PdfToDocx: React.FC = () => {
  const [file, setFile] = useState<{ name: string, arrayBuffer: ArrayBuffer } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const processFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError(null);
    setSuccess(false);
    setProgress(0);
    const buffer = await selectedFile.arrayBuffer();
    setFile({ name: selectedFile.name, arrayBuffer: buffer });
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setProgress(5);
    setStatusMessage("Rendering pages...");

    try {
      const pdf = await pdfJs.getDocument({ data: file.arrayBuffer }).promise;
      const pagesToProcess = Math.min(pdf.numPages, 10);
      const pageImages: string[] = [];

      for (let i = 1; i <= pagesToProcess; i++) {
        setProgress(5 + (i / pagesToProcess) * 20);
        setStatusMessage(`Rendering page ${i}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better text recognition
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          pageImages.push(canvas.toDataURL('image/jpeg', 0.9));
        }
      }

      setStatusMessage("AI is reconstructing structure...");
      setProgress(30);

      const markdown = await analyzeDocumentImages(
        pageImages,
        "Convert this document into structured Markdown. Preserve headings, bullet points, and paragraphs. Do not include any conversational text."
      );

      setProgress(85);
      setStatusMessage("Generating Word document...");

      await generateDocxFromMarkdown(markdown, file.name.replace('.pdf', '.docx'));

      setProgress(100);
      setSuccess(true);
      setStatusMessage("Complete!");
    } catch (err) {
      console.error(err);
      setError("AI conversion failed. Document might be too complex.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-6 sm:space-y-8">
      {!file ? (
        <div
          className={`w-full max-w-xl border-2 border-dashed rounded-3xl p-8 sm:p-16 text-center transition-all duration-300 ${isDragging
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[1.01]'
            : 'border-orange-500/40 bg-gradient-to-br from-orange-500/5 to-transparent hover:from-orange-500/10 hover:border-orange-500/60 shadow-sm'
            }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
        >
          <input type="file" id="pdf-convert-upload" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
          <label htmlFor="pdf-convert-upload" className="cursor-pointer flex flex-col items-center w-full h-full group">
            <div className="bg-orange-600/20 p-4 sm:p-6 rounded-3xl mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <ArrowRightLeft className={`w-8 h-8 sm:w-10 sm:h-10 text-orange-600 dark:text-orange-400`} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">PDF to Word</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              {isDragging ? 'Drop to start conversion' : 'Drag & drop PDF here, or tap to browse. PDFauto.ai will reconstruct your document structure.'}
            </p>
            <div className="mt-6 px-8 py-3 bg-orange-600 text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-orange-500/30 group-hover:bg-orange-700 transition-colors">
              Choose Document
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-4 uppercase tracking-[0.2em] font-bold">Limit: 5MB</p>
          </label>
        </div>
      ) : (
        <div className="w-full max-w-xl bg-white dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 space-y-8 shadow-2xl transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-neutral-50 dark:bg-black/40 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto min-w-0">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-600 dark:text-orange-400 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate" title={file.name}>{file.name}</p>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">PDF Source</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0 rotate-90 sm:rotate-0" />
            <div className="flex items-center space-x-4 w-full sm:w-auto min-w-0 sm:text-right sm:flex-row-reverse sm:space-x-reverse">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-600 dark:text-orange-400 flex-shrink-0">
                <FileType className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Word Doc</p>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">Output</p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                <span>{statusMessage}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-5 bg-orange-50 dark:bg-neutral-800 border border-orange-100 dark:border-neutral-700 rounded-2xl flex items-start space-x-4 animate-in slide-in-from-top-4">
              <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-white flex-shrink-0" />
              <div>
                <p className="text-sm text-neutral-900 dark:text-white font-bold">Successfully Converted!</p>
                <p className="text-xs text-neutral-500 font-medium mt-1">Structure preserved. Download should have started.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="secondary" onClick={() => setFile(null)} className="w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl" disabled={isProcessing}>Cancel</Button>
            <Button onClick={handleConvert} isLoading={isProcessing} disabled={success} className={`w-full py-4 text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 ${success ? 'opacity-50' : '!bg-orange-600 !text-white'}`} icon={<FileType className="w-4 h-4" />}>
              {isProcessing ? "Processing..." : success ? "Task Finished" : "Convert"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
