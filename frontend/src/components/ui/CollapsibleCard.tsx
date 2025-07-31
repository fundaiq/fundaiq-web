'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className=" border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 sm:px-4 sm:py-3 font-medium sm:font-semibold text-left text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-t-lg text-sm sm:text-base"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {open && (
        <div className="px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base">
          {children}
        </div>
      )}
    </div>
  );
}
