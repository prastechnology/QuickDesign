import React, { useEffect, useMemo, useRef, useState } from "react";
import TemplateArtwork from "./TemplateArtwork.jsx";
import { templates } from "../data/templates.js";

const HISTORY_LIMIT = 30;

function loadDraft(template) {
  try {
    const saved = localStorage.getItem(`dzinewallah-draft-${template.id}`);
    return saved ? { ...JSON.parse(saved), templateId: template.id } : {
      templateId: template.id,
      headline: template.headline,
      subline: template.subline,
      background: template.palette[0],
      photo: "",
    };
  } catch {
    return { templateId: template.id, headline: template.headline, subline: template.subline, background: template.palette[0], photo: "" };
  }
}

export default function Editor({ templateId, onBack }) {
  const template = useMemo(() => templates.find((item) => item.id === templateId) || templates[0], [templateId]);
  const [draft, setDraft] = useState(() => loadDraft(template));
  const [history, setHistory] = useState(() => [loadDraft(template)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [notice, setNotice] = useState("");
  const svgRef = useRef(null);
  const noticeTimer = useRef(null);

  useEffect(() => {
    const initial = loadDraft(template);
    setDraft(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    setSavedAt("");
  }, [template]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(`dzinewallah-draft-${template.id}`, JSON.stringify(draft));
        setSavedAt("Saved on this device");
      } catch {
        setSavedAt("Autosave unavailable");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [draft, template.id]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const update = (key, value) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setHistory((current) => {
      const trimmed = current.slice(0, historyIndex + 1);
      const result = [...trimmed, next].slice(-HISTORY_LIMIT);
      setHistoryIndex(result.length - 1);
      return result;
    });
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setDraft(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setDraft(history[nextIndex]);
  };

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2600);
  };

  const download = async (format) => {
    const source = svgRef.current;
    if (!source) return;
    const clone = source.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "1500");
    const markup = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1500;
      const context = canvas.getContext("2d");
      context.fillStyle = draft.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) {
          showNotice("Could not export this design. Please try again.");
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${format}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
        showNotice(`Your ${format.toUpperCase()} is ready.`);
      }, format === "jpg" ? "image/jpeg" : "image/png", 0.94);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      showNotice("Could not export this design. Please try again.");
    };
    image.src = url;
  };

  const onPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotice("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      showNotice("Choose an image smaller than 6 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("photo", String(reader.result));
    reader.onerror = () => showNotice("This image could not be opened.");
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => update("photo", "");
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <button className="editor-brand" onClick={onBack} aria-label="Return to Dzinewallah home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>Dzinewallah</span>
        </button>
        <div className="editor-document">
          <span className="editor-document-name">{template.name}</span>
          <span className="save-status">{savedAt || "Saving locally…"}</span>
        </div>
        <div className="editor-actions">
          <button className="icon-action" disabled={!canUndo} onClick={undo} title="Undo" aria-label="Undo last change">↶</button>
          <button className="icon-action" disabled={!canRedo} onClick={redo} title="Redo" aria-label="Redo last change">↷</button>
          <button className="editor-preview-button" onClick={() => setPreview(true)}>Preview</button>
          <button className="editor-preview-button editor-jpg-button" title="Download a JPG image" onClick={() => download("jpg")}>JPG</button>
          <button className="editor-download-button" title="Download a PNG image" onClick={() => download("png")}>Download</button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="editor-controls" aria-label="Design controls">
          <div className="editor-panel-heading">
            <span className="eyebrow">YOUR DESIGN</span>
            <h1>Make it yours.</h1>
            <p>The layout is ready. Add your details and make it feel like you.</p>
          </div>
          <label className="editor-field">
            <span>Headline</span>
            <textarea value={draft.headline} maxLength={54} rows={3} onChange={(event) => update("headline", event.target.value)} />
          </label>
          <label className="editor-field">
            <span>Supporting text</span>
            <input value={draft.subline} maxLength={80} onChange={(event) => update("subline", event.target.value)} />
          </label>
          <div className="editor-field">
            <span>Background color</span>
            <div className="editor-color-row">
              <input aria-label="Choose background color" type="color" value={draft.background} onChange={(event) => update("background", event.target.value)} />
              <code>{draft.background.toUpperCase()}</code>
              <button className="text-reset" onClick={() => update("background", template.palette[0])}>Reset</button>
            </div>
            <div className="editor-swatches">
              {template.palette.map((color) => (
                <button
                  key={color}
                  className={`editor-swatch${draft.background.toLowerCase() === color.toLowerCase() ? " active" : ""}`}
                  style={{ "--swatch": color }}
                  onClick={() => update("background", color)}
                  aria-label={`Set background to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="editor-field">
            <span>Bring in a photo <small>optional</small></span>
            <label className="upload-photo">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPhoto} />
              <span className="upload-photo-icon" aria-hidden="true">＋</span>
              <span>{draft.photo ? "Replace your photo" : "Upload a photo"}</span>
            </label>
            {draft.photo && <button className="text-reset clear-photo" onClick={clearPhoto}>Remove photo</button>}
          </div>
          <div className="editor-hint"><span aria-hidden="true">✳</span> Your work saves automatically on this device.</div>
        </aside>

        <section className="editor-canvas-area" aria-label="Design canvas">
          <div className="canvas-toolbar">
            <span>Poster · Portrait</span>
            <span className="canvas-zoom">100%</span>
          </div>
          <div className="canvas-stage">
            <div className="canvas-paper">
              <TemplateArtwork
                template={template}
                headline={draft.headline}
                subline={draft.subline}
                background={draft.background}
                photo={draft.photo}
                className="editor-artwork"
                ref={svgRef}
              />
            </div>
            <div className="canvas-caption">
              <span>{template.name}</span>
              <span>1200 × 1500 px</span>
            </div>
          </div>
          <div className="canvas-help">Tip: Try a shorter headline for a more spacious layout.</div>
        </section>
      </div>

      {preview && (
        <div className="preview-overlay" role="dialog" aria-modal="true" aria-label="Design preview">
          <div className="preview-dialog">
            <div className="preview-dialog-header">
              <div><span className="eyebrow">PREVIEW</span><h2>{template.name}</h2></div>
              <button className="icon-action" onClick={() => setPreview(false)} aria-label="Close preview">×</button>
            </div>
            <TemplateArtwork template={template} headline={draft.headline} subline={draft.subline} background={draft.background} photo={draft.photo} className="preview-artwork" />
            <button className="editor-download-button preview-download" onClick={() => download("png")}>Download your design</button>
          </div>
        </div>
      )}
      {notice && <div className="editor-toast" role="status">{notice}</div>}
      <button className="editor-mobile-back" onClick={onBack}>← Back to Dzinewallah</button>
    </main>
  );
}
