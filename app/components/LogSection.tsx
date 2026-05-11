'use client';

interface Log {
  email: string;
  status: string;
  time?: string;
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
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📊</span>
          Tiến trình & Nhật ký
        </h3>
        {progress.total > 0 && (
          <span className="text-xs font-black bg-indigo-600 text-white px-2 py-1 rounded">
            {progress.current}/{progress.total}
          </span>
        )}
      </div>

      {progress.total > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-slate-400">Tiến độ tổng thể</span>
            <span className="text-indigo-400">{percent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
              <div className="text-[10px] font-black text-emerald-500 uppercase">Thành công</div>
              <div className="text-xl font-black text-white">{progress.success}</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
              <div className="text-[10px] font-black text-rose-500 uppercase">Thất bại</div>
              <div className="text-xl font-black text-white">{progress.failed}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-2">📥</div>
            <p className="text-sm italic">Chưa có hoạt động nào được ghi nhận</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center p-3 bg-slate-900/30 border border-slate-800 rounded-xl hover:bg-slate-900/50 transition-all group animate-in slide-in-from-right-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'XONG' || log.status === '✅ SENT' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                  log.status === 'BỎ QUA' ? 'bg-amber-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                }`}></div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{log.email}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded ${
                log.status === 'XONG' || log.status === '✅ SENT' ? 'bg-emerald-500/10 text-emerald-500' : 
                log.status === 'BỎ QUA' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {log.status}
              </span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </section>
  );
}
