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
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
        Kết nối dữ liệu Google Sheet
      </h3>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Mã Spreadsheet ID:</label>
          <input 
            value={spreadsheetId} 
            onChange={e => setSpreadsheetId(e.target.value)} 
            placeholder="Ví dụ: 1Bv8..." 
            className="w-full text-sm"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên Tab (Tên trang tính):</label>
            <input 
              value={sheetName} 
              onChange={e => setSheetName(e.target.value)} 
              placeholder="Ví dụ: Sheet1" 
              className="w-full text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Bắt đầu quét từ hàng:</label>
            <input 
              type="number" 
              value={startRow} 
              onChange={e => setStartRow(Number(e.target.value))} 
              className="w-full text-sm"
            />
          </div>
        </div>
      </div>

      <button 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all mb-6 flex items-center justify-center gap-2"
        onClick={onConnect}
      >
        🔗 KẾT NỐI VÀ TẢI TIÊU ĐỀ CỘT
      </button>

      {headers.length > 0 ? (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cột chứa Email người nhận:</label>
              <select 
                value={emailColumn} 
                onChange={e => setEmailColumn(e.target.value)}
                className="w-full"
              >
                <option value="">-- Chọn cột --</option>
                {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cột ghi trạng thái gửi:</label>
              <select 
                value={statusColumn} 
                onChange={e => setStatusColumn(e.target.value)}
                className="w-full"
              >
                <option value="">-- Chọn cột --</option>
                {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Chèn nhanh biến vào nội dung (Click để chèn):</label>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, i) => h && (
                <button 
                  key={i} 
                  onClick={() => onInsertPlaceholder(h)} 
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                >
                  {`{{${h}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
          Vui lòng nhấn nút Kết nối để hiển thị danh sách tiêu đề cột.
        </div>
      )}
    </section>
  );
}
