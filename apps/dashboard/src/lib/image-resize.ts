/**
 * صورة مرفوعة ← Data URL JPEG صغيرة (أطول ضلع 1000px). في الـMocks بنخزنها في المتصفح، فلازم تكون خفيفة.
 * لما الـAPI يجهز الرفع الحقيقي (multipart) بيبدّل الدالة دي. بترفض الملفات اللي مش صور.
 */
export async function resizeImage(file: File, maxSide = 1000, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('NOT_IMAGE');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('NO_CANVAS');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
