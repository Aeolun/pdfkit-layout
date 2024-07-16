type BoxProps = {
  x?: number;
  y?: number;
  width: number | string;
  height: number | string;
  padding?: number;
  margin?: number;
  borderWidth?: number;
  borderColor?: string;
  measure?: "proportional" | "absolute";
};
export class Box {
  public readonly type: "box" | "image" | "text" = "box";

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
    this.x = props.x ?? 0;
    this.y = props.y ?? 0;

    // check only percentage unit specifier allowed for width and height
    if (typeof props.width !== "number" && !props.width.includes("%")) {
      throw new Error("Only percentage unit specifier allowed for width");
    }
    if (typeof props.height !== "number" && !props.height.includes("%")) {
      throw new Error("Only percentage unit specifier allowed for height");
    }

    // take percentage sign off and divide by 100 when string
    this.width =
      typeof props.width === "string"
        ? parseFloat(props.width) / 100
        : props.width;
    this.height =
      typeof props.height === "string"
        ? parseFloat(props.height) / 100
        : props.height;

    this.measure = props.measure ?? "proportional";

    this.padding = props.padding ?? 0;
    this.margin = props.margin ?? 0;
    this.borderColor = props.borderColor ?? "black";
    this.borderWidth = props.borderWidth ?? 0;
  }

  addChild(box: Box) {
    box.setParent(this);
    this.children.push(box);

    return this;
  }

  addChildren(...boxes: Box[]) {
    for (const box of boxes) {
      this.addChild(box);
    }

    return this;
  }

  private setParent(box: Box) {
    this.parentBox = box;

    return this;
  }

  getBounds(currentPage?: PDFKit.PDFPage) {
    if (this.measure === "absolute") {
      return {
        x: this.x + this.margin,
        y: this.y + this.margin,
        width: this.width - this.margin * 2,
        height: this.height - this.margin * 2,
      };
    }

    if (!this.parentBox && !currentPage) {
      throw new Error(
        "Cannot be proportional without parent or page added to the PDFDocument",
      );
    }
    const baseSize = this.parentBox
      ? this.parentBox.getBounds(currentPage)
      : {
          x: currentPage.margins.left,
          y: currentPage.margins.top,
          width:
            currentPage.width -
            currentPage.margins.left -
            currentPage.margins.right,
          height:
            currentPage.height -
            currentPage.margins.top -
            currentPage.margins.bottom,
          padding: 0,
        };

    return {
      x: baseSize.x + baseSize.width * this.x + baseSize.padding,
      y: baseSize.y + baseSize.height * this.y + baseSize.padding,
      width: baseSize.width * this.width - baseSize.padding * 2,
      height: baseSize.height * this.height - baseSize.padding * 2,
      padding: this.padding,
    };
  }
}

type ImageProps = BoxProps & {
  src: string;
  fit?: "contain" | "cover";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "bottom" | "center";
};
export class Image extends Box {
  public readonly type = "image";

  src: string;
  fit: "contain" | "cover";
  align: undefined | "center" | "right";
  verticalAlign: undefined | "bottom" | "center";
  constructor(props: ImageProps) {
    super(props);

    this.src = props.src;
    this.fit = props.fit ?? "contain";
    this.align = props.align === "left" ? undefined : props.align ?? "center";
    this.verticalAlign =
      props.verticalAlign === "top"
        ? undefined
        : props.verticalAlign ?? "center";
  }
}

function isImage(box: ValidShape): box is Image {
  return box.type === "image";
}

type TextProps = BoxProps & {
  text: string;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom" | "center";
};

export class Text extends Box {
  public readonly type = "text";

  public text: string;
  public fontSize: number;
  public color: string;
  public align: "left" | "center" | "right";
  public verticalAlign: "top" | "middle" | "bottom";
  constructor(props: TextProps) {
    super(props);

    this.text = props.text;
    this.fontSize = props.fontSize ?? 12;
    this.color = props.color ?? "black";
    this.align = props.align ?? "left";
    this.verticalAlign =
      props.verticalAlign === "center"
        ? "middle"
        : props.verticalAlign ?? "middle";
  }
}
function isText(box: ValidShape): box is Text {
  return box.type === "text";
}

type ValidShape = Box | Image | Text;

export const layout = (doc: PDFKit.PDFDocument, box: ValidShape) => {
  const size = box.getBounds(doc.page);

  if (isImage(box)) {
    doc.image(box.src, size.x, size.y, {
      [box.fit === "contain" ? "fit" : "cover"]: [size.width, size.height],
      align: box.align,
      valign: box.verticalAlign,
    });
  }

  for (const child of box.children) {
    layout(doc, child);
  }

  if (isText(box)) {
    const xPos = size.x + box.padding;
    const yPos =
      box.verticalAlign === "top"
        ? size.y + box.padding
        : box.verticalAlign === "middle"
          ? size.y + size.height / 2
          : size.y + size.height - box.padding;
    const textOptions = {
      height: size.height - box.padding * 2,
      width: size.width - box.padding * 2,
      align: box.align,
      lineGap: 0,
      paragraphGap: 0,
    };
    doc.fontSize(box.fontSize || 12).fillColor(box.color);
    const height = doc.heightOfString(box.text, textOptions);
    const adjustment =
      box.verticalAlign === "bottom"
        ? height
        : box.verticalAlign === "middle"
          ? height / 2
          : 0;
    doc.text(box.text, xPos, yPos - adjustment, textOptions);
  }

  if (box.borderWidth > 0) {
    doc
      .lineWidth(box.borderWidth)
      .rect(size.x, size.y, size.width, size.height)
      .stroke(box.borderColor);
  }
};
