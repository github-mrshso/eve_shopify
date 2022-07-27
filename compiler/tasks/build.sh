#!/bin/bash
THEME_LIQUID="./theme/layout/theme.liquid"

# === Assign BUILD_ENV
if [ "$1" = "--dev" ] || [ "$1" = "" ]
then
    BUILD_ENV=development
elif [ "$1" = "--prod" ]
then
    BUILD_ENV=production
fi

# Run build scripts
echo '\e[0;33m- Building scripts -'
node compiler/scripts/javascript.js
echo '\e[0;33m- Building styles -'
node compiler/scripts/styles.js
echo '\e[0;33m- Building vendor assets -'
cd src/vendor
webpack --mode production --config webpack.config.js --stats 'errors-only'
cd ../../
echo '\e[0;33m- Building checkout assets -'
cd src/checkout
webpack --mode production --config webpack.config.js --stats 'errors-only'
cd ../../
echo '\e[0;33m- Building twsc assets -'
cd src/twsc
webpack --mode production --config webpack.config.js --stats 'errors-only'
cd ../../

## @TODO: Investigate doing the following via theme compile js file
    echo '\n\e[0;33mAdding build information into theme.liquid...'

    # Update built theme.liquid with build environment
    sed -E -i "" "s/build_env = \"(.*)\"/build_env = \"${BUILD_ENV}\"/" $THEME_LIQUID

    # Update built theme.liquid with build commit
    BUILD_COMMIT=$(git log -1 --pretty=format:%h)
    sed -E -i "" "s/build_commit = \"(.*)\"/build_commit = \"${BUILD_COMMIT}\"/" $THEME_LIQUID

    # Update built theme.liquid with build date
    BUILD_DATE=$(date '+%d-%m-%Y')
    sed -E -i "" "s/build_date = \"(.*)\"/build_date = \"${BUILD_DATE}\"/" $THEME_LIQUID
## @/TODO: Investigate doing the following via theme compile js file

echo '\n\e[1;32mBuild complete 👍'