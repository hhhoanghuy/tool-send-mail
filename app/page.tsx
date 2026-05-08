'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ComponentWithNoSSR = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>Đang tải bộ soạn thảo...</div>
}) as any;

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [emailColumn, setEmailColumn] = useState('');
  const [statusColumn, setStatusColumn] = useState('');
  const [skipSent, setSkipSent] = useState(true);
  const [startRow, setStartRow] = useState(5);
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string, data: string } | null>(null);
  const [emailUser, setEmailUser] = useState('');
  const [emailPass, setEmailPass] = useState('');
  const [googleCredentials, setGoogleCredentials] = useState('');
  const [autoPilot, setAutoPilot] = useState(false);
  const [nextScanIn, setNextScanIn] = useState(300);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  
  const subjectRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<any>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'template'>('template');

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'color': []}, {'background': []}],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'align': []}],
      ['link', 'clean']
    ],
  }), []);

  useEffect(() => {
    setMounted(true);
    // 1. Lấy từ trình duyệt trước (LocalStorage) để người dùng thấy dữ liệu của mình ngay
    const localData: any = {};
    ['spreadsheetId', 'sheetName', 'emailColumn', 'statusColumn', 'subject', 'template', 'startRow', 'emailUser', 'emailPass', 'googleCredentials'].forEach(key => {
      localData[key] = localStorage.getItem(key);
    });

    if (localData.spreadsheetId) setSpreadsheetId(localData.spreadsheetId);
    if (localData.sheetName) setSheetName(localData.sheetName);
    if (localData.emailColumn) setEmailColumn(localData.emailColumn);
    if (localData.statusColumn) setStatusColumn(localData.statusColumn);
    if (localData.subject) setSubject(localData.subject);
    if (localData.template) setTemplate(localData.template);
    if (localData.startRow) setStartRow(Number(localData.startRow));
    if (localData.emailUser) setEmailUser(localData.emailUser);
    if (localData.emailPass) setEmailPass(localData.emailPass);
    if (localData.googleCredentials) setGoogleCredentials(localData.googleCredentials);
    
    const localHeaders = localStorage.getItem('headers');
    if (localHeaders) {
      try { setHeaders(JSON.parse(localHeaders)); } catch (e) {}
    }

    // 2. Sau đó mới hỏi Server để cập nhật những gì thiếu hoặc mới nhất
    fetch('/api/config').then(res => res.json()).then(data => {
      if (data.spreadsheetId && !localData.spreadsheetId) setSpreadsheetId(data.spreadsheetId);
      if (data.sheetName && !localData.sheetName) setSheetName(data.sheetName);
      if (data.emailColumn && !localData.emailColumn) setEmailColumn(data.emailColumn);
      if (data.statusColumn && !localData.statusColumn) setStatusColumn(data.statusColumn);
      if (data.subject && !localData.subject) setSubject(data.subject);
      if (data.template && !localData.template) setTemplate(data.template);
      if (data.startRow && !localData.startRow) setStartRow(data.startRow);
      if (data.emailUser && !localData.emailUser) setEmailUser(data.emailUser);
      if (data.emailPass && !localData.emailPass) setEmailPass(data.emailPass);
      if (data.googleCredentials && !localData.googleCredentials) setGoogleCredentials(data.googleCredentials);
      if (data.fileInfo) setFileInfo(data.fileInfo);
      if (data.headers && !localHeaders) setHeaders(data.headers);
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (autoPilot && !isSending) {
      timer = setInterval(() => {
        setNextScanIn(prev => {
          if (prev <= 1) { triggerAutoScan(); return 300; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [autoPilot, isSending]);

  const triggerAutoScan = async () => {
    const res = await fetch('/api/cron');
    const data = await res.json();
    setLogs(prev => [{ email: 'HỆ THỐNG', status: data.message || 'Xong' }, ...prev.slice(0, 9)]);
  };

  const insertPlaceholder = (header: string) => {
    const placeholder = `{{${header}}}`;
    if (lastFocused === 'subject' && subjectRef.current) {
      const start = subjectRef.current.selectionStart || 0;
      const end = subjectRef.current.selectionEnd || 0;
      const newValue = subject.substring(0, start) + placeholder + subject.substring(end);
      setSubject(newValue);
    } else if (lastFocused === 'template') {
      if (editorMode === 'rich' && quillRef.current) {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        const index = range ? range.index : quill.getLength() - 1;
        quill.insertText(index, placeholder);
      } else if (editorMode === 'html' && htmlRef.current) {
        const start = htmlRef.current.selectionStart || 0;
        const end = htmlRef.current.selectionEnd || 0;
        const newValue = template.substring(0, start) + placeholder + template.substring(end);
        setTemplate(newValue);
      }
    }
  };

  const saveConfig = async (isAuto: boolean) => {
    const config = { spreadsheetId, sheetName, emailColumn, statusColumn, subject, template, startRow, autoPilot: isAuto, fileInfo, emailUser, emailPass, googleCredentials };
    await fetch('/api/config', { method: 'POST', body: JSON.stringify(config), headers: { 'Content-Type': 'application/json' } });
    
    // Lưu toàn bộ vào trình duyệt
    localStorage.setItem('spreadsheetId', spreadsheetId);
    localStorage.setItem('sheetName', sheetName);
    localStorage.setItem('emailColumn', emailColumn);
    localStorage.setItem('statusColumn', statusColumn);
    localStorage.setItem('subject', subject);
    localStorage.setItem('template', template);
    localStorage.setItem('startRow', String(startRow));
    localStorage.setItem('emailUser', emailUser);
    localStorage.setItem('emailPass', emailPass);
    localStorage.setItem('googleCredentials', googleCredentials);
    localStorage.setItem('headers', JSON.stringify(headers));
    
    setAutoPilot(isAuto);
    alert(isAuto ? '✅ Đã bật chế độ gửi Tự động!' : '✅ Đã kết nối & Lưu cấu hình thành công!');
  };

  const deleteConfig = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sạch cấu hình không?')) return;
    
    const emptyConfig = { spreadsheetId: '', sheetName: '', emailColumn: '', statusColumn: '', subject: '', template: '', startRow: 5, autoPilot: false, fileInfo: null, emailUser: '', emailPass: '', googleCredentials: '' };
    await fetch('/api/config', { method: 'POST', body: JSON.stringify(emptyConfig), headers: { 'Content-Type': 'application/json' } });
    
    // Xóa sạch LocalStorage
    localStorage.clear();
    
    setEmailUser(''); setEmailPass(''); setGoogleCredentials('');
    setSpreadsheetId(''); setSheetName(''); setHeaders([]);
    setSubject(''); setTemplate(''); setStartRow(5);
    alert('🗑️ Đã xóa toàn bộ cấu hình!');
  };

  const verifyConnection = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/config/verify', {
        method: 'POST',
        body: JSON.stringify({ emailUser, emailPass, googleCredentials }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert('🚀 Tuyệt vời! Cấu hình của bạn hoàn toàn chính xác.\nHệ thống đã gửi 1 email test đến: ' + emailUser);
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('❌ Không thể kết nối với Server!');
    } finally {
      setIsSending(false);
    }
  };

  const connectToSheet = async () => {
    try {
      const res = await fetch('/api/sheets/headers', {
        method: 'POST',
        body: JSON.stringify({ spreadsheetId, range: sheetName, googleCredentials }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.headers) {
        setHeaders(data.headers);
        // Lưu ngay ID và Tab vào trình duyệt để F5 không mất
        localStorage.setItem('spreadsheetId', spreadsheetId);
        localStorage.setItem('sheetName', sheetName);
        localStorage.setItem('headers', JSON.stringify(data.headers));
        alert('✅ Đã kết nối Sheet thành công!');
      } else {
        alert('❌ Lỗi: ' + (data.error || 'Không thể lấy dữ liệu tiêu đề'));
      }
    } catch (err) {
      alert('❌ Lỗi kết nối đến máy chủ!');
    }
  };

  const startManualCampaign = async () => {
    if (!emailColumn) return alert('Chọn cột Email!');
    setIsSending(true); setLogs([]);
    try {
      const res = await fetch('/api/sheets/data', { 
        method: 'POST', 
        body: JSON.stringify({ spreadsheetId, range: sheetName, startRow, googleCredentials }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      const data = await res.json();
      const rows = data.rows || [];
      setProgress({ current: 0, total: rows.length, success: 0, failed: 0 });

      for (let i = 0; i < rows.length; i++) {
        const emailIdx = headers.indexOf(emailColumn);
        const statusIdx = headers.indexOf(statusColumn);
        if (!row[emailIdx]) continue;
        if (skipSent && statusIdx !== -1 && row[statusIdx]?.includes('SENT')) {
          setProgress(p => ({ ...p, current: i + 1 }));
          setLogs(prev => [{ email: row[emailIdx], status: 'BỎ QUA' }, ...prev.slice(0, 9)]);
          continue;
        }
        const slugify = (str: string) => {
          return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
            .replace(/[^a-z0-9]/g, '');
        };

        const personalize = (text: string) => {
          return text.replace(/{{([\s\S]*?)}}/g, (match, p1) => {
            const cleanP1 = p1.replace(/<[^>]*>?/gm, '');
            const target = slugify(cleanP1);
            const colIdx = headers.findIndex(h => slugify(h) === target);
            return colIdx !== -1 && row[colIdx] !== undefined ? String(row[colIdx]) : match;
          });
        };

        const finalSubject = personalize(subject);
        const finalHtml = personalize(template);

        const sendRes = await fetch('/api/send', { 
          method: 'POST', 
          body: JSON.stringify({ 
            recipient: row[headers.indexOf(emailColumn)], 
            subject: finalSubject, 
            template: finalHtml, 
            data: {}, // Đã ánh xạ xong nên không cần data nữa
            fileData: fileInfo?.data, 
            fileName: fileInfo?.name,
            emailUser,
            emailPass
          }), 
          headers: { 'Content-Type': 'application/json' } 
        });
        const result = await sendRes.json();
        if (statusColumn) {
          const colIndex = headers.indexOf(statusColumn);
          await fetch('/api/sheets/update', { 
            method: 'POST', 
            body: JSON.stringify({ spreadsheetId, range: sheetName, row: Number(startRow) + i, column: colIndex, status: result.success ? '✅ SENT' : '❌ FAIL', googleCredentials }), 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        setProgress(p => ({ ...p, current: i + 1, success: result.success ? p.success + 1 : p.success, failed: result.success ? p.failed : p.failed + 1 }));
        setLogs(prev => [{ email: row[emailIdx], status: result.success ? 'XONG' : 'LỖI' }, ...prev.slice(0, 9)]);
      }
    } catch (err) { alert('Lỗi!'); } finally { setIsSending(false); }
  };

  return (
    <main className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem', background: '#f0f4f8', minHeight: '100vh' }}>
      <style>{`
        .ql-container { background: white !important; color: #333 !important; font-size: 16px !important; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .ql-toolbar { background: #f8fafc !important; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1); padding: 1.5rem; }
        .btn-primary { background: #6366f1; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); }
        .toggle-btn { padding: 8px 16px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
        .toggle-btn.active { background: #6366f1; color: white; border-color: #6366f1; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border 0.2s; background: white; color: #333; }
        input:focus { border-color: #6366f1; }
      `}</style>

      <header className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: autoPilot ? '4px solid #22c55e' : '4px solid #6366f1' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#1e293b' }}>Mail Automator <span style={{ color: '#6366f1' }}>Pro</span></h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{autoPilot ? `🟢 TỰ ĐỘNG: Quét sau ${Math.floor(nextScanIn/60)}p ${nextScanIn%60}s` : '⚪ Chế độ thủ công'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ background: '#94a3b8' }} onClick={() => saveConfig(false)}>Lưu cấu hình</button>
          <button className="btn-primary" style={{ background: autoPilot ? '#ef4444' : '#22c55e' }} onClick={() => saveConfig(!autoPilot)}>
            {autoPilot ? 'Tắt Tự động' : 'Bật Tự động'}
          </button>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', display: 'grid' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: '#1e293b' }}>0. Cấu hình Email gửi</h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.8rem', display: 'grid' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Email Gmail:</label>
                <input value={emailUser} onChange={e => setEmailUser(e.target.value)} placeholder="example@gmail.com" style={{ marginTop: '5px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Mật khẩu ứng dụng:</label>
                <input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" style={{ marginTop: '5px' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>* Lưu ý: Sử dụng App Password của Google. Nếu để trống sẽ dùng mặc định trong .env</p>
            
            <div style={{ marginTop: '1.2rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Google Service Account JSON (Dán nội dung file .json):</label>
              <textarea 
                value={googleCredentials} 
                onChange={e => setGoogleCredentials(e.target.value)} 
                placeholder='{"type": "service_account", ...}'
                style={{ marginTop: '5px', height: '80px', fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1, background: '#10b981' }} onClick={verifyConnection} disabled={isSending}>
                {isSending ? 'Đang kiểm tra...' : '🔍 Kiểm tra & Xác thực'}
              </button>
              <button className="btn-primary" style={{ flex: 1, background: '#6366f1' }} onClick={() => saveConfig(false)}>
                🔗 Kết nối & Lưu
              </button>
              <button className="btn-primary" style={{ flex: 0.5, background: '#ef4444' }} onClick={deleteConfig}>
                🗑️ Xóa
              </button>
            </div>

            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginTop: '1.2rem', border: '1px solid #bae6fd' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                📖 Hướng dẫn cấu hình 5 bước nhanh:
              </p>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                  <span style={{ minWidth: '20px', height: '20px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
                  <span>Tạo Project & bật <b>Google Sheets API</b> tại <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 600 }}>Google Cloud</a>.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                  <span style={{ minWidth: '20px', height: '20px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
                  <span>Tạo <b>Service Account</b>, tải file JSON và dán nội dung vào ô trên.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                  <span style={{ minWidth: '20px', height: '20px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
                  <span><b>QUAN TRỌNG:</b> Share quyền <b>Viewer</b> file Sheet cho email của Service Account.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                  <span style={{ minWidth: '20px', height: '20px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>4</span>
                  <span>Lấy <b>App Password</b> Gmail (16 ký tự) tại <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 600 }}>đây</a>.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                  <span style={{ minWidth: '20px', height: '20px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>5</span>
                  <span>Điền thông tin, nhấn <b>Kiểm tra & Xác thực</b> để hệ thống tự động kiểm tra lỗi.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: '#1e293b' }}>1. Kết nối & Ánh xạ cột</h3>
            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '0.8rem', display: 'grid' }}>
              <input value={spreadsheetId} onChange={e => setSpreadsheetId(e.target.value)} placeholder="Spreadsheet ID" />
              <input value={sheetName} onChange={e => setSheetName(e.target.value)} placeholder="Tab Name" />
              <input type="number" value={startRow} onChange={e => setStartRow(Number(e.target.value))} placeholder="Hàng đầu" />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={connectToSheet}>Kết nối & Lấy dữ liệu</button>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.8rem', display: 'grid', marginTop: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cột chứa Email:</label>
                <select value={emailColumn} onChange={e => setEmailColumn(e.target.value)} style={{ marginTop: '5px' }}>
                  <option value="">-- Chọn cột --</option>
                  {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cột ghi Trạng thái:</label>
                <select value={statusColumn} onChange={e => setStatusColumn(e.target.value)} style={{ marginTop: '5px' }}>
                  <option value="">-- Chọn cột --</option>
                  {headers.map((h, i) => h && <option key={i} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.2rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Nhấn để chèn biến nhanh:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {headers.map((h, i) => h && <button key={i} onClick={() => insertPlaceholder(h)} style={{ cursor: 'pointer', border: '1px solid #6366f1', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 500 }}>{h}</button>)}
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>2. Soạn thảo Email</h3>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                <button className={`toggle-btn ${editorMode === 'rich' ? 'active' : ''}`} onClick={() => setEditorMode('rich')}>Soạn thảo (Word)</button>
                <button className={`toggle-btn ${editorMode === 'html' ? 'active' : ''}`} onClick={() => setEditorMode('html')}>Mã HTML</button>
              </div>
            </div>

            <input 
              ref={subjectRef} 
              onFocus={() => setLastFocused('subject')}
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Tiêu đề email..." 
              style={{ marginBottom: '1rem', fontWeight: 600 }} 
            />
            
            <div className="quill-container" onClick={() => setLastFocused('template')} style={{ marginBottom: '1rem' }}>
              {editorMode === 'rich' ? (
                mounted ? (
                  <ComponentWithNoSSR 
                    ref={quillRef}
                    theme="snow" 
                    value={template} 
                    onChange={setTemplate} 
                    modules={modules}
                    placeholder="Nội dung email..."
                    style={{ height: '300px', marginBottom: '45px' }}
                  />
                ) : (
                  <div style={{ height: '345px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}></div>
                )
              ) : (
                <textarea 
                  ref={htmlRef}
                  onFocus={() => setLastFocused('template')}
                  value={template} 
                  onChange={e => setTemplate(e.target.value)} 
                  style={{ height: '345px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                  placeholder="Nhập mã HTML tại đây..."
                />
              )}
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="file" style={{ border: 'none', background: 'none', padding: 0 }} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setFileInfo({ name: file.name, data: event.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                }} />
                {fileInfo && <button onClick={() => setFileInfo(null)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>XÓA FILE</button>}
              </div>
              {fileInfo && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 }}>📎 Đang đính kèm: {fileInfo.name}</div>}
            </div>
            <button className="btn-primary" style={{ width: '100%', background: '#10b981', marginTop: '1.5rem', height: '50px', fontSize: '1rem' }} onClick={startManualCampaign} disabled={isSending}>🚀 GỬI THỦ CÔNG NGAY</button>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>XEM TRƯỚC (PREVIEW)</div>
            <div style={{ padding: '25px', background: '#e2e8f0', display: 'flex', justifyContent: 'center', minHeight: '600px' }}>
              <div style={{ width: '100%', maxWidth: '550px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Tiêu đề:</div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{subject.replace(/{{(.*?)}}/g, '[$1]') || '...'}</div>
                </div>
                <div 
                  className="preview-content"
                  style={{ padding: '25px', fontSize: '1rem', color: '#334155', minHeight: '400px', maxHeight: '600px', overflowY: 'auto', lineHeight: '1.6', background: 'white' }} 
                  dangerouslySetInnerHTML={{ __html: template.replace(/{{(.*?)}}/g, '<b style="color:#6366f1">[$1]</b>') || '<i style="color:#cbd5e1">Nội dung sẽ hiển thị ở đây...</i>' }} 
                />
                {fileInfo && <div style={{ padding: '12px 25px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', color: '#6366f1', fontSize: '0.85rem', fontWeight: 600 }}>📎 File đính kèm: {fileInfo.name}</div>}
              </div>
            </div>
          </section>

          <section className="glass-card" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e293b' }}>Nhật ký hoạt động</h3>
            <div>
              {logs.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Chưa có hoạt động nào...</p>}
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569', fontWeight: 500 }}>{log.email}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    background: log.status.toLowerCase().includes('lỗi') || log.status.toLowerCase().includes('fail') ? '#fee2e2' : '#dcfce7',
                    color: log.status.toLowerCase().includes('lỗi') || log.status.toLowerCase().includes('fail') ? '#ef4444' : '#16a34a'
                  }}>{log.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
