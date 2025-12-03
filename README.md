# pdfkit-layout

Makes it easier to create PDFs using PFFKit, using proportional layout based on percentages and alignment (sorta like flexbox, but less flexible).

## Installation

```bash
npm install --save pdfkit-layout
# or
yarn add pdfkit-layout
# or
pnpm add pdfkit-layout
```

## Usage

```javascript
const PDFDocument = require("pdfkit");
const { layout, Box, Text, Image } = require("pdfkit-layout");

const doc = new PDFDocument();

const box = new Box({
  width: "100%",
  height: "100%",
  padding: 10,
});
const image = new Image({
  src: "static/tools1.jpg",
  width: "50%",
  height: "50%",
  align: "center",
});
const text = new Text({
  text: "Hello, World!",
  width: "100%",
  height: "10%",
  align: "center",
  verticalAlign: "center",
});

const layoutDoc = layout(doc, box);
```
