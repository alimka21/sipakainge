import React from 'react';

interface EmptyDataNoticeProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyDataNotice: React.FC<EmptyDataNoticeProps> = ({ title, message, actionLabel, onAction }) => (
  <div className="px-6 lg:px-10 py-10">
    <div className="mx-auto max-w-lg text-center p-10 border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
      <span className="material-symbols-outlined text-slate-300 text-5xl block">group_off</span>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition"
        >
          <span className="material-symbols-outlined text-sm">manage_accounts</span>
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);
