
import React, { useState, useCallback } from 'react';
import { transcribeVideo } from './services/geminiService';
import { VideoResult, TranscriptionExport } from './types';

const App: React.FC = () => {
  const [inputUrls, setInputUrls] = useState('');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseUrls = (text: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const matches = [...text.matchAll(regex)];
    return matches.map(m => `https://www.youtube.com/watch?v=${m[1]}`);
  };

  const handleStartProcessing = async () => {
    const urls = parseUrls(inputUrls);
    if (urls.length === 0) return;

    setIsProcessing(true);
    const initialVideos: VideoResult[] = urls.map(url => ({
      id: url.split('v=')[1] || Math.random().toString(),
      url,
      title: 'Awaiting analysis...',
      channelName: 'Pending...',
      status: 'pending'
    }));

    setVideos(initialVideos);

    for (let i = 0; i < urls.length; i++) {
      setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, status: 'loading' } : v));
      
      try {
        const result = await transcribeVideo(urls[i]);
        setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, ...result, status: 'completed' } : v));
      } catch (err) {
        setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, status: 'error' } : v));
      }
    }
    setIsProcessing(false);
  };

  const downloadJson = () => {
    const exportData: TranscriptionExport = {
      projectName: `Transcrypt_Export_${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      videos: videos.filter(v => v.status === 'completed'),
      count: videos.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcripts_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="border-b border-white/5 py-6 px-8 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-bolt-lightning text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TRANSCRYPT<span className="text-indigo-500">PRO</span>
          </h1>
        </div>
        
        {videos.some(v => v.status === 'completed') && (
          <button 
            onClick={downloadJson}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <i className="fa-solid fa-download"></i>
            Export JSON Bundle
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#101014] border border-white/5 p-6 rounded-3xl shadow-2xl">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Input Engine</h2>
              <textarea 
                value={inputUrls}
                onChange={(e) => setInputUrls(e.target.value)}
                placeholder="Paste YouTube links here (one per line)..."
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 custom-scrollbar"
              />
              <button 
                onClick={handleStartProcessing}
                disabled={isProcessing || !inputUrls.trim()}
                className="w-full mt-4 bg-white hover:bg-slate-200 text-black font-black py-4 rounded-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <><i className="fa-solid fa-circle-notch animate-spin"></i> Processing Queue</>
                ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles"></i> Analyze Content</>
                )}
              </button>
            </div>

            <div className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Instructions</h3>
              <ul className="text-xs text-slate-500 space-y-2 leading-relaxed">
                <li className="flex gap-2"><i className="fa-solid fa-circle-check text-indigo-500/50 mt-1"></i> Paste multiple links for bulk extraction.</li>
                <li className="flex gap-2"><i className="fa-solid fa-circle-check text-indigo-500/50 mt-1"></i> Gemini Pro will search for and reconstruct content.</li>
                <li className="flex gap-2"><i className="fa-solid fa-circle-check text-indigo-500/50 mt-1"></i> Export the final bundle for Claude/GPT scripting.</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Transcription Pipeline</h2>
              <div className="text-[10px] font-bold text-slate-600 px-3 py-1 border border-white/5 rounded-full">
                {videos.length} ENTITIES DISCOVERED
              </div>
            </div>

            {videos.length === 0 ? (
              <div className="h-[500px] border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-700">
                <i className="fa-solid fa-terminal text-5xl mb-6 opacity-10"></i>
                <p className="text-sm font-medium">Pipeline idle. Awaiting content ingestion...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                {videos.map((video) => (
                  <div key={video.id} className={`group bg-[#101014] border border-white/5 p-6 rounded-[2rem] transition-all hover:bg-[#131318] relative overflow-hidden ${video.status === 'loading' ? 'animate-pulse' : ''}`}>
                    
                    {video.status === 'loading' && (
                      <div className="absolute top-0 left-0 h-1 bg-indigo-500/50 w-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-1/3 animate-[loading_2s_infinite]"></div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {video.status === 'completed' ? (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] font-black rounded border border-green-500/20 uppercase">Sync Success</span>
                          ) : video.status === 'error' ? (
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-black rounded border border-red-500/20 uppercase">Fetch Failed</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded border border-indigo-500/20 uppercase tracking-widest">Processing</span>
                          )}
                          <span className="text-[10px] text-slate-600 font-mono truncate max-w-[200px]">{video.url}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 leading-tight">{video.title}</h3>
                        <p className="text-xs text-indigo-500 font-bold mb-4">{video.channelName}</p>
                      </div>
                      
                      {video.status === 'completed' && (
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                          <i className="fa-solid fa-check-double text-indigo-500"></i>
                        </div>
                      )}
                    </div>

                    {video.status === 'completed' && (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-scroll text-indigo-500/50"></i>
                            Transcript Snippet
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed italic font-serif line-clamp-3">
                            "{video.transcript}"
                          </p>
                        </div>

                        {/* Display extracted grounding URLs as required for search queries */}
                        {video.groundingUrls && video.groundingUrls.length > 0 && (
                          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <i className="fa-solid fa-link text-indigo-500/50"></i>
                              Sources & Citations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {video.groundingUrls.map((source, i) => (
                                <a 
                                  key={i} 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-200 text-[10px] rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                                >
                                  <i className="fa-solid fa-earth-americas text-[8px]"></i>
                                  {source.title || 'View Source'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          {video.segments?.slice(0, 3).map((seg, i) => (
                            <div key={i} className="px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                              <span className="text-[9px] font-bold text-indigo-400 block mb-0.5">{seg.time}</span>
                              <p className="text-[10px] text-slate-400 truncate w-32">{seg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e1e24;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2a2a33;
        }
      `}</style>
    </div>
  );
};

export default App;
