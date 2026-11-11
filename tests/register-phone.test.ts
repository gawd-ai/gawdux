import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// A register reads on a phone (tokens.css "A register on a phone"): at or
// below the compact width every register's table (the table in a
// ListSurface's scroller, or one wrapped in `.responsive-card-table`) turns
// its rows into labelled cards, one pattern for every register.
const tokens = readFileSync(path.resolve(import.meta.dirname, '../src/lib/styles/tokens.css'), 'utf8');
const section = tokens.slice(
	tokens.indexOf('---------- A register on a phone: its rows are cards'),
	tokens.indexOf('.checkbox-target {')
);

describe('a register on a phone', () => {
	it("turns every ListSurface register's rows into cards, not only a table a host marks", () => {
		expect(section).toContain('@media (max-width: 1024px)');
		expect(section).toContain(':is(.responsive-card-table, .list-table-scroll) tbody > tr {');
		expect(section).not.toMatch(/(?<!:is\()\.responsive-card-table tbody/);
	});

	it("labels a cell with its column's name and heads the card with the row's name", () => {
		expect(section).toContain("td[data-label]::before {\n\t\tcontent: attr(data-label);");
		expect(section).toContain("td[data-card='title'] {\n\t\tgrid-column: 1 / -1;");
		expect(section).toContain("td[data-card='wide'] {\n\t\tgrid-column: 1 / -1;");
		// No column vocabulary of the library's own.
		expect(section).not.toMatch(/content:\s*'[A-Z]/);
	});

	it('wraps a truncated value in a card instead of crushing it', () => {
		expect(section).toMatch(/td :is\(\.truncate, \.line-clamp-1\) \{[^}]*white-space: normal;/);
		expect(section).toMatch(/td:nth-child\(n\) \{[^}]*padding: 0 !important;[^}]*white-space: normal !important;/);
	});

	it("pads a dense table's cells only above the compact width", () => {
		const dense = tokens.slice(tokens.indexOf('.list-table {'), tokens.indexOf('/* Status column width utility */'));
		expect(dense).toMatch(/@media \(min-width: 1025px\) \{\s*\.list-table th,\s*\.list-table td \{\s*@apply !px-2;/);
	});
});
