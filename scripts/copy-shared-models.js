const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..'); // root (ndl-view)
const sourceDir = path.join(baseDir, 'shared/models');
const frontendDestDir = path.join(baseDir, 'frontend/src/app/models');
const apiDestDir = path.join(baseDir, 'api/models');

// Make sure destination dirs exist
for (const dir of [frontendDestDir, apiDestDir]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Read all files in shared/models
fs.readdirSync(sourceDir).forEach((filename) => {
    const srcFile = path.join(sourceDir, filename);

    // Only copy .ts files (skip other stuff)
    if (!fs.statSync(srcFile).isFile() || !filename.endsWith('.ts')) return;

    const destFrontend = path.join(frontendDestDir, filename);
    const destApi = path.join(apiDestDir, filename);

    fs.copyFileSync(srcFile, destFrontend);
    fs.copyFileSync(srcFile, destApi);
    console.log(`Copied ${filename} to frontend/ and api/`);
});
