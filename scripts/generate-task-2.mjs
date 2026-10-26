import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import PDFDocument from "pdfkit";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "Task_2.md");
const outputPath = path.join(projectRoot, "Task_2.pdf");
const markdown = fs.readFileSync(sourcePath, "utf8");

const colors = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  navy: "#0f172a",
  blue: "#2563eb",
  blueSoft: "#dbeafe",
  amber: "#b45309",
  amberSoft: "#fef3c7",
  green: "#15803d",
  greenSoft: "#dcfce7",
  red: "#b91c1c",
  redSoft: "#fee2e2",
  violet: "#6d28d9",
  violetSoft: "#ede9fe",
  paper: "#ffffff",
};

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 62, right: 58, bottom: 58, left: 58 },
  bufferPages: true,
  info: {
    Title: "Task 2: Next Iteration Design",
    Author: "Nexus AML Internal Task Portal",
    Subject: "Process flow and sprint implementation plan",
  },
});

const output = fs.createWriteStream(outputPath);
doc.pipe(output);

const sectionPages = new Map();
let activeSubtopic = null;

function cleanInline(value) {
  return value
    .replace(/\*\*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function addPortraitPage() {
  doc.addPage({ size: "A4", layout: "portrait", margins: { top: 62, right: 58, bottom: 58, left: 58 } });
}

function ensureSpace(height) {
  if (doc.y + height > doc.page.height - 62) addPortraitPage();
}

function paragraph(text, options = {}) {
  const value = cleanInline(text);
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.font("Helvetica").fontSize(9.6);
  const height = doc.heightOfString(value, { width, lineGap: 3, ...options });
  ensureSpace(height + 9);
  doc.fillColor(colors.ink).text(value, {
    width,
    lineGap: 3,
    ...options,
  });
  doc.moveDown(0.55);
}

function heading(text, level) {
  if (process.env.DEBUG_PDF) {
    console.log(`page ${doc.bufferedPageRange().count}: ${text}`);
  }
  const value = cleanInline(text);
  activeSubtopic = null;

  if (level === 2) {
    sectionPages.set(value, doc.bufferedPageRange().count);
    ensureSpace(76);
    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.navy).text(value, { lineGap: 2 });
    const y = doc.y + 5;
    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).strokeColor(colors.line).lineWidth(0.7).stroke();
    doc.y = y + 10;
    return;
  }

  if (level === 3) {
    ensureSpace(52);
    doc.moveDown(0.75);
    const y = doc.y;
    doc.roundedRect(doc.page.margins.left, y + 1, 4, 20, 2).fill(colors.blue);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(colors.navy).text(value, doc.page.margins.left + 14, y, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 14,
      lineGap: 2,
    });
    doc.moveDown(0.45);
    return;
  }

  doc.font("Helvetica-Bold").fontSize(10.5);
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right - 20;
  const textHeight = doc.heightOfString(value, { width, lineGap: 2 });
  const boxHeight = Math.max(30, textHeight + 14);
  ensureSpace(boxHeight + 56);
  doc.moveDown(0.6);
  const y = doc.y;
  doc.roundedRect(doc.page.margins.left, y, width + 20, boxHeight, 6).fill(colors.blueSoft);
  doc.fillColor(colors.navy).text(value, doc.page.margins.left + 10, y + 7, { width, lineGap: 2 });
  doc.y = y + boxHeight + 9;
}

function bullet(text, ordered = false, index = "") {
  const marker = ordered ? `${index}.` : "•";
  const indent = activeSubtopic ? 20 : 0;
  const left = doc.page.margins.left + indent;
  const markerWidth = 18;
  const contentWidth = doc.page.width - doc.page.margins.right - left - markerWidth;
  const apiMatch = text.match(/^`([^`]+)`:\s*(.*)$/);

  if (apiMatch) {
    const [, endpoint, description] = apiMatch;
    doc.font("Courier-Bold").fontSize(8.2);
    const badgeWidth = Math.min(doc.widthOfString(endpoint) + 14, contentWidth - 120);
    const descriptionX = left + markerWidth + badgeWidth + 9;
    const descriptionWidth = doc.page.width - doc.page.margins.right - descriptionX;
    doc.font("Helvetica").fontSize(9.3);
    const descriptionHeight = doc.heightOfString(description, { width: descriptionWidth, lineGap: 2.5 });
    const height = Math.max(18, descriptionHeight);
    ensureSpace(height + 8);
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(9.3).fillColor(colors.blue).text(marker, left, y + 1, { width: markerWidth });
    doc.roundedRect(left + markerWidth, y - 2, badgeWidth, 18, 4).fill("#e2e8f0");
    doc.font("Courier-Bold").fontSize(8.2).fillColor(colors.navy).text(endpoint, left + markerWidth + 7, y + 2, {
      width: badgeWidth - 14,
      lineBreak: false,
    });
    doc.font("Helvetica").fontSize(9.3).fillColor(colors.ink).text(description, descriptionX, y, {
      width: descriptionWidth,
      lineGap: 2.5,
    });
    doc.y = y + height + 7;
    return;
  }

  const value = cleanInline(text);
  doc.font("Helvetica").fontSize(9.3);
  const height = doc.heightOfString(value, { width: contentWidth, lineGap: 2.5 });
  ensureSpace(height + 6);
  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(9.3).fillColor(colors.blue).text(marker, left, y, { width: markerWidth });
  doc.font("Helvetica").fontSize(9.3).fillColor(colors.ink).text(value, left + markerWidth, y, { width: contentWidth, lineGap: 2.5 });
  doc.y = Math.max(doc.y, y + height) + 5;
}

function subtopic(text) {
  ensureSpace(26);
  activeSubtopic = cleanInline(text);
  const x = doc.page.margins.left + 16;
  const y = doc.y + 2;
  doc.roundedRect(x, y + 1, 3, 13, 1.5).fill(colors.blue);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(colors.navy).text(activeSubtopic, x + 10, y, {
    lineBreak: false,
  });
  doc.y = y + 21;
}

function callout(labelText, bodyText) {
  const label = cleanInline(labelText);
  const body = cleanInline(bodyText);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.font("Helvetica").fontSize(9.5);
  const bodyHeight = doc.heightOfString(body, { width: width - 82, lineGap: 2 });
  const height = Math.max(34, bodyHeight + 16);
  ensureSpace(height + 8);
  const y = doc.y;
  doc.roundedRect(x, y, width, height, 6).fill("#f1f5f9");
  doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.blue).text(label.toUpperCase(), x + 12, y + 11, {
    width: 60,
    lineBreak: false,
  });
  doc.font("Helvetica").fontSize(9.5).fillColor(colors.ink).text(body, x + 76, y + 9, {
    width: width - 88,
    lineGap: 2,
  });
  doc.y = y + height + 9;
}

function drawContents(pageIndex) {
  doc.switchToPage(pageIndex);
  doc.font("Helvetica-Bold").fontSize(27).fillColor(colors.navy).text("Contents", 58, 70);
  doc.font("Helvetica").fontSize(10).fillColor(colors.muted).text("Process design, delivery plan, dependencies, and release controls", 58, 108);

  const sections = [
    "1. Scope and working assumptions",
    "2. Process flow map",
    "3. Proposed solution shape",
    "4. Sprint implementation plan",
    "5. Dependency sequence and critical path",
    "6. Risks and mitigations",
    "7. Definition of done",
  ];

  let y = 164;
  for (const [index, title] of sections.entries()) {
    const page = sectionPages.get(title) ?? "";
    doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.blue).text(String(index + 1).padStart(2, "0"), 58, y, {
      width: 28,
      lineBreak: false,
    });
    doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.ink).text(title.replace(/^\d+\.\s/, ""), 96, y - 2, {
      width: 360,
      lineBreak: false,
    });
    doc.moveTo(96, y + 22).lineTo(500, y + 22).strokeColor("#e2e8f0").lineWidth(0.6).stroke();
    doc.font("Helvetica-Bold").fontSize(10).fillColor(colors.muted).text(String(page), 506, y - 1, {
      width: 30,
      align: "right",
      lineBreak: false,
    });
    y += 70;
  }

  doc.roundedRect(58, 692, 478, 68, 8).fill("#f1f5f9");
  doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.navy).text("DELIVERY VIEW", 74, 710);
  doc.font("Helvetica").fontSize(9).fillColor(colors.muted).text("Sprint 1 establishes shared work and task details. Sprint 2 adds secure evidence and approval.", 74, 730, {
    width: 440,
  });
}

function arrow(x1, y1, x2, y2, color = colors.muted) {
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(1.4).stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 6;
  doc
    .moveTo(x2, y2)
    .lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6))
    .lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6))
    .closePath()
    .fillColor(color)
    .fill();
}

function box(x, y, width, height, label, fill = colors.paper, stroke = colors.line, radius = 7) {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(colors.ink).text(label, x + 8, y + height / 2 - 5, {
    width: width - 16,
    align: "center",
  });
}

function diamond(cx, cy, width, height, label, fill = colors.amberSoft, stroke = colors.amber) {
  doc
    .moveTo(cx, cy - height / 2)
    .lineTo(cx + width / 2, cy)
    .lineTo(cx, cy + height / 2)
    .lineTo(cx - width / 2, cy)
    .closePath()
    .fillAndStroke(fill, stroke);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(colors.ink).text(label, cx - width / 2 + 17, cy - 5, {
    width: width - 34,
    align: "center",
  });
}

function inputBox(x, y, width, height, text) {
  const inset = 12;
  doc
    .moveTo(x + inset, y)
    .lineTo(x + width, y)
    .lineTo(x + width - inset, y + height)
    .lineTo(x, y + height)
    .closePath()
    .fillAndStroke(colors.paper, colors.line);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(colors.ink).text(text, x + 12, y + height / 2 - 5, {
    width: width - 24,
    align: "center",
  });
}

function label(text, x, y, color = colors.muted) {
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(color).text(text, x, y, { lineBreak: false });
}

function drawFlowDiagram() {
  doc.addPage({ size: "A4", layout: "landscape", margins: { top: 42, right: 36, bottom: 42, left: 36 } });
  sectionPages.set("2. Process flow map", doc.bufferedPageRange().count);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.navy).text("2. Process flow map", 36, 38);
  doc.font("Helvetica").fontSize(8.5).fillColor(colors.muted).text("Solid arrows show the primary path. Side paths show recovery, rejection, blocking, and cancellation.", 36, 64);

  const cx = 421;
  const w = 180;
  const h = 30;
  const ys = [98, 145, 192, 239, 292, 345, 392, 445, 502];

  box(cx - w / 2, ys[0], w, h, "Task created", colors.blueSoft, colors.blue, 15);
  box(cx - w / 2, ys[1], w, h, "Assign active user");
  box(cx - w / 2, ys[2], w, h, "Assignee works", colors.blueSoft, colors.blue);
  inputBox(cx - w / 2, ys[3], w, h, "Upload evidence");
  diamond(cx, ys[4] + 15, 176, 44, "File valid and stored?");
  box(cx - w / 2, ys[5], w, h, "Pending review", colors.violetSoft, colors.violet);
  box(cx - w / 2, ys[6], w, h, "Admin reviews evidence", colors.violetSoft, colors.violet);
  diamond(cx, ys[7] + 15, 176, 44, "Approve completion?", colors.violetSoft, colors.violet);
  box(cx - w / 2, ys[8], w, h, "Completed", colors.greenSoft, colors.green, 15);

  for (let index = 0; index < 4; index += 1) {
    arrow(cx, ys[index] + h, cx, ys[index + 1] - (index === 3 ? 7 : 0));
  }
  arrow(cx, ys[4] + 37, cx, ys[5]);
  arrow(cx, ys[5] + h, cx, ys[6]);
  arrow(cx, ys[6] + h, cx, ys[7] - 7);
  arrow(cx, ys[7] + 37, cx, ys[8]);
  label("Yes", cx + 8, ys[4] + 43, colors.green);
  label("Approve", cx + 8, ys[7] + 43, colors.green);

  box(92, 267, 170, h, "Validation error: retry", colors.redSoft, colors.red);
  arrow(cx - 88, ys[4] + 15, 262, 282, colors.red);
  arrow(177, 267, 177, 254, colors.red);
  arrow(177, 254, cx - 92, ys[3] + 15, colors.red);
  label("No", cx - 119, ys[4] + 3, colors.red);

  box(92, 184, 170, h, "Blocked: resolve or reassign", colors.amberSoft, colors.amber);
  arrow(cx - 90, ys[2] + 15, 262, 199, colors.amber);
  arrow(177, 184, 177, 170, colors.amber);
  arrow(177, 170, cx - 92, ys[2] + 15, colors.amber);

  box(580, 430, 188, h, "Changes requested with comment", colors.amberSoft, colors.amber);
  arrow(cx + 88, ys[7] + 15, 580, 445, colors.amber);
  arrow(674, 430, 674, 208, colors.amber);
  arrow(674, 208, cx + 92, ys[2] + 15, colors.amber);
  label("Reject", cx + 98, ys[7] + 3, colors.amber);

  box(620, 132, 125, h, "Cancelled", "#f1f5f9", colors.muted, 15);
  arrow(cx + 90, ys[1] + 15, 620, 147, colors.muted);
  label("Authorized cancel", 522, 133, colors.muted);

  label("CREATOR / SYSTEM", cx - 57, 86, colors.blue);
  label("ASSIGNEE", cx - 32, 181, colors.blue);
  label("ADMIN", cx - 23, 381, colors.violet);

  addPortraitPage();
}

// Cover page
doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.navy);
doc.roundedRect(58, 86, 118, 26, 13).fill("#1e3a5f");
doc.font("Helvetica-Bold").fontSize(9).fillColor("#bfdbfe").text("NEXT ITERATION", 58, 95, { width: 118, align: "center" });
doc.font("Helvetica-Bold").fontSize(32).fillColor("#ffffff").text("Task 2", 58, 162);
doc.font("Helvetica-Bold").fontSize(24).fillColor("#ffffff").text("Process flow and sprint implementation plan", 58, 207, { width: 460, lineGap: 5 });
doc.font("Helvetica").fontSize(11).fillColor("#cbd5e1").text("Internal Task Portal · Nexus AML", 58, 290);
doc.moveTo(58, 334).lineTo(535, 334).strokeColor("#334155").lineWidth(1).stroke();
doc.font("Helvetica").fontSize(10).fillColor("#94a3b8").text("Scope", 58, 360);
doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff").text("Assignment · Filtering · Details · Evidence · Review · Completion", 58, 380, { width: 470 });
doc.font("Helvetica").fontSize(9).fillColor("#64748b").text("Prepared as the Part 2 design deliverable", 58, 730);

addPortraitPage();
const contentsPageIndex = 1;
addPortraitPage();

const lines = markdown.split(/\r?\n/);
let inMermaid = false;
let started = false;

for (const rawLine of lines) {
  const line = rawLine.trimEnd();

  if (!started) {
    if (line.startsWith("## 1.")) started = true;
    else continue;
  }

  if (line === "```mermaid") {
    inMermaid = true;
    continue;
  }
  if (inMermaid) {
    if (line === "```") inMermaid = false;
    continue;
  }
  if (line === "<!-- PDF_FLOW_DIAGRAM -->") {
    drawFlowDiagram();
    continue;
  }
  if (!line.trim() || line === "---") {
    doc.moveDown(0.25);
    continue;
  }
  if (line.startsWith("### ")) {
    heading(line.slice(4), 3);
    continue;
  }
  if (line.startsWith("#### ")) {
    heading(line.slice(5), 4);
    continue;
  }
  if (line.startsWith("## ")) {
    const title = line.slice(3);
    if (title.startsWith("2. ")) {
      activeSubtopic = null;
      continue;
    }
    if ((title.startsWith("4. ") || title.startsWith("5. ")) && doc.y > doc.page.margins.top + 40) {
      addPortraitPage();
    }
    heading(title, 2);
    continue;
  }
  const subtopicMatch = line.match(/^\*\*([^*]+)\*\*$/);
  if (subtopicMatch) {
    subtopic(subtopicMatch[1]);
    continue;
  }
  const calloutMatch = line.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
  if (calloutMatch) {
    callout(calloutMatch[1], calloutMatch[2]);
    continue;
  }
  if (/^\d+\.\s/.test(line)) {
    const match = line.match(/^(\d+)\.\s+(.*)$/);
    if (match) bullet(match[2], true, match[1]);
    continue;
  }
  if (line.startsWith("- ")) {
    bullet(line.slice(2));
    continue;
  }
  paragraph(line);
}

drawContents(contentsPageIndex);

const pageRange = doc.bufferedPageRange();
for (let index = pageRange.start; index < pageRange.start + pageRange.count; index += 1) {
  doc.switchToPage(index);
  if (index === 0) continue;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  doc.page.margins.bottom = 0;
  doc.moveTo(36, 28).lineTo(pageWidth - 36, 28).strokeColor(colors.line).lineWidth(0.5).stroke();
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(colors.muted).text("NEXUS AML · INTERNAL TASK PORTAL", 36, 16, { lineBreak: false });
  doc.font("Helvetica").fontSize(7.5).fillColor(colors.muted).text(`TASK 2 · ${index + 1}`, pageWidth - 130, pageHeight - 28, { width: 93, align: "right", lineBreak: false });
}

doc.end();

await new Promise((resolve, reject) => {
  output.on("finish", resolve);
  output.on("error", reject);
});

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
