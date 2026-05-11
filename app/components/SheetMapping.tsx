'use client';

interface SheetMappingProps {
  spreadsheetId: string;
  setSpreadsheetId: (v: string) => void;
  sheetName: string;
  setSheetName: (v: string) => void;
  startRow: number;
  setStartRow: (v: number) => void;
  headers: string[];
  emailColumn: string;
  setEmailColumn: (v: string) => void;
  statusColumn: string;
  setStatusColumn: (v: string) => void;
  onConnect: () => void;
  onInsertPlaceholder: (h: string) => void;
}

export default function SheetMapping({
  spreadsheetId, setSpreadsheetId,
  sheetName, setSheetName,
  startRow, setStartRow,
  headers,
  emailColumn, setEmailColumn,
  statusColumn, setStatusColumn,
  onConnect, onInsertPlaceholder
}: SheetMappingProps) {
  return (
    <section className="glass-card">
      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">02</span>
        Kết nối Dữ liệu Sheet
      </h3>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input 
            value={spreadsheetId} 
            onChange={e => setSpreadsheetId(e.target.value)} 
            placeholder="Spreadsheet ID (từ URL của Google Sheet)" 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="w-full md:w-40">
          <input 
            value={sheetName} 
            onChange={e => setSheetName(e.target.value)} 
            placeholder="Tên Tab" 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="w-full md:w-24">
          <input 
            type="number" 
            value={startRow} 
            onChange={e => setStartRow(Number(e.target.value))} 
            placeholder="Hàng bắt đầu" 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <button 
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-lg shadow-indigo-500/20"
        onClick={onConnect}
      >
        ⚡ Kết nối & Lấy dữ liệu tiêu đề
      </button>

      {headers.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Cột chứa Email:</label>
              <select 
                value={emailColumn} 
                onChange={e => setEmailColumn(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="">-- Chọn cột --</option>
                {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Cột ghi Trạng thái:</label>
              <select 
                value={statusColumn} 
                onChange={e => setStatusColumn(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="">-- Chọn cột --</option>
                {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-400 ml-1">Click để chèn biến nhanh vào nội dung:</label>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, i) => h && (
                <button 
                  key={i} 
                  onClick={() => onInsertPlaceholder(h)} 
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95"
                >
                  {`{{${h}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
