const fs = require('fs');
const path = require('path');
const dir = 'apps/web/src/pages';

if (!fs.existsSync(dir)) {
    console.error(`Directory ${dir} not found`);
    process.exit(1);
}

fs.readdirSync(dir).forEach(f => {
    if (f.endsWith('.tsx')) {
        const p = path.join(dir, f);
        let c = fs.readFileSync(p, 'utf8');
        let changed = false;

        // Standardize apiRequest(url, payload) into apiRequest(url, { method: "POST", body: JSON.stringify(payload) })
        // ONLY if the second argument is NOT an object already (missing 'method:')
        
        // This is tricky with regex due to nested objects, but we can target common cases in this project
        
        // Case: apiRequest("/api/...", { method: "...", body: ... }) -> already correct
        // Case: apiRequest("/api/...", payload) -> incorrect for new signature
        
        // Regex to find apiRequest with 2 args where second arg doesn't contain 'method:'
        // Simplified: replace known problematic calls
        
        if (f === 'OnboardingPage.tsx') {
            c = c.replace(/apiRequest\("\/api\/profiles",\s+{([\s\S]*?)}\)/g, (m, body) => {
                if (body.includes('method:')) return m;
                return `apiRequest("/api/profiles", { method: "POST", body: JSON.stringify({${body}}) })`;
            });
            changed = true;
        }

        if (f === 'CompatibilityPage.tsx') {
            c = c.replace(/apiRequest\("\/api\/compatibility",\s+{([\s\S]*?)}\)/g, (m, body) => {
                if (body.includes('method:')) return m;
                return `apiRequest("/api/compatibility", { method: "POST", body: JSON.stringify({${body}}) })`;
            });
            changed = true;
        }
        
        // Re-run the usage fix to ensure TimelinePage/TodayPage/TrackerPage are correct with (url, options)
        if (f === 'TodayPage.tsx') {
             c = c.replace(/apiRequest\("\/api\/today\/card",\s+JSON\.stringify\(payload\)\)/g, 
                'apiRequest("/api/today/card", { method: "POST", body: JSON.stringify(payload) })');
             changed = true;
        }

        if (changed) {
            fs.writeFileSync(p, c);
            console.log(`Standardized apiRequest in ${f}`);
        }
    }
});
