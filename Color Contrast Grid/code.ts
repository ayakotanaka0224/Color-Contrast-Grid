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

function tableHeader(colorStyles, layoutMode) {
  const tableHeader = figma.createFrame();
  tableHeader.layoutMode = layoutMode;
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
    const tile = figma.createFrame();
    tile.layoutMode = "VERTICAL";
    tile.resize(80, 80);
    tile.horizontalPadding = 8;
    tile.verticalPadding = 8;
    tile.itemSpacing = 8;
    tile.primaryAxisAlignItems = "SPACE_BETWEEN";
    tile.backgrounds = [{ type: "SOLID", color: fillColor }];
    if (columnIndex !== index) {
      const text = figma.createText();
      text.characters = "Text";
      text.fills = [{ type: "SOLID", color: rgbColor }];
      tile.appendChild(text);
    }
    tableColumn.appendChild(tile);
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
    const tableContainer = figma.createFrame();
    tableContainer.layoutMode = "HORIZONTAL";
    tableContainer.itemSpacing = 5;
    tableContainer.counterAxisSizingMode = "AUTO";
    tableContainer.backgrounds = [
      { type: "SOLID", color: { r: 1, g: 1, b: 1 } },
    ];
    tableContainer.y = 200;
    // figma.currentPage.appendChild(tableHeader(localColorStyles, "VERTICAL"));
    tableContainer.appendChild(tableHeader(localColorStyles, "VERTICAL"));
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
