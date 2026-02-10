import * as fs from "fs";
import * as path from "path";

interface CountryPath {
    id: string;
    name: string;
    d: string;
}

const svgPath = path.resolve("app/assert/africa-map.svg");
const outputPath = path.resolve("app/auth/africa-paths.ts");

const svgContent = fs.readFileSync(svgPath, "utf8");

// Regex patterns to extract path data
const pathTagRegex = /<path[\s\S]*?\/>/g;
const dRegex = /d="([^"]+)"/;
const idRegex = /id="([^"]+)"/;
const nameRegex = /data-name="([^"]+)"/;

const paths: CountryPath[] = [];

let match: RegExpExecArray | null = pathTagRegex.exec(svgContent);
while (match !== null) {
    const pathTag = match[0];
    const dMatch = dRegex.exec(pathTag);
    const idMatch = idRegex.exec(pathTag);
    const nameMatch = nameRegex.exec(pathTag);

    if (dMatch && idMatch && nameMatch) {
        paths.push({
            id: idMatch[1],
            name: nameMatch[1],
            d: dMatch[1],
        });
    }
}

const fileContent = `// Auto-generated from africa-map.svg
// Run: npx tsx scripts/extract-africa-paths.ts

export interface CountryPath {
  readonly id: string;
  readonly name: string;
  readonly d: string;
}

export const africaPaths: readonly CountryPath[] = ${JSON.stringify(paths, null, 2)} as const;

export const COUNTRY_COUNT = ${paths.length} as const;
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`✓ Extracted ${paths.length} country paths to ${outputPath}`);
