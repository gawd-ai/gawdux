// gawdux/test-support: the real-Chromium geometry harness and the house rule
// runner. Node only.
export { GEOMETRY_WIDTHS, boxes, componentStylesheet, componentStylesheets, createGeometry, launchGeometry, mountAt, openAt } from './browser-geometry.js';
export { GEOMETRY_CHROMIUM_ENV, geometryChromium, geometrySkipReason } from './chromium.js';
// The house rule runner: walk the sources, apply the readers, exceptions by file with reasons.
export { createHouseRules, houseRuleFiles } from './house-rules.js';
