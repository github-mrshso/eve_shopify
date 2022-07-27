#!/bin/bash
# Login to store
#zsh ./compiler/tasks/cli-login.sh

# Run build
zsh ./compiler/tasks/build.sh

# Serve files
cd theme && shopify theme serve --theme-editor-sync