const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
                replaceInDir(p);
            }
        } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
            let content = fs.readFileSync(p, 'utf8');
            let changed = false;

            // replace imports from shared/schema with @soulcodex/db
            const dbRegex = /import\s+({[^}]+})\s+from\s+['"](\.\.\/|\.\/)*shared\/schema['"]/g;
            if (dbRegex.test(content)) {
                content = content.replace(dbRegex, 'import $1 from "@soulcodex/db"');
                changed = true;
            }

            // replace default imports from shared/schema with @soulcodex/db
            const dbDefaultRegex = /import\s+(\w+)\s+from\s+['"](\.\.\/|\.\/)*shared\/schema['"]/g;
            if (dbDefaultRegex.test(content)) {
                content = content.replace(dbDefaultRegex, 'import $1 from "@soulcodex/db"');
                changed = true;
            }

            // replace imports from soulcodex with @soulcodex/core
            const coreRegex = /import\s+({[^}]+})\s+from\s+['"](\.\.\/|\.\/)*soulcodex['"]/g;
            if (coreRegex.test(content)) {
                content = content.replace(coreRegex, 'import $1 from "@soulcodex/core"');
                changed = true;
            }

            // replace default imports from soulcodex with @soulcodex/core
            const coreDefaultRegex = /import\s+(\w+)\s+from\s+['"](\.\.\/|\.\/)*soulcodex['"]/g;
            if (coreDefaultRegex.test(content)) {
                content = content.replace(coreDefaultRegex, 'import $1 from "@soulcodex/core"');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(p, content);
                console.log(`Updated imports in ${p}`);
            }
        }
    }
}

replaceInDir('apps/api');
replaceInDir('apps/web');
replaceInDir('packages');
