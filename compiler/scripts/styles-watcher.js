import chokidar from "chokidar";
import fs from "fs";

import { copyStyles, stylesIgnore } from "./styles.js";
import {
  gitIgnoreRemove,
  cssComment,
  overwriteMessage,
  flattenPath,
} from '../utils/index.js';

const stylesWatcher = chokidar.watch("./src/styles", {
  ignored: stylesIgnore,
  persistent: true,
});

stylesWatcher.on("change", (path) => {
  console.log(`📦 '${path}' 📮 'theme/assets/${flattenPath(path, 'styles').replace('.scss', '.css')}'`);

  copyStyles({
    path: `./${path}`,
  });
}).on("unlink", (path) => {
  const themeFilePath = `theme/assets/${flattenPath(path, 'styles').replace('.scss', '.css')}`;

  try {
    /**
     * Check if a file already exists in theme/assets
     */
    const data = fs.readFileSync(themeFilePath, 'utf-8');

    /**
     * Check if the file is compliled/uncompiled
     */
    if (!data.toString().includes(cssComment)) {
      console.warn(`${overwriteMessage} Check '${path}'`);
      return; // exit
    }
  } catch (e) {
    // console.log('File did not exist')
  }

  // Proceed with removal
  gitIgnoreRemove(themeFilePath);

  fs.unlink(themeFilePath, (err) => {
    if (err) {
      console.error(err)
      return
    }
  
    console.log(`🗑️  '${themeFilePath}' was deleted`);
  })
});

