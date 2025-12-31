
import React, { useState } from 'react';
import { Button } from './Button';
import { FileText, Wand2, Eye, Edit3 } from 'lucide-react';
import { refineText } from '../services/geminiService';
import { generatePdfFromText } from '../services/pdfService';
import ReactMarkdown from 'react-markdown';

export const TextToPdf: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleRefine = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const refined = await refineText(text);
      setText(refined);
    } catch (err) {
      console.error(err);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    generatePdfFromText(text);
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex bg-white dark:bg-black p-1 rounded-lg">
            <button 
                onClick={() => setPreviewMode(false)}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${!previewMode ? 'bg-indigo-500 text-white shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
            </button>
            <button 
                onClick={() => setPreviewMode(true)}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${previewMode ? 'bg-indigo-500 text-white shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
            >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
            </button>
        </div>
        <div className="flex space-x-2 pr-1">
          <Button 
            variant="secondary" 
            onClick={handleRefine}
            isLoading={isProcessing}
            disabled={!text.trim()}
            icon={<Wand2 className="w-3.5 h-3.5 text-indigo-500" />}
            className="text-[10px] sm:text-xs flex-1 py-2 sm:py-2.5 font-bold uppercase tracking-wider"
          >
            AI Refine
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={!text.trim()}
            icon={<FileText className="w-3.5 h-3.5" />}
            className="text-[10px] sm:text-xs flex-1 py-2 sm:py-2.5 font-bold uppercase tracking-wider !bg-indigo-600 !text-white"
          >
            Download
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900/60 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden min-h-[350px] sm:min-h-[500px] shadow-sm">
        {previewMode ? (
            <div className="p-4 sm:p-8 prose dark:prose-invert prose-sm sm:prose-base max-w-none overflow-y-auto h-[350px] sm:h-[500px] prose-neutral prose-headings:text-neutral-900 dark:prose-headings:text-white prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-li:text-neutral-700 dark:prose-li:text-neutral-300">
                <ReactMarkdown>{text || "*No content to preview yet. Switch to Editor to start typing.*"}</ReactMarkdown>
            </div>
        ) : (
            <textarea
            className="w-full h-[350px] sm:h-[500px] bg-transparent p-4 sm:p-8 text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none placeholder-neutral-400 dark:placeholder-neutral-600 font-sans text-sm sm:text-base leading-relaxed tracking-tight"
            placeholder="Start typing your report or notes here. Gemini AI can polish your work into a professional PDF."
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
        )}
      </div>
    </div>
  );
};
