/**
 * بيصغّر الصورة قبل الرفع (أطول ضلع `maxSide` بكسل) ويرجّعها JPEG كـData URL.
 * في الـMocks بس بنخزّنها في الـlocalStorage؛ الحقيقي بيرفع الملف على الـStorage بـPre-signed URL (docs/15).
 */
export async function resizeToDataUrl(file: File, maxSide = 640, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('CANVAS_UNAVAILABLE');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
