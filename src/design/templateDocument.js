const BASE_CANVAS = { width: 1200, height: 1500 };

export const blankTemplate = {
  id: "blank",
  category: "Blank",
  name: "Blank canvas",
  headline: "",
  subline: "",
  palette: ["#fbf8f1", "#315f4d", "#282d2b", "#ffffff"],
  style: "blank",
};

const text = (id, name, value, x, y, width, height, color, fontSize, extras = {}) => ({
  id,
  name,
  type: "text",
  text: value,
  x,
  y,
  width,
  height,
  color,
  fontFamily: extras.fontFamily || "Georgia",
  fontSize,
  fontWeight: extras.fontWeight || 400,
  alignment: extras.alignment || "left",
  letterSpacing: extras.letterSpacing || 0,
  lineHeight: extras.lineHeight || 1.05,
  opacity: 1,
  rotation: 0,
  visible: true,
  locked: false,
});

const shape = (id, name, type, x, y, width, height, properties = {}) => ({
  id,
  name,
  type,
  x,
  y,
  width,
  height: type === "line" && height === 0 ? 2 : height,
  fill: "none",
  stroke: "none",
  strokeWidth: 0,
  opacity: 1,
  rotation: 0,
  visible: true,
  locked: false,
  ...properties,
});

function motifLayers(template, accent, soft, paper) {
  const k = (suffix) => `${template.id}-${suffix}`;
  switch (template.style) {
    case "wedding":
    case "blue":
    case "dinner":
    case "terracotta":
    case "garden":
      return [
        shape(k("arch-back"), "Garden arch", "path", 195, 230, 810, 500, {
          path: "M8 100V53C8 24 25 5 50 5s42 19 42 48v47",
          viewBox: "0 0 100 100",
          stroke: accent,
          strokeWidth: 3,
        }),
        shape(k("arch-front"), "Inner arch", "path", 248, 274, 704, 455, {
          path: "M8 100V52C8 25 25 5 50 5s42 20 42 47v48",
          viewBox: "0 0 100 100",
          stroke: paper,
          strokeWidth: 2,
        }),
        shape(k("floral-dot"), "Arch detail", "circle", 582, 315, 36, 36, { fill: accent }),
        shape(k("leaf-left"), "Left leaf", "path", 260, 520, 100, 145, {
          path: "M50 98C4 75 2 30 8 8c37 5 68 30 59 60-3 12-10 22-17 30Zm0 0L34 38",
          viewBox: "0 0 100 110",
          fill: soft,
          stroke: accent,
          strokeWidth: 2,
        }),
        shape(k("leaf-right"), "Right leaf", "path", 840, 520, 100, 145, {
          path: "M50 98C96 75 98 30 92 8c-37 5-68 30-59 60 3 12 10 22 17 30Zm0 0 16-60",
          viewBox: "0 0 100 110",
          fill: soft,
          stroke: accent,
          strokeWidth: 2,
        }),
      ];
    case "coffee":
    case "menu":
      return [
        shape(k("cup-halo"), "Cup backdrop", "circle", 760, 218, 300, 300, { fill: paper, opacity: 0.88 }),
        shape(k("steam"), "Steam", "path", 830, 245, 115, 95, {
          path: "M20 90C52 65 2 43 36 7M62 90c31-25-18-48 15-83",
          viewBox: "0 0 100 100",
          stroke: accent,
          strokeWidth: 4,
        }),
        shape(k("cup"), "Coffee cup", "path", 830, 320, 185, 155, {
          path: "M8 8h70v52a27 27 0 0 1-27 27h-16A27 27 0 0 1 8 60V8Zm70 12h9a20 20 0 1 1 0 40h-9M2 99h93",
          viewBox: "0 0 100 100",
          stroke: accent,
          strokeWidth: 4,
        }),
        shape(k("steam-dot"), "Coffee bean", "ellipse", 785, 500, 18, 31, { fill: accent, rotation: -28 }),
      ];
    case "market":
      return [
        shape(k("awning"), "Market awning", "path", 220, 285, 760, 380, {
          path: "M4 22 15 4h70l11 18-6 16c-9 8-19 6-25 0-8 9-18 9-26 0-8 9-18 9-26 0-7 7-18 8-25 0L4 22Zm9 18h73v55H13z",
          viewBox: "0 0 100 100",
          fill: soft,
          stroke: accent,
          strokeWidth: 2.5,
        }),
        shape(k("market-sun"), "Market sun", "circle", 850, 228, 82, 82, { fill: accent, opacity: 0.82 }),
        shape(k("market-stall"), "Market counter", "rect", 285, 595, 630, 38, { fill: accent }),
      ];
    case "sale":
      return [
        shape(k("sale-halo"), "Sale badge backdrop", "circle", 755, 225, 320, 320, { fill: soft }),
        shape(k("sale-ring"), "Sale badge ring", "circle", 800, 270, 230, 230, { fill: "none", stroke: accent, strokeWidth: 5 }),
        text(k("sale-label"), "Sale badge text", "GOOD\nDEAL", 825, 340, 180, 90, accent, 34, { alignment: "center", fontFamily: "Arial", fontWeight: 700 }),
        shape(k("sale-spark"), "Sale sparkle", "path", 752, 544, 125, 112, {
          path: "M50 0 59 37 96 16 75 50l39 9-39 9 21 34-37-21-9 39-9-39-37 21 21-34-39-9 39-9L4 16l37 21z",
          viewBox: "0 0 114 114",
          fill: accent,
        }),
      ];
    case "home":
      return [
        shape(k("home-body"), "House", "path", 745, 244, 350, 390, {
          path: "M8 45 50 8l42 37v48H8V45Zm30 48V60h24v33M25 51h17m16 0h17",
          viewBox: "0 0 100 100",
          fill: soft,
          stroke: accent,
          strokeWidth: 2.5,
        }),
        shape(k("home-sun"), "Home sun", "circle", 815, 245, 70, 70, { fill: accent, opacity: 0.75 }),
        shape(k("home-ground"), "Ground line", "line", 225, 646, 750, 0, { stroke: accent, strokeWidth: 3 }),
      ];
    case "studio":
      return [
        shape(k("studio-vase"), "Studio vase", "path", 770, 255, 300, 330, {
          path: "M35 8h30v18c0 7-5 12-9 18l15 34c8 18-1 34-16 34H45c-15 0-24-16-16-34l15-34c-4-6-9-11-9-18V8Zm3 20h24M34 78h32",
          viewBox: "0 0 100 120",
          fill: soft,
          stroke: accent,
          strokeWidth: 3,
        }),
        shape(k("studio-sun"), "Studio accent", "circle", 850, 222, 72, 72, { fill: accent, opacity: 0.78 }),
        shape(k("studio-line"), "Display shelf", "line", 730, 617, 360, 0, { stroke: accent, strokeWidth: 3 }),
      ];
    case "sound":
      return [
        shape(k("sound-halo"), "Sound backdrop", "circle", 760, 220, 320, 320, { fill: soft }),
        shape(k("sound-ring-outer"), "Sound wave", "circle", 800, 260, 240, 240, { fill: "none", stroke: accent, strokeWidth: 3, opacity: 0.55 }),
        shape(k("sound-ring-inner"), "Sound core", "circle", 850, 310, 140, 140, { fill: accent }),
        shape(k("sound-play"), "Play symbol", "path", 892, 344, 65, 72, {
          path: "M5 4 62 36 5 68Z",
          viewBox: "0 0 70 72",
          fill: paper,
        }),
        ...[0, 1, 2, 3].map((i) => shape(k(`sound-bar-${i}`), "Sound bar", "rect", 250 + i * 42, 360 + (i % 2) * 18, 16, 110 - (i % 2) * 28, { fill: accent, opacity: 0.6 + i * 0.08 })),
      ];
    case "launch":
      return [
        shape(k("launch-box"), "Launch package", "path", 755, 232, 340, 365, {
          path: "M6 28 50 5l44 23v45L50 96 6 73V28Zm0 0 44 25 44-25M50 53v43",
          viewBox: "0 0 100 100",
          fill: soft,
          stroke: accent,
          strokeWidth: 2.5,
        }),
        shape(k("launch-star"), "Launch sparkle", "path", 770, 562, 100, 100, {
          path: "M50 0 60 38 98 50 60 62 50 100 40 62 2 50 40 38Z",
          viewBox: "0 0 100 100",
          fill: accent,
        }),
        shape(k("launch-dot"), "Launch dot", "circle", 1010, 630, 32, 32, { fill: accent }),
      ];
    case "night":
      return [
        shape(k("moon"), "Moon", "path", 780, 224, 270, 270, {
          path: "M68 4C39 17 27 51 40 78c12 25 42 34 67 22-13 34-53 51-87 35C-17 117-4 29 68 4Z",
          viewBox: "0 0 110 140",
          fill: soft,
        }),
        ...[[930, 230, 26], [720, 408, 18], [1015, 530, 22], [810, 570, 14]].map(([x, y, size], i) =>
          shape(k(`night-star-${i}`), "Star", "path", x, y, size, size, {
            path: "M50 0 61 37 100 50 61 63 50 100 39 63 0 50 39 37Z",
            viewBox: "0 0 100 100",
            fill: accent,
          })),
      ];
    case "sunny":
      return [
        shape(k("sun-rays"), "Sun rays", "path", 744, 211, 360, 360, {
          path: "M50 0v18m0 64v18M0 50h18m64 0h18M15 15l13 13m44 44 13 13m0-70L72 28M28 72 15 85",
          viewBox: "0 0 100 100",
          stroke: accent,
          strokeWidth: 4,
        }),
        shape(k("sun-core"), "Sun", "circle", 800, 267, 250, 250, { fill: accent }),
        shape(k("sun-ground"), "Sun horizon", "line", 755, 590, 340, 0, { stroke: accent, strokeWidth: 3 }),
      ];
    case "festival":
    case "winter":
    case "spring":
    case "harvest":
    case "colors":
      return [
        shape(k("festival-garland"), "Festival garland", "path", 170, 222, 860, 400, {
          path: "M2 6C30 51 70 51 98 6M2 6C30 51 70 51 98 6",
          viewBox: "0 0 100 100",
          stroke: accent,
          strokeWidth: 2.5,
        }),
        ...[0, 1, 2, 3, 4].map((i) =>
          shape(k(`festival-light-${i}`), "Festival light", "circle", 254 + i * 145, 362 + Math.abs(2 - i) * 34, 38, 48, { fill: i % 2 ? soft : accent, stroke: accent, strokeWidth: 2 })),
        shape(k("festival-spark"), "Festival sparkle", "path", 830, 512, 128, 128, {
          path: "M50 0 62 38 100 50 62 62 50 100 38 62 0 50 38 38Z",
          viewBox: "0 0 100 100",
          fill: accent,
        }),
      ];
    case "birthday":
    case "party":
    case "pop":
      return [
        ...[[780, 260], [900, 220], [1010, 315], [755, 430], [975, 500], [840, 570]].map(([x, y], i) =>
          shape(k(`party-confetti-${i}`), i % 2 ? "Confetti dot" : "Confetti", i % 2 ? "circle" : "rect", x, y, i % 2 ? 28 : 17, i % 2 ? 28 : 49, {
            fill: i % 3 === 0 ? soft : accent,
            rotation: i * 18 - 20,
          })),
        shape(k("party-balloon"), "Balloon", "ellipse", 886, 260, 92, 126, { fill: soft, stroke: accent, strokeWidth: 2 }),
        shape(k("party-string"), "Balloon string", "path", 916, 382, 36, 125, { path: "M50 0C5 43 80 72 35 100", viewBox: "0 0 100 100", stroke: accent, strokeWidth: 2 }),
      ];
    case "reminder":
    case "social":
      return [
        shape(k("social-orb"), "Soft backdrop", "circle", 770, 245, 280, 280, { fill: soft }),
        shape(k("social-leaf"), "Leaf", "path", 810, 280, 190, 240, {
          path: "M50 95C4 72 3 28 8 7c37 5 68 30 59 60-3 12-10 22-17 28Zm0 0L34 35",
          viewBox: "0 0 100 110",
          fill: accent,
          stroke: accent,
          strokeWidth: 2,
        }),
        shape(k("social-dot"), "Leaf detail", "circle", 765, 570, 38, 38, { fill: accent }),
      ];
    default:
      return [
        shape(k("default-orb"), "Decorative circle", "circle", 785, 240, 250, 250, { fill: soft }),
        shape(k("default-line-1"), "Decorative line", "line", 800, 300, 210, 0, { stroke: accent, strokeWidth: 3 }),
        shape(k("default-line-2"), "Decorative line", "line", 780, 365, 180, 0, { stroke: accent, strokeWidth: 3, opacity: 0.7 }),
        shape(k("default-line-3"), "Decorative line", "line", 820, 430, 170, 0, { stroke: accent, strokeWidth: 3, opacity: 0.5 }),
      ];
  }
}

function createDocument(template, id) {
  const [base, accent, ink, paper] = template.palette;
  const stamp = Date.now();
  const elements = [
    shape("background", "Background", "rect", 0, 0, BASE_CANVAS.width, BASE_CANVAS.height, { fill: base, locked: true, role: "background" }),
    shape("border", "Border", "rect", 80, 80, 1040, 1340, { fill: "none", stroke: accent, strokeWidth: 3 }),
    text("category", "Category label", template.category.toUpperCase(), 140, 122, 780, 42, accent, 22, { fontFamily: "Arial", fontWeight: 700, letterSpacing: 4 }),
    shape("category-rule", "Category underline", "line", 140, 188, 88, 0, { stroke: accent, strokeWidth: 3 }),
    ...motifLayers(template, accent, template.palette[3], paper),
    text("headline", "Headline", template.headline, 130, 710, 940, 240, ink, 100, { fontFamily: "Georgia", fontWeight: 600, lineHeight: 1.03 }),
    text("subline", "Supporting text", template.subline, 135, 990, 900, 92, ink, 31, { fontFamily: "Arial", lineHeight: 1.35 }),
    shape("footer-rule", "Footer line", "line", 140, 1300, 920, 0, { stroke: accent, strokeWidth: 2, opacity: 0.58 }),
    text("footer", "Footer label", "DZINEWALLAH · MADE BY YOU", 140, 1340, 720, 35, ink, 16, { fontFamily: "Arial", fontWeight: 700, letterSpacing: 3 }),
    text("page-mark", "Page mark", template.category.slice(0, 2).toUpperCase(), 1010, 1340, 45, 35, accent, 16, { fontFamily: "Arial", fontWeight: 700, alignment: "right" }),
  ];

  return {
    schemaVersion: 2,
    id,
    templateId: template.id,
    title: template.name,
    canvas: { ...BASE_CANVAS, background: base },
    elements,
    createdAt: stamp,
    updatedAt: stamp,
    expiresAt: stamp + 30 * 24 * 60 * 60 * 1000,
  };
}

export function createTemplateDocument(template, projectId) {
  return createDocument(template, projectId);
}

export function createBlankDocument(projectId) {
  const document = createDocument(blankTemplate, projectId);
  return { ...document, elements: [document.elements[0]], title: "Untitled design" };
}

export function makeElementId() {
  return globalThis.crypto?.randomUUID?.() || `layer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
