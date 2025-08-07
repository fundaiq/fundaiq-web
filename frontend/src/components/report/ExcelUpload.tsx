'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ExcelUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 w-full min-w-0">
      {/* File input */}
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => {
          const selected = e.target.files?.[0] || null;
          setFile(selected);
        }}
        className="text-sm w-full sm:w-auto max-w-[200px] sm:max-w-none"
      />

      {/* Upload button */}
      <div className="w-full sm:w-auto">
        <Button
          className="bg-gray-600 text-white w-full sm:w-auto"
          onClick={() => file && onUpload(file)}
          disabled={!file}
        >
          Upload Excel
        </Button>
      </div>

      {/* File name preview */}
      {file?.name && (
        <span className="text-sm text-gray-500 truncate max-w-full sm:max-w-[200px]">
          📄 {file.name}
        </span>
      )}
    </div>
  );
}
