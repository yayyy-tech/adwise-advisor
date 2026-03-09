import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Drawer({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
          <motion.div initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-full bg-dark-surface border-l border-dark-border overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-border sticky top-0 bg-dark-surface z-10">
              <h3 className="font-body text-base font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="text-dark-muted hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
