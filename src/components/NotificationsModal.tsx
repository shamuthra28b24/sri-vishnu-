import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Clock,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onClearAll,
  onNavigate
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const filtered = notifications.filter((n) => {
    if (filterPriority !== 'ALL' && n.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getPriorityIcon = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Notification Center</h3>
              <p className="text-xs text-slate-400">
                Approvals, Expiry Warnings, Security Alerts, and File Share Notices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-2">✕</button>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Priority:</span>
          {['ALL', 'Critical', 'Warning', 'Information', 'Success'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                filterPriority === p ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No notifications in this priority category.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 transition ${
                  item.isRead ? 'bg-slate-950/40 border-slate-800/80 opacity-75' : 'bg-slate-950 border-slate-700/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getPriorityIcon(item.priority)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{item.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.linkView && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate(item.linkView!);
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                      title="Navigate"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
