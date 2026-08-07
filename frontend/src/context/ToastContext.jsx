import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((message) => show(message, 'success'), [show]);
  const error = useCallback((message) => show(message, 'error'), [show]);
  const warning = useCallback((message) => show(message, 'warning'), [show]);
  const info = useCallback((message) => show(message, 'info'), [show]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 shadow-emerald-500/5';
      case 'error':
        return 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-rose-500/5';
      case 'warning':
        return 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 shadow-amber-500/5';
      default:
        return 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 shadow-blue-500/5';
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, show }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start space-x-3 p-4 rounded-2xl border shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 ${getBgColor(
              toast.type
            )}`}
            style={{
              animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {toast.message}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
