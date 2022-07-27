# eve Sleep Shopify Theme
Built upon Dawn 3.0

## Devlop
### Setup
- [Node](https://www.npmjs.com/get-npm). Check `package.json` for recommended version.
- Node v14.12.0 is required. We encourage using `nvm` and running `nvm use` to ensure you're running the correct version of Node.
- Run `npm install` for project dependencies.

### Scripts
The `package.json` file is home to many commands, a lot of which are eve-specific given the multi-store setup. Many are self-explanatory, so here are just the key ones:

#### Build – `build`
Runs a build shell script (found in `./compiler/tasks/build.sh`) that does the following:
- Runs compile scripts (found in `./compiler/*`). These scripts copy over the files from `src` to `/theme/assets`, compiling JavaScript and Sass along the way.
- Runs Webpack config (found in `./src/vendor/`), compiling all existing vendor scripts together
– Adds build information into `theme.liquid`, including `build_env`, `build_commit` and `build_date` variables. 
A production variation of the build command exists, outputting `production` as the `build_env` variable. This is run when the one of the three push commands are ran.

#### Build vendor – `npm run build:vendor`
Runs Webpack config found in `./src/vendor`. For more information, see "Bundles > Vendor".

#### Build checkout – `npm run build:checkout`
Runs Webpack config found in `./src/checkout`. For more information, see "Bundles > Checkout".

#### Build TWSC – `npm run build:twsc`
Runs Webpack config found in `./src/twsc`. For more information, see "Bundles > TWSC".

#### Watch – `npm run watch`
Watches the `src` dir for any changes and sequentially runs the compiling scripts 

#### Login – `npm run login:uk`
Three login commands exist, one for each eve store: UK, IE and FR. Running will run `shopify logout` and then log you back into the corresponding eve store. 

#### Switch – `npm run switch:uk`
Three switch commands exist, one for each eve store: UK, IE and FR. Running will `shopify switch` you to the correponding eve store, without logging you out. This is run every time `serve` is ran, ensuring you're always devving on the correct store. 

### Serve – `npm run serve:uk`
Three serve conmands exist, one for each eve store: UK, IE and FR. This runs `shopify theme serve` from the `/theme` directory. Ensure to run `watch` to watch for changes whilst you dev, or alternatively run `start:uk` to run both concurrently. 

#### Pull – `npm run pull`
Pulls the `/config`, `/templates` and `/locales` from `main` theme. The command looks for a theme named `[tm-development] main`, therefore this theme __cannot__ be renamed.

#### Push – `npm run push:uk`
Three push commands exist, one for each eve store: UK, IE and FR. Pushes to the `[tm-development] main` theme on the corresponding store.

#### Push feature – `npm run push-feature:uk`
Three push-feature conmands exist, one for each eve store: UK, IE and FR. Creates and pushes to a new theme on the corresponding store. You will be prompted to name the new theme. The following naming convention is encouraged: `[tm-development] branch-name`
An example would be: `[tm-development] feature/modal-update`

#### Start – `npm run start:uk`
Three start conmands exist, one for each eve store: UK, IE and FR. Concurrently runs `watch` and `serve:uk` in the same terminal window. Alternatively you can run the two commands separately yourself to make things more readable :) 

### Theme
The theme intended to be used should be copied into `/theme`.

When installing an updated theme, it should be copied into `/theme` and Git diffed accordingly.

### Compiler

The Thought And Mortar `/compiler` compiles Sass from `/src/styles` and JavaScript from `/src/scripts` to `/theme/assets`.

Uses:
- [Dart Sass](https://sass-lang.com/dart-sass) for Sass compiling.
- [`recursive-copy`](https://github.com/timkendrick/recursive-copy) for JavaScript file copying.
- [`chokidar`](https://github.com/paulmillr/chokidar) to watch for file changes.

#### CSS/JS assets
The watching and moving of files is done by Node scripts in `/compiler/scripts` that are run by Shell scripts in `/compiler/tasks`.

Any files compiled from `/src/scripts` and `/src/styles` will warn before overwriting any namesakes in `/theme` that do not have the "_This is a compiled {{type}} file._" comment. This prevents files output from `/src` unintentionally overwriting files in `/theme/assets`.

Existing `/theme/assets` files intended to be overwritten should be removed from `/theme` and copied to the approprate `/src` directory.

A good example is when a `/theme/assets` file needs to be modified, so changes can be tracked outside of the theme.

Asset files are not bundled and each CSS/JS asset is included as-needed in `.liquid` files, to match the Dawn 4.0 approach.

#### Managing .gitignore 
CSS and JS files that are compiled from `/src` to `/theme/assets` are added to `.gitignore` by the compiler. This allows us to track `/src` files only and not their respective outputs.

### Deployed themes
Themes should use the following naming convention: `[tm-development] branch-name`

All stores will have a theme called `[tm-development] main`, plus others for individual feature QA.

## Bundles
Larger, standalone JavaScript modules are bundled by Webpack.

When `npm i` is run in root, their dependencies will also be installed followed by a build.

### Vendor
JS for the vendor scripts is bundled as `/theme/assets/bundle.vendor.js` from `/src/vendor/bundles/vendor.js`.

### Checkout
JS for the checkout is bundled as `/theme/assets/bundle.checkout.js` from `/src/checkout/bundles/checkout.js`.

### TWSC
The TWSC Vue.js app is bundled as `/theme/assets/bundle.checkout.js` from `/src/checkout/bundles/checkout.js`.
