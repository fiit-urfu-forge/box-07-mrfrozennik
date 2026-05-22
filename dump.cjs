const fs = require('fs');
const path = require('path');

// Папки и файлы, которые нужно проигнорировать
const IGNORE_DIRS = ['node_modules', '.git', '.devcontainer', 'dist', '.vite'];
const IGNORE_FILES = ['package-lock.json', 'dump.js', 'project_code.txt'];

const OUTPUT_FILE = path.join(__dirname, 'project_code.txt');

// Очищаем файл перед записью, если он существовал
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

function scanDirectory(currentDir) {
  const files = fs.readdirSync(currentDir);

  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    const relativePath = path.relative(__dirname, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        scanDirectory(fullPath);
      }
    } else {
      if (!IGNORE_FILES.includes(file)) {
        try {
          // Читаем контент как текст
          const content = fs.readFileSync(fullPath, 'utf8');
          // Приводим слэши к единому виду / для красоты
          const formattedPath = '/' + relativePath.replace(/\\/g, '/');
          
          // Записываем строго по твоему формату
          fs.appendFileSync(OUTPUT_FILE, `FILENAME ${formattedPath}\n${content}\nENDFILE\n\n`);
        } catch (e) {
          // Пропускаем бинарники или файлы, которые не удалось прочесть
          console.warn(`Пропущен файл: ${relativePath}`);
        }
      }
    }
  }
}

console.log('Сборка файлов проекта запущена...');
scanDirectory(__dirname);
console.log(`Готово! Все исходники склеены в файл: ${OUTPUT_FILE}`);