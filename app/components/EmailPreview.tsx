'use client';

import { personalizeContent } from '@/lib/utils';

interface EmailPreviewProps {
  subject: string;
  template: string;
  rows: any[][];
  headers: string[];
  previewIndex: number;
  setPreviewIndex: (v: number) => void;
  fileInfo: { name: string } | null;
}

export default function EmailPreview({
  subject, template, rows, headers,
  previewIndex, setPreviewIndex,
  fileInfo
}: EmailPreviewProps) {
  const currentRow = rows[previewIndex] || [];
  const finalSubject = personalizeContent(subject, currentRow, headers) || '(Chưa có tiêu đề)';
  const finalHtml = personalizeContent(template, currentRow, headers) || '<p class="text-slate-500 italic">Nội dung sẽ hiển thị tại đây...</p>';

  return (
    <section className="glass-card flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">👁️</span>
          Xem trước thực tế
        </h3>
        
        {rows.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase">Dòng:</span>
            <input 
              type="number" 
              value={previewIndex + 1} 
              onChange={e => setPreviewIndex(Math.max(0, Math.min(rows.length - 1, Number(e.target.value) - 1)))}
              className="w-12 bg-transparent text-center text-white font-bold text-sm focus:outline-none"
            />
            <span className="text-slate-600">/</span>
            <span className="text-sm font-bold text-slate-400">{rows.length}</span>
          </div>
        )}
      </div>

      {/* Unified Email Window Simulation */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-700 overflow-hidden flex flex-col shadow-2xl">
        {/* Email App Toolbar */}
        <div className="bg-slate-100 p-3 flex items-center gap-2 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="mx-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mail Preview</div>
        </div>

        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg">M</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-base font-bold text-slate-900">Từ: Bạn &lt;me@gmail.com&gt;</h4>
                <span className="text-[10px] text-slate-400 font-medium">Vừa xong</span>
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                Đến: <span className="text-indigo-600 font-medium">{currentRow[headers.findIndex(h => h.toLowerCase().includes('email'))] || 'recipient@example.com'}</span>
              </div>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 leading-tight">
            {finalSubject}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
          <div 
            className="prose prose-slate max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        </div>

        {fileInfo && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-xl">📎</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-700">{fileInfo.name}</div>
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Tệp đính kèm</div>
            </div>
            <button className="text-[10px] font-bold text-indigo-600 px-3 py-1 bg-white border border-indigo-100 rounded-lg">Xem tệp</button>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          <b>Lưu ý:</b> Đây là giả lập hiển thị. Kết quả thực tế có thể thay đổi tùy thuộc vào hòm thư người nhận.
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </section>
  );
}
