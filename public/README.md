# Gemcraft Brand Assets & Logos

โฟลเดอร์และ branch นี้จัดทำขึ้นเพื่อเป็นคลัง Brand Assets กลางของโปรเจกต์ **Gemcraft** สำหรับนักพัฒนาและ Contributor ทุกคนนำไปใช้งาน ทั้งบน Desktop App, Web, เอกสาร หรือสื่อประชาสัมพันธ์

---

## 1. รายการไฟล์โลโก้ (Available Logos)

| ไฟล์ | รายละเอียด | การใช้งานแนะนำ |
| :--- | :--- | :--- |
| **`logo-white.svg`** | โลโก้ประกายดาวสีขาวบริสุทธิ์ (เวกเตอร์ SVG) | **โลโก้หลัก (Default)** สำหรับพื้นหลังสีเข้ม / Dark Theme |
| **`logo-white.png`** | โลโก้สีขาวแบบ Bitmap โปร่งใส (1290 x 1376 px) | สำหรับ UI, Favicon หรือเอกสารที่ต้องการไฟล์ PNG |
| **`logo-black.svg`** | โลโก้ประกายดาวสีดำคมชัด (เวกเตอร์ SVG) | สำหรับพื้นหลังสีสว่าง / Light Theme |
| **`logo-black.png`** | โลโก้สีดำแบบ Bitmap โปร่งใส (1290 x 1376 px) | สำหรับเอกสารสิ่งพิมพ์ หรือพื้นหลังขาว |

---

## 2. ตัวอย่างการเรียกใช้งาน (Usage Examples)

### ใน React / TypeScript
```tsx
import logoWhite from "@/assets/logo-white.svg";
import logoBlack from "@/assets/logo-black.svg";

// หรือใช้ผ่าน Component สำเร็จรูป
import { GemcraftLogo } from "@/components/GemcraftLogo";

<GemcraftLogo theme="dark" width={64} height={64} />
```

### ใน HTML
```html
<!-- Dark Theme (Default) -->
<img src="/logo-white.svg" alt="Gemcraft Logo" width="120" />

<!-- Light Theme -->
<img src="/logo-black.svg" alt="Gemcraft Logo" width="120" />
```
