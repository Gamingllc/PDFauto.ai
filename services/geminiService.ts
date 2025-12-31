
/**
 * Analyzes a set of images (converted from PDF pages) via Secure Backend.
 */
export const analyzeDocumentImages = async (base64Images: string[], prompt: string, userId?: string): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: base64Images, prompt, userId })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresUpgrade) {
        throw new Error(data.error || 'Upgrade required');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return data.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates a description for an image via Secure Backend.
 */
export const describeImage = async (base64Image: string, prompt: string = "Describe this image in detail for a document caption.", userId?: string): Promise<string> => {
  try {
    const response = await fetch('/api/describe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, prompt, userId })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresUpgrade) {
        throw new Error(data.error || 'Upgrade required');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return data.text;
  } catch (error) {
    console.error("Description Error:", error);
    throw error;
  }
};

/**
 * Refines text via Secure Backend.
 */
export const refineText = async (text: string, userId?: string): Promise<string> => {
  try {
    const response = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userId })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresUpgrade) {
        throw new Error(data.error || 'Upgrade required');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return data.text;
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
};

// Deprecated
export const analyzePdf = async (base64Pdf: string, prompt: string): Promise<string> => {
  return "Please use the enhanced component-based rendering pipeline.";
};

export const convertPdfToMarkdown = async (base64Pdf: string): Promise<string> => {
  return "Please use the enhanced component-based rendering pipeline.";
};
