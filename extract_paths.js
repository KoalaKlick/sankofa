const fs = require('fs');
const path = require('path');

const svgPath = path.resolve('app/assert/africa-map.svg');
const outputPath = path.resolve('app/auth/africa-paths.ts');

const svgContent = fs.readFileSync(svgPath, 'utf8');

// Regex to find path elements and extract d, id, and data-name
const pathRegex = /<path[^>]*d="([^"]+)"[^>]*id="([^"]+)"[^>]*data-name="([^"]+)"/g;

let match;
const paths = [];

while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push({
        d: match[1],
        id: match[2],
        name: match[3]
    });
}

const fileContent = `export const africaPaths = ${JSON.stringify(paths, null, 2)} as const;
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`Extracted ${paths.length} paths to ${outputPath}`);
