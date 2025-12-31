
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

export const generateDocxFromMarkdown = async (markdown: string, filename: string = "pdfauto-converted.docx") => {
    const lines = markdown.split('\n');
    const children = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('# ')) {
            children.push(new Paragraph({
                text: trimmed.substring(2),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 }
            }));
        } else if (trimmed.startsWith('## ')) {
             children.push(new Paragraph({
                text: trimmed.substring(3),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 }
            }));
        } else if (trimmed.startsWith('### ')) {
             children.push(new Paragraph({
                text: trimmed.substring(4),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 240, after: 120 }
            }));
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             children.push(new Paragraph({
                text: trimmed.substring(2),
                bullet: { level: 0 }
            }));
        } else {
             // Basic clean up of bold markers for cleaner docx output
             const cleanText = trimmed.replace(/\*\*/g, '');
             children.push(new Paragraph({
                text: cleanText,
                spacing: { after: 120 }
            }));
        }
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    
    // Native browser download handling to avoid file-saver module issues
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
