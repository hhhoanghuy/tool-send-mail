'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { personalizeContent } from '@/lib/utils';

// Import components
import EmailConfig from './components/EmailConfig';
import SheetMapping from './components/SheetMapping';
import EmailEditor from './components/EmailEditor';
import EmailPreview from './components/EmailPreview';
import LogSection from './components/LogSection';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');
  
  // States
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [emailColumn, setEmailColumn] = useState('');
  const [statusColumn, setStatusColumn] = useState('');
  const [skipSent, setSkipSent] = useState(true);
  const [startRow, setStartRow] = useState(2);
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string, data: string } | null>(null);
  const [emailUser, setEmailUser] = useState('');
  const [emailPass, setEmailPass] = useState('');
  const [googleCredentials, setGoogleCredentials] = useState('');
  const [autoPilot, setAutoPilot] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  
  // Refs
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
    // 1. Lấy từ LocalStorage
    const localKeys = ['spreadsheetId', 'sheetName', 'emailColumn', 'statusColumn', 'subject', 'template', 'startRow', 'emailUser', 'emailPass', 'googleCredentials'];
    localKeys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        switch(key) {
          case 'spreadsheetId': setSpreadsheetId(val); break;
          case 'sheetName': setSheetName(val); break;
          case 'emailColumn': setEmailColumn(val); break;
          case 'statusColumn': setStatusColumn(val); break;
          case 'subject': setSubject(val); break;
          case 'template': setTemplate(val); break;
          case 'startRow': setStartRow(Number(val)); break;
          case 'emailUser': setEmailUser(val); break;
          case 'emailPass': setEmailPass(val); break;
          case 'googleCredentials': setGoogleCredentials(val); break;
        }
      }
    });

    const localHeaders = localStorage.getItem('headers');
    if (localHeaders) {
      try { setHeaders(JSON.parse(localHeaders)); } catch (e) {}
    }

    // 2. Lấy từ Server
    fetch('/api/config').then(res => res.json()).then(data => {
      if (!localStorage.getItem('spreadsheetId') && data.spreadsheetId) setSpreadsheetId(data.spreadsheetId);
      if (!localStorage.getItem('sheetName') && data.sheetName) setSheetName(data.sheetName);
      if (!localStorage.getItem('emailColumn') && data.emailColumn) setEmailColumn(data.emailColumn);
      if (!localStorage.getItem('statusColumn') && data.statusColumn) setStatusColumn(data.statusColumn);
      if (!localStorage.getItem('subject') && data.subject) setSubject(data.subject);
      if (!localStorage.getItem('template') && data.template) setTemplate(data.template);
      if (!localStorage.getItem('startRow') && data.startRow) setStartRow(data.startRow);
      if (!localStorage.getItem('emailUser') && data.emailUser) setEmailUser(data.emailUser);
      if (!localStorage.getItem('emailPass') && data.emailPass) setEmailPass(data.emailPass);
      if (!localStorage.getItem('googleCredentials') && data.googleCredentials) setGoogleCredentials(data.googleCredentials);
      if (data.fileInfo) setFileInfo(data.fileInfo);
      if (!localStorage.getItem('headers') && data.headers) setHeaders(data.headers);
    });
  }, []);

  const insertPlaceholder = (header: string) => {
    const placeholder = `{{${header}}}`;
    if (lastFocused === 'subject' && subjectRef.current) {
      const start = subjectRef.current.selectionStart || 0;
      const end = subjectRef.current.selectionEnd || 0;
      const newValue = subject.substring(0, start) + placeholder + subject.substring(end);
      setSubject(newValue);
    } else {
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
    alert('✅ Đã lưu cấu hình thành công!');
  };

  const deleteConfig = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sạch cấu hình không?')) return;
    localStorage.clear();
    setSpreadsheetId(''); setSheetName(''); setHeaders([]);
    setSubject(''); setTemplate(''); setStartRow(2);
    setEmailUser(''); setEmailPass(''); setGoogleCredentials('');
    alert('🗑️ Đã xóa toàn bộ cấu hình!');
  };

  const verifyConnection = async () => {
    if (!emailUser || !emailPass) return alert('Hãy nhập Email và App Password!');
    setIsSending(true);
    try {
      const res = await fetch('/api/config/verify', {
        method: 'POST',
        body: JSON.stringify({ emailUser, emailPass, googleCredentials }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert('🚀 Kết nối thành công! Kiểm tra hòm thư của bạn để thấy email test.');
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (err: any) {
      alert('❌ Lỗi kết nối Server: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const connectToSheet = async () => {
    if (!spreadsheetId) return alert('Hãy nhập Spreadsheet ID!');
    try {
      const res = await fetch('/api/sheets/headers', {
        method: 'POST',
        body: JSON.stringify({ spreadsheetId, range: sheetName, googleCredentials }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.headers) {
        setHeaders(data.headers);
        localStorage.setItem('headers', JSON.stringify(data.headers));
        
        const dataRes = await fetch('/api/sheets/data', {
          method: 'POST',
          body: JSON.stringify({ spreadsheetId, range: sheetName, startRow: 2, googleCredentials }),
          headers: { 'Content-Type': 'application/json' }
        });
        const dataJson = await dataRes.json();
        if (dataJson.rows) setRows(dataJson.rows);

        alert('✅ Kết nối Sheet thành công! Hãy chọn cột Email bên dưới.');
      } else {
        alert('❌ Lỗi: ' + (data.error || 'Không thể lấy dữ liệu'));
      }
    } catch (err: any) {
      alert('❌ Lỗi kết nối: ' + err.message);
    }
  };

  const startManualCampaign = async () => {
    if (!emailColumn) return alert('Hãy chọn cột Email trước!');
    if (!confirm(`Hệ thống sẽ gửi mail cho hàng loạt dữ liệu từ hàng ${startRow}. Tiếp tục?`)) return;
    
    setIsSending(true); setLogs([]);
    try {
      const res = await fetch('/api/sheets/data', { 
        method: 'POST', 
        body: JSON.stringify({ spreadsheetId, range: sheetName, startRow, googleCredentials }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      const data = await res.json();
      const fetchedRows = data.rows || [];
      
      if (fetchedRows.length === 0) {
        alert('ℹ️ Không tìm thấy hàng dữ liệu nào để gửi.');
        setIsSending(false);
        return;
      }

      setRows(fetchedRows);
      setProgress({ current: 0, total: fetchedRows.length, success: 0, failed: 0 });

      const emailIdx = headers.indexOf(emailColumn);
      const statusIdx = headers.indexOf(statusColumn);

      for (let i = 0; i < fetchedRows.length; i++) {
        const row = fetchedRows[i];
        const recipient = row[emailIdx];

        if (!recipient || !recipient.includes('@')) {
          setProgress(p => ({ ...p, current: i + 1 }));
          continue;
        }
        
        if (skipSent && statusIdx !== -1 && row[statusIdx]?.includes('SENT')) {
          setProgress(p => ({ ...p, current: i + 1 }));
          setLogs(prev => [{ email: recipient, status: 'BỎ QUA' }, ...prev.slice(0, 49)]);
          continue;
        }

        const finalSubject = personalizeContent(subject, row, headers);
        const finalHtml = personalizeContent(template, row, headers);

        try {
          const sendRes = await fetch('/api/send', { 
            method: 'POST', 
            body: JSON.stringify({ 
              recipient, 
              subject: finalSubject, 
              template: finalHtml, 
              fileData: fileInfo?.data, 
              fileName: fileInfo?.name,
              emailUser,
              emailPass
            }), 
            headers: { 'Content-Type': 'application/json' } 
          });
          const result = await sendRes.json();

          if (statusColumn && statusIdx !== -1) {
            await fetch('/api/sheets/update', { 
              method: 'POST', 
              body: JSON.stringify({ spreadsheetId, range: sheetName, row: Number(startRow) + i, column: statusIdx, status: result.success ? '✅ SENT' : '❌ FAIL', googleCredentials }), 
              headers: { 'Content-Type': 'application/json' } 
            });
          }

          setProgress(p => ({ ...p, current: i + 1, success: result.success ? p.success + 1 : p.success, failed: result.success ? p.failed : p.failed + 1 }));
          setLogs(prev => [{ email: recipient, status: result.success ? 'XONG' : 'LỖI' }, ...prev.slice(0, 49)]);
        } catch (e) {
          setProgress(p => ({ ...p, current: i + 1, failed: p.failed + 1 }));
          setLogs(prev => [{ email: recipient, status: 'LỖI' }, ...prev.slice(0, 49)]);
        }
      }
      alert('🎉 Đã hoàn tất gửi toàn bộ email!');
    } catch (err: any) { 
      alert('❌ Lỗi: ' + err.message); 
    } finally { 
      setIsSending(false); 
    }
  };

  if (!mounted) return null;

  return (
    <main className="container pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl">Mail</span> 
            Automator Pro
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Hệ thống gửi Email Marketing chuyên nghiệp từ Google Sheets
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${autoPilot ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
            onClick={() => saveConfig(!autoPilot)}
          >
            {autoPilot ? '🛑 Tắt AutoPilot' : '🚀 Bật AutoPilot'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Areas */}
        <div className="lg:col-span-7 space-y-8">
          <EmailConfig 
            emailUser={emailUser} setEmailUser={setEmailUser}
            emailPass={emailPass} setEmailPass={setEmailPass}
            googleCredentials={googleCredentials} setGoogleCredentials={setGoogleCredentials}
            onVerify={verifyConnection}
            onSave={() => saveConfig(false)}
            onDelete={deleteConfig}
            isSending={isSending}
          />

          <SheetMapping 
            spreadsheetId={spreadsheetId} setSpreadsheetId={setSpreadsheetId}
            sheetName={sheetName} setSheetName={setSheetName}
            startRow={startRow} setStartRow={setStartRow}
            headers={headers}
            emailColumn={emailColumn} setEmailColumn={setEmailColumn}
            statusColumn={statusColumn} setStatusColumn={setStatusColumn}
            onConnect={connectToSheet}
            onInsertPlaceholder={insertPlaceholder}
          />

          <EmailEditor 
            editorMode={editorMode} setEditorMode={setEditorMode}
            subject={subject} setSubject={setSubject}
            template={template} setTemplate={setTemplate}
            quillRef={quillRef} htmlRef={htmlRef} subjectRef={subjectRef}
            setLastFocused={setLastFocused}
            modules={modules}
            onSend={startManualCampaign}
            isSending={isSending}
          />
        </div>

        {/* Right: Preview & Stats */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-8">
            <EmailPreview 
              subject={subject}
              template={template}
              rows={rows}
              headers={headers}
              previewIndex={previewIndex}
              setPreviewIndex={setPreviewIndex}
              fileInfo={fileInfo}
            />

            <LogSection 
              logs={logs}
              progress={progress}
            />
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center text-slate-400 text-xs font-medium">
        Build for Productivity. v3.0.0
      </footer>
    </main>
  );
}
