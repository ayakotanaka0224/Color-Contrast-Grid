// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 300,
  height: 400,
});

figma.loadFontAsync({ family: "Roboto", style: "Regular" });
figma.loadFontAsync({ family: "Inter", style: "Regular" });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

const components: { createInstance: () => any }[] = [];

const badgeObj = {
  aaa: {
    color: { r: 0.01117647058823, g: 0.5372549019607, b: 0.1607843137254 },
    description: "pass, AAA(7+)",
  },
  aa: {
    color: { r: 0.2470588235294, g: 0.3843137254901, b: 0.8745098039215 },
    description: "pass, AA(4.5+)",
  },
  aa18: {
    color: { r: 0.8862745098039, g: 0.5686274509803, b: 0.0901960784313 },
    description: "pass, Large Text Only(3+)",
  },
  dnp: {
    color: { r: 0.8235294117647, g: 0.2431372549019, b: 0.2431372549019 },
    description: "Does Not Pass",
  },
};

const badgeArray: ComponentNode[] = [];

// 相対輝度の計算に使うための計算式
const getRGBForCalculateLuminance = (rgb: number) => {
  return rgb <= 0.03928 ? rgb / 12.92 : Math.pow((rgb + 0.055) / 1.055, 2.4);
};

// 相対輝度を計算する
const getRelativeLuminance = (r: number, g: number, b: number) => {
  const [R, G, B] = [r, g, b].map(getRGBForCalculateLuminance);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

// コントラスト比出力
const getContrast = (fillColor: RGB, rgbColor: RGB) => {
  const l1 = getRelativeLuminance(
    fillColor["r"],
    fillColor["g"],
    fillColor["b"]
  );
  const l2 = getRelativeLuminance(rgbColor["r"], rgbColor["g"], rgbColor["b"]);
  const [bright, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  const contrast = (bright + 0.05) / (dark + 0.05);
  return Math.floor(contrast * 10) / 10;
};

const setProperties = (fillColor: RGB, rgbColor: RGB) => {
  const contrast = getContrast(fillColor, rgbColor);
  if (contrast >= 7) return "aaa";
  if (contrast >= 4.5) return "aa";
  if (contrast >= 3) return "aa18";
  return "dnp";
};

const createFigmaComponent = (
  props: { [key: string]: any },
  size?: [number, number]
) => {
  const component = figma.createComponent();
  Object.assign(component, props);
  if (size !== undefined) component.resize(...size);
  return component;
};

const createFigmaFrame = (
  props: { [key: string]: any },
  size?: [number, number]
) => {
  const frame = figma.createFrame();
  Object.assign(frame, props);
  if (size !== undefined) frame.resize(...size);
  return frame;
};

const createFigmaText = (content: string, props?: { [key: string]: any }) => {
  const component = figma.createText();
  Object.assign(component, { characters: content });
  if (props) {
    Object.assign(component, props);
  }
  return component;
};

const createColorNameTile = () => {
  const colorNameTile = createFigmaComponent(
    {
      name: "colorNameTile",
      layoutMode: "VERTICAL",
      horizontalPadding: 8,
      verticalPadding: 8,
      itemSpacing: 8,
      primaryAxisAlignItems: "CENTER",
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    },
    [80, 80]
  );
  const colorName = createFigmaText("Hex code");
  colorNameTile.appendChild(colorName);
  components.push(colorNameTile);
};

const createColorNameAndCodeTile = () => {
  const colorNameAndCodeTile = createFigmaComponent(
    {
      name: "colorNameAndCodeTile",
      layoutMode: "VERTICAL",
      horizontalPadding: 8,
      verticalPadding: 8,
      itemSpacing: 8,
      primaryAxisAlignItems: "CENTER",
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    },
    [200, 80]
  );
  const colorName = createFigmaText("Color name");
  const colorCode = createFigmaText("Hex code");
  colorNameAndCodeTile.appendChild(colorName);
  colorNameAndCodeTile.appendChild(colorCode);
  colorNameAndCodeTile.x = 100;
  components.push(colorNameAndCodeTile);
};

const createTile = () => {
  const footer = createFigmaFrame(
    {
      layoutMode: "HORIZONTAL",
      layoutAlign: "STRETCH",
      primaryAxisAlignItems: "SPACE_BETWEEN",
      fills: [],
    },
    [64, 16]
  );
  footer.counterAxisSizingMode = "AUTO";
  const tile = createFigmaComponent(
    {
      name: "tile",
      layoutMode: "VERTICAL",
      horizontalPadding: 8,
      verticalPadding: 8,
      itemSpacing: 8,
      primaryAxisAlignItems: "SPACE_BETWEEN",
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    },
    [80, 80]
  );
  const text = figma.createText();
  text.characters = "Text";
  text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  tile.x = 650;
  const badge = badgeArray[0].createInstance();
  const num = createFigmaText("num");
  tile.appendChild(text);
  tile.appendChild(footer);
  footer.appendChild(badge);
  footer.appendChild(num);
  components.push(tile);
};

const createBadge = () => {
  for (const [key, status] of Object.entries(badgeObj)) {
    const textWrapper = createFigmaComponent(
      {
        name: key,
        layoutMode: "VERTICAL",
        horizontalPadding: 2,
        verticalPadding: 2,
        cornerRadius: 8,
        fills: [{ type: "SOLID", color: status.color }],
        counterAxisAlignItems: "CENTER",
      },
      [30, 20]
    );
    textWrapper.primaryAxisSizingMode = "AUTO";
    const badgeText = figma.createText();
    badgeText.characters = key.toUpperCase();
    badgeText.fontSize = 10;
    badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    textWrapper.appendChild(badgeText);
    badgeArray.push(textWrapper);
  }
};

const createBadgeFrame = () => {
  createBadge();
  const descriptionContainer = createFigmaFrame({
    layoutMode: "VERTICAL",
    itemSpacing: 12,
    horizontalPadding: 10,
    verticalPadding: 10,
    primaryAxisAlignItems: "SPACE_BETWEEN",
    fills: [],
    counterAxisSizingMode: "AUTO",
  });
  for (const status of Object.values(badgeObj)) {
    descriptionContainer.appendChild(createFigmaText(status.description));
  }
  const frame = createFigmaFrame({
    name: "badgeDescription",
    layoutMode: "HORIZONTAL",
    itemSpacing: 10,
    horizontalPadding: 10,
    verticalPadding: 10,
    primaryAxisAlignItems: "SPACE_BETWEEN",
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    counterAxisSizingMode: "AUTO",
  });
  const variants = figma.combineAsVariants(badgeArray, frame);
  variants.name = "badge";
  variants.layoutMode = "VERTICAL";
  variants.counterAxisSizingMode = "AUTO";
  variants.itemSpacing = 10;
  variants.horizontalPadding = 10;
  variants.verticalPadding = 10;
  frame.appendChild(descriptionContainer);
  frame.x = 350;
};

const toHexColor = (color: number) => {
  return Math.round(color * 255)
    .toString(16)
    .padStart(2, "0");
};

const rbgToHex = (color: RGB) => {
  return `#${Object.values(color).map(toHexColor).join("")}`;
};

const tableHeader = (colorStyles: PaintStyle[]) => {
  const tableHeader = createFigmaFrame({
    layoutMode: "VERTICAL",
    itemSpacing: 5,
    counterAxisSizingMode: "AUTO",
  });
  const tile = createFigmaFrame(
    {
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
      itemSpacing: 5,
    },
    [200, 80]
  );
  tableHeader.appendChild(tile);
  colorStyles.map((paintStyle) => {
    const fillColor = (paintStyle.paints[0] as SolidPaint).color;
    const instance = components[1].createInstance();
    instance.children[0].characters = paintStyle.name;
    instance.children[1].characters = rbgToHex(fillColor);
    instance.fillStyleId = paintStyle.id;
    tableHeader.appendChild(instance);
  });
  return tableHeader;
};

const tableColumn = (
  colorStyles: PaintStyle[],
  index: number,
  array: { [key: string]: boolean }
) => {
  const columnIndex = index;
  const tableColumn = createFigmaFrame({
    layoutMode: "VERTICAL",
    itemSpacing: 5,
    counterAxisSizingMode: "AUTO",
  });
  const basePaintStyle = colorStyles[index];
  const rgbColor = (basePaintStyle.paints[0] as SolidPaint).color;
  const instance = (components[0] as ComponentNode).createInstance();
  (instance.children[0] as TextNode).characters = rbgToHex(rgbColor);
  instance.fillStyleId = basePaintStyle.id;
  tableColumn.appendChild(instance);
  colorStyles.map((paintStyle, index) => {
    const instanceTile = components[2].createInstance();
    let fillColor = (paintStyle.paints[0] as SolidPaint).color;
    const contrastClass = setProperties(fillColor, rgbColor);
    if (columnIndex === index || !array[contrastClass]) {
      instanceTile.children[0].fills = [
        { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
      ];
      instanceTile.children[0].visible = false;
      instanceTile.children[1].visible = false;
    } else {
      instanceTile.children[0].fillStyleId = paintStyle.id;
      instanceTile.fillStyleId = basePaintStyle.id;
    }
    const badgeFrame = instanceTile.children[1].children;
    badgeFrame[1].characters = getContrast(fillColor, rgbColor).toString();
    badgeFrame[0].setProperties({
      ["Property 1"]: setProperties(fillColor, rgbColor),
    });
    badgeFrame[0].setProperties({
      ["Property 1"]: contrastClass,
    });
    tableColumn.appendChild(instanceTile);
  });
  return tableColumn;
};

figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  console.log(msg);
  if (msg.type === "create-rectangles") {
    const nodes: SceneNode[] = [];
    const localColorStyles = figma.getLocalPaintStyles();
    createColorNameTile();
    createColorNameAndCodeTile();
    createBadgeFrame();
    createTile();
    const tableContainer = createFigmaFrame({
      name: "grid",
      layoutMode: "HORIZONTAL",
      itemSpacing: 5,
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
      counterAxisSizingMode: "AUTO",
      y: 200,
    });
    tableContainer.appendChild(tableHeader(localColorStyles));
    localColorStyles.map((_, index) =>
      tableContainer.appendChild(
        tableColumn(localColorStyles, index, msg.array)
      )
    );
    nodes.push(tableContainer);
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
