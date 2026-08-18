const path = require('path');
const { src, dest, parallel } = require('gulp');

function buildNodeIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest(path.resolve('dist', 'nodes')));
}

// The credential carries its own icon, and n8n resolves it relative to the
// credential file — so it has to be copied separately, not shared with the node.
function buildCredentialIcons() {
	return src('credentials/**/*.{png,svg}').pipe(dest(path.resolve('dist', 'credentials')));
}

exports['build:icons'] = parallel(buildNodeIcons, buildCredentialIcons);
