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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">01</span>
          Cấu hình Email & Hệ thống
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Gmail cá nhân:</label>
          <input 
            value={emailUser} 
            onChange={e => setEmailUser(e.target.value)} 
            placeholder="example@gmail.com" 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Mật khẩu ứng dụng (App Password):</label>
          <input 
            type="password" 
            value={emailPass} 
            onChange={e => setEmailPass(e.target.value)} 
            placeholder="xxxx xxxx xxxx xxxx" 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-sm font-semibold text-slate-400 ml-1 flex justify-between">
          <span>Google Service Account JSON:</span>
          <span className="text-xs text-slate-500 italic">* Yêu cầu để kết nối Google Sheets</span>
        </label>
        <textarea 
          value={googleCredentials} 
          onChange={e => setGoogleCredentials(e.target.value)} 
          placeholder='{"type": "service_account", ...}'
          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-xs h-32 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          className="flex-1 min-w-[150px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          onClick={onVerify}
          disabled={isSending}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : '🔍 Kiểm tra kết nối'}
        </button>
        <button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
          onClick={onSave}
        >
          💾 Lưu cấu hình
        </button>
        <button 
          className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 border border-rose-500/50 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
          onClick={onDelete}
        >
          🗑️ Xóa
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2">
          💡 Tips nhanh:
        </h4>
        <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
          <li>Bật 2FA và tạo <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">App Password</a> 16 ký tự cho Gmail.</li>
          <li>Cấp quyền <b>Viewer</b> cho email Service Account trong file Sheet của bạn.</li>
          <li>Sử dụng JSON Service Account để hệ thống có thể chạy tự động 24/7.</li>
        </ul>
      </div>
    </section>
  );
}
