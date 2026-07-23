import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
};

const bgColors = {
    success: 'bg-gray-900/90 dark:bg-gray-900/95 border-emerald-500/20',
    error: 'bg-gray-900/90 dark:bg-gray-900/95 border-red-500/20',
    info: 'bg-gray-900/90 dark:bg-gray-900/95 border-white/10',
};

const Toast = ({ message, type = 'info', onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl max-w-sm ${bgColors[type] || bgColors.info}`}
        >
            {icons[type] || icons.info}
            <span className="text-sm font-medium text-white/90 leading-tight">{message}</span>
            <button
                onClick={onDismiss}
                className="ml-2 text-white/30 hover:text-white/70 transition-colors shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
};

export default Toast;
