# 🏛️ StatVault Community Discussion Website — Agent Handover Document
**Target Role:** Frontend / Full-Stack Agent (Lead UI/UX & Community Platform Engineer)  
**Project:** StatVault (Warhammer 40,000 Total War RTS / Warcore Engine Database & Community Hub)  
**Repository:** [github.com/Kausiukas/statvault](https://github.com/Kausiukas/statvault)  
**Status:** Ingestion & Asset Automation Operational; Web Platform Ready for Construction  

---

## 1. Executive Mission & Vision

Your objective is to design and develop a **visually breathtaking, highly responsive, modern community discussion website** for **StatVault**. 

StatVault is an open-access analytical source-of-truth database and 3D inspection terminal for Warhammer 40,000 strategy games and competitive RTS tacticians. The core draw of StatVault is the **Dual-Lens Analytical Framework**—the perpetual, passionate debate between **Lore Purists** (Black Library canon, realistic ballistic physics, transhuman dread) and **Competitive RTS Tacticians** (symmetrical balance, point costs, DPS, pathfinding, counter-play).

Your mission is to turn this database into the **definitive digital gathering ground** where fans, competitive gamers, and lore scholars engage in deep, structured tactical discussions around every unit, weapon, and game balance decision.

---

## 2. Visual Identity & UI/UX Aesthetic

Do **not** build a generic, sterile corporate dashboard or a cookie-cutter forum. The design must embody a unique synthesis:
> **"Imperial Cogitator Terminal meets Linear / Raycast / Steam Community"**

### Aesthetic Pillars:
1. **Palette & Theming (Grimdark Modern Dark Mode):**
   - **Backgrounds:** Deep slate/obsidian (`#0b0f17`, `#0f172a`, `#182234`) with subtle hexagonal or military scanline grid textures.
   - **Borders & Framing:** Tactical chamfered corners, subtle sub-pixel borders (`rgba(255, 255, 255, 0.08)`), and soft neon accent glows.
   - **Faction Color Signatures:**
     * Imperium / Space Marines: Ultramarine Blue (`#1d4ed8`), Imperial Gold (`#f59e0b`), Purity Seal Red (`#dc2626`).
     * Adeptus Mechanicus: Mars Rust Red (`#b91c1c`), Phosphor Green (`#10b981`).
     * Chaos / Traitors: Warp Purple / Crimson (`#881337`, `#7e22ce`).
     * Necrons: Gauss Emerald Green (`#059669`, `#10b981`) with living-metal obsidian textures.
     * Tyranids: Hive Fleet Bio-Purple (`#7e22ce`) and Chitin Bone (`#fef08a`).
     * T'au Empire: High-Tech Ochre (`#d97706`) and Plasma Cyan (`#06b6d4`).
     * Orks: WAAAGH! Slime Green (`#65a30d`) and Scrap Metal Orange.
2. **Typography & Hierarchies:**
   - Monospace tactical headers (`JetBrains Mono`, `Fira Code`, or `Geist Mono`) for unit stats, coordinates, and RHAe armor values.
   - Elegant, clean sans-serif (`Geist Sans`, `Inter`, or `Outfit`) for discussion text and long-form debate essays.
   - Subtle gothic / military badges (`[ORDO XENOS VERIFIED]`, `[WARCORE ENGINE V1.0.2]`, `[TACTICAL CITATION]`).
3. **Micro-Interactions & Feel:**
   - Smooth card transitions, subtle hover glows, interactive tab switching with spring physics (Framer Motion).
   - Glassmorphism overlays with backdrop blur (`backdrop-blur-md`).
   - Sound FX toggle (optional / subtle mechanical cogitator click on button presses).

---

## 3. Existing Architecture & Asset Inventory

The repository is configured as an autonomous, monorepo-driven data engine with rich visual assets ready to be consumed:

```
statvault/
├── apps/
│   └── web/                   <-- YOUR PRIMARY WORKSPACE (Next.js / Vite React App)
│       └── lib/               <-- Contains dread-simulator.ts, math-engine.ts, upi-calculator.ts
├── packages/
│   ├── schemas/               <-- TypeScript types & Zod schemas (@statvault/schemas)
│   │   └── src/               <-- unit.schema.ts, weapon.schema.ts, lore.schema.ts
│   └── 3d-pipeline/           <-- Model compression & VRAM inspection utilities
├── data/
│   ├── units/*.json           <-- 10 Canonical Unit Dataslates (growing daily at 06:00 UTC)
│   ├── weapons/*.json         <-- 10 Primary Armament Profiles (growing daily)
│   ├── lore/*.json            <-- Discrepancy annotations (Lore vs RTS balance analyses)
│   └── COVERAGE.md            <-- Daily ingestion backlog & faction index
├── assets/art/                <-- Visual Asset Suite (stamped with C2PA & marketing.ekopolimeras.com credentials)
│   ├── *_concept.png          <-- 16:9 Widescreen Action Battlefield Concept Art
│   ├── *_multiview_0.png      <-- Transparent Orthographic Front View (0°)
│   ├── *_multiview_1.png      <-- Transparent Orthographic Flank View (90°)
│   ├── *_multiview_2.png      <-- Transparent Orthographic Rear/Dorsal View (180°)
│   └── *.png / *.jpg          <-- Studio miniature renders
└── public/models/             <-- Interactive 3D Assets (Draco/KTX2 GLB files, e.g. hormagaunt.glb)
```

### Autonomous Pipeline Context
Every day at **06:00 UTC (09:00 AM EEST)**, the automated GitHub Actions pipeline ingests a new unit, generates its 3-tier visual suite via Meshy API (`nano-banana-pro`), stamps C2PA/XMP provenance credentials ("Made by StatVault / marketing.ekopolimeras.com"), and updates `README.md`. Your frontend will automatically inherit this expanding corpus!

---

## 4. Core Community Features to Build

### A. The Dataslate Dossier & 3D Interactive Inspection Page
* **Hero Section:** Full-width 16:9 Action Concept Art (`*_concept.png`) with cinematic title overlay and faction crest.
* **Interactive 3D Model Bay:** 
  - WebGL / Three.js / React Three Fiber (`@react-three/fiber` + `@react-three/drei`) viewport loading `public/models/{unit}.glb`.
  - Orbit controls, lighting toggles (Grimdark Moody / Neutral Studio / Trench Warfare), and wireframe/bounding box inspection.
* **Orthographic Multi-View Strips:**
  - 3-angle interactive tabs/switchers for Unit (`Front 0°`, `Side 90°`, `Rear 180°`) and Weapon.
* **Dual-Lens Stat Matrix:**
  - Interactive comparison tables: In-Engine HP/Armor/Speed vs Lore RHAe/Monomolecular penetration/Velocity.
  - Interactive radar chart (UPI - Unit Performance Index) using Chart.js or Recharts.

### B. The Dual-Lens Community Discussion Forum
The hallmark feature of the site is allowing users to debate specific units and weapons under two distinct lenses:

1. **Dual-Lens Discussion Tabs on Every Dataslate:**
   - **Tab 1: 📜 Lore & Narrative Canon:** Users debate Black Library consistency, realistic weapon physics, whether Space Marine armor would deflect Tau pulse rifles, etc.
   - **Tab 2: ⚙️ RTS Balance & Competitive Meta:** Users discuss point costs, build orders, counter-units, pathfinding issues, time-to-kill (TTK), and tournament viability.
2. **Interactive Community Consensus Sliders:**
   - Every dataslate should feature a community voting widget:
     * *Lore Accuracy:* `[1: Total Heresy <---------> 10: Pure Black Library Canon]`
     * *Engine Balance:* `[Underpowered <---- Perfect Balance ----> Overpowered / Nerf Now]`
     * Visual dynamic progress bar displaying aggregate community votes in real-time.
3. **Structured Discussion Threads:**
   - Root threads with nested markdown replies.
   - Rich tags: `[Balance Suggestion]`, `[Lore Citation]`, `[Tactical Guide]`, `[Bug/Discrepancy]`.
   - Lore Citation Box: Special blockquote formatting that allows users to cite Imperial Armour, Codex editions, or Black Library novels with book/page references.
4. **User Profiles & Faction Allegiance:**
   - Users choose a primary Faction allegiance (`Astra Militarum`, `Adeptus Astartes`, `Tyranids`, `Necrons`, `T'au Empire`, `Chaos`, `Orks`).
   - Community Ranks / Flairs (e.g. *Tech-Adept, Inquisitorial Scribe, Hive Mind Synapse, Warboss*).

---

## 5. Recommended Technical Stack

| Area | Recommended Technologies | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Full React 18/19 server components, high SEO for dataslates, rapid dynamic routing (`/dataslates/[slug]`, `/discussions/[id]`). |
| **Workspace Location** | `apps/web` | Already wired in Turborepo (`npm run dev --workspace=web`). |
| **Styling** | **Tailwind CSS + shadcn/ui** | Rapid development of dark-mode military cogitator components; accessible Radix primitives. |
| **3D Rendering** | **Three.js + @react-three/fiber + @react-three/drei** | Zero-latency loading of Draco-compressed `.glb` models from `public/models/`. |
| **Visual Charts** | **Recharts** or **Chart.js** | 6-axis radar diagrams (UPI scores) and velocity/damage decay curves. |
| **Icons** | **Lucide React** (`lucide-react`) | Sleek, minimal iconography for tactical weapon icons, shields, crosshairs, and arrows. |
| **State / Mock DB** | **Local JSON Direct Import + Zustand / React Query** | Can read directly from `data/units/` and `data/weapons/` statically, with local storage or Supabase/PostgreSQL for community posts. |
| **Animation** | **Framer Motion** | Silky smooth tab switches, modal popups, and expanding multi-angle image inspection galleries. |

---

## 6. Step-by-Step Implementation Roadmap

### Phase 1: Environment & App Scaffolding (`apps/web`)
1. Initialize Next.js 14 App Router inside `apps/web` (or enhance existing structure).
2. Ensure `@statvault/schemas` package is linked and imported.
3. Configure Tailwind theme with the StatVault colors (`dataslate`, `imperium`, `gold`, `gauss`, `warp`).

### Phase 2: Design System & Core Component Library
1. Build `<DataslateCard />`, `<Badge />`, `<FactionBanner />`, and `<TacticalButton />`.
2. Build the **Dual-Lens Comparison Component** (`<DualLensStatBox />`) that displays Lore vs Engine metrics side-by-side with color-coded discrepancy indicators.
3. Build the **3-Angle Multi-View Carousel** (`<MultiViewInspectionBay />`) showcasing Front, Flank, and Rear PNGs.

### Phase 3: Interactive 3D Model Viewport
1. Create `<ModelViewer glbPath="/models/{slug}.glb" />` with `@react-three/fiber`.
2. Add camera orbit, zoom bounds, auto-rotation toggle, and shadow plane.

### Phase 4: The Community Discussion Platform
1. Create `/dataslates/[slug]` page:
   - Upper half: Hero Concept Art + 3D Viewport + Multi-View + Stats.
   - Lower half: Community Discussion Hub.
2. Build the **Dual-Lens Comment Section**:
   - Tabbed filtering (All Comments / Lore Canon / RTS Balance / Tactical Guides).
   - "Cast Your Balance Vote" widget (interactive sliders).
   - Reply composer with markdown preview and citation badges.

### Phase 5: Global Discussion Hub (`/community`)
1. Create a dedicated community feed listing trending tactical debates across all factions.
2. Filter discussions by Faction, Unit, or Weapon.
3. Leaderboard of Top Tacticians & Lore Scholars based on community upvotes.

---

## 7. Developer Quickstart Commands

```bash
# 1. Install all dependencies across monorepo
npm install

# 2. Build the TypeScript schemas
npm run build:schemas

# 3. Validate existing data corpus (10 units, 10 weapons, 5 lore files)
npm run validate:data

# 4. Run the web development server
npm run dev
# Or target web specifically:
npm run dev --workspace=web

# 5. Helper CLI tools available in repo:
npm run visuals:daily       # Runs the Meshy 3-tier visual asset generator
npm run credentials:stamp   # Losslessly stamps C2PA/XMP credentials on all art
npm run readme:update       # Updates the repository hero card
```

---

## 8. Crucial Rules & Advice for the Agent

1. **Respect Canonical Data:** Always pull stats and descriptions directly from `data/units/`, `data/weapons/`, and `data/lore/` via `@statvault/schemas`. Do not hardcode unit stats!
2. **Preserve Content Credentials:** When displaying images from `assets/art/`, you can display a discreet **"C2PA Certified / marketing.ekopolimeras.com"** badge in the corner of images to highlight the authentic provenance metadata embedded within.
3. **Mobile Responsiveness is Non-Negotiable:** Warhammer fans browse on mobile devices constantly. The 3D viewport and multi-view tables must collapse gracefully into responsive swipeable cards.
4. **Lean into the Lore:** Use authentic terminology throughout UI states:
   - Loading: *"Accessing Munitorum Archives..."* / *"Recalibrating Cogitator Sensors..."*
   - Error: *"Transmission Severed by Warp Anomaly."*
   - Success: *"Dataslate Decrypted & Verified by Ordo Xenos."*

---
*Document prepared and verified for handover. All schemas build green, assets are validated, and the stage is set for an extraordinary frontend experience.*
