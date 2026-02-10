const fs = require('fs');
const path = require('path');

const svgPath = path.resolve('app/assert/africa-map.svg');
const outputPath = path.resolve('app/auth/africa-paths.ts');

const svgContent = fs.readFileSync(svgPath, 'utf8');

const pathTagRegex = /<path[\s\S]*?\/>/g;
// Use \s to ensure we are matching the start of an attribute
// Use [\s\S] inside the capture group if we want to support multiline d (though usually it's one line or handled by wrapping)
// Actually d attribute value shouldn't contain ", so [^"]+ is fine.
const dRegex = /\sd="([^"]+)"/;
const idRegex = /\sid="([^"]+)"/;
const nameRegex = /\sdata-name="([^"]+)"/;

let match;
const paths = [];

while ((match = pathTagRegex.exec(svgContent)) !== null) {
    const pathTag = match[0];
    const dMatch = dRegex.exec(pathTag);
    const idMatch = idRegex.exec(pathTag);
    const nameMatch = nameRegex.exec(pathTag);

    // Debug first match to see what's wrong
    if (paths.length === 0) {
        console.log('First path tag:', pathTag);
        console.log('d match:', dMatch ? dMatch[1].substring(0, 20) : 'null');
    }

    if (dMatch && idMatch && nameMatch) {
        paths.push({
            id: idMatch[1],
            name: nameMatch[1],
            d: dMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() // Clean up newlines/spaces in d
        });
    }
}

const fileContent = `export const africaPaths = ${JSON.stringify(paths, null, 2)} as const;
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`Extracted ${paths.length} paths to ${outputPath}`);
