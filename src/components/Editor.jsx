import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { templates } from "../data/templates.js";
import { blankTemplate, makeElementId } from "../design/templateDocument.js";
import { createProjectId, loadProject, saveProject } from "../design/localProjects.js";
import DragCanvas from "./DragCanvas.jsx";
import { InspectorPanel, ToolPanel } from "./EditorPanels.jsx";
import "./drag-editor.css";

const TEMPLATE_LIBRARY = [blankTemplate, ...templates];
const HISTORY_LIMIT = 60;
const CANVAS_PRESETS = [
  { label: "Poster · 4:5", width: 1200, height: 1500 },
  { label: "Square · 1:1", width: 1080, height: 1080 },
  { label: "Story · 9:16", width: 1080, height: 1920 },
];

function boxFor(elements) {
  return {
    x: Math.min(...elements.map((element) => element.x)),
    y: Math.min(...elements.map((element) => element.y)),
    width: Math.max(...elements.map((element) => element.x + element.width)) - Math.min(...elements.map((element) => element.x)),
    height: Math.max(...elements.map((element) => element.y + element.height)) - Math.min(...elements.map((element) => element.y)),
  };
}

function pointOnCanvas(event, svg) {
  if (!svg?.getScreenCTM) return { x: event.clientX, y: event.clientY };
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function freshHistory(next) {
  return JSON.parse(JSON.stringify(next));
}

function imageData(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      const scale = Math.min(1, 1800 / Math.max(sourceWidth, sourceHeight));
      const canvas = window.document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image processing is unavailable."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve({ src: String(reader.result), sourceWidth, sourceHeight });
        reader.onerror = () => reject(new Error("Image could not be read."));
        reader.readAsDataURL(blob);
      }, "image/webp", 0.85);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be opened."));
    };
    image.src = objectUrl;
  });
}

function slug(value) {
  return String(value || "dzinewallah-design").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dzinewallah-design";
}

export default function Editor({ templateId, projectId: requestedProjectId, onBack, onNewTemplate }) {
  const template = useMemo(
    () => TEMPLATE_LIBRARY.find((item) => item.id === templateId) || templates[5],
    [templateId],
  );
  const [projectId] = useState(() => requestedProjectId || createProjectId());
  const initialDocument = useMemo(() => loadProject(projectId, template), [projectId, template]);
  const [documentModel, setDocumentModel] = useState(initialDocument);
  const documentRef = useRef(initialDocument);
  const historyRef = useRef([freshHistory(initialDocument)]);
  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedIdsRef = useRef([]);
  const [activeTool, setActiveTool] = useState("templates");
  const [zoom, setZoom] = useState(100);
  const [guides, setGuides] = useState({});
  const [savedAt, setSavedAt] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const svgRef = useRef(null);
  const gestureRef = useRef(null);
  const toastTimer = useRef(null);
  const selectedElements = documentModel.elements.filter((element) => selectedIds.includes(element.id));
  const selected = selectedIds.length === 1 ? selectedElements[0] : null;
  const background = documentModel.elements.find((element) => element.role === "background") || documentModel.elements[0];

  const setSelection = useCallback((next) => {
    selectedIdsRef.current = next;
    setSelectedIds(next);
  }, []);

  const setTransientDocument = useCallback((next) => {
    documentRef.current = next;
    setDocumentModel(next);
  }, []);

  const commitDocument = useCallback((next) => {
    const current = documentRef.current;
    if (next === current) return;
    const index = historyIndexRef.current;
    const entries = [...historyRef.current.slice(0, index + 1), freshHistory(next)].slice(-HISTORY_LIMIT);
    historyRef.current = entries;
    historyIndexRef.current = entries.length - 1;
    setHistoryIndex(entries.length - 1);
    setTransientDocument(next);
  }, [setTransientDocument]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    setHistoryIndex(historyIndexRef.current);
    setTransientDocument(freshHistory(historyRef.current[historyIndexRef.current]));
  }, [setTransientDocument]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    setHistoryIndex(historyIndexRef.current);
    setTransientDocument(freshHistory(historyRef.current[historyIndexRef.current]));
  }, [setTransientDocument]);

  const updateElement = useCallback((id, patch) => {
    const current = documentRef.current;
    const next = {
      ...current,
      elements: current.elements.map((element) => element.id === id ? { ...element, ...patch } : element),
    };
    commitDocument(next);
  }, [commitDocument]);

  const updateBackground = useCallback((patch) => {
    const current = documentRef.current;
    const layer = current.elements.find((element) => element.role === "background") || current.elements[0];
    updateElement(layer.id, patch);
  }, [updateElement]);

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2800);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("project")) {
      url.searchParams.set("project", projectId);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [projectId]);

  useEffect(() => {
    setSavedAt("Saving on this device…");
    const timer = window.setTimeout(() => {
      try {
        saveProject(documentModel);
        setSavedAt("Saved on this device");
      } catch {
        setSavedAt("Storage is full");
        showNotice("This project could not be saved. Remove a large image or clear older browser data.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [documentModel, showNotice]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (typing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateLayers(selectedIdsRef.current);
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedIdsRef.current.length) {
        event.preventDefault();
        deleteLayers(selectedIdsRef.current);
      } else if (event.key === "Escape") {
        setPreview(false);
        setSelection([]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const persistOnExit = () => {
      try { saveProject(documentRef.current); } catch { /* autosave will report storage errors while the editor is open */ }
    };
    window.addEventListener("pagehide", persistOnExit);
    window.addEventListener("popstate", persistOnExit);
    return () => {
      window.removeEventListener("pagehide", persistOnExit);
      window.removeEventListener("popstate", persistOnExit);
    };
  }, []);

  const saveNow = () => {
    try {
      saveProject(documentRef.current);
      setSavedAt("Saved on this device");
      showNotice("Your design is saved in this browser for 30 days.");
    } catch {
      showNotice("This project could not be saved. Remove a large image or clear older browser data.");
    }
  };

  const createNewFromTemplate = (nextTemplateId) => {
    try { saveProject(documentRef.current); } catch { /* the current project remains in memory */ }
    onNewTemplate?.(nextTemplateId);
  };

  const addText = (variant) => {
    const id = makeElementId();
    const isHeading = variant === "heading";
    const element = {
      id,
      name: isHeading ? "New heading" : "New text",
      type: "text",
      text: isHeading ? "Your headline" : "Add your details here",
      x: 230,
      y: 620,
      width: 740,
      height: isHeading ? 150 : 100,
      fontFamily: isHeading ? "Georgia" : "Arial",
      fontSize: isHeading ? 76 : 36,
      fontWeight: isHeading ? 600 : 400,
      lineHeight: 1.15,
      letterSpacing: 0,
      alignment: "left",
      color: documentRef.current.elements.find((item) => item.id === "headline")?.color || "#282d2b",
      opacity: 1,
      rotation: 0,
      visible: true,
      locked: false,
    };
    commitDocument({ ...documentRef.current, elements: [...documentRef.current.elements, element] });
    setSelection([id]);
  };

  const addShape = (kind) => {
    const id = makeElementId();
    const common = { id, name: kind === "star" ? "Star" : kind === "line" ? "Line" : kind === "ellipse" ? "Circle" : "Rectangle", type: kind === "star" ? "path" : kind, x: 420, y: 520, width: kind === "line" ? 300 : 220, height: kind === "line" ? 4 : 190, fill: kind === "line" ? "none" : "#e3a64f", stroke: "#315f4d", strokeWidth: kind === "line" ? 5 : 2, opacity: 1, rotation: 0, visible: true, locked: false };
    const element = kind === "star"
      ? { ...common, path: "M50 0 61 37 100 50 61 63 50 100 39 63 0 50 39 37Z", viewBox: "0 0 100 100" }
      : common;
    commitDocument({ ...documentRef.current, elements: [...documentRef.current.elements, element] });
    setSelection([id]);
  };

  const addUploadedFiles = async (fileList, options = {}) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const validFiles = files.filter((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type) && file.size <= 6 * 1024 * 1024);
    if (validFiles.length !== files.length) showNotice("Use JPG, PNG or WebP images under 6 MB each.");
    if (!validFiles.length) return;
    try {
      const uploads = await Promise.all(validFiles.map(async (file) => ({ file, image: await imageData(file) })));
      const current = documentRef.current;
      const newElements = uploads.map(({ file, image }, index) => {
        const id = makeElementId();
        const width = options.asBackground ? current.canvas.width : 430;
        const height = options.asBackground ? current.canvas.height : 380;
        return {
          id,
          name: options.asBackground ? "Photo background" : file.name.replace(/\.[^.]+$/, "") || `Photo ${index + 1}`,
          type: "image",
          src: image.src,
          sourceWidth: image.sourceWidth,
          sourceHeight: image.sourceHeight,
          x: options.asBackground ? 0 : 260 + index * 28,
          y: options.asBackground ? 0 : 350 + index * 28,
          width,
          height,
          cropZoom: 1,
          cropX: 0.5,
          cropY: 0.5,
          opacity: 1,
          rotation: 0,
          visible: true,
          locked: Boolean(options.asBackground),
          role: options.asBackground ? "background-image" : undefined,
          radius: 0,
        };
      });
      let newId = newElements.map((element) => element.id);
      let elements;
      if (options.replaceId) {
        const replacement = newElements[0];
        elements = current.elements.map((element) => element.id === options.replaceId
          ? { ...element, src: replacement.src, sourceWidth: replacement.sourceWidth, sourceHeight: replacement.sourceHeight, cropZoom: 1, cropX: 0.5, cropY: 0.5, name: replacement.name }
          : element);
        elements = [...elements, ...newElements.slice(1)];
        newId = [options.replaceId];
      } else if (options.asBackground) {
        const baseLayer = current.elements[0];
        elements = baseLayer
          ? [baseLayer, ...newElements, ...current.elements.slice(1).filter((element) => element.id !== baseLayer.id)]
          : [...newElements, ...current.elements];
      } else {
        elements = [...current.elements, ...newElements];
      }
      commitDocument({ ...current, elements });
      setSelection(newId);
      setActiveTool("uploads");
    } catch {
      showNotice("One of those images could not be processed. Try another file.");
    }
  };

  const deleteLayers = (ids) => {
    if (!ids?.length) return;
    const deleted = new Set(ids);
    commitDocument({ ...documentRef.current, elements: documentRef.current.elements.filter((element) => !deleted.has(element.id)) });
    setSelection([]);
  };

  const duplicateLayers = (ids) => {
    if (!ids?.length) return;
    const selected = documentRef.current.elements.filter((element) => ids.includes(element.id));
    const copyGroupId = selected.length > 1 ? makeElementId() : selected[0]?.groupId;
    const copies = selected.map((element) => ({ ...element, id: makeElementId(), ...(copyGroupId ? { groupId: copyGroupId } : {}), name: `${element.name || element.type} copy`, x: element.x + 24, y: element.y + 24, locked: false }));
    commitDocument({ ...documentRef.current, elements: [...documentRef.current.elements, ...copies] });
    setSelection(copies.map((element) => element.id));
  };

  const groupSelection = () => {
    const ids = selectedIdsRef.current;
    if (ids.length < 2) return;
    const groupId = makeElementId();
    commitDocument({
      ...documentRef.current,
      elements: documentRef.current.elements.map((element) => ids.includes(element.id) ? { ...element, groupId } : element),
    });
  };

  const ungroupSelection = () => {
    const ids = new Set(selectedIdsRef.current);
    const groups = new Set(documentRef.current.elements.filter((element) => ids.has(element.id) && element.groupId).map((element) => element.groupId));
    if (!groups.size) return;
    commitDocument({
      ...documentRef.current,
      elements: documentRef.current.elements.map((element) => groups.has(element.groupId) ? { ...element, groupId: undefined } : element),
    });
  };

  const alignSelection = (axis) => {
    const ids = new Set(selectedIdsRef.current);
    const selectedLayers = documentRef.current.elements.filter((element) => ids.has(element.id));
    if (selectedLayers.length < 2) return;
    const box = boxFor(selectedLayers);
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    commitDocument({
      ...documentRef.current,
      elements: documentRef.current.elements.map((element) => !ids.has(element.id) ? element : axis === "x"
        ? { ...element, x: centerX - element.width / 2 }
        : { ...element, y: centerY - element.height / 2 }),
    });
  };

  const toggleLayer = (id, property) => {
    const element = documentRef.current.elements.find((item) => item.id === id);
    if (element) updateElement(id, { [property]: !element[property] });
  };

  const reorderLayer = (id, direction) => {
    const elements = [...documentRef.current.elements];
    const index = elements.findIndex((element) => element.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= elements.length) return;
    [elements[index], elements[target]] = [elements[target], elements[index]];
    commitDocument({ ...documentRef.current, elements });
  };

  const selectLayer = (id, multi = false) => {
    if (multi) {
      const current = selectedIdsRef.current;
      setSelection(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    } else {
      const layer = documentRef.current.elements.find((element) => element.id === id);
      const grouped = layer?.groupId
        ? documentRef.current.elements.filter((element) => element.groupId === layer.groupId).map((element) => element.id)
        : [id];
      setSelection(grouped);
    }
  };

  const beginGesture = (event, kind, ids, handle = "") => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const current = documentRef.current;
    const editable = current.elements.filter((element) => ids.includes(element.id) && !element.locked && element.visible);
    if (!editable.length) return;
    const box = boxFor(editable);
    const start = pointOnCanvas(event, svgRef.current);
    const svg = svgRef.current;
    try { svg?.setPointerCapture(event.pointerId); } catch { /* pointer capture is not supported by every embedded preview */ }
    gestureRef.current = {
      pointerId: event.pointerId,
      kind,
      handle,
      ids: editable.map((element) => element.id),
      initial: current,
      elements: editable,
      box,
      start,
      angle: Math.atan2(start.y - (box.y + box.height / 2), start.x - (box.x + box.width / 2)),
    };
  };

  const onLayerPointerDown = (event, layer) => {
    if (event.shiftKey) {
      selectLayer(layer.id, true);
      return;
    }
    const currentSelection = selectedIdsRef.current;
    const grouped = layer.groupId
      ? documentRef.current.elements.filter((element) => element.groupId === layer.groupId).map((element) => element.id)
      : [layer.id];
    const ids = currentSelection.includes(layer.id) ? currentSelection : grouped;
    if (!currentSelection.includes(layer.id)) setSelection(ids);
    if (!layer.locked) beginGesture(event, "move", ids);
  };

  const onHandlePointerDown = (event, handle) => beginGesture(event, handle === "rotate" ? "rotate" : "resize", selectedIdsRef.current, handle);

  const updateCanvasDrag = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || (event.pointerId !== undefined && event.pointerId !== gesture.pointerId)) return;
    const point = pointOnCanvas(event, svgRef.current);
    const current = documentRef.current;
    let elements = gesture.initial.elements;

    if (gesture.kind === "move") {
      let dx = point.x - gesture.start.x;
      let dy = point.y - gesture.start.y;
      let vertical = false;
      let horizontal = false;
      const centerX = gesture.box.x + gesture.box.width / 2 + dx;
      const centerY = gesture.box.y + gesture.box.height / 2 + dy;
      if (Math.abs(centerX - current.canvas.width / 2) < 14) {
        dx += current.canvas.width / 2 - centerX;
        vertical = true;
      }
      if (Math.abs(centerY - current.canvas.height / 2) < 14) {
        dy += current.canvas.height / 2 - centerY;
        horizontal = true;
      }
      dx = Math.max(-gesture.box.x, Math.min(current.canvas.width - gesture.box.x - gesture.box.width, dx));
      dy = Math.max(-gesture.box.y, Math.min(current.canvas.height - gesture.box.y - gesture.box.height, dy));
      setGuides({ vertical, horizontal });
      const ids = new Set(gesture.ids);
      elements = gesture.initial.elements.map((element) => ids.has(element.id) ? { ...element, x: element.x + dx, y: element.y + dy } : element);
    } else if (gesture.kind === "rotate") {
      const centerX = gesture.box.x + gesture.box.width / 2;
      const centerY = gesture.box.y + gesture.box.height / 2;
      const angle = Math.atan2(point.y - centerY, point.x - centerX);
      const delta = (angle - gesture.angle) * (180 / Math.PI);
      const ids = new Set(gesture.ids);
      elements = gesture.initial.elements.map((element) => {
        if (!ids.has(element.id)) return element;
        const elementCenterX = element.x + element.width / 2;
        const elementCenterY = element.y + element.height / 2;
        const offsetX = elementCenterX - centerX;
        const offsetY = elementCenterY - centerY;
        const radians = delta * (Math.PI / 180);
        return {
          ...element,
          x: centerX + offsetX * Math.cos(radians) - offsetY * Math.sin(radians) - element.width / 2,
          y: centerY + offsetX * Math.sin(radians) + offsetY * Math.cos(radians) - element.height / 2,
          rotation: (element.rotation || 0) + delta,
        };
      });
    } else {
      const { x, y, width, height } = gesture.box;
      let left = x;
      let right = x + width;
      let top = y;
      let bottom = y + height;
      const handle = gesture.handle;
      if (handle.includes("w")) left = Math.max(0, Math.min(point.x, right - 24));
      if (handle.includes("e")) right = Math.min(current.canvas.width, Math.max(point.x, left + 24));
      if (handle.includes("n")) top = Math.max(0, Math.min(point.y, bottom - 24));
      if (handle.includes("s")) bottom = Math.min(current.canvas.height, Math.max(point.y, top + 24));
      const scaleX = (right - left) / Math.max(1, width);
      const scaleY = (bottom - top) / Math.max(1, height);
      const ids = new Set(gesture.ids);
      elements = gesture.initial.elements.map((element) => {
        if (!ids.has(element.id)) return element;
        const nextWidth = Math.max(12, element.width * scaleX);
        const nextHeight = Math.max(12, element.height * scaleY);
        const resized = {
          ...element,
          x: left + (element.x - x) * scaleX,
          y: top + (element.y - y) * scaleY,
          width: nextWidth,
          height: nextHeight,
        };
        if (element.type === "text") resized.fontSize = Math.max(8, Math.min(240, element.fontSize * Math.min(scaleX, scaleY)));
        return resized;
      });
    }
    setTransientDocument({ ...gesture.initial, elements });
  };

  const finishGesture = (event) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    if (event?.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
    const result = documentRef.current;
    if (JSON.stringify(result.elements) !== JSON.stringify(gesture.initial.elements)) {
      const history = [...historyRef.current.slice(0, historyIndexRef.current + 1), freshHistory(result)].slice(-HISTORY_LIMIT);
      historyRef.current = history;
      historyIndexRef.current = history.length - 1;
      setHistoryIndex(history.length - 1);
    }
    gestureRef.current = null;
    setGuides({});
  };

  const resizeCanvas = (preset) => {
    const current = documentRef.current;
    const scaleX = preset.width / current.canvas.width;
    const scaleY = preset.height / current.canvas.height;
    const elements = current.elements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: Math.max(element.type === "line" ? 2 : 12, element.height * scaleY),
      ...(element.type === "text" ? { fontSize: Math.max(8, element.fontSize * Math.min(scaleX, scaleY)) } : {}),
    }));
    commitDocument({ ...current, canvas: { ...current.canvas, width: preset.width, height: preset.height }, elements });
  };

  const useAsBackground = () => {
    if (!selected || selected.type !== "image") return;
    const current = documentRef.current;
    const image = { ...selected, x: 0, y: 0, width: current.canvas.width, height: current.canvas.height, role: "background-image", locked: true, rotation: 0 };
    const base = current.elements.find((element) => element.id === "background");
    const rest = current.elements.filter((element) => element.id !== selected.id && element.id !== base?.id);
    const layers = base ? [base, image, ...rest] : [image, ...rest];
    commitDocument({ ...current, elements: layers });
    setSelection([image.id]);
  };

  const exportDesign = (format) => {
    const svg = svgRef.current;
    if (!svg) return;
    const copy = svg.cloneNode(true);
    copy.querySelectorAll("[data-editor-overlay]").forEach((node) => node.remove());
    copy.removeAttribute("class");
    copy.removeAttribute("style");
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("width", String(documentRef.current.canvas.width));
    copy.setAttribute("height", String(documentRef.current.canvas.height));
    copy.setAttribute("viewBox", `0 0 ${documentRef.current.canvas.width} ${documentRef.current.canvas.height}`);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = window.document.createElement("canvas");
      canvas.width = documentRef.current.canvas.width;
      canvas.height = documentRef.current.canvas.height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        showNotice("Image export is unavailable in this browser.");
        return;
      }
      context.fillStyle = format === "jpg" ? (background?.fill || "#ffffff") : "transparent";
      if (format === "jpg") context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) {
          showNotice("Could not export this design. Please try again.");
          return;
        }
        const link = window.document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${slug(documentRef.current.title)}.${format}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1800);
        showNotice(`Your ${format.toUpperCase()} is ready.`);
      }, format === "jpg" ? "image/jpeg" : "image/png", 0.94);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      showNotice("Could not export this design. Please try again.");
    };
    image.src = url;
  };

  const activePreset = CANVAS_PRESETS.find((preset) => preset.width === documentModel.canvas.width && preset.height === documentModel.canvas.height)?.label || "Custom size";

  return (
    <main className="de-editor">
      <header className="de-topbar">
        <div className="de-brand-area">
          <button className="de-brand" type="button" onClick={() => { try { saveProject(documentRef.current); } catch { /* autosave will report storage errors while the editor is open */ } onBack?.(); }} aria-label="Return to Dzinewallah home"><span className="de-brand-mark"><i /><i /><i /></span><b>Dzinewallah</b></button>
          <label className="de-project-title"><input aria-label="Design name" value={documentModel.title || "Untitled design"} onChange={(event) => commitDocument({ ...documentRef.current, title: event.target.value })} /><span>{savedAt || "Guest · this device"}</span></label>
        </div>
        <div className="de-toolbar">
          <button type="button" className="de-toolbar-button" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" aria-label="Undo">↶</button>
          <button type="button" className="de-toolbar-button" onClick={redo} disabled={historyIndex >= historyRef.current.length - 1} title="Redo (Ctrl+Y)" aria-label="Redo">↷</button>
          <div className="de-zoom-control"><button type="button" onClick={() => setZoom((value) => Math.max(50, value - 10))} aria-label="Zoom out">−</button><span>{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(160, value + 10))} aria-label="Zoom in">+</button></div>
          <button type="button" className="de-toolbar-button de-fit-button" onClick={() => setZoom(100)}>Fit</button>
          <select className="de-size-select" value={activePreset} aria-label="Canvas size" onChange={(event) => {
            const preset = CANVAS_PRESETS.find((item) => item.label === event.target.value);
            if (preset) resizeCanvas(preset);
          }}>{activePreset === "Custom size" && <option>Custom size</option>}{CANVAS_PRESETS.map((preset) => <option key={preset.label}>{preset.label}</option>)}</select>
          <button type="button" className="de-toolbar-button de-preview-button" onClick={() => setPreview(true)}>Preview</button>
          <button type="button" className="de-toolbar-button" onClick={saveNow}>Save</button>
          <button type="button" className="de-download-jpg" onClick={() => exportDesign("jpg")}>JPG</button>
          <button type="button" className="de-download" onClick={() => exportDesign("png")}>Download PNG</button>
        </div>
      </header>

      <div className="de-workspace">
        <ToolPanel
          templates={TEMPLATE_LIBRARY}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onNewTemplate={createNewFromTemplate}
          onAddText={addText}
          onAddShape={addShape}
          onFiles={(files) => addUploadedFiles(files)}
          background={background || {}}
          gradient={background?.gradient}
          onBackgroundChange={updateBackground}
          onGradientChange={(enabled) => updateBackground({ gradient: enabled ? "#e4e8d4" : "" })}
          onBackgroundImage={(files) => addUploadedFiles(files, { asBackground: true })}
        />

        <section className="de-canvas-panel" aria-label="Interactive design workspace">
          <div className="de-canvas-panel-head"><span>{documentModel.canvas.width} × {documentModel.canvas.height} px</span><span>{selectedIds.length > 1 ? `${selectedIds.length} layers selected` : selected ? selected.name : "Select a layer to edit"}</span></div>
          <div className="de-canvas-stage">
            <DragCanvas
              documentModel={documentModel}
              selectedIds={selectedIds}
              zoom={zoom}
              svgRef={svgRef}
              guides={guides}
              onLayerPointerDown={onLayerPointerDown}
              onHandlePointerDown={onHandlePointerDown}
              onCanvasPointerMove={updateCanvasDrag}
              onCanvasPointerUp={finishGesture}
              onCanvasPointerCancel={finishGesture}
              onClearSelection={() => setSelection([])}
            />
          </div>
          <p className="de-canvas-tip">Drag to move · use corner/edge handles to resize · use the top handle to rotate</p>
        </section>

        <InspectorPanel
          selected={selected}
          selectedIds={selectedIds}
          elements={documentModel.elements}
          background={background || {}}
          onSelect={selectLayer}
          onUpdate={(patch, target = "selected") => target === "background"
            ? updateBackground(patch)
            : selected && updateElement(selected.id, patch)}
          onReorder={reorderLayer}
          onToggle={toggleLayer}
          onDuplicate={(ids) => duplicateLayers(Array.isArray(ids) ? ids : [ids])}
          onDelete={deleteLayers}
          onGroup={groupSelection}
          onUngroup={ungroupSelection}
          onAlign={alignSelection}
          canUngroup={selectedElements.some((element) => element.groupId)}
          onReplaceImage={(files) => addUploadedFiles(files, { replaceId: selected?.id })}
          onUseAsBackground={useAsBackground}
        />
      </div>

      {preview && (
        <div className="de-preview-backdrop" role="dialog" aria-modal="true" aria-label="Design preview" onPointerDown={(event) => { if (event.target === event.currentTarget) setPreview(false); }}>
          <div className="de-preview-dialog">
            <div className="de-preview-head"><div><span className="de-kicker">PREVIEW</span><h2>{documentModel.title}</h2></div><button type="button" className="de-toolbar-button" onClick={() => setPreview(false)} aria-label="Close preview">×</button></div>
            <DragCanvas documentModel={documentModel} selectedIds={[]} zoom={100} preview />
            <div className="de-preview-actions"><button type="button" className="de-download-jpg" onClick={() => exportDesign("jpg")}>Download JPG</button><button type="button" className="de-download" onClick={() => exportDesign("png")}>Download PNG</button></div>
          </div>
        </div>
      )}
      {notice && <div className="de-toast" role="status">{notice}</div>}
    </main>
  );
}
