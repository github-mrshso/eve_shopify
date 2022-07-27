#!/bin/bash
# Run build
zsh ./compiler/tasks/build.sh

# Watch files
echo '\n\e[1;33mWatching for changes 👀\n'
concurrently "node compiler/scripts/javascript-watcher.js" "node compiler/scripts/styles-watcher.js"