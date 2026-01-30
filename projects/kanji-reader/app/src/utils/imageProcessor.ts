import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Resizes an image to the specified width, maintaining aspect ratio.
 * @param uri The URI of the image to resize.
 * @param width The target width.
 * @returns The manipulated image result.
 */
export const resizeImage = async (uri: string, width: number) => {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width } }],
      { compress: 1, format: SaveFormat.JPEG }
    );
    return result;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

/**
 * Crops an image based on the specified rectangle.
 * @param uri The URI of the image to crop.
 * @param originX The x-coordinate of the top-left corner of the crop rectangle.
 * @param originY The y-coordinate of the top-left corner of the crop rectangle.
 * @param width The width of the crop rectangle.
 * @param height The height of the crop rectangle.
 * @returns The manipulated image result.
 */
export const cropImage = async (
  uri: string,
  originX: number,
  originY: number,
  width: number,
  height: number
) => {
  try {
    const result = await manipulateAsync(
      uri,
      [{ crop: { originX, originY, width, height } }],
      { compress: 1, format: SaveFormat.JPEG }
    );
    return result;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
};

/**
 * Prepares an image for OCR processing.
 * Currently resizes to a max width of 1024px to optimize upload/processing speed
 * while maintaining enough detail for recognition.
 * @param uri The URI of the image to prepare.
 * @returns The manipulated image result.
 */
export const prepareForOcr = async (uri: string) => {
  try {
    // Resize to a standard width for OCR (e.g., 1024px) to balance quality and speed.
    // If we had a grayscale option we might use it, but basic manipulation is often sufficient.
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.9, format: SaveFormat.JPEG }
    );
    return result;
  } catch (error) {
    console.error('Error preparing image for OCR:', error);
    throw error;
  }
};
