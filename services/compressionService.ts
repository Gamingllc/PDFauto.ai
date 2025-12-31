import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

// Handle potential default export wrapping for ESM compatibility
const lib = pdfjsLib as any;
const pdfJs = lib.default || lib;

// Set worker source to the cdnjs version which provides a stable classic script bundle
// suitable for standard Web Worker loading.
if (pdfJs.GlobalWorkerOptions) {
    pdfJs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export interface CompressionOptions {
  quality: number; // JPEG quality (0-1)
  scale: number;   // Viewport scale (resolution control)
}

export const compressPdf = async (
  file: File, 
  options: CompressionOptions, 
  onProgress: (current: number, total: number) => void
): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document using the resolved library object
  const loadingTask = pdfJs.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  
  // Create a new PDF. 
  // We will add pages manually matching the source document's aspect ratio.
  const newPdf = new jsPDF({
    orientation: 'p',
    unit: 'pt', // Use points for standard PDF sizing
    format: 'a4',
    compress: true
  });
  
  // Remove the initial blank page jsPDF creates
  newPdf.deletePage(1);

  for (let i = 1; i <= totalPages; i++) {
    onProgress(i, totalPages);
    
    const page = await pdf.getPage(i);
    
    // 1. Get reference viewport at 1.0 scale to determine physical page size (in points)
    // 72 DPI is standard PDF point size.
    const originalViewport = page.getViewport({ scale: 1.0 });
    
    // 2. Get scaled viewport for rendering (controls pixel density/resolution)
    // For high compression, this scale will be lower (creating smaller images)
    const renderViewport = page.getViewport({ scale: options.scale });

    // Create a canvas to render the page content
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = renderViewport.height;
    canvas.width = renderViewport.width;

    if (!context) throw new Error("Could not create canvas context");

    // Render the PDF page into the canvas
    await page.render({
      canvasContext: context,
      viewport: renderViewport
    }).promise;

    // Convert canvas to JPEG with specified quality
    // This is where the main size reduction happens (lossy compression)
    const imgData = canvas.toDataURL('image/jpeg', options.quality);

    // 3. Add the page to the new PDF using the ORIGINAL dimensions
    // This ensures the page size stays correct (e.g. A4) even if resolution is low
    const isLandscape = originalViewport.width > originalViewport.height;
    newPdf.addPage(
        [originalViewport.width, originalViewport.height], 
        isLandscape ? 'l' : 'p'
    );
    
    // 4. Draw the compressed image onto the page, stretching it to fit the physical bounds
    newPdf.addImage(
        imgData, 
        'JPEG', 
        0, 
        0, 
        originalViewport.width, 
        originalViewport.height, 
        undefined, 
        'FAST'
    );
    
    // Clean up
    page.cleanup();
    canvas.width = 0; 
    canvas.height = 0;
  }

  const filename = file.name.replace('.pdf', '-min.pdf');
  newPdf.save(filename);
};