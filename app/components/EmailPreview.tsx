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
  const finalHtml = personalizeContent(template, currentRow, headers) || '<p class="text-slate-400 italic">Nội dung sẽ hiển thị tại đây...</p>';

  return (
    <section className="glass-card flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">👁️</span>
          Xem trước Email
        </h3>
        
        {rows.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Hàng:</span>
            <input 
              type="number" 
              value={previewIndex + 1} 
              onChange={e => setPreviewIndex(Math.max(0, Math.min(rows.length - 1, Number(e.target.value) - 1)))}
              className="w-10 bg-transparent text-center text-slate-900 font-bold text-sm focus:outline-none"
            />
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-600">{rows.length}</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-black">Me</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-slate-800">Bạn</h4>
                <span className="text-[10px] text-slate-400">Vừa xong</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Đến: <span className="text-indigo-600">{currentRow[headers.findIndex(h => h.toLowerCase().includes('email'))] || 'recipient@example.com'}</span>
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {finalSubject}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
          <div 
            className="prose prose-slate max-w-none text-slate-700 text-sm"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        </div>

        {fileInfo && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <div className="text-xl">📎</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-700">{fileInfo.name}</div>
              <div className="text-[10px] text-slate-400 uppercase">Tệp đính kèm</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </section>
  );
}
