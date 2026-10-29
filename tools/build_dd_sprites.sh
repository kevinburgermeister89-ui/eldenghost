#!/bin/sh
# v21: baut js/creatures_dd.js aus den Entwurfsdateien in design/ (Drache-/Dunkel-Geister)
cd "$(dirname "$0")/.." || exit 1
{
  echo "'use strict';"
  echo "// GENERIERT von tools/build_dd_sprites.sh aus design/*.js – dort bearbeiten, nicht hier."
  for f in design/sprites_drachen_dunkel.js design/dd_helpers.js design/dd_fern.js design/dd_s*.js; do echo "// ---- $f"; cat "$f"; echo; done
  echo "Object.assign(G.Creatures.DEF, DD.DEF); Object.assign(G.Creatures.TEX, DD.TEX);"
} > js/creatures_dd.js
