const path = require('path');
const { src, dest } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest(path.resolve('dist', 'nodes')));
}

exports['build:icons'] = buildIcons;
