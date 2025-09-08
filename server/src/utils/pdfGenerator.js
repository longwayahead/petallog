// GET /api/qr/batch/pdf?size=70&offset=0 - batch 1
// GET /api/qr/batch/pdf?size=70&offset=70 - 2
// GET /api/qr/batch/pdf?size=70&offset=140 - 3

////////////////////
// POST /api/qr/generate
// Content-Type: application/json
// { "count": 500 }

import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";

const MM_TO_PT = mm => (mm * 72) / 25.4;

export async function generateLabelPDF(codes, cfg) {
  const {
    showWireframe,
    qrScale,
    qrOffsetX,
    qrOffsetY,
    textFontSize,
    textOffsetX,
    textOffsetY
  } = cfg;

  const labelSize = MM_TO_PT(25);
  const pitch = MM_TO_PT(27);
  const marginLeft = MM_TO_PT(11.5);
  const marginTop = MM_TO_PT(14.5);

  const cols = 7, rows = 10;
  const pageWidth = MM_TO_PT(210);
  const pageHeight = MM_TO_PT(297);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const qrSize = labelSize * qrScale;
  const qrCenteringOffset = (labelSize - qrSize) / 2;

  for (let i = 0; i < codes.length; i++) {
    const code = typeof codes[i] === "string" ? codes[i] : codes[i].code;
    const col = i % cols;
    const row = Math.floor(i / cols);

    const labelX = marginLeft + col * pitch;
    const labelY = pageHeight - marginTop - labelSize - row * pitch;

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

    const qrX = labelX + qrCenteringOffset + qrOffsetX;
    const qrY = labelY + qrCenteringOffset + qrOffsetY;

    const qrDataUrl = await QRCode.toDataURL(code, {
      errorCorrectionLevel: "H",
      width: Math.floor(qrSize),
      margin: 0,
    });
    const qrBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

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
