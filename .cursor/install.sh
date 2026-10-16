#!/usr/bin/env bash
set -euo pipefail

# CursorTest has no third-party dependencies yet; verify checkout/bootstrap.
test -f README.md
grep -qi cursortest README.md

command -v git >/dev/null
command -v node >/dev/null
command -v python3 >/dev/null
