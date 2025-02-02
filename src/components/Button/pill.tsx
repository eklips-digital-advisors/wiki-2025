import React from 'react';
import { Plus, X } from 'lucide-react';

interface PillProps {
  active?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

const Pill: React.FC<PillProps> = ({ active = false, children, onClick }) => {
  return (
    <button
      role={'button'}
      aria-label={'Toggle columns'}
      onClick={onClick}
      className={`border border-zinc-300 rounded-sm text-sm flex gap-1 items-center px-1 py-[2px] cursor-pointer hover:bg-zinc-200/60 ${active ? 'bg-zinc-200/80' : 'bg-white'}`}
    >
      {active ? <X className="w-4" /> : <Plus className="w-4" />}
      {children}
    </button>
  );
};

export default Pill;
