import { Box, Image, Text, layout } from "./index";
import PDFDocument from "pdfkit";
import * as fs from "fs";

const document = new PDFDocument();
document.pipe(fs.createWriteStream("test.pdf"));

const box = new Box({
  width: "100%",
  height: "100%",
  padding: 10,
  borderWidth: 1,
});
const image = new Image({
  src: "static/tools1.jpg",
  width: "50%",
  height: "50%",
  borderWidth: 1,
  verticalAlign: "bottom",
  fit: "contain",
});

const textBox = new Box({
  x: 0.5,
  y: 0,
  width: 0.5,
  height: 0.5,
});
const alignments = ["left", "center", "right"] as const;
const verticalAlignments = ["top", "center", "bottom"] as const;
let i = 0;
for (const alignment of alignments) {
  let j = 0;
  for (const verticalAlignment of verticalAlignments) {
    const text = new Text({
      text: `Hello, World ${alignment} ${verticalAlignment}!`,
      x: (i * 1) / 3,
      y: (j * 1) / 3,
      width: 1 / 3,
      height: 1 / 3,
      align: alignment,
      verticalAlign: verticalAlignment,
      borderWidth: 1,
      borderColor: "black",
    });
    textBox.addChildren(text);
    j++;
  }
  i++;
}

box.addChildren(image, textBox);

layout(document, box);

document.end();
