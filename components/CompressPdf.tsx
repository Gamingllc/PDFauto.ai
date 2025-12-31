
import React, { useState } from 'react';
import { Button } from './Button';
import { FileText, ArrowDownToLine, Minimize2, CheckCircle2, AlertCircle, Settings2, Loader2 } from 'lucide-react';
import { compressPdf, CompressionOptions } from '../services/compressionService';

type CompressionLevel = 'high' | 'balanced' | 'low';

export const CompressPdf: React.FC = () => {
  const [file, setFile] = useState<{name: string, file: File, size: number} | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError("Please upload a valid PDF file.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds the 5MB limit.");
      return;
    }
    setFile({
      name: selectedFile.name,
      file: selectedFile,
      size: selectedFile.size
    });
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    const settingsMap: Record<CompressionLevel, CompressionOptions> = {
      high: { scale: 0.8, quality: 0.3 },
      balanced: { scale: 1.0, quality: 0.5 },
      low: { scale: 1.5, quality: 0.7 }
    };

    try {
      setStatus("Initializing...");
      await compressPdf(file.file, settingsMap[level], (current, total) => {
        const percentage = Math.round((current / total) * 100);
        setProgress(percentage);
        setStatus(`Processing page ${current} of ${total}...`);
      });
      setSuccess(true);
      setStatus("Done!");
    } catch (err) {
      setError("Compression failed. The file might be corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-6 sm:space-y-8">
      {!file ? (
        <div 
            className={`w-full max-w-xl border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center transition-all duration-300 ${
                isDragging 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]' 
                : 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-900/10 hover:bg-emerald-500/10 hover:border-emerald-500/50 shadow-sm'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          <input
            type="file"
            id="pdf-compress-upload"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="pdf-compress-upload" className="cursor-pointer flex flex-col items-center w-full h-full group">
            <div className="bg-emerald-500/10 p-4 sm:p-6 rounded-full mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Minimize2 className={`w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]`} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">Compress PDF</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base max-w-sm mx-auto">
               {isDragging ? 'Drop to start compression' : 'Drag & drop PDF here, or tap to optimize file size'}
            </p>
            <div className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
              Choose Document
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-4 uppercase tracking-[0.2em] font-bold">Limit: 5MB</p>
          </label>
        </div>
      ) : (
        <div className="w-full max-w-xl bg-white dark:bg-neutral-900/40 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-8 space-y-6 shadow-xl transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 dark:bg-black/40 rounded-xl border border-neutral-100 dark:border-neutral-800/50 gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate break-all" title={file.name}>{file.name}</p>
                <p className="text-xs text-neutral-500 font-medium">{formatSize(file.size)}</p>
              </div>
            </div>
            <button 
                onClick={() => { setFile(null); setSuccess(false); setProgress(0); }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider hover:underline self-end sm:self-center flex-shrink-0 transition-colors"
                disabled={isProcessing}
            >
                Change
            </button>
          </div>

          {!success && (
            <div className="space-y-4">
               <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                 <Settings2 className="w-3 h-3" /> Compression Level
               </label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['low', 'balanced', 'high'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`p-4 rounded-xl border text-sm font-bold transition-all text-left flex flex-col ${level === l ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-emerald-500/50'}`}
                    >
                      <span className="capitalize">{l}</span>
                      <span className={`text-[10px] font-medium mt-1 ${level === l ? 'text-emerald-100' : 'text-neutral-400 dark:text-neutral-500'}`}>
                        {l === 'low' ? 'Best Quality' : l === 'balanced' ? 'Optimal' : 'Smallest'}
                      </span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-900 dark:text-emerald-100 font-bold">Optimized Successfully!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium mt-0.5">Your compressed document has been downloaded.</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleCompress} 
            isLoading={isProcessing}
            disabled={success}
            className={`w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg ${success ? 'opacity-50' : '!bg-emerald-600 !text-white hover:!bg-emerald-700'}`}
            variant={success ? "secondary" : "primary"}
            icon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
          >
            {isProcessing ? "Optimizing PDF..." : success ? "Task Completed" : "Start Compression"}
          </Button>
        </div>
      )}
    </div>
  );
};
