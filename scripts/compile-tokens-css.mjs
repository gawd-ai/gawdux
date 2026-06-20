import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const root = process.cwd();
const file = path.join(root, 'dist/styles/tokens.css');
const source = await fs.readFile(file, 'utf8');

// The published stylesheet must be plain CSS. Consumers import it from
// node_modules/symlinks, where Tailwind may evaluate it as its own module
// and reject package-local @apply rules. Use @reference only at package time
// so Tailwind can expand @apply without emitting the full utility sheet.
const input = `@reference 'tailwindcss';\n${source}`;
const result = await postcss([tailwindcss()]).process(input, {
	from: file,
	to: file
});

await fs.writeFile(file, result.css);
