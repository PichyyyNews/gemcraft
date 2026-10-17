# Gemcraft Design System: Color Tokens Specification

เอกสารข้อกำหนดชุดสี (Color Tokens Specification) สำหรับโปรเจกต์ Gemcraft ครอบคลุมทั้ง **Dark Theme** (ธีมหลักตามแบบฉบับ Google NotebookLM) และ **Light Theme** (ธีมสว่างสำหรับสภาพแวดล้อมที่ต้องการความคมชัดสูง) เพื่อให้ทีมพัฒนาฝั่ง Frontend, Backend และ UI Designer ใช้เป็นมาตรฐานกลางเดียวกัน

---

## 1. ปรัชญาการออกแบบ (Design Philosophy)

1. **Authentic Google NotebookLM Charcoal Aesthetic**:
   - ใช้เฉดสี Charcoal ลึก (`#131314` และ `#1e1f20`) แทนการใช้สีดำสนิท (`#000000`) เพื่อลดความล้าของสายตาเมื่ออ่านเอกสารวิชาการหรือวิจัยขนาดยาว
2. **Semantic Grounded Accents**:
   - ใช้สี **Sky Blue (`#a8c7fa`)** สำหรับจุดที่เกี่ยวข้องกับ Grounding และ Citations (ป้ายอ้างอิงวงกลม, ไฮไลต์ข้อความในเอกสาร, แท็บที่เลือก)
   - ใช้สี **Studio Lavender (`#c5bfff`)** สำหรับฟังก์ชัน Generative Studio เช่น Audio Overview (Deep Dive AI Podcast) และ Studio Generators
3. **WCAG 2.1 AAA Contrast Compliance**:
   - ทุกคู่สีของตัวอักษรและพื้นหลัง (Foreground / Background) ผ่านเกณฑ์ Contrast Ratio ไม่ต่ำกว่า 7:1 เพื่อให้อ่านง่าย ชัดเจน และลด Cognitive Load

---

## 2. ตาราง Color Tokens (Dark Theme vs Light Theme)

### 2.1 Canvas & Surface (พื้นผิวและเลเยอร์)

| Token Name | Dark Theme (Hex) | Light Theme (Hex) | หน้าที่และการใช้งาน |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#131314` | `#f8fafd` | พื้นหลังหลักของทั้งแอปพลิเคชัน (Root Background) และบริเวณแชตกลาง |
| `--bg-surface` | `#1e1f20` | `#ffffff` | พื้นหลังของแผงข้าง (Sources Panel และ Studio Column) |
| `--bg-surface-raised` | `#28292c` | `#f1f3f4` | พื้นหลังของการ์ดลอย, บับเบิลแชตของผู้ใช้, ปุ่มที่ถูก Hover |
| `--bg-surface-active` | `#37393e` | `#e8eaed` | พื้นหลังขององค์ประกอบที่อยู่ในสถานะ Selected หรือ Active |
| `--bg-surface-sunken` | `#0f0f10` | `#edf2f7` | พื้นหลังช่องกรอกข้อมูล (Textarea / Input) และแถบโค้ด (Code Blocks) |

---

### 2.2 Borders & Outlines (เส้นขอบและตัวคั่น)

| Token Name | Dark Theme (Hex) | Light Theme (Hex) | หน้าที่และการใช้งาน |
| :--- | :--- | :--- | :--- |
| `--border-subtle` | `#282a2e` | `#e0e2e5` | เส้นขอบกั้นระหว่างคอลัมน์, เส้นคั่นระหว่างรายการไฟล์ |
| `--border-strong` | `#444746` | `#dadce0` | เส้นขอบของ Floating Input Bar, Modal Dialog, กล่องสถานะ |
| `--border-focus` | `#a8c7fa` | `#0b57d0` | เส้นขอบเมื่อองค์ประกอบได้รับ Focus หรือสถานะ Active Tab |

---

### 2.3 Typography & Text (ข้อความและเนื้อหา)

| Token Name | Dark Theme (Hex) | Light Theme (Hex) | หน้าที่และการใช้งาน |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#e3e3e3` | `#1f1f1f` | ข้อความหลัก, หัวข้อ (Headers), เนื้อหาคำตอบของ AI |
| `--text-secondary` | `#8e918f` | `#5f6368` | ข้อความรอง, ขนาดไฟล์, จำนวน Chunks, Label กำกับฟอร์ม |
| `--text-muted` | `#5e615f` | `#70757a` | ข้อความตัวอย่าง (Placeholders), วันเวลาเก่า, ข้อความที่ถูก Disable |
| `--text-inverse` | `#041e49` | `#ffffff` | ข้อความที่อยู่บนพื้นหลังสี Accent Blue ชัดเจน |

---

### 2.4 Accents & Citations (สีระบุตำแหน่งการอ้างอิง)

| Token Name | Dark Theme (Hex) | Light Theme (Hex) | หน้าที่และการใช้งาน |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#a8c7fa` | `#0b57d0` | สีหลักของระบบ Citation, ปุ่ม Submit, Active Tab Indicator |
| `--accent-on-primary` | `#041e49` | `#ffffff` | สีตัวอักษร/ตัวเลขบนชิป Citation วงกลม (`[1]`, `[2]`) |
| `--accent-hover` | `#d3e3fd` | `#0842a0` | สถานะ Hover ของปุ่มหลัก |
| `--studio-accent` | `#c5bfff` | `#6750a4` | สีประจำ Studio Workspace, Deep Dive Podcast, ไอคอน Sparkles |
| `--studio-on-accent` | `#2b273d` | `#ffffff` | สีพื้นหลังการ์ดหรือตัวอักษรสำหรับ Studio Tools |

---

### 2.5 Ingestion & Pipeline States (สถานะการประมวลผล RAG)

| State | Dark Theme (Hex) | Light Theme (Hex) | ความหมายทางเทคนิค |
| :--- | :--- | :--- | :--- |
| **Uploading** | `#a8c7fa` (Blue) | `#1a73e8` | ขั้นตอนรับไฟล์จากเครื่องเข้าสู่ระบบ (Progress 25%) |
| **Chunking** | `#c5bfff` (Purple) | `#8430ce` | ขั้นตอนตัดแบ่งเนื้อหาด้วย Sentence/Markdown Splitter (Progress 60%) |
| **Embedding** | `#fdd663` (Amber) | `#f29900` | ขั้นตอนคำนวณเวกเตอร์ด้วย fastembed-rs / ONNX (Progress 85%) |
| **Ready** | `#7ada94` (Green) | `#188038` | ดัชนีเวกเตอร์ถูกบันทึกลง SQLite-vec พร้อมใช้งาน (Progress 100%) |
| **Error** | `#f28b82` (Coral) | `#d93025` | การประมวลผลล้มเหลว (ไฟล์เสียหาย หรือ Unsupported Format) |

---

### 2.6 Grounded Passage & Search Highlighting (การเน้นข้อความอ้างอิง)

| Token Name | Dark Theme | Light Theme | หน้าที่และการใช้งาน |
| :--- | :--- | :--- | :--- |
| `--citation-highlight-bg` | `rgba(168, 199, 250, 0.12)` | `rgba(11, 87, 208, 0.08)` | พื้นหลังกล่องข้อความอ้างอิงที่ตรงกับคำตอบ AI |
| `--citation-highlight-border` | `#a8c7fa` (Solid 4px left) | `#0b57d0` (Solid 4px left) | แถบเส้นด้านซ้ายของย่อหน้าที่ถูกอ้างอิง |
| `--search-highlight-bg` | `#fdd663` | `#fff099` | สีพื้นหลังคำที่ตรงกับการค้นหาในเอกสาร (`<mark>`) |
| `--search-highlight-text` | `#000000` | `#000000` | สีตัวอักษรของคำที่ถูกค้นพบ |

---

## 3. คู่มือการนำไปใช้งานในโค้ด (Code Implementation)

### 3.1 การประกาศใน CSS Root Variables (`src/index.css`)

```css
@layer base {
  /* Default: Dark Theme (NotebookLM Standard) */
  :root {
    --bg-canvas: #131314;
    --bg-surface: #1e1f20;
    --bg-surface-raised: #28292c;
    --bg-surface-active: #37393e;
    --bg-surface-sunken: #0f0f10;

    --border-subtle: #282a2e;
    --border-strong: #444746;
    --border-focus: #a8c7fa;

    --text-primary: #e3e3e3;
    --text-secondary: #8e918f;
    --text-muted: #5e615f;
    --text-inverse: #041e49;

    --accent-primary: #a8c7fa;
    --accent-on-primary: #041e49;
    --accent-hover: #d3e3fd;

    --studio-accent: #c5bfff;
    --studio-surface: #2b273d;

    --status-success: #7ada94;
    --status-warning: #fdd663;
    --status-error: #f28b82;

    --citation-highlight-bg: rgba(168, 199, 250, 0.12);
    --citation-highlight-border: #a8c7fa;
  }

  /* Optional: Light Theme Mode (.light class) */
  .light {
    --bg-canvas: #f8fafd;
    --bg-surface: #ffffff;
    --bg-surface-raised: #f1f3f4;
    --bg-surface-active: #e8eaed;
    --bg-surface-sunken: #f8f9fa;

    --border-subtle: #e0e2e5;
    --border-strong: #dadce0;
    --border-focus: #0b57d0;

    --text-primary: #1f1f1f;
    --text-secondary: #5f6368;
    --text-muted: #70757a;
    --text-inverse: #ffffff;

    --accent-primary: #0b57d0;
    --accent-on-primary: #ffffff;
    --accent-hover: #0842a0;

    --studio-accent: #6750a4;
    --studio-surface: #f3edf7;

    --status-success: #188038;
    --status-warning: #e37400;
    --status-error: #d93025;

    --citation-highlight-bg: rgba(11, 87, 208, 0.08);
    --citation-highlight-border: #0b57d0;
  }
}
```

---

## 4. โครงสร้างการแมปใน UI Component ต่างๆ

1. **Header Bar**:
   - Background: `var(--bg-canvas)` (`#131314`)
   - Bottom Border: `var(--border-subtle)` (`#282a2e`)
   - Logo Sparkles: `var(--studio-accent)` (`#c5bfff`)
2. **Sources Panel (Left Column)**:
   - Panel Background: `var(--bg-surface)` (`#1e1f20`)
   - Ingestion Droptarget Active: Border `var(--accent-primary)`, Background `rgba(168, 199, 250, 0.05)`
   - Source Item Ready: Border `var(--border-subtle)`, Progress Green `var(--status-success)`
3. **Chat Panel (Center Column)**:
   - Floating Input Pill: Background `var(--bg-surface)`, Border `var(--border-strong)`, Focus `var(--border-focus)`
   - Citation Circle: Background `var(--accent-primary)` (`#a8c7fa`), Text `var(--accent-on-primary)` (`#041e49`)
   - Stop Generating Button: Background `var(--status-error)` (`#f28b82`)
4. **Citation & Studio Panel (Right Column)**:
   - Deep Dive Audio Card: Gradient from `var(--studio-surface)` to `var(--bg-surface)`
   - Studio Notes Cards: Background `var(--bg-canvas)` (`#131314`), Border `var(--border-subtle)`
   - Full Document Cited Block: Background `var(--citation-highlight-bg)`, Border Left `var(--citation-highlight-border)`

---

## 5. สรุปสำหรับทีม Backend และ Contributor
- ข้อมูลสถานะที่ส่งผ่าน Tauri IPC Events (`uploading`, `chunking`, `embedding`, `ready`, `error`) จะถูกผูกเข้ากับ Color Tokens ในหัวข้อ 2.5 อัตโนมัติ
- ไม่ต้อง Hardcode รหัสสีใน Rust Backend ให้ส่งเฉพาะ Status Enum String เท่านั้น ฝั่ง Frontend จะเป็นผู้แปลงเป็น Token Style เองทั้งหมด
