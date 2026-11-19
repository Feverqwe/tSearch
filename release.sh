#!/bin/sh
set -eu

CDPATH='' cd -- "$(dirname -- "$0")"
exec npm run release
