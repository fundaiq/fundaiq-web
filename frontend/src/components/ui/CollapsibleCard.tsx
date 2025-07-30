'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 font-semibold text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-t-lg"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}
