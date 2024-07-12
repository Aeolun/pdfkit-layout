type BoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
  margin?: number;
  borderWidth?: number;
  borderColor?: string;
  measure: "proportional" | "absolute";
};
class Box {
  public readonly type = "box";

  children: Box[] = [];
  parentBox?: Box;
  padding = 0;
  margin = 0;
  borderColor: string;
  borderWidth: number;

  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private measure: "proportional" | "absolute";

  constructor(props: BoxProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = props.width;
    this.height = props.height;
    this.measure = props.measure ?? "proportional";

    this.padding = props.padding ?? 0;
    this.margin = props.margin ?? 0;
    this.borderColor = props.borderColor ?? "black";
    this.borderWidth = props.borderWidth ?? 1;
  }

  addChild(box: Box) {
    box.setParent(this);
    this.children.push(box);
  }

  private setParent(box: Box) {
    this.parentBox = box;
  }

  getBounds() {
    if (this.measure === "absolute") {
      return {
        x: this.x + this.margin,
        y: this.y + this.margin,
        width: this.width - this.margin * 2,
        height: this.height - this.margin * 2,
      };
    }

    if (!this.parentBox) {
      throw new Error("Cannot be proportional without parent");
    }
    const baseSize = this.parentBox.getBounds();

    return {
      x: baseSize.x + baseSize.width * this.x,
      y: baseSize.y + baseSize.height * this.y,
      width: baseSize.width * this.width,
      height: baseSize.height * this.height,
    };
  }
}

type ImageProps = BoxProps & {
  image: string;
};
class Image extends Box {
  public readonly type = "image";

  image: string;
  constructor(props: ImageProps) {
    super(props);

    this.image = props.image;
  }
}

function isImage(box: Box): box is Image {
  return box.type === "image";
}

type TextProps = BoxProps & {
  text: string;
  fontSize?: number;
  color?: string;
};

class Text extends Box {
  public readonly type = "text";

  public text: string;
  public fontSize: number;
  public color: string;
  constructor(props: TextProps) {
    super(props);

    this.text = props.text;
    this.fontSize = props.fontSize ?? 12;
    this.color = props.color ?? "black";
  }
}
function isText(box: Box): box is Text {
  return box.type === "text";
}

export const draw = (doc: PDFKit.PDFDocument, box: Box | Image | Text) => {
  const size = box.getBounds();

  if (isImage(box)) {
    doc.image(box.image, size.x, size.y, {
      fit: [size.width, size.height],
    });
  }

  for (const child of box.children) {
    draw(doc, child);
  }

  if (box.borderWidth > 0) {
    doc.stroke(box.borderColor);
    doc.lineWidth(box.borderWidth);
    doc.rect(size.x, size.y, size.width, size.height);
  }

  if (isText(box)) {
    doc
      .fontSize(box.fontSize || 12)
      .fillColor(box.color)
      .text(box.text, size.x + box.padding, size.y + box.padding, {
        height: size.height - box.padding * 2,
        width: size.width - box.padding * 2,
        align: "center",
      });
  }
};
