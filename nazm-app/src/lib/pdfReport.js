// Generate a branded NAZM PDF report by rasterizing a DOM node.
// Uses html2canvas → jsPDF. This route preserves Arabic shaping/RTL because
// the browser renders the HTML natively; no custom Arabic font embedding needed.

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateReport(targetEl, { fileName = 'nazm-report.pdf', brand = 'NAZM · نَظْم' } = {}) {
  if (!targetEl) throw new Error('generateReport: target element is required');

  const canvas = await html2canvas(targetEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: getComputedStyle(targetEl).backgroundColor || '#070A12',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 32;
  const headerH = 48;

  // Branded header bar
  pdf.setFillColor(7, 10, 18);
  pdf.rect(0, 0, pageW, headerH, 'F');
  pdf.setFillColor(139, 92, 246);
  pdf.rect(0, headerH - 3, pageW, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(brand, margin, 30);
  pdf.setFontSize(9);
  pdf.setTextColor(165, 243, 252);
  pdf.text(new Date().toISOString().slice(0, 19).replace('T', ' '), pageW - margin, 30, { align: 'right' });

  // Fit the captured image within page while preserving aspect ratio
  const availW = pageW - margin * 2;
  const availH = pageH - headerH - margin * 2;
  const ratio = Math.min(availW / canvas.width, availH / canvas.height);
  const imgW = canvas.width * ratio;
  const imgH = canvas.height * ratio;
  const x = (pageW - imgW) / 2;
  const y = headerH + margin;

  pdf.addImage(imgData, 'PNG', x, y, imgW, imgH, undefined, 'FAST');

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 140);
  pdf.text(`${brand} — Intelligence Hub`, pageW / 2, pageH - 14, { align: 'center' });

  pdf.save(fileName);
}
