import React from "react";

function imageFrame(element) {
  const naturalWidth = element.sourceWidth || 900;
  const naturalHeight = element.sourceHeight || 900;
  const zoom = Math.max(1, element.cropZoom || 1);
  const scale = Math.max(element.width / naturalWidth, element.height / naturalHeight) * zoom;
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const cropX = Math.min(1, Math.max(0, element.cropX ?? 0.5));
  const cropY = Math.min(1, Math.max(0, element.cropY ?? 0.5));
  return {
    x: (element.x || 0) - (width - element.width) * cropX,
    y: (element.y || 0) - (height - element.height) * cropY,
    width,
    height,
  };
}

function boundsFor(selectedElements) {
  if (!selectedElements.length) return null;
  const left = Math.min(...selectedElements.map((element) => element.x));
  const top = Math.min(...selectedElements.map((element) => element.y));
  const right = Math.max(...selectedElements.map((element) => element.x + element.width));
  const bottom = Math.max(...selectedElements.map((element) => element.y + element.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function renderElement(element, onPointerDown, preview) {
  if (!element.visible) return null;
  const transform = `translate(${element.x} ${element.y}) rotate(${element.rotation || 0} ${element.width / 2} ${element.height / 2})`;
  const commonProps = {
    key: element.id,
    transform,
    opacity: element.opacity ?? 1,
    onPointerDown: preview ? undefined : (event) => onPointerDown(event, element),
    style: preview ? undefined : { cursor: element.locked ? "default" : "move", touchAction: "none" },
    "data-layer-id": element.id,
  };

  if (element.type === "text") {
    const lines = String(element.text || "").split("\n");
    const anchor = element.alignment === "center" ? "middle" : element.alignment === "right" ? "end" : "start";
    const textX = anchor === "middle" ? element.width / 2 : anchor === "end" ? element.width : 0;
    return (
      <g {...commonProps} key={element.id} pointerEvents={preview ? "none" : "all"}>
        <rect x="0" y="0" width={element.width} height={element.height} fill="transparent" pointerEvents={preview ? "none" : "all"} />
        {lines.length === 0 || lines.every((line) => !line) ? null : (
          <text
            x={textX}
            y={element.fontSize}
            textAnchor={anchor}
            fill={element.color || "#222"}
            fontFamily={element.fontFamily || "Arial"}
            fontSize={element.fontSize || 36}
            fontWeight={element.fontWeight || 400}
            fontStyle={element.italic ? "italic" : "normal"}
            letterSpacing={element.letterSpacing || 0}
            style={{ whiteSpace: "pre" }}
          >
            {lines.map((line, index) => <tspan key={`${element.id}-${index}`} x={textX} dy={index === 0 ? 0 : (element.fontSize || 36) * (element.lineHeight || 1.1)}>{line}</tspan>)}
          </text>
        )}
      </g>
    );
  }

  if (element.type === "image") {
    const clipId = `clip-${element.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const fitted = imageFrame(element);
    return (
      <g {...commonProps} key={element.id}>
        {!preview && <rect x="0" y="0" width={element.width} height={element.height} fill="#e5e9e3" stroke="#94a497" strokeDasharray="9 7" />}
        {element.src && (
          <>
            <defs><clipPath id={clipId}><rect x="0" y="0" width={element.width} height={element.height} rx={element.radius || 0} /></clipPath></defs>
            <image
              href={element.src}
              x={fitted.x - element.x}
              y={fitted.y - element.y}
              width={fitted.width}
              height={fitted.height}
              preserveAspectRatio="none"
              clipPath={`url(#${clipId})`}
              pointerEvents="none"
            />
            {!preview && <rect x="0" y="0" width={element.width} height={element.height} fill="transparent" pointerEvents="all" />}
          </>
        )}
      </g>
    );
  }

  if (element.type === "path") {
    return (
      <g {...commonProps} key={element.id}>
        <svg x="0" y="0" width={element.width} height={element.height} viewBox={element.viewBox || "0 0 100 100"} preserveAspectRatio="none" overflow="visible">
          <path d={element.path || ""} fill={element.fill || "none"} stroke={element.stroke || "none"} strokeWidth={element.strokeWidth || 0} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {!preview && <rect x="0" y="0" width={element.width} height={element.height} fill="transparent" pointerEvents="all" />}
      </g>
    );
  }

  if (element.type === "line") {
    return <g {...commonProps} key={element.id}><line x1="0" y1={element.height / 2} x2={element.width} y2={element.height / 2} stroke={element.stroke || "#333"} strokeWidth={element.strokeWidth || 2} strokeLinecap="round" /><line x1="0" y1={element.height / 2} x2={element.width} y2={element.height / 2} stroke="transparent" strokeWidth="24" pointerEvents={preview ? "none" : "all"} /></g>;
  }

  if (element.type === "ellipse" || element.type === "circle") {
    return <g {...commonProps} key={element.id} pointerEvents={preview ? "none" : "all"}><ellipse cx={element.width / 2} cy={element.height / 2} rx={element.width / 2} ry={element.height / 2} fill={element.fill || "none"} stroke={element.stroke || "none"} strokeWidth={element.strokeWidth || 0} /><ellipse cx={element.width / 2} cy={element.height / 2} rx={element.width / 2} ry={element.height / 2} fill="transparent" pointerEvents={preview ? "none" : "all"} /></g>;
  }

  return (
    <g {...commonProps} key={element.id}>
      <rect x="0" y="0" width={element.width} height={element.height} rx={element.radius || 0} fill={element.fill || "none"} stroke={element.stroke || "none"} strokeWidth={element.strokeWidth || 0} />
      {!preview && <rect x="0" y="0" width={element.width} height={element.height} rx={element.radius || 0} fill="transparent" pointerEvents="all" />}
    </g>
  );
}

const HANDLES = [
  ["nw", (box) => [box.x, box.y]],
  ["n", (box) => [box.x + box.width / 2, box.y]],
  ["ne", (box) => [box.x + box.width, box.y]],
  ["e", (box) => [box.x + box.width, box.y + box.height / 2]],
  ["se", (box) => [box.x + box.width, box.y + box.height]],
  ["s", (box) => [box.x + box.width / 2, box.y + box.height]],
  ["sw", (box) => [box.x, box.y + box.height]],
  ["w", (box) => [box.x, box.y + box.height / 2]],
];

export default function DragCanvas({
  documentModel,
  selectedIds,
  zoom,
  svgRef,
  preview = false,
  guides = {},
  onLayerPointerDown,
  onHandlePointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onCanvasPointerCancel,
  onClearSelection,
}) {
  const selected = documentModel.elements.filter((element) => selectedIds.includes(element.id) && element.visible);
  const box = !preview ? boundsFor(selected) : null;
  const width = documentModel.canvas.width;
  const height = documentModel.canvas.height;

  return (
    <div className={`de-canvas-scroll${preview ? " is-preview" : ""}`}>
      <svg
        ref={svgRef}
        className="de-svg-canvas"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={preview ? "Design preview" : "Interactive design canvas"}
        style={{ width: `${zoom}%`, maxWidth: "none", height: "auto", touchAction: "none" }}
        onPointerMove={preview ? undefined : onCanvasPointerMove}
        onPointerUp={preview ? undefined : onCanvasPointerUp}
        onPointerCancel={preview ? undefined : onCanvasPointerCancel}
        onPointerDown={(event) => {
          if (!preview && event.target === event.currentTarget) onClearSelection();
        }}
      >
        <defs>
          {documentModel.elements.filter((element) => element.type === "rect" && element.gradient && element.visible).map((element) => (
            <linearGradient key={`gradient-${element.id}`} id={`gradient-${element.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={element.fill || "#fff"} />
              <stop offset="100%" stopColor={element.gradient || "#eee"} />
            </linearGradient>
          ))}
        </defs>
        {documentModel.elements.map((element) => {
          if (element.type === "rect" && element.gradient) {
            return (
              <g key={element.id} data-layer-id={element.id} transform={`translate(${element.x} ${element.y}) rotate(${element.rotation || 0} ${element.width / 2} ${element.height / 2})`} opacity={element.opacity ?? 1} pointerEvents={preview ? "none" : "all"} onPointerDown={preview ? undefined : (event) => onLayerPointerDown(event, element)}>
                <rect x="0" y="0" width={element.width} height={element.height} fill={`url(#gradient-${element.id})`} stroke={element.stroke || "none"} strokeWidth={element.strokeWidth || 0} />
              </g>
            );
          }
          return renderElement(element, onLayerPointerDown, preview);
        })}

        {!preview && box && (
          <g className="de-selection" data-editor-overlay="true">
            <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="none" stroke="#157963" strokeWidth="3" strokeDasharray="10 7" vectorEffect="non-scaling-stroke" pointerEvents="none" />
            {HANDLES.map(([name, point]) => {
              const [x, y] = point(box);
              return <circle key={name} className="de-selection-handle" cx={x} cy={y} r="11" fill="#fff" stroke="#157963" strokeWidth="3" vectorEffect="non-scaling-stroke" onPointerDown={(event) => onHandlePointerDown(event, name)} />;
            })}
            <line x1={box.x + box.width / 2} y1={box.y} x2={box.x + box.width / 2} y2={box.y - 49} stroke="#157963" strokeWidth="3" vectorEffect="non-scaling-stroke" pointerEvents="none" />
            <circle className="de-rotate-handle" cx={box.x + box.width / 2} cy={box.y - 55} r="12" fill="#157963" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" onPointerDown={(event) => onHandlePointerDown(event, "rotate")} />
          </g>
        )}
        {!preview && guides.vertical && <line data-editor-overlay="true" x1={width / 2} y1="0" x2={width / 2} y2={height} stroke="#ff6b4a" strokeWidth="2" strokeDasharray="12 10" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
        {!preview && guides.horizontal && <line data-editor-overlay="true" x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#ff6b4a" strokeWidth="2" strokeDasharray="12 10" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      </svg>
    </div>
  );
}
