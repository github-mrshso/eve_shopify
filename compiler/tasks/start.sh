#!/bin/bash
if tmux -V ; then
    # If tmux is installed
    echo 'Setting up tmux windows'
    
    # Create a tmux window & split into two panes
    # run 'watch' in one / 'serve' in the other
    tmux kill-session
    tmux new -s "T&M Kit" "tmux splitw -d 'npm run watch | less' && npm run serve"
else
    # If tmux not installed, ask if they'd like to install it
    echo "\n\e[1;33mWe use tmux to keep the build/deploy logs seperate."
    echo "\nWe recommend installing it (requires brew), else we will run the tasks in parallel."
    echo ""

    if read -q "choice?Press Y/y to install"; then
        # Install tmux
        brew install tmux

        # Run serve/build with tmux
        tmux new -s "T&M Kit" "tmux splitw -d 'npm run watch | less' && npm run serve"
    else
        # If not run in single pane (ugly)
        echo "\e[1;33mHave it your way! Running start & serve in parallel"

        concurrently "npm run watch" "npm run serve"
    fi
fi