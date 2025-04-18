const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..'); // go up to ndl-view

const targets = [
    {
        src: path.join(baseDir, 'shared/models/watchlist-entry.model.ts'),
        dests: [
            path.join(baseDir, 'frontend/src/app/models/watchlist-entry.model.ts'),
            path.join(baseDir, 'api/models/watchlist-entry.model.ts'),
        ],
    }
];

for (const target of targets) {
    for (const dest of target.dests) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(target.src, dest);
        console.log(`✅ Copied ${target.src} to ${dest}`);
    }
}
