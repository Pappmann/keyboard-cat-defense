#!/usr/bin/env bash
set -euo pipefail

OUTPUT="${1:-keyboard-cat-defense@onel.github.io.zip}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

rm -f "$OUTPUT"

zip -r "$OUTPUT" \
    cat.svg \
    extension.js \
    metadata.json \
    stylesheet.css \
    README.md \
    LICENSE \
    -x 'keyboard-cat-defense@onel.github.io.zip' \
    -x '*.git*' \
    -x '.github/*' \
    -x 'build.sh'
