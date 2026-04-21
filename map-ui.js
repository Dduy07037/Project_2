/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

function scanDir(dir, depth = 0) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory() && !['node_modules', '.next', 'dist'].includes(file)) {
            console.log(`${'  '.repeat(depth)}DIR  [${file}]`);
            scanDir(filePath, depth + 1);
            return;
        }

        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const classes = content.match(/className="([^"]+)"/g) || [];
            console.log(`${'  '.repeat(depth)}FILE ${file} (${classes.length} UI elements)`);
        }
    });
}

scanDir('./src');
