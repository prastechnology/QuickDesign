import React, { useEffect, useMemo, useRef, useState } from "react";
import TemplateArtwork from "./TemplateArtwork.jsx";
import { templates } from "../data/templates.js";

const HISTORY_LIMIT = 30;
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const TEXT_ELEMENTS = [
  { id: "headline", x: 130, y: 535, width: 940, height: 220, fontFamily: "Georgia", fontSize: 106, fontWeight: 600, alignment: "left" },
  { id: "subline", x: 132, y: 760, width: 900, height: 70, fontFamily: "Arial", fontSize: 36, fontWeight: 400, alignment: "left" },
];

function getElement(draft, id) {
  return draft.elements.find((element) => element.id === id);
}

function getText(draft, id) {
  return getElement(draft, id)?.text || "";
}

function getPhoto(draft) {
  return getElement(draft, "photo")?.src || "";
}

function createDesignDocument(template, saved = {}) {
  const savedElements = Array.isArray(saved.elements) ? saved.elements : [];
  const background = saved.canvas?.background || saved.background || template.palette[0];
  const savedText = (id) => savedElements.find((element) => element.id === id)?.text || saved[id] || template[id];
  const savedPhoto = savedElements.find((element) => element.id === "photo")?.src || saved.photo || "";

  return {
    schemaVersion: 1,
    templateId: template.id,
    canvas: {
      width: 1200,
      height: 1500,
      background,
      ...(saved.canvas || {}),
    },
    elements: [
      ...TEXT_ELEMENTS.map((defaults) => ({
        ...defaults,
        type: "text",
        text: savedText(defaults.id),
        color: template.palette[2],
        locked: false,
      })),
      { id: "photo", type: "image", src: savedPhoto, x: 716, y: 226, width: 357, height: 549, locked: false },
    ],
    updatedAt: saved.updatedAt || Date.now(),
  };
}

function cleanupExpiredDrafts() {
  const now = Date.now();
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("dzinewallah-draft-")) continue;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      const expiry = saved.expiresAt || (saved.updatedAt ? saved.updatedAt + DRAFT_TTL_MS : null);
      if (expiry && expiry < now) localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }
}

function loadDraft(template) {
  try {
    cleanupExpiredDrafts();
    const saved = localStorage.getItem(`dzinewallah-draft-${template.id}`);
    const parsed = saved ? JSON.parse(saved) : {};
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      localStorage.removeItem(`dzinewallah-draft-${template.id}`);
      return createDesignDocument(template);
    }
    return createDesignDocument(template, parsed);
  } catch {
    return createDesignDocument(template);
  }
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function compressPhoto(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Image could not be opened."));
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    if (!blob) throw new Error("Image compression failed.");
    return await readAsDataUrl(blob);
  } finally {
    URL.revokeObjectURL(imageUrl);
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
        const now = Date.now();
        localStorage.setItem(`dzinewallah-draft-${template.id}`, JSON.stringify({
          ...draft,
          updatedAt: now,
          expiresAt: now + DRAFT_TTL_MS,
        }));
        setSavedAt("Saved on this device");
      } catch {
        setSavedAt("Autosave unavailable");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [draft, template.id]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const update = (key, value) => {
    const now = Date.now();
    const next = {
      ...draft,
      canvas: key === "background" ? { ...draft.canvas, background: value } : draft.canvas,
      elements: draft.elements.map((element) => {
        if (key === "headline" && element.id === "headline") return { ...element, text: value };
        if (key === "subline" && element.id === "subline") return { ...element, text: value };
        if (key === "photo" && element.id === "photo") return { ...element, src: value };
        return element;
      }),
      updatedAt: now,
    };
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
      context.fillStyle = draft.canvas.background;
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

  const onPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showNotice("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      showNotice("Choose an image smaller than 6 MB.");
      event.target.value = "";
      return;
    }
    try {
      update("photo", await compressPhoto(file));
    } catch {
      showNotice("This image could not be opened. Please try another.");
    } finally {
      event.target.value = "";
    }
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
            <textarea value={getText(draft, "headline")} maxLength={54} rows={3} onChange={(event) => update("headline", event.target.value)} />
          </label>
          <label className="editor-field">
            <span>Supporting text</span>
            <input value={getText(draft, "subline")} maxLength={80} onChange={(event) => update("subline", event.target.value)} />
          </label>
          <div className="editor-field">
            <span>Background color</span>
            <div className="editor-color-row">
              <input aria-label="Choose background color" type="color" value={draft.canvas.background} onChange={(event) => update("background", event.target.value)} />
              <code>{draft.canvas.background.toUpperCase()}</code>
              <button className="text-reset" onClick={() => update("background", template.palette[0])}>Reset</button>
            </div>
            <div className="editor-swatches">
              {template.palette.map((color) => (
                <button
                  key={color}
                  className={`editor-swatch${draft.canvas.background.toLowerCase() === color.toLowerCase() ? " active" : ""}`}
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
              <span>{getPhoto(draft) ? "Replace your photo" : "Upload a photo"}</span>
            </label>
            {getPhoto(draft) && <button className="text-reset clear-photo" onClick={clearPhoto}>Remove photo</button>}
          </div>
          <div className="editor-hint"><span aria-hidden="true">✳</span> Drafts save in this browser and expire after 30 days.</div>
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
                headline={getText(draft, "headline")}
                subline={getText(draft, "subline")}
                background={draft.canvas.background}
                photo={getPhoto(draft)}
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
            <TemplateArtwork template={template} headline={getText(draft, "headline")} subline={getText(draft, "subline")} background={draft.canvas.background} photo={getPhoto(draft)} className="preview-artwork" />
            <button className="editor-download-button preview-download" onClick={() => download("png")}>Download your design</button>
          </div>
        </div>
      )}
      {notice && <div className="editor-toast" role="status">{notice}</div>}
      <button className="editor-mobile-back" onClick={onBack}>← Back to Dzinewallah</button>
    </main>
  );
}
