'use client';

interface Log {
  email: string;
  status: string;
}

interface LogSectionProps {
  logs: Log[];
  progress: {
    current: number;
    total: number;
    success: number;
    failed: number;
  };
}

export default function LogSection({ logs, progress }: LogSectionProps) {
  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <section className="glass-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">📊</span>
          Tiến trình & Nhật ký
        </h3>
        {progress.total > 0 && (
          <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
            {progress.current} / {progress.total}
          </span>
        )}
      </div>

      {progress.total > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Tiến độ</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Thành công</div>
              <div className="text-lg font-black text-slate-800">{progress.success}</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
              <div className="text-[10px] font-bold text-rose-600 uppercase">Thất bại</div>
              <div className="text-lg font-black text-slate-800">{progress.failed}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm italic">Chưa có hoạt động</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl"
            >
              <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">{log.email}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                log.status === 'XONG' || log.status === '✅ SENT' ? 'bg-emerald-100 text-emerald-700' : 
                log.status === 'BỎ QUA' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {log.status}
              </span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </section>
  );
}
