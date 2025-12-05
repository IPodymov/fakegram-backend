import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class FileUtils {
  static saveBase64Image(base64String: string, directory: string): string {
    try {
      // Проверяем, является ли строка base64
      if (!base64String.startsWith('data:image')) {
        return base64String; // Возвращаем как есть, если это URL
      }

      // Извлекаем mime type и данные
      const matches = base64String.match(
        /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/,
      );
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }

      const mimeType = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      // Определяем расширение файла
      let extension = 'jpg';
      if (mimeType === 'png') extension = 'png';
      else if (mimeType === 'gif') extension = 'gif';
      else if (mimeType === 'webp') extension = 'webp';
      else if (mimeType === 'svg+xml') extension = 'svg';
      else if (mimeType === 'jpeg') extension = 'jpg';

      // Создаем директорию, если не существует
      const uploadDir = join(process.cwd(), 'uploads', directory);
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Генерируем короткое уникальное имя файла (8 символов + расширение)
      const shortId = Math.random().toString(36).substring(2, 10);
      const filename = `${shortId}.${extension}`;
      const filepath = join(uploadDir, filename);

      // Сохраняем файл
      writeFileSync(filepath, buffer);

      // Возвращаем относительный путь
      return `/uploads/${directory}/${filename}`;
    } catch (error) {
      console.error('FileUtils.saveBase64Image error:', error);
      throw error;
    }
  }

  static saveBase64ImageSafe(
    base64String: string | undefined,
    directory: string,
  ): string | null {
    if (!base64String || !base64String.startsWith('data:image')) {
      return base64String || null;
    }
    try {
      return this.saveBase64Image(base64String, directory);
    } catch (error) {
      console.error('Error saving base64 image:', error);
      return null;
    }
  }
}
