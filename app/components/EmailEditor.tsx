'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-900/50 border border-slate-700 rounded-xl animate-pulse flex items-center justify-center text-slate-500">Đang tải bộ soạn thảo...</div>
}) as any;

interface EmailEditorProps {
  editorMode: 'rich' | 'html';
  setEditorMode: (v: 'rich' | 'html') => void;
  subject: string;
  setSubject: (v: string) => void;
  template: string;
  setTemplate: (v: string) => void;
  quillRef: any;
  htmlRef: any;
  subjectRef: any;
  setLastFocused: (v: 'subject' | 'template') => void;
  modules: any;
  onSend: () => void;
  isSending: boolean;
}

export default function EmailEditor({
  editorMode, setEditorMode,
  subject, setSubject,
  template, setTemplate,
  quillRef, htmlRef, subjectRef,
  setLastFocused,
  modules,
  onSend,
  isSending
}: EmailEditorProps) {
  return (
    <section className="glass-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">03</span>
          Soạn thảo Nội dung
        </h3>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700">
          <button 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'rich' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setEditorMode('rich')}
          >
            SOẠN THẢO (WORD)
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'html' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setEditorMode('html')}
          >
            MÃ HTML
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Tiêu đề Email:</label>
          <input 
            ref={subjectRef}
            onFocus={() => setLastFocused('subject')}
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            placeholder="Nhập tiêu đề email (có thể dùng {{biến}})..." 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2" onClick={() => setLastFocused('template')}>
          <label className="text-sm font-semibold text-slate-400 ml-1">Nội dung chi tiết:</label>
          <div className="editor-wrapper rounded-xl overflow-hidden border border-slate-700 bg-slate-900/30 shadow-inner">
            {editorMode === 'rich' ? (
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={template} 
                onChange={setTemplate} 
                modules={modules}
                placeholder="Viết nội dung email của bạn tại đây..."
                style={{ height: '350px' }}
                className="custom-quill"
              />
            ) : (
              <textarea 
                ref={htmlRef}
                onFocus={() => setLastFocused('template')}
                value={template} 
                onChange={e => setTemplate(e.target.value)} 
                className="w-full h-[350px] bg-slate-900/80 text-emerald-400 font-mono text-sm p-4 focus:outline-none resize-none"
                placeholder="Paste mã HTML của bạn vào đây..."
              />
            )}
          </div>
        </div>
      </div>

      <button 
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-lg py-4 px-6 rounded-2xl transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20"
        onClick={onSend}
        disabled={isSending}
      >
        {isSending ? (
          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <span>🚀</span>
            <span>BẮT ĐẦU CHIẾN DỊCH GỬI NGAY</span>
          </>
        )}
      </button>

      <style jsx global>{`
        .custom-quill .ql-toolbar {
          background: #1e293b !important;
          border: none !important;
          border-bottom: 1px solid #334155 !important;
          padding: 12px !important;
        }
        .custom-quill .ql-container {
          background: transparent !important;
          border: none !important;
          height: 300px !important;
          color: white !important;
          font-family: inherit !important;
          font-size: 16px !important;
        }
        .custom-quill .ql-editor.ql-blank::before {
          color: #64748b !important;
          font-style: italic !important;
        }
        .custom-quill .ql-stroke { stroke: #94a3b8 !important; }
        .custom-quill .ql-fill { fill: #94a3b8 !important; }
        .custom-quill .ql-picker { color: #94a3b8 !important; }
      `}</style>
    </section>
  );
}
