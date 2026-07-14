# Kara Weaves

Textile pattern designer MVP — a Next.js port of the original Colab/Gradio fabric generator.

Rendering runs entirely in the browser via Canvas 2D. Weave simulation logic lives in pure TypeScript under `src/lib/fabric/` with no React dependencies.

See [CONTEXT.md](CONTEXT.md) for the project background, goals, and MVP priorities.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Project structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── fabric-designer/    # Designer UI (controls, canvas, layout)
│   └── ui/                 # Shared form primitives
├── hooks/                  # React state, render loop, stripe drag
└── lib/fabric/             # Types, weave simulators, render pipeline
    ├── weaves/             # Plain, waffle, loose tile generators
    ├── render/             # Compositing, softness, rulers
    ├── stripes/            # Hit testing
    └── export/             # PNG download
```

## Architecture notes

- **State:** `useFabricDesignState` (reducer) holds the full `FabricDesign` model
- **Render:** `useFabricRenderer` debounces updates (60ms); drag uses immediate render
- **Simulation:** `renderFabric(canvas, design, defaults)` is the single entry point for drawing

The original Colab notebook (`Fabric_pattern_generator_improvised.ipynb`) is kept for reference.

## Defaults

Texture amount (0.85), softness (0.10), and intersection darkness (0.40) are fixed internal constants — matching the notebook's "fixed defaults" behavior.
