import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { BackendDataset } from '../types/zenodo';
import { generateBibTeX, generateRIS, generateEndNote, generateCSLJSON, generateRefWorks } from '../lib/citation';
import { BookOpenIcon, ClipboardIcon, CheckIcon, DownloadIcon } from 'lucide-react';

interface CitationExportProps {
  dataset: BackendDataset;
}

type CitationFormat = 'bibtex' | 'ris' | 'endnote' | 'csljson' | 'refworks';

const LABELS: Record<CitationFormat, { label: string; ext: string; mime: string }> = {
  bibtex: { label: 'BibTeX', ext: 'bib', mime: 'application/x-bibtex' },
  ris: { label: 'RIS', ext: 'ris', mime: 'application/x-research-info-systems' },
  endnote: { label: 'EndNote', ext: 'enw', mime: 'application/x-endnote-refer' },
  csljson: { label: 'CSL JSON', ext: 'json', mime: 'application/vnd.citationstyles.csl+json' },
  refworks: { label: 'RefWorks', ext: 'rwk', mime: 'text/plain' }
};

const GENERATORS: Record<CitationFormat, (d: BackendDataset) => string> = {
  bibtex: generateBibTeX,
  ris: generateRIS,
  endnote: generateEndNote,
  csljson: generateCSLJSON,
  refworks: generateRefWorks
};

export const CitationExport = ({ dataset }: CitationExportProps) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CitationFormat>('bibtex');
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const citation = useMemo(() => GENERATORS[format](dataset), [dataset, format]);

  const closeOnOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', closeOnOutside);
      return () => document.removeEventListener('mousedown', closeOnOutside);
    }
  }, [open, closeOnOutside]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('Citation copy failed', err);
      }
    }
  };

  const handleDownload = () => {
    const { ext, mime } = LABELS[format];
    const blob = new Blob([citation], { type: `${mime};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const safeTitle = dataset.title.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60) || 'citation';
    a.download = `${safeTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
      >
        <BookOpenIcon className="h-4 w-4" />
        <span className="leading-none">Cite</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Export citation"
          className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Export Citation</h4>
          <label className="flex flex-col gap-1 mb-2 text-xs text-gray-600">
            Format
            <select
              value={format}
              onChange={e => setFormat(e.target.value as CitationFormat)}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(LABELS) as CitationFormat[]).map(f => (
                <option key={f} value={f}>{LABELS[f].label}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy citation"
              className="inline-flex items-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 text-xs font-medium"
            >
              {copied ? <CheckIcon className="h-3 w-3" /> : <ClipboardIcon className="h-3 w-3" />}
              <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download citation file"
              className="inline-flex items-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 text-xs font-medium"
            >
              <DownloadIcon className="h-3 w-3" />
              <span className="ml-1">Download</span>
            </button>
          </div>
          <pre className="max-h-48 overflow-auto text-[11px] leading-snug bg-gray-50 border border-gray-100 rounded p-2 whitespace-pre-wrap text-gray-600 font-mono">{citation}</pre>
          <div className="pt-2 text-[10px] text-gray-400">Generated automatically; please verify before use.</div>
        </div>
      )}
    </div>
  );
};
