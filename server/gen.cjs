// gen.cjs
// Run with: node gen.cjs

const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");
const QRCode = require("qrcode");

// --- CONFIG ---
const CONFIG = {
  showWireframe: true,   // show red box outlines for labels
  qrScale: 0.75,         // QR code relative size (0–1 of label)
  qrOffsetX: 0,          // global QR horizontal offset (pt)
  qrOffsetY: 4,          // global QR vertical offset (pt)
  textFontSize: 6,       // font size for code text
  textOffsetY: -2,       // relative offset beneath QR
  textOffsetX: 0         // relative horizontal tweak
};

// --- utils: random 4-letter string generator ---
function generateAlphaStrings(count) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const results = [];
  for (let i = 0; i < count; i++) {
    let str = "";
    for (let j = 0; j < 4; j++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    results.push(str);
  }
  return results;
}

// --- mm to PDF points ---
const MM_TO_PT = mm => (mm * 72) / 25.4;

// --- PDF generator ---
async function generateLabelPDF(codes, cfg) {
  const {
    showWireframe,
    qrScale,
    qrOffsetX,
    qrOffsetY,
    textFontSize,
    textOffsetX,
    textOffsetY
  } = cfg;

  // LP70/25SQ specs
  const labelSize = MM_TO_PT(25);       // 25mm square
  const pitch = MM_TO_PT(27);           // label + gap
  const marginLeft = MM_TO_PT(11.5);
  const marginTop = MM_TO_PT(14.5);

  const cols = 7, rows = 10;
  const pageWidth = MM_TO_PT(210);      // A4 width
  const pageHeight = MM_TO_PT(297);     // A4 height

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const qrSize = labelSize * qrScale;
  const qrCenteringOffset = (labelSize - qrSize) / 2;

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    // top-left corner of label cell
    const labelX = marginLeft + col * pitch;
    const labelY = pageHeight - marginTop - labelSize - row * pitch;

    // --- optional wireframe ---
    if (showWireframe) {
      page.drawRectangle({
        x: labelX,
        y: labelY,
        width: labelSize,
        height: labelSize,
        borderColor: rgb(0.8, 0.2, 0.2),
        borderWidth: 0.5,
      });
    }

    // position QR inside label
    const qrX = labelX + qrCenteringOffset + qrOffsetX;
    const qrY = labelY + qrCenteringOffset + qrOffsetY;

    // Generate QR
    const qrDataUrl = await QRCode.toDataURL(code, {
      errorCorrectionLevel: "H",
      width: Math.floor(qrSize),
      margin: 0,
    });
    const qrBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    // Draw QR
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Place text beneath QR, centered
    const fontSize = textFontSize;
    const textWidth = fontSize * code.length * 0.6;
    const textX = labelX + (labelSize - textWidth) / 2 + textOffsetX;
    const textY = qrY - fontSize + textOffsetY;

    page.drawText(code, {
      x: textX,
      y: textY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
}

// --- runner ---
(async () => {
  try {
    const codes = generateAlphaStrings(70); // one full sheet
    const pdfBytes = await generateLabelPDF(codes, CONFIG);
    fs.writeFileSync("labels.pdf", pdfBytes);
    console.log("✅ labels.pdf generated with tuning options");
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
})();
