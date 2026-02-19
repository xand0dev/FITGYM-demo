import fs from 'fs';
import path from 'path';

// Папки, які треба читати
const DIRECTORIES = ['./src', './public/css'];
// Розширення файлів, які нам потрібні
const EXTENSIONS = ['.jsx', '.js', '.css'];
// Файл, куди все збережеться
const OUTPUT_FILE = 'full_project_code.txt';

let outputContent = '';

function readDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            readDirectory(fullPath);
        } else {
            if (EXTENSIONS.includes(path.extname(fullPath))) {
                const content = fs.readFileSync(fullPath, 'utf8');
                outputContent += `\n\n=========================================\n`;
                outputContent += `ФАЙЛ: ${fullPath}\n`;
                outputContent += `=========================================\n\n`;
                outputContent += content;
            }
        }
    }
}

console.log('Збираю код докупи...');
DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) readDirectory(dir);
});

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`✅ Готово! Весь код збережено у файл: ${OUTPUT_FILE}`);