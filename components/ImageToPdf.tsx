
import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { Button } from './Button';
import { Upload, X, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { describeImage } from '../services/geminiService';
import { generatePdfFromImages } from '../services/pdfService';

export const ImageToPdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const processFiles = (newFilesList: File[]) => {
    const validFiles: File[] = [];
    newFilesList.forEach(file => {
      if (file.size > MAX_FILE_SIZE) setError(`"${file.name}" is too large (>5MB)`);
      else validFiles.push(file);
    });
    if (validFiles.length === 0) return;
    const newUploadedFiles: UploadedFile[] = validFiles.map((file: File) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      base64: '', 
      type: 'image'
    }));
    newUploadedFiles.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, base64: reader.result as string } : pf));
      reader.readAsDataURL(f.file);
    });
    setFiles(prev => [...prev, ...newUploadedFiles]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => setFiles(files.filter(f => f.id !== id));

  const generateCaptions = async () => {
    setIsProcessing(true);
    for (const file of files) {
      if (!file.aiDescription && file.base64) {
        setProcessingId(file.id);
        try {
          const description = await describeImage(file.base64);
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, aiDescription: description } : f));
        } catch (err) { console.error(err); }
      }
    }
    setProcessingId(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div 
        className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center transition-all duration-500 ${
            isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]' 
                : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/40 hover:bg-neutral-200 dark:hover:bg-neutral-900/60 shadow-sm'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files)); }}
      >
        <input type="file" id="image-upload" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center group">
          <div className="bg-blue-500/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-inner">
             <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-1 sm:mb-2">Image to PDF</h3>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-xs leading-relaxed">
            Drag images here or tap to browse. AI will handle the rest.
          </p>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4 pt-2 sm:pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Selected ({files.length})</h4>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={generateCaptions} disabled={isProcessing} isLoading={isProcessing} icon={<Sparkles className="w-3.5 h-3.5 text-blue-500" />} className="text-[10px] flex-1 sm:flex-none">AI Caption</Button>
              <Button onClick={() => generatePdfFromImages(files)} icon={<FileText className="w-3.5 h-3.5" />} className="text-[10px] flex-1 sm:flex-none">Download PDF</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map(file => (
              <div key={file.id} className="group relative bg-white dark:bg-neutral-900/60 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-start gap-3 transition-all hover:shadow-lg dark:hover:shadow-none">
                <div className="relative flex-shrink-0">
                    <img src={file.previewUrl} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-neutral-100 dark:bg-neutral-950" />
                    <button onClick={() => removeFile(file.id)} className="absolute -top-1.5 -right-1.5 p-1.5 bg-red-500 text-white rounded-full shadow-lg transition-transform hover:scale-110"><X className="w-3 h-3" /></button>
                </div>
                <div className="flex-1 min-w-0 pr-2 pt-0.5 sm:pt-1">
                  <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-200 truncate break-all">{file.file.name}</p>
                  <div className="text-[10px] sm:text-xs text-neutral-500 italic mt-1">
                    {processingId === file.id ? <span className="text-blue-500 animate-pulse">Analyzing...</span> : file.aiDescription ? <p className="line-clamp-2">"{file.aiDescription}"</p> : "Ready."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
