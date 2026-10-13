import { createBlankDocument, createTemplateDocument } from "./templateDocument.js";

const PROJECT_KEY = "dzinewallah-projects";
const PROJECT_PREFIX = "dzinewallah-project-";
const LEGACY_PREFIX = "dzinewallah-draft-";
const PROJECT_TTL = 30 * 24 * 60 * 60 * 1000;

export function createProjectId() {
  return globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readIndex() {
  try {
    const value = JSON.parse(localStorage.getItem(PROJECT_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function tidyIndex(index, now = Date.now()) {
  return index.filter((item) => item?.id && item.expiresAt > now).slice(0, 40);
}

export function listSavedProjects() {
  const now = Date.now();
  const projects = tidyIndex(readIndex(), now).flatMap((item) => {
    try {
      const stored = JSON.parse(localStorage.getItem(`${PROJECT_PREFIX}${item.id}`) || "null");
      return stored && stored.expiresAt > now ? [{
        id: stored.id,
        templateId: stored.templateId,
        title: stored.title || "Untitled design",
        updatedAt: stored.updatedAt,
      }] : [];
    } catch {
      return [];
    }
  });
  try {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(projects.map((project) => ({
      ...project,
      expiresAt: now + PROJECT_TTL,
    }))));
  } catch {
    // Opening the gallery still works if browser storage is unavailable.
  }
  return projects;
}

export function loadProject(projectId, template) {
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(`${PROJECT_PREFIX}${projectId}`) || "null");
    if (stored?.schemaVersion === 2 && Array.isArray(stored.elements) && stored.expiresAt > now) {
      return {
        ...stored,
        canvas: { width: 1200, height: 1500, background: "#fbf8f1", ...stored.canvas },
      };
    }

    const legacy = JSON.parse(localStorage.getItem(`${LEGACY_PREFIX}${template.id}`) || "null");
    const initial = template.id === "blank"
      ? createBlankDocument(projectId)
      : createTemplateDocument(template, projectId);
    if (legacy) {
      return {
        ...initial,
        canvas: { ...initial.canvas, background: legacy.canvas?.background || legacy.background || initial.canvas.background },
        elements: initial.elements.map((element) => {
          if (element.id === "headline" && legacy.headline) return { ...element, text: legacy.headline };
          if (element.id === "subline" && legacy.subline) return { ...element, text: legacy.subline };
          if (element.id === "photo" && legacy.photo) return { ...element, src: legacy.photo };
          return element;
        }),
      };
    }
    return initial;
  } catch {
    return template.id === "blank"
      ? createBlankDocument(projectId)
      : createTemplateDocument(template, projectId);
  }
}

export function saveProject(document) {
  const now = Date.now();
  const saved = {
    ...document,
    updatedAt: now,
    expiresAt: now + PROJECT_TTL,
  };
  localStorage.setItem(`${PROJECT_PREFIX}${document.id}`, JSON.stringify(saved));
  const index = tidyIndex(readIndex().filter((item) => item.id !== document.id), now);
  index.unshift({
    id: document.id,
    templateId: document.templateId,
    title: document.title || "Untitled design",
    updatedAt: now,
    expiresAt: now + PROJECT_TTL,
  });
  localStorage.setItem(PROJECT_KEY, JSON.stringify(index.slice(0, 40)));
  return saved;
}

export function deleteProject(projectId) {
  localStorage.removeItem(`${PROJECT_PREFIX}${projectId}`);
  localStorage.setItem(PROJECT_KEY, JSON.stringify(readIndex().filter((item) => item.id !== projectId)));
}
