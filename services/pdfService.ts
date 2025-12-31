
import { jsPDF } from "jspdf";
import { UploadedFile } from "../types";

export const generatePdfFromImages = (files: UploadedFile[], title: string = "Generated Document") => {
  const doc = new jsPDF();
  let yOffset = 20;

  // Title
  doc.setFontSize(18);
  doc.text(title, 10, yOffset);
  yOffset += 15;

  files.forEach((file, index) => {
    if (file.type !== 'image') return;

    const imgProps = doc.getImageProperties(file.previewUrl);
    const pdfWidth = doc.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Check if new page is needed
    if (yOffset + pdfHeight > 280) {
      doc.addPage();
      yOffset = 20;
    }

    doc.addImage(file.previewUrl, 'JPEG', 10, yOffset, pdfWidth, pdfHeight);
    yOffset += pdfHeight + 5;

    // Add caption if AI generated one
    if (file.aiDescription) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      const splitText = doc.splitTextToSize(file.aiDescription, pdfWidth);
      
      // Check space for caption
      const textHeight = splitText.length * 4;
      if (yOffset + textHeight > 280) {
        doc.addPage();
        yOffset = 20;
      }
      
      doc.text(splitText, 10, yOffset);
      yOffset += textHeight + 10;
      doc.setTextColor(0); // Reset color
    } else {
      yOffset += 10;
    }
  });

  doc.save("pdfauto-images.pdf");
};

export const generatePdfFromText = (text: string) => {
  const doc = new jsPDF();
  const splitText = doc.splitTextToSize(text, 180);
  
  doc.setFontSize(12);
  let y = 20;
  
  // A very basic Markdown-ish renderer loop could go here, 
  // but for stability we just render the cleaned text.
  // In a real app, you'd parse headers, etc.
  
  const pageHeight = doc.internal.pageSize.height;
  
  splitText.forEach((line: string) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
    y += 7;
  });

  doc.save("pdfauto-report.pdf");
};
