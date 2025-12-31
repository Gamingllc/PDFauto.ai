
import React, { useState } from 'react';
import { CreateMode } from './types';
import { ImageToPdf } from './components/ImageToPdf';
import { TextToPdf } from './components/TextToPdf';
import { PdfAnalyzer } from './components/PdfAnalyzer';
import { PdfToDocx } from './components/PdfToDocx';
import { CompressPdf } from './components/CompressPdf';
import { LegalNotice } from './components/LegalNotice';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { useAuth } from './context/AuthContext';
import {
  FileType,
  Image as ImageIcon,
  FileText,
  ArrowRightLeft,
  Minimize2,
  MessageSquare,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  User,
  LogOut,
  Crown
} from 'lucide-react';

const App: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTool, setActiveTool] = useState<CreateMode | 'ANALYZE' | null>(null);
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const tools = [
    {
      id: CreateMode.IMAGES,
      name: 'JPG to PDF',
      desc: 'Smart image-to-document conversion',
      icon: ImageIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-500/20',
      glow: 'shadow-blue-500/30'
    },
    {
      id: CreateMode.PDF_TO_DOCX,
      name: 'PDF to Word',
      desc: 'PDFauto.ai will do the Job',
      icon: ArrowRightLeft,
      color: 'text-orange-500',
      bg: 'bg-orange-500/20',
      glow: 'shadow-orange-500/30'
    },
    {
      id: 'ANALYZE',
      name: 'Chat with PDF',
      desc: 'Summarize, extract & query PDFauto.ai',
      icon: MessageSquare,
      color: 'text-purple-500',
      bg: 'bg-purple-500/20',
      glow: 'shadow-purple-500/30'
    },
    {
      id: CreateMode.COMPRESS_PDF,
      name: 'Compress PDF',
      desc: 'Lossless file size optimization',
      icon: Minimize2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/20',
      glow: 'shadow-emerald-500/30'
    },
    {
      id: CreateMode.TEXT,
      name: 'Text to PDF',
      desc: 'AI-polished professional reports',
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/20',
      glow: 'shadow-indigo-500/30'
    },
  ];

  const handleLogoClick = () => {
    setActiveTool(null);
    setLegalView(null);
  };

  const handleLegalClick = (type: 'terms' | 'privacy') => {
    setActiveTool(null);
    setLegalView(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] text-neutral-900 dark:text-neutral-200 flex flex-col transition-colors duration-300">
      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="bg-black dark:bg-white p-2 rounded-xl transition-transform group-hover:scale-110 shadow-xl">
            <FileType className="w-5 h-5 text-white dark:text-black" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase">
            PDFauto<span className="text-neutral-400 dark:text-neutral-600 font-light lowercase">.ai</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {(activeTool || legalView) && (
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Tools Gallery</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/30"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-900/50 rounded-full border border-neutral-200 dark:border-neutral-800">
                <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors group"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-32 flex-grow">
        {legalView ? (
          <LegalNotice type={legalView} onBack={() => setLegalView(null)} />
        ) : !activeTool ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="mb-12 sm:mb-20 text-center sm:text-left">
              <div className="inline-flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-900/50 px-3 py-1 rounded-full mb-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">Powered by Ai</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 dark:text-white mb-6 tracking-tighter leading-none">
                Reimagining <br className="hidden sm:block" /> Document AI.
              </h2>
              <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-500 max-w-2xl leading-relaxed font-medium">
                The high-performance toolkit for structural document conversions and intelligence analysis. Minimalist. Secure. Pro.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className="group relative flex flex-col items-start p-8 bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] hover:bg-white dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-2xl dark:hover:shadow-[0_0_50px_rgba(255,255,255,0.03)] transition-all text-left overflow-hidden backdrop-blur-md"
                >
                  <div className={`${tool.bg} p-4 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-500 ${tool.glow}`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">{tool.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-8 leading-relaxed">{tool.desc}</p>

                  <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    Access Tool <ArrowRight className="ml-3 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">
                  {tools.find(t => t.id === activeTool)?.name || 'Analyze PDF'}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-500 text-sm sm:text-lg mt-2 font-medium">
                  {tools.find(t => t.id === activeTool)?.desc || 'AI-powered document analysis.'}
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] p-6 sm:p-12 backdrop-blur-xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] transition-all duration-500">
              {activeTool === CreateMode.IMAGES && <ImageToPdf />}
              {activeTool === CreateMode.TEXT && <TextToPdf />}
              {activeTool === CreateMode.PDF_TO_DOCX && <PdfToDocx />}
              {activeTool === CreateMode.COMPRESS_PDF && <CompressPdf />}
              {activeTool === 'ANALYZE' && <PdfAnalyzer />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-neutral-100 dark:border-neutral-900 bg-white/40 dark:bg-black/40 backdrop-blur-md py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-700 font-black text-center sm:text-left">
          <div className="order-2 sm:order-1 tracking-[0.5em]">© 2026 PDFAUTO.AI</div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 order-1 sm:order-2">
            <button
              onClick={() => handleLegalClick('terms')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => handleLegalClick('privacy')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Privacy
            </button>
            <span className="hidden sm:inline opacity-20 text-neutral-400">|</span>
            <span className="text-neutral-300 dark:text-neutral-800">MAX 5MB CLOUD-NATIVE</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </div>
  );
};

export default App;
