#!/bin/bash
ENVIRONMENT=( .env )
CONFIG="./"

# Get env variables
source $CONFIG$ENVIRONMENT

if [ "$STORE_URL" = "" ] ; then
    echo "\n\e[1;93mUnable to find STORE_URL in .env file"
else
    if shopify switch --store $STORE_URL ; then
        # Switch to new store from .env
        echo ""
    else
        # If switch fails, run login instead
        echo "\n\e[1;93mChecking logout (incase logged in to wrong account)"
        echo "\n"

        shopify logout

        echo "\n\e[1;93mRunning 'shopify login'"
        echo "\n"

        shopify login --store $STORE_URL
    fi
fi