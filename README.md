# Hackathon Constraint Generator

A design-space randomizer for our monthly hackathon. Generates random constraints by pairing an **industry** with a **customer level** to define the problem space for each session.

## What It Does

- **Industry Roller** — Slot-machine style animation that picks from 100+ industries across 16 sectors (Healthcare, Fintech, Agriculture, etc.)
- **Customer Level Roller** — Determines the target customer depth:
  - **Primary (B2C)** — Direct to end users
  - **Secondary (B2B)** — Serving businesses that serve end users
  - **Tertiary (B2B2B+)** — Deep in the value chain
- **History** — Track past rolls across sessions
- **Editable Lists** — Add/remove sectors and industries to customize the pool

## Tech Stack

- React 19 + Vite
- Framer Motion (animations)
- Three.js / React Three Fiber (3D background)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
