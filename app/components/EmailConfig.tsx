'use client';

import { useState } from 'react';

interface EmailConfigProps {
  emailUser: string;
  setEmailUser: (v: string) => void;
  emailPass: string;
  setEmailPass: (v: string) => void;
  googleCredentials: string;
  setGoogleCredentials: (v: string) => void;
  onVerify: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSending: boolean;
}

export default function EmailConfig({
  emailUser, setEmailUser,
  emailPass, setEmailPass,
  googleCredentials, setGoogleCredentials,
  onVerify, onSave, onDelete,
  isSending
}: EmailConfigProps) {
  return (
    <section className="glass-card">
      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
        Cấu hình Email gửi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Gmail của bạn:</label>
          <input 
            value={emailUser} 
            onChange={e => setEmailUser(e.target.value)} 
            placeholder="ten@gmail.com" 
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Mật khẩu ứng dụng (App Password):</label>
          <input 
            type="password" 
            value={emailPass} 
            onChange={e => setEmailPass(e.target.value)} 
            placeholder="xxxx xxxx xxxx xxxx" 
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-sm font-bold text-slate-700">Google Service Account JSON (Dán nội dung tệp JSON vào đây):</label>
        <textarea 
          value={googleCredentials} 
          onChange={e => setGoogleCredentials(e.target.value)} 
          placeholder='{"type": "service_account", ...}'
          className="w-full h-32 font-mono text-xs resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
          onClick={onVerify}
          disabled={isSending}
        >
          {isSending ? 'Đang kiểm tra...' : '🔍 Kiểm tra & Xác thực'}
        </button>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all"
          onClick={onSave}
        >
          💾 Lưu cấu hình
        </button>
        <button 
          className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 px-6 rounded-lg transition-all"
          onClick={onDelete}
        >
          🗑️ Xóa sạch
        </button>
      </div>
    </section>
  );
}
