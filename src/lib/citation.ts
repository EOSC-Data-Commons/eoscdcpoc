import type { BackendDataset } from "../types/zenodo";

const sanitize = (value: string) => value.replace(/[{}]/g, "");

const firstCreatorLastName = (creators: string[]) => {
  if (!creators.length) return "unknown";
  const first = creators[0];
  // Expect formats like "Last, First" or "First Last"
  if (first.includes(",")) {
    return first.split(",")[0].trim().replace(/\s+/g, "_");
  }
  const parts = first.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : "unknown";
};

const extractYear = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "n.d." : String(d.getUTCFullYear());
};

const formatAuthorsBibTeX = (creators: string[]) => {
  return creators.map(c => c.replace(/\s+/g, ' ').trim()).join(" and ");
};

const extractDOI = (url: string): string | undefined => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('doi.org')) {
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    }
  } catch (err) {
    // Non-DOI or malformed URL; safe to ignore. Log in dev for diagnostics.
    if (typeof console !== 'undefined') {
      console.debug('extractDOI: unable to parse DOI from URL', url, err);
    }
  }
  return undefined;
};

export const generateBibTeX = (ds: BackendDataset): string => {
  const year = extractYear(ds.publication_date);
  const keyBase = `${firstCreatorLastName(ds.creators)}_${year}_${ds.id}`.replace(/[^A-Za-z0-9_]/g, "");
  const authors = formatAuthorsBibTeX(ds.creators);
  const doi = extractDOI(ds.url);
  const fields: Record<string, string | undefined> = {
    title: sanitize(ds.title),
    author: authors || undefined,
    year: year !== 'n.d.' ? year : undefined,
    url: ds.url,
    note: `Accessed: ${new Date().toISOString().split('T')[0]}`,
    doi
  };
  const entries = Object.entries(fields).filter(([, v]) => !!v);
  const body = entries
    .map(([k, v], idx) => {
      const isLast = idx === entries.length - 1;
      return `  ${k} = {${sanitize(v!)}}${isLast ? '' : ','}`;
    })
    .join("\n");
  return `@misc{${keyBase},\n${body}\n}`;
};

export const generateRIS = (ds: BackendDataset): string => {
  const year = extractYear(ds.publication_date);
  const date = new Date(ds.publication_date);
  const datePart = isNaN(date.getTime()) ? '' : `${date.getUTCFullYear()}/${String(date.getUTCMonth()+1).padStart(2,'0')}/${String(date.getUTCDate()).padStart(2,'0')}`;
  const doi = extractDOI(ds.url);
  const lines: string[] = [];
  lines.push('TY  - DATA');
  lines.push(`TI  - ${sanitize(ds.title)}`);
  ds.creators.forEach(c => lines.push(`AU  - ${c}`));
  if (year !== 'n.d.') lines.push(`PY  - ${year}`);
  if (datePart) lines.push(`DA  - ${datePart}`);
  if (doi) lines.push(`DO  - ${doi}`);
  lines.push(`UR  - ${ds.url}`);
  lines.push('ER  - ');
  return lines.join('\n');
};

export const generateEndNote = (ds: BackendDataset): string => {
  const year = extractYear(ds.publication_date);
  const doi = extractDOI(ds.url);
  const lines: string[] = [];
  lines.push('%0 Dataset');
  lines.push(`%T ${sanitize(ds.title)}`);
  ds.creators.forEach(c => lines.push(`%A ${c}`));
  if (year !== 'n.d.') lines.push(`%D ${year}`);
  if (doi) lines.push(`%R ${doi}`);
  lines.push(`%U ${ds.url}`);
  lines.push(`%~ Accessed ${new Date().toISOString().split('T')[0]}`);
  return lines.join('\n');
};

export const generateCSLJSON = (ds: BackendDataset): string => {
  const year = extractYear(ds.publication_date);
  const date = new Date(ds.publication_date);
  const dateParts = isNaN(date.getTime()) ? undefined : [[date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]];
  const authors = ds.creators.map(name => ({ literal: name.trim() })).filter(a => a.literal.length);
  const obj: Record<string, unknown> = {
    type: 'dataset',
    id: ds.id,
    title: ds.title,
    author: authors.length ? authors : undefined,
    issued: dateParts ? { 'date-parts': dateParts } : undefined,
    URL: ds.url,
    accessed: { 'date-parts': [[new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, new Date().getUTCDate()]] },
    'original-date': year !== 'n.d.' ? { 'date-parts': [[Number(year)]] } : undefined,
    keyword: ds.keywords && ds.keywords.length ? ds.keywords.join(', ') : undefined,
    'container-title': undefined
  };
  // Remove undefined
  Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
  return JSON.stringify(obj, null, 2);
};

export const generateRefWorks = (ds: BackendDataset): string => {
  // RefWorks Tagged Format (simplified)
  const year = extractYear(ds.publication_date);
  const lines: string[] = [];
  lines.push('RT Dataset');
  lines.push('SR Electronic');
  ds.creators.forEach(c => lines.push(`A1 ${c}`));
  lines.push(`T1 ${ds.title}`);
  if (year !== 'n.d.') lines.push(`YR ${year}`);
  if (ds.keywords) ds.keywords.slice(0, 15).forEach(kw => lines.push(`K1 ${kw}`));
  lines.push(`UL ${ds.url}`);
  lines.push(`NO Accessed ${new Date().toISOString().split('T')[0]}`);
  lines.push('ER');
  return lines.join('\n');
};

export interface CitationBundle {
  bibtex: string;
  ris: string;
  endnote: string;
  csljson: string;
  refworks: string;
}

export const generateCitations = (ds: BackendDataset): CitationBundle => ({
  bibtex: generateBibTeX(ds),
  ris: generateRIS(ds),
  endnote: generateEndNote(ds),
  csljson: generateCSLJSON(ds),
  refworks: generateRefWorks(ds)
});
