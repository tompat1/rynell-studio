import { useMemo, useState } from 'react';

const SAMPLE_JSON = JSON.stringify([
  {
    name: 'Mara Voss',
    role: 'Creative Director',
    active: true,
    location: { city: 'Stockholm', studio: 'North Pier' }
  },
  {
    name: 'Noah Vale',
    role: 'Motion Designer',
    active: false,
    location: { city: 'Malmo', studio: 'Signal House' }
  }
], null, 2);

const flattenObject = (value, prefix = '', result = {}) => {
  Object.entries(value).forEach(([key, nestedValue]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      flattenObject(nestedValue, nextKey, result);
    } else {
      result[nextKey] = Array.isArray(nestedValue) ? JSON.stringify(nestedValue) : nestedValue;
    }
  });
  return result;
};

const escapeCsvValue = (value, separator) => {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes(separator)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
};

const JsonTransformer = () => {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [separator, setSeparator] = useState(',');
  const [flattenNested, setFlattenNested] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (!rows.length || rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
        return { error: 'Use a JSON object or an array of JSON objects.' };
      }

      const normalizedRows = rows.map((row) => flattenNested ? flattenObject(row) : row);
      const headers = [...new Set(normalizedRows.flatMap((row) => Object.keys(row)))];
      const csv = [headers, ...normalizedRows.map((row) => headers.map((header) => row[header]))]
        .map((row) => row.map((value) => escapeCsvValue(value, separator)).join(separator))
        .join('\n');

      return { headers, rows: normalizedRows, csv };
    } catch (error) {
      return { error: `Invalid JSON: ${error.message.replace(/^JSON\.parse: /, '')}` };
    }
  }, [jsonInput, separator, flattenNested]);

  const handleCopy = async () => {
    if (!result.csv) return;
    await navigator.clipboard.writeText(result.csv);
    setCopied(true);
    setNotice('CSV COPIED TO CLIPBOARD');
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!result.csv) return;
    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rynell-json-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('CSV DOWNLOAD READY');
  };

  return (
    <section id="json-lab" className="json-lab-section">
      <div className="section-label">JSON LAB</div>
      <div className="container">
        <div className="json-lab-header">
          <div>
            <div className="headline-badge">BROWSER-ONLY DATA TOOL</div>
            <h2 className="json-lab-title">JSON <span className="text-orange">IN.</span> CSV <span className="text-blue">OUT.</span></h2>
            <p className="json-lab-subtitle">Shape structured data into a clean spreadsheet export. Nothing leaves this browser.</p>
          </div>
          <div className="json-lab-stamp">LOCAL<br />TRANSFORM</div>
        </div>

        <div className="json-tool-shell">
          <div className="json-tool-toolbar">
            <div className="json-tool-status"><span className="json-status-dot" /> READY / LOCAL</div>
            <div className="json-toolbar-actions">
              <button className="json-utility-btn" onClick={() => { setJsonInput(SAMPLE_JSON); setNotice('SAMPLE LOADED'); }}>LOAD SAMPLE</button>
              <button className="json-utility-btn" onClick={() => { setJsonInput(''); setNotice('INPUT CLEARED'); }}>CLEAR</button>
            </div>
          </div>

          <div className="json-tool-grid">
            <div className="json-input-panel">
              <div className="json-panel-heading"><span>01 / SOURCE JSON</span><span>{jsonInput.length} CHARS</span></div>
              <textarea
                className="json-input"
                value={jsonInput}
                onChange={(event) => { setJsonInput(event.target.value); setNotice(''); }}
                spellCheck="false"
                aria-label="Source JSON"
                placeholder="Paste an object or an array of objects..."
              />
              <div className="json-options">
                <label className="json-option-label" htmlFor="separator-select">SEPARATOR</label>
                <select id="separator-select" className="json-select" value={separator} onChange={(event) => setSeparator(event.target.value)}>
                  <option value=",">COMMA ,</option>
                  <option value=";">SEMICOLON ;</option>
                  <option value="\t">TAB</option>
                  <option value="|">PIPE |</option>
                </select>
                <label className="json-check-label"><input type="checkbox" checked={flattenNested} onChange={(event) => setFlattenNested(event.target.checked)} /> FLATTEN NESTED KEYS</label>
              </div>
            </div>

            <div className="json-output-panel">
              <div className="json-panel-heading"><span>02 / TABLE PREVIEW</span><span>{result.rows ? `${result.rows.length} ROWS` : 'ERROR'}</span></div>
              {result.error ? (
                <div className="json-error" role="alert"><strong>CHECK YOUR INPUT</strong><span>{result.error}</span></div>
              ) : (
                <div className="json-table-wrap">
                  <table className="json-table">
                    <thead><tr>{result.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{result.headers.map((header) => <td key={`${rowIndex}-${header}`}>{String(row[header] ?? '')}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="json-tool-footer">
            <span className="json-notice" aria-live="polite">{notice}</span>
            <div className="json-export-actions">
              <button className="json-export-btn json-copy-btn" onClick={handleCopy} disabled={Boolean(result.error)}>{copied ? 'COPIED' : 'COPY CSV'}</button>
              <button className="json-export-btn" onClick={handleDownload} disabled={Boolean(result.error)}>DOWNLOAD CSV <span>↓</span></button>
            </div>
          </div>
        </div>
        <p className="json-lab-footnote">Arrays become rows. Nested objects become dot-notated columns. Values are escaped for spreadsheet-safe CSV.</p>
      </div>
      <style>{`
        .json-lab-section { position: relative; padding: 8rem 0 7rem; background: var(--bg-secondary); overflow: hidden; }
        .json-lab-section::before { content: ''; position: absolute; inset: 0; opacity: .34; background-image: radial-gradient(var(--pattern-color) 1px, transparent 1px); background-size: 10px 10px; pointer-events: none; }
        .json-lab-section .container { position: relative; z-index: 1; }
        .json-lab-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 2.5rem; }
        .json-lab-title { font-size: clamp(3.5rem, 8vw, 7.5rem); margin: 1rem 0 .75rem; letter-spacing: 2px; transform: skewX(-8deg); }
        .json-lab-subtitle { max-width: 600px; color: var(--text-secondary); font-size: 1.05rem; }
        .json-lab-stamp { flex: 0 0 auto; border: 3px solid var(--primary-orange); color: var(--primary-orange); padding: .8rem 1rem; font-family: var(--font-heading); font-size: 1.5rem; line-height: .9; transform: rotate(4deg); text-align: center; box-shadow: 5px 5px 0 var(--secondary-blue); }
        .json-tool-shell { border: 3px solid var(--text-primary); background: var(--bg-card); box-shadow: 10px 10px 0 var(--primary-orange); }
        .json-tool-toolbar, .json-tool-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 2px solid var(--border-color); }
        .json-tool-footer { border-bottom: 0; border-top: 2px solid var(--border-color); }
        .json-tool-status, .json-panel-heading, .json-option-label, .json-check-label, .json-utility-btn, .json-export-btn, .json-notice { font-family: var(--font-heading); letter-spacing: 1.5px; font-size: .82rem; }
        .json-status-dot { display: inline-block; width: 9px; height: 9px; margin-right: .5rem; background: #00e676; border-radius: 50%; box-shadow: 0 0 0 3px rgba(0,230,118,.16); }
        .json-toolbar-actions, .json-export-actions { display: flex; gap: .65rem; }
        .json-utility-btn, .json-export-btn { border: 2px solid var(--text-primary); background: transparent; color: var(--text-primary); padding: .55rem .8rem; cursor: pointer; }
        .json-utility-btn:hover, .json-export-btn:hover:not(:disabled) { background: var(--text-primary); color: var(--bg-primary); }
        .json-tool-grid { display: grid; grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); }
        .json-input-panel, .json-output-panel { min-width: 0; padding: 1.25rem; }
        .json-input-panel { border-right: 2px solid var(--border-color); }
        .json-panel-heading { display: flex; justify-content: space-between; color: var(--primary-orange); margin-bottom: .75rem; }
        .json-input { width: 100%; min-height: 330px; resize: vertical; border: 2px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); padding: 1rem; font: .9rem/1.6 monospace; outline: none; }
        .json-input:focus { border-color: var(--secondary-blue); box-shadow: 4px 4px 0 var(--secondary-blue); }
        .json-options { display: flex; align-items: center; flex-wrap: wrap; gap: .8rem 1rem; margin-top: 1rem; }
        .json-select { border: 2px solid var(--text-primary); background: var(--bg-primary); color: var(--text-primary); padding: .45rem .6rem; font: .82rem var(--font-heading); }
        .json-check-label { display: flex; align-items: center; gap: .4rem; cursor: pointer; }
        .json-check-label input { accent-color: var(--primary-orange); width: 16px; height: 16px; }
        .json-table-wrap { overflow: auto; min-height: 330px; max-height: 430px; border: 2px solid var(--border-color); background: var(--bg-primary); }
        .json-table { border-collapse: collapse; width: 100%; min-width: 450px; font-size: .78rem; }
        .json-table th, .json-table td { text-align: left; padding: .7rem .75rem; border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); white-space: nowrap; max-width: 190px; overflow: hidden; text-overflow: ellipsis; }
        .json-table th { position: sticky; top: 0; color: var(--black); background: var(--yellow); font-family: var(--font-heading); letter-spacing: 1px; }
        .json-error { min-height: 330px; display: flex; flex-direction: column; justify-content: center; gap: .8rem; padding: 2rem; border: 2px solid #ff4040; color: #ff7070; font-family: monospace; }
        .json-error strong { font-family: var(--font-heading); font-size: 1.5rem; letter-spacing: 1px; }
        .json-export-btn { background: var(--primary-orange); color: var(--black); border-color: var(--black); box-shadow: 3px 3px 0 var(--secondary-blue); font-size: 1rem; }
        .json-copy-btn { background: var(--secondary-blue); color: var(--white); }
        .json-export-btn:disabled { cursor: not-allowed; opacity: .35; box-shadow: none; }
        .json-notice { color: var(--secondary-blue); min-height: 1em; }
        .json-lab-footnote { margin-top: 1.5rem; color: var(--text-secondary); font-size: .82rem; font-family: monospace; }
        @media (max-width: 850px) { .json-lab-header { align-items: flex-start; flex-direction: column; } .json-tool-grid { grid-template-columns: 1fr; } .json-input-panel { border-right: 0; border-bottom: 2px solid var(--border-color); } }
        @media (max-width: 560px) { .json-lab-section { padding-top: 6rem; } .json-tool-toolbar, .json-tool-footer { align-items: flex-start; flex-direction: column; } .json-toolbar-actions, .json-export-actions { width: 100%; } .json-utility-btn, .json-export-btn { flex: 1; } .json-input { min-height: 250px; } .json-table-wrap, .json-error { min-height: 250px; } }
      `}</style>
    </section>
  );
};

export default JsonTransformer;