import * as FileSystem from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence?: number;
  boundingBox?: any; // Google Vision API returns vertices, keeping it loose for now or could define strict types
}

const GOOGLE_CLOUD_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export const performOCR = async (imageUri: string): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not found in environment variables');
    }

    // Convert image to Base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GOOGLE_CLOUD_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OCR API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Parse the response
    // Google Vision API returns a list of text annotations. 
    // The first annotation usually contains the entire text detected.
    if (data.responses && data.responses.length > 0 && data.responses[0].textAnnotations) {
      const fullText = data.responses[0].textAnnotations[0].description;
      return fullText;
    } else {
      return ''; // No text detected
    }

  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
};
