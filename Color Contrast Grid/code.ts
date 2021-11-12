// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.loadFontAsync({ family: "Roboto", style: "Regular" });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

const components = [];

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

const badgeArray = [];

// 相対輝度の計算に使うための計算式
function getRGBForCalculateLuminance(rgb) {
  if (rgb <= 0.03928) {
    return rgb / 12.92;
  } else {
    return Math.pow((rgb + 0.055) / 1.055, 2.4);
  }
}

// 相対輝度を計算する
function getRelativeLuminance(r, g, b) {
  let R = getRGBForCalculateLuminance(r);
  let G = getRGBForCalculateLuminance(g);
  let B = getRGBForCalculateLuminance(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// コントラスト比出力
function getContrast(fillColor, rgbColor) {
  let l1 = getRelativeLuminance(fillColor["r"], fillColor["g"], fillColor["b"]);
  let l2 = getRelativeLuminance(rgbColor["r"], rgbColor["g"], rgbColor["b"]);
  let bright = l1 > l2 ? l1 : l2;
  let dark = l1 < l2 ? l1 : l2;
  const contrast = (bright + 0.05) / (dark + 0.05);
  return Math.floor(contrast * 10) / 10;
}

function setProperties(fillColor, rgbColor) {
  const contrast = getContrast(fillColor, rgbColor);
  if (contrast >= 7) {
    return "aaa";
  } else if (contrast < 7 && contrast >= 4.5) {
    return "aa";
  } else if (contrast < 4.5 && contrast >= 3) {
    return "aa18";
  } else {
    return "dnp";
  }
}

function createColorNameTile() {
  const colorNameTile = figma.createComponent();
  colorNameTile.name = "colorNameTile";
  colorNameTile.layoutMode = "VERTICAL";
  colorNameTile.resize(80, 80);
  colorNameTile.horizontalPadding = 8;
  colorNameTile.verticalPadding = 8;
  colorNameTile.itemSpacing = 8;
  colorNameTile.primaryAxisAlignItems = "CENTER";
  colorNameTile.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  const colorName = figma.createText();
  colorName.characters = "Hex code";
  colorNameTile.appendChild(colorName);
  components.push(colorNameTile);
}

function createColorNameAndCodeTile() {
  const colorNameAndCodeTile = figma.createComponent();
  colorNameAndCodeTile.name = "colorNameAndCodeTile";
  colorNameAndCodeTile.layoutMode = "VERTICAL";
  colorNameAndCodeTile.resize(200, 80);
  colorNameAndCodeTile.horizontalPadding = 8;
  colorNameAndCodeTile.verticalPadding = 8;
  colorNameAndCodeTile.itemSpacing = 8;
  colorNameAndCodeTile.primaryAxisAlignItems = "CENTER";
  colorNameAndCodeTile.backgrounds = [
    { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
  ];
  const colorName = figma.createText();
  colorName.characters = "Color name";
  const colorCode = figma.createText();
  colorCode.characters = "Hex code";
  colorNameAndCodeTile.appendChild(colorName);
  colorNameAndCodeTile.appendChild(colorCode);
  colorNameAndCodeTile.x = 100;
  components.push(colorNameAndCodeTile);
}

function createTile() {
  const footer = figma.createFrame();
  footer.layoutMode = "HORIZONTAL";
  footer.resize(64, 16);
  footer.counterAxisSizingMode = "AUTO";
  footer.primaryAxisAlignItems = "SPACE_BETWEEN";
  footer.layoutAlign = "STRETCH";
  footer.backgrounds = [
    { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0 },
  ];
  const tile = figma.createComponent();
  tile.name = "tile";
  tile.layoutMode = "VERTICAL";
  tile.resize(80, 80);
  tile.horizontalPadding = 8;
  tile.verticalPadding = 8;
  tile.itemSpacing = 8;
  tile.primaryAxisAlignItems = "SPACE_BETWEEN";
  tile.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  const text = figma.createText();
  text.characters = "Text";
  text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  tile.x = 650;
  let badge = badgeArray[0].createInstance();
  const num = figma.createText();
  num.characters = "num";
  tile.appendChild(text);
  tile.appendChild(footer);
  footer.appendChild(badge);
  footer.appendChild(num);
  components.push(tile);
}

function createBadge() {
  for (let key in badgeObj) {
    const textWrapper = figma.createComponent();
    textWrapper.name = key;
    textWrapper.layoutMode = "VERTICAL";
    textWrapper.resize(30, 20);
    textWrapper.primaryAxisSizingMode = "AUTO";
    textWrapper.cornerRadius = 8;
    textWrapper.horizontalPadding = 2;
    textWrapper.verticalPadding = 2;
    textWrapper.counterAxisAlignItems = "CENTER";
    textWrapper.backgrounds = [
      { type: "SOLID", color: badgeObj[key]["color"] },
    ];
    const badgeText = figma.createText();
    badgeText.characters = key.toUpperCase();
    badgeText.fontSize = 10;
    badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    textWrapper.appendChild(badgeText);
    badgeArray.push(textWrapper);
  }
}

function createBadgeFrame() {
  createBadge();
  const descriptionContainer = figma.createFrame();
  descriptionContainer.layoutMode = "VERTICAL";
  descriptionContainer.counterAxisSizingMode = "AUTO";
  descriptionContainer.itemSpacing = 12;
  descriptionContainer.horizontalPadding = 10;
  descriptionContainer.verticalPadding = 10;
  for (let key in badgeObj) {
    const description = figma.createText();
    description.characters = badgeObj[key]["description"];
    descriptionContainer.appendChild(description);
  }
  const frame = figma.createFrame();
  frame.name = "badgeDescription";
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = 10;
  frame.horizontalPadding = 10;
  frame.verticalPadding = 10;
  const variants = figma.combineAsVariants(badgeArray, frame);
  variants.name = "badge";
  variants.layoutMode = "VERTICAL";
  variants.counterAxisSizingMode = "AUTO";
  variants.itemSpacing = 10;
  variants.horizontalPadding = 10;
  variants.verticalPadding = 10;
  frame.appendChild(descriptionContainer);
  frame.x = 350;
}

function rbgToHex(color) {
  var hex = "#";
  const rgb = [
    parseInt(color.r * 255).toString(16),
    parseInt(color.g * 255).toString(16),
    parseInt(color.b * 255).toString(16),
  ];
  for (let i = 0; i < rgb.length; ++i) {
    if (rgb[i].length == 1) {
      rgb[i] = "0" + rgb[i];
    }
    hex += rgb[i];
  }
  return hex;
}

function tableHeader(colorStyles) {
  const tableHeader = figma.createFrame();
  tableHeader.layoutMode = "VERTICAL";
  tableHeader.itemSpacing = 5;
  tableHeader.counterAxisSizingMode = "AUTO";
  const tile = figma.createFrame();
  tile.resize(200, 80);
  tile.backgrounds = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  tableHeader.appendChild(tile);
  colorStyles.map((paintStyle) => {
    const fillColor = paintStyle.paints[0].color;
    const instance = components[1].createInstance();
    instance.children[0].characters = paintStyle.name;
    instance.children[1].characters = rbgToHex(fillColor);
    instance.backgrounds = [{ type: "SOLID", color: fillColor }];
    tableHeader.appendChild(instance);
  });
  return tableHeader;
}

function tableColumn(colorStyles, index) {
  const columnIndex = index;
  const tableColumn = figma.createFrame();
  tableColumn.layoutMode = "VERTICAL";
  tableColumn.itemSpacing = 5;
  tableColumn.counterAxisSizingMode = "AUTO";
  const rgbColor = colorStyles[index].paints[0].color;
  const instance = components[0].createInstance();
  instance.children[0].characters = rbgToHex(rgbColor);
  instance.backgrounds = [{ type: "SOLID", color: rgbColor }];
  tableColumn.appendChild(instance);
  colorStyles.map((paintStyle, index) => {
    let fillColor = paintStyle.paints[0].color;
    if (columnIndex === index) {
      fillColor = { r: 1, g: 1, b: 1 };
    }
    const instanceTile = components[2].createInstance();
    instanceTile.backgrounds = [{ type: "SOLID", color: fillColor }];
    instanceTile.children[0].fills = [{ type: "SOLID", color: rgbColor }];
    const badgeFrame = instanceTile.children[1].children;
    badgeFrame[1].characters = getContrast(fillColor, rgbColor).toString();
    badgeFrame[0].setProperties({
      ["Property 1"]: setProperties(fillColor, rgbColor),
    });
    if (columnIndex === index) {
      instanceTile.children[0].visible = false;
      instanceTile.children[1].visible = false;
    }
    tableColumn.appendChild(instanceTile);
  });
  return tableColumn;
}

figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-rectangles") {
    const nodes: SceneNode[] = [];
    const localColorStyles = figma.getLocalPaintStyles();
    createColorNameTile();
    createColorNameAndCodeTile();
    createBadgeFrame();
    createTile();
    const tableContainer = figma.createFrame();
    tableContainer.layoutMode = "HORIZONTAL";
    tableContainer.itemSpacing = 5;
    tableContainer.counterAxisSizingMode = "AUTO";
    tableContainer.backgrounds = [
      { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
    ];
    tableContainer.y = 200;
    tableContainer.appendChild(tableHeader(localColorStyles));
    localColorStyles.map((paintStyle, index) =>
      tableContainer.appendChild(tableColumn(localColorStyles, index))
    );
    nodes.push(tableContainer);
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
