
import React, { useState } from 'react';
import { VideoAnalysis, Video } from '../types';

interface AnalysisViewProps {
  video: Video;
  analysis: VideoAnalysis | null;
  loading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ video, analysis, loading }) => {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    if (!analysis?.aiPromptContext) return;
    navigator.clipboard.writeText(analysis.aiPromptContext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-brain text-2xl text-indigo-400 animate-pulse"></i>
          </div>
        </div>
        <p className="text-white font-bold text-lg">Reverse-Engineering Story Architecture</p>
        <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">Gemini is deconstructing narrative beats and psychological triggers...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800 transition-all">
        <div className="bg-slate-800/50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 rotate-3">
          <i className="fa-solid fa-microscope text-4xl opacity-30 text-indigo-400"></i>
        </div>
        <h3 className="text-white font-black text-xl mb-2 tracking-tight">Select an Outlier</h3>
        <p className="text-sm text-slate-500 max-w-xs text-center">Extract the exact script structure and story beats for AI-assisted content creation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">
                Strategic Blueprint
              </span>
              <button 
                onClick={copyPrompt}
                className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-green-500/20 transition-all"
              >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                {copied ? 'Copied Context' : 'Copy LLM Prompt'}
              </button>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3 tracking-tight">{video.title}</h2>
            <div className="flex items-center gap-6 text-sm text-slate-500 font-bold">
              <span className="flex items-center gap-2"><i className="fa-solid fa-chart-line text-indigo-500"></i> Performance: {video.zScore.toFixed(2)}σ</span>
              <span className="flex items-center gap-2"><i className="fa-solid fa-eye text-slate-700"></i> {video.views.toLocaleString()}</span>
            </div>
          </div>
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-white/5 hover:bg-white/10 p-5 rounded-3xl border border-white/5 transition-all group">
            <i className="fa-brands fa-youtube text-4xl text-red-500 group-hover:scale-110 transition-transform"></i>
          </a>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
          {/* Left Column: Narrative Arc */}
          <div className="space-y-10">
            <section>
              <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                <i className="fa-solid fa-bezier-curve text-indigo-500"></i>
                Story Architecture
              </h4>
              <div className="space-y-4">
                {analysis.storyStructure.map((step, i) => (
                  <div key={i} className="group relative pl-10 pb-6 last:pb-0">
                    {/* Line connection */}
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-800 group-last:hidden"></div>
                    {/* Point */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                      <span className="text-[10px] font-black text-slate-500 group-hover:text-white">{i + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{step.phase}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{step.timing || 'N/A'}</span>
                      </div>
                      <p className="text-slate-300 text-sm font-medium mb-1">{step.description}</p>
                      <p className="text-[11px] text-slate-500 italic">Purpose: {step.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                <i className="fa-solid fa-scroll text-indigo-500"></i>
                Full Script Breakdown
              </h4>
              <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/50 font-serif text-slate-400 text-sm leading-loose whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar shadow-inner">
                {analysis.fullScriptOutline}
              </div>
            </section>
          </div>

          {/* Right Column: Strategic Insights */}
          <div className="space-y-10">
             <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-8">
              <h4 className="flex items-center gap-3 text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">
                <i className="fa-solid fa-brain"></i>
                Growth Strategy
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Retention Tactics</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.retentionHooks.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-200 text-xs rounded-xl border border-indigo-500/20 font-medium">{h}</span>
                    ))}
                  </div>
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Psychological Triggers</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.engagementTriggers.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-200 text-xs rounded-xl border border-blue-500/20 font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
               <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                <i className="fa-solid fa-lightbulb text-yellow-500"></i>
                Content Pillars
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {analysis.keyPoints.map((point, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-all">
                    <i className="fa-solid fa-check-circle text-indigo-500 mt-1"></i>
                    <p className="text-sm text-slate-300 font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-slate-800">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Transcript Insight</h4>
               <p className="text-slate-400 text-sm italic font-serif leading-relaxed">
                 "{analysis.transcriptSnippet}"
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
