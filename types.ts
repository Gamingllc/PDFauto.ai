export enum AppTab {
  CONVERT = 'CONVERT',
  ANALYZE = 'ANALYZE'
}

export enum CreateMode {
  IMAGES = 'IMAGES',
  TEXT = 'TEXT',
  PDF_TO_DOCX = 'PDF_TO_DOCX',
  COMPRESS_PDF = 'COMPRESS_PDF'
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  type: 'image' | 'pdf';
  aiDescription?: string;
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}