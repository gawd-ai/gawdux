// gawdux/test-support: the real-Chromium geometry harness. Node only.
export {
	GEOMETRY_WIDTHS,
	boxes,
	componentStylesheet,
	componentStylesheets,
	createGeometry,
	launchGeometry,
	mountAt,
	openAt
} from './browser-geometry.js';
export type { Box, Geometry, GeometryOptions, PageOptions } from './browser-geometry.js';
export { GEOMETRY_CHROMIUM_ENV, geometryChromium, geometrySkipReason } from './chromium.js';
export type { GeometryChromium } from './chromium.js';
