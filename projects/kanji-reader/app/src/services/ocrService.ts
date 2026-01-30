import { File } from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: any;
}

const GOOGLE_CLOUD_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export const performOCR = async (imageUri: string): Promise<string> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      throw new Error('Google Cloud Vision API key is missing. Please set EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY.');
    }

    // Read the file as Base64 using the new File API
    const file = new File(imageUri);
    const base64Image = await file.base64();

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
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
      const errorText = await response.text();
      throw new Error(`Google Cloud Vision API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (data.responses && data.responses.length > 0) {
      const resp = data.responses[0];
      if (resp.fullTextAnnotation) {
        return resp.fullTextAnnotation.text;
      }
      if (resp.textAnnotations && resp.textAnnotations.length > 0) {
        return resp.textAnnotations[0].description;
      }
    }

    return '';
  } catch (error) {
    console.error('performOCR error:', error);
    throw error;
  }
};
