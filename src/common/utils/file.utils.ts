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
        /^data:image\/([a-zA-Z]+);base64,(.+)$/,
      );
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
      }

      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      // Создаем директорию, если не существует
      const uploadDir = join(process.cwd(), 'uploads', directory);
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Генерируем короткое уникальное имя файла (8 символов + расширение)
      const shortId = Math.random().toString(36).substring(2, 10);
      const filename = `${shortId}.jpg`;
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
}
