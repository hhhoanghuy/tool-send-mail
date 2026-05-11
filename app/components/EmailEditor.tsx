'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse flex items-center justify-center text-slate-400">Đang tải bộ soạn thảo...</div>
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
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
          Soạn thảo Nội dung
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'rich' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setEditorMode('rich')}
          >
            CHẾ ĐỘ WORD
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'html' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setEditorMode('html')}
          >
            CHẾ ĐỘ HTML
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Tiêu đề Email:</label>
          <input 
            ref={subjectRef}
            onFocus={() => setLastFocused('subject')}
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            placeholder="Ví dụ: Chào {{Tên}}, chúc bạn một ngày tốt lành!" 
            className="w-full text-base font-medium"
          />
        </div>

        <div className="space-y-2" onClick={() => setLastFocused('template')}>
          <label className="text-sm font-bold text-slate-700">Nội dung chi tiết:</label>
          <div className="editor-wrapper rounded-xl overflow-hidden border border-slate-200 bg-white min-h-[400px]">
            {editorMode === 'rich' ? (
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={template} 
                onChange={setTemplate} 
                modules={modules}
                placeholder="Nhập nội dung email..."
                style={{ height: '350px' }}
                className="light-quill"
              />
            ) : (
              <textarea 
                ref={htmlRef}
                onFocus={() => setLastFocused('template')}
                value={template} 
                onChange={e => setTemplate(e.target.value)} 
                className="w-full h-[400px] bg-slate-50 text-indigo-900 font-mono text-sm p-4 focus:outline-none resize-none"
                placeholder="Dán mã HTML vào đây..."
              />
            )}
          </div>
        </div>
      </div>

      <button 
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xl py-5 px-6 rounded-2xl transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
        onClick={onSend}
        disabled={isSending}
      >
        {isSending ? (
          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <span>🚀</span>
            <span>BẮT ĐẦU GỬI CHIẾN DỊCH</span>
          </>
        )}
      </button>

      <style jsx global>{`
        .light-quill .ql-toolbar {
          background: #f8fafc !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 10px !important;
        }
        .light-quill .ql-container {
          background: white !important;
          border: none !important;
          height: 350px !important;
          font-family: inherit !important;
          font-size: 16px !important;
        }
        .light-quill .ql-editor {
          min-height: 350px !important;
        }
      `}</style>
    </section>
  );
}
