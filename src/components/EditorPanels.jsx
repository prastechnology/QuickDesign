import React, { useRef } from "react";
import TemplateArtwork from "./TemplateArtwork.jsx";

const TOOL_ITEMS = [
  ["templates", "▦", "Templates"],
  ["text", "T", "Text"],
  ["uploads", "↥", "Uploads"],
  ["shapes", "◇", "Shapes"],
  ["background", "◐", "Background"],
];

function NumberField({ label, value, min, max, step = 1, onChange }) {
  return (
    <label className="de-number-field">
      <span>{label}</span>
      <input type="number" value={Number(value || 0).toFixed(step < 1 ? 1 : 0)} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function ToolPanel({
  templates,
  activeTool,
  setActiveTool,
  onNewTemplate,
  onAddText,
  onAddShape,
  onFiles,
  background,
  gradient,
  onBackgroundChange,
  onGradientChange,
  onBackgroundImage,
}) {
  const uploadRef = useRef(null);
  const backgroundRef = useRef(null);

  return (
    <aside className="de-tools-panel" aria-label="Design tools">
      <nav className="de-tool-tabs" aria-label="Canvas tools">
        {TOOL_ITEMS.map(([id, icon, label]) => (
          <button type="button" key={id} className={activeTool === id ? "active" : ""} aria-pressed={activeTool === id} onClick={() => setActiveTool(id)}>
            <span aria-hidden="true">{icon}</span><small>{label}</small>
          </button>
        ))}
      </nav>
      <div className="de-tool-content">
        {activeTool === "templates" && (
          <div className="de-template-tool">
            <div className="de-panel-title"><span className="de-kicker">STARTING POINTS</span><h2>Templates</h2></div>
            {templates.map((template) => (
              <button type="button" className="de-template-choice" key={template.id} onClick={() => onNewTemplate(template.id)}>
                <span className="de-template-thumb">{template.id === "blank" ? <i>Blank</i> : <TemplateArtwork template={template} />}</span>
                <span><b>{template.name}</b><small>{template.category}</small></span>
              </button>
            ))}
          </div>
        )}
        {activeTool === "text" && (
          <div className="de-add-tool">
            <div className="de-panel-title"><span className="de-kicker">ADD A LAYER</span><h2>Text</h2></div>
            <button type="button" className="de-tool-primary" onClick={() => onAddText("heading")}>＋ Add a heading</button>
            <button type="button" className="de-tool-secondary" onClick={() => onAddText("body")}>＋ Add body text</button>
            <p>New text appears in the middle of your canvas. Select it to edit, move, resize or rotate it.</p>
          </div>
        )}
        {activeTool === "uploads" && (
          <div className="de-add-tool">
            <div className="de-panel-title"><span className="de-kicker">YOUR DEVICE</span><h2>Uploads</h2></div>
            <input ref={uploadRef} className="de-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { onFiles(event.target.files); event.target.value = ""; }} />
            <button type="button" className="de-tool-primary" onClick={() => uploadRef.current?.click()}>＋ Upload photos</button>
            <p>JPG, PNG and WebP · up to 6 MB each. Images are compressed and stored with this project on this device.</p>
          </div>
        )}
        {activeTool === "shapes" && (
          <div className="de-add-tool">
            <div className="de-panel-title"><span className="de-kicker">ADD A LAYER</span><h2>Shapes</h2></div>
            <div className="de-shape-buttons">
              <button type="button" onClick={() => onAddShape("rect")}><span>▰</span>Rectangle</button>
              <button type="button" onClick={() => onAddShape("ellipse")}><span>●</span>Circle</button>
              <button type="button" onClick={() => onAddShape("line")}><span>━</span>Line</button>
              <button type="button" onClick={() => onAddShape("star")}><span>✦</span>Star</button>
            </div>
            <p>Shape layers can be moved, resized, rotated, recolored and reordered.</p>
          </div>
        )}
        {activeTool === "background" && (
          <div className="de-add-tool">
            <div className="de-panel-title"><span className="de-kicker">CANVAS FILL</span><h2>Background</h2></div>
            <label className="de-color-field"><span>Base color</span><input type="color" value={background.fill || "#fbf8f1"} onChange={(event) => onBackgroundChange({ fill: event.target.value, gradient: "" })} /></label>
            <label className="de-check-field"><input type="checkbox" checked={Boolean(gradient)} onChange={(event) => onGradientChange(event.target.checked)} /> Use a two-color gradient</label>
            {gradient && <label className="de-color-field"><span>Second color</span><input type="color" value={gradient} onChange={(event) => onBackgroundChange({ gradient: event.target.value })} /></label>}
            <input ref={backgroundRef} className="de-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { onBackgroundImage(event.target.files); event.target.value = ""; }} />
            <button type="button" className="de-tool-secondary" onClick={() => backgroundRef.current?.click()}>Use a photo as background</button>
            <p>The background stays behind all other layers. You can change its color or replace it with an image.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function InspectorPanel({
  selected,
  selectedIds,
  elements,
  background,
  onSelect,
  onUpdate,
  onReorder,
  onToggle,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onAlign,
  canUngroup,
  onReplaceImage,
  onUseAsBackground,
}) {
  const replaceRef = useRef(null);
  const topLayerIndex = elements.length - 1;

  return (
    <aside className="de-inspector-panel" aria-label="Properties and layers">
      <section className="de-properties">
        <div className="de-panel-title"><span className="de-kicker">SELECTED LAYER</span><h2>{selected ? selected.name : "Design properties"}</h2></div>
        {selected ? (
          <>
            {selectedIds.length > 1 && <div className="de-selection-note">{selectedIds.length} layers selected · drag to move together</div>}
            <label className="de-property-label">Layer name<input value={selected.name || ""} onChange={(event) => onUpdate({ name: event.target.value })} /></label>
            <div className="de-property-grid">
              <NumberField label="X" value={selected.x} onChange={(value) => onUpdate({ x: value })} />
              <NumberField label="Y" value={selected.y} onChange={(value) => onUpdate({ y: value })} />
              <NumberField label="Width" value={selected.width} min={12} onChange={(value) => onUpdate({ width: Math.max(12, value) })} />
              <NumberField label="Height" value={selected.height} min={12} onChange={(value) => onUpdate({ height: Math.max(12, value) })} />
            </div>
            <NumberField label="Rotation" value={selected.rotation || 0} min={-360} max={360} onChange={(value) => onUpdate({ rotation: value })} />
            {selected.type === "text" && (
              <div className="de-specific-controls">
                <label className="de-property-label">Text<textarea rows={4} maxLength={240} value={selected.text || ""} onChange={(event) => onUpdate({ text: event.target.value })} /></label>
                <label className="de-property-label">Font family<select value={selected.fontFamily || "Arial"} onChange={(event) => onUpdate({ fontFamily: event.target.value })}><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Trebuchet MS</option><option>Courier New</option></select></label>
                <NumberField label="Font size" value={selected.fontSize || 36} min={8} max={240} onChange={(value) => onUpdate({ fontSize: Math.min(240, Math.max(8, value)) })} />
                <div className="de-property-grid">
                  <label className="de-color-field"><span>Text color</span><input type="color" value={selected.color || "#222222"} onChange={(event) => onUpdate({ color: event.target.value })} /></label>
                  <label className="de-property-label">Align<select value={selected.alignment || "left"} onChange={(event) => onUpdate({ alignment: event.target.value })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
                </div>
                <div className="de-inline-options">
                  <label className="de-check-field"><input type="checkbox" checked={Number(selected.fontWeight) >= 600} onChange={(event) => onUpdate({ fontWeight: event.target.checked ? 700 : 400 })} /> Bold</label>
                  <label className="de-check-field"><input type="checkbox" checked={Boolean(selected.italic)} onChange={(event) => onUpdate({ italic: event.target.checked })} /> Italic</label>
                </div>
                <NumberField label="Letter spacing" value={selected.letterSpacing || 0} min={-4} max={20} step={0.5} onChange={(value) => onUpdate({ letterSpacing: value })} />
                <NumberField label="Line height" value={selected.lineHeight || 1.1} min={0.8} max={2} step={0.1} onChange={(value) => onUpdate({ lineHeight: value })} />
              </div>
            )}
            {selected.type === "image" && (
              <div className="de-specific-controls">
                <button type="button" className="de-tool-secondary" onClick={() => replaceRef.current?.click()}>Replace image</button>
                <input ref={replaceRef} className="de-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { onReplaceImage(event.target.files); event.target.value = ""; }} />
                <label className="de-range-field"><span>Crop zoom <b>{(selected.cropZoom || 1).toFixed(1)}×</b></span><input type="range" min="1" max="3" step=".1" value={selected.cropZoom || 1} onChange={(event) => onUpdate({ cropZoom: Number(event.target.value) })} /></label>
                <label className="de-range-field"><span>Horizontal crop</span><input type="range" min="0" max="1" step=".01" value={selected.cropX ?? 0.5} onChange={(event) => onUpdate({ cropX: Number(event.target.value) })} /></label>
                <label className="de-range-field"><span>Vertical crop</span><input type="range" min="0" max="1" step=".01" value={selected.cropY ?? 0.5} onChange={(event) => onUpdate({ cropY: Number(event.target.value) })} /></label>
                <button type="button" className="de-text-action" onClick={onUseAsBackground}>Set as background image</button>
              </div>
            )}
            {["rect", "ellipse", "circle", "line", "path"].includes(selected.type) && (
              <div className="de-specific-controls">
                {selected.type !== "line" && <label className="de-color-field"><span>Fill color</span><input type="color" value={selected.fill && selected.fill !== "none" ? selected.fill : "#ffffff"} onChange={(event) => onUpdate({ fill: event.target.value })} /></label>}
                <label className="de-color-field"><span>Line color</span><input type="color" value={selected.stroke && selected.stroke !== "none" ? selected.stroke : "#315f4d"} onChange={(event) => onUpdate({ stroke: event.target.value })} /></label>
                <NumberField label="Line width" value={selected.strokeWidth || 0} min={0} max={40} onChange={(value) => onUpdate({ strokeWidth: value })} />
              </div>
            )}
            <label className="de-range-field"><span>Opacity <b>{Math.round((selected.opacity ?? 1) * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={selected.opacity ?? 1} onChange={(event) => onUpdate({ opacity: Number(event.target.value) })} /></label>
            <div className="de-layer-actions">
              <button type="button" onClick={() => onToggle(selected.id, "locked")}>{selected.locked ? "Unlock" : "Lock"}</button>
              <button type="button" onClick={() => onDuplicate(selected.id)}>Duplicate</button>
              <button type="button" className="is-danger" onClick={() => onDelete(selectedIds)}>Delete</button>
            </div>
          </>
        ) : (
          <div className="de-empty-inspector">
            {selectedIds.length > 1 ? (
              <>
                <div className="de-selection-note">{selectedIds.length} layers selected · move these layers together</div>
                <div className="de-group-actions">
                  <button type="button" onClick={onGroup}>Group</button>
                  {canUngroup && <button type="button" onClick={onUngroup}>Ungroup</button>}
                </div>
                <span className="de-align-label">Align centers within selection</span>
                <div className="de-group-actions">
                  <button type="button" onClick={() => onAlign("x")}>Horizontal</button>
                  <button type="button" onClick={() => onAlign("y")}>Vertical</button>
                </div>
                <button type="button" className="de-tool-secondary de-group-duplicate" onClick={() => onDuplicate(selectedIds)}>Duplicate selection</button>
              </>
            ) : (
              <>
                <p>Select a layer on the canvas or in the layer list to edit it.</p>
                <label className="de-color-field"><span>Background color</span><input type="color" value={background.fill || "#fbf8f1"} onChange={(event) => onUpdate({ fill: event.target.value }, "background")} /></label>
              </>
            )}
          </div>
        )}
      </section>
      <section className="de-layers">
        <div className="de-layer-heading"><div><span className="de-kicker">STACK ORDER</span><h2>Layers</h2></div><span>{elements.length}</span></div>
        <div className="de-layer-list">
          {[...elements].reverse().map((element) => {
            const index = elements.findIndex((item) => item.id === element.id);
            const active = selectedIds.includes(element.id);
            return (
              <div className={`de-layer-row${active ? " is-selected" : ""}${!element.visible ? " is-hidden" : ""}`} key={element.id}>
                <button type="button" className="de-layer-select" onClick={(event) => onSelect(element.id, event.shiftKey)} aria-pressed={active}>
                  <span className="de-layer-kind">{element.type === "text" ? "T" : element.type === "image" ? "▧" : "◇"}</span><span className="de-layer-name">{element.name || element.type}</span>
                </button>
                <button type="button" className="de-layer-mini" title={element.visible ? "Hide layer" : "Show layer"} aria-label={element.visible ? "Hide layer" : "Show layer"} onClick={() => onToggle(element.id, "visible")}>{element.visible ? "◉" : "○"}</button>
                <button type="button" className="de-layer-mini" title={element.locked ? "Unlock layer" : "Lock layer"} aria-label={element.locked ? "Unlock layer" : "Lock layer"} onClick={() => onToggle(element.id, "locked")}>{element.locked ? "▣" : "▢"}</button>
                <button type="button" className="de-layer-mini" title="Move layer up" aria-label="Move layer up" disabled={index === topLayerIndex} onClick={() => onReorder(element.id, 1)}>↑</button>
                <button type="button" className="de-layer-mini" title="Move layer down" aria-label="Move layer down" disabled={index === 0} onClick={() => onReorder(element.id, -1)}>↓</button>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

