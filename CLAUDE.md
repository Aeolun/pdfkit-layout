# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library for creating layout-based PDF generation using PDFKit. It provides a box model abstraction layer on top of PDFKit's drawing primitives, allowing for proportional and absolute positioning of elements.

## Core Architecture

### Box Model System

The codebase implements a hierarchical box model similar to CSS, with four main element types defined in `src/index.ts`:

1. **Box** (base class): Container element with positioning, padding, margin, and borders
   - Supports two measurement modes:
     - `"absolute"`: Fixed pixel dimensions
     - `"proportional"`: Dimensions relative to parent box (0-1 range for x, y, width, height)
   - Children boxes form a tree structure via `addChild()`
   - `getBounds()` calculates actual pixel coordinates recursively

2. **Image** (extends Box): Renders images within a box
   - Takes image path via `image` property
   - Images are fitted within the calculated bounds

3. **Text** (extends Box): Renders text content
   - Properties: `text`, `fontSize`, `color`, `textAlign`
   - Supports text alignment: "left" | "center" | "right" | "justify" (default: "center")
   - Text positioning respects padding

4. **FlexBox**: Flexbox-style container for dynamic layout
   - Separate class hierarchy that can be mixed with Box/Image/Text in same tree
   - Supports `direction` (row/column), `justifyContent`, `alignItems`, and `gap`
   - Automatically sizes and positions children based on flex rules
   - Children can be Box, Image, Text, or other FlexBox instances
   - Uses two-phase layout: measure then position

### Rendering

The `draw()` function recursively traverses the box tree and renders to a PDFKit document:
- Triggers FlexBox layout computation if needed (`performLayout()`)
- Renders images first
- Recursively renders children
- Draws borders if borderWidth > 0
- Renders text last (on top)

## Development Commands

### Build
```bash
pnpm build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

### Linting
```bash
pnpm biome check
```
Runs Biome linter and formatter checks. The project uses:
- 2-space indentation
- Recommended rules enabled
- Auto-organize imports

To auto-fix issues:
```bash
pnpm biome check --write
```

### Testing
```bash
pnpm test
```
Runs all tests once using vitest.

```bash
pnpm test:watch
```
Runs tests in watch mode for development.

```bash
pnpm test:ui
```
Opens the vitest UI for interactive test running.

## FlexBox Usage

FlexBox provides a flexbox-style layout system for dynamically sizing and positioning children:

```typescript
import { FlexBox, Box, draw } from "pdfkit-layout";

// Create a horizontal layout with space-between
const container = new FlexBox({
  x: 0,
  y: 0,
  width: 600,
  height: 100,
  measure: "absolute",
  direction: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: 20,
});

// Add Box children (x, y are ignored by FlexBox parent)
const box1 = new Box({ x: 0, y: 0, width: 150, height: 60, measure: "absolute" });
const box2 = new Box({ x: 0, y: 0, width: 150, height: 60, measure: "absolute" });

container.addChild(box1);
container.addChild(box2);

// FlexBox automatically positions children during draw
draw(doc, container);
```

### FlexBox Properties

- **direction**: "row" | "column" (default: "row")
- **justifyContent**: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" (default: "flex-start")
- **alignItems**: "flex-start" | "flex-end" | "center" | "stretch" (default: "flex-start")
- **gap**: spacing between children in pixels (default: 0)

### Mixing Box and FlexBox

- FlexBox can contain Box, Image, Text, or other FlexBox children
- Box can contain FlexBox children
- Proportional sizing works inside FlexBox (treated as percentage of FlexBox content area)

## Code Style

- Uses Biome for formatting and linting (configured in `biome.json`)
- 2-space indentation
- TypeScript with strict typing via PDFKit type definitions
