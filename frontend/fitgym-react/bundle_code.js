import fs from 'fs';
import path from 'path';

// Папки, які треба читати
const DIRECTORIES = ['./src', './public/css'];
// Розширення файлів, які нам потрібні
const EXTENSIONS = ['.jsx', '.js', '.css'];
// Файл, куди все збережеться
const OUTPUT_FILE = 'full_project_code.txt';

let outputContent = '';

// Функція для побудови дерева папок і файлів
function buildTree(directory, prefix = '') {
    let tree = '';
    if (!fs.existsSync(directory)) return tree;
    
    const files = fs.readdirSync(directory);
    
    // Фільтруємо файли, щоб показувати тільки потрібні розширення та папки
    const filteredFiles = files.filter(file => {
        const fullPath = path.join(directory, file);
        return fs.statSync(fullPath).isDirectory() || EXTENSIONS.includes(path.extname(fullPath));
    });

    filteredFiles.forEach((file, index) => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        const isLast = index === filteredFiles.length - 1;

        tree += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;

        if (stat.isDirectory()) {
            tree += buildTree(fullPath, prefix + (isLast ? '    ' : '│   '));
        }
    });
    return tree;
}

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

console.log('Збираю структуру проекту та код докупи...');

// 1. Спочатку генеруємо візуальне дерево
let treeOutput = 'СТРУКТУРА ПРОЕКТУ:\n=========================================\n';
DIRECTORIES.forEach(dir => {
    treeOutput += `${dir}\n`;
    treeOutput += buildTree(dir);
    treeOutput += '\n';
});

// Додаємо дерево на самий початок
outputContent = treeOutput;

// 2. Потім збираємо вміст файлів
DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) readDirectory(dir);
});

fs.writeFileSync(OUTPUT_FILE, outputContent);
console.log(`✅ Готово! Структура та код збережені у файл: ${OUTPUT_FILE}`);