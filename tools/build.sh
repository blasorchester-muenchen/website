#!/usr/bin/env bash
# Assemble the public GitHub Pages artifact into _site/.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir _site
cp index.html impressum.html 404.html site.webmanifest robots.txt _site/
cp -R css js assets _site/
rm -rf _site/assets/images/_originals
: > _site/.nojekyll

echo "Public site staged in _site/ ($(du -sh _site | cut -f1))"
