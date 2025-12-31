
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Scale, ShieldCheck } from 'lucide-react';

interface LegalNoticeProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

export const LegalNotice: React.FC<LegalNoticeProps> = ({ type, onBack }) => {
  const content = {
    terms: `
# Terms of Service
*Last updated: December 30*

Welcome to **PDFauto.ai**. By using our services, you agree to the following terms:

### 1. Description of Service
PDFauto.ai provides AI-powered document tools including conversion, compression, and analysis. Our service utilizes Google Gemini AI to process document contents.

### 2. Usage Limits
*   The service is currently limited to files under **5MB**.
*   We reserve the right to limit the number of requests per user to ensure stability for all.

### 3. User Responsibility
You are solely responsible for the content of the documents you upload. You must not upload documents containing illegal material or content that violates the rights of third parties.

### 4. AI Processing Disclaimer
Our tools use Artificial Intelligence. While highly capable, AI can sometimes make mistakes or misinterpret document structures. Users should verify critical data after conversion or analysis.

### 5. Termination
We reserve the right to suspend or terminate access to our service at any time, without notice, for conduct that we believe violates these Terms.
    `,
    privacy: `
# Privacy Policy
*Last updated: November 2025*

Your privacy is paramount. At **PDFauto.ai**, we follow a "Minimal Data" philosophy.

### 1. Data Processing
*   **No File Storage:** We do not store your uploaded files on our servers. All processing is ephemeral.
*   **AI Transmission:** Documents are sent via encrypted connection to the Google Gemini API for processing and are immediately discarded by our system once the task is complete.

### 2. Local Storage
We may use browser Local Storage to save your preferences, such as theme selection (Light/Dark mode) or tool history, to improve your experience.

### 3. Cookies
We do not use tracking cookies or third-party advertising cookies.

### 4. Third-Party Services
Our service relies on the Google Gemini API. By using PDFauto.ai, you acknowledge that your document data is processed by Google's AI infrastructure in accordance with their safety and privacy standards.

### 5. Contact
For any privacy concerns, please contact our support team.
    `
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-[10px]">Back to App</span>
      </button>

      <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            {type === 'terms' ? <Scale className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {type === 'terms' ? 'Terms & Conditions' : 'Privacy Notice'}
            </h2>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mt-1">PDFAUTO.AI Legal</p>
          </div>
        </div>

        <div className="prose dark:prose-invert prose-neutral max-w-none prose-sm sm:prose-base 
          prose-headings:font-bold prose-headings:tracking-tight 
          prose-p:text-neutral-600 dark:prose-p:text-neutral-400 
          prose-li:text-neutral-600 dark:prose-li:text-neutral-400">
          <ReactMarkdown>{content[type]}</ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
            Thank you for trusting PDFAUTO.AI
          </p>
        </div>
      </div>
    </div>
  );
};
