import chokidar from "chokidar";
import fs from "fs";

import { copyJS } from "./javascript.js";
import {
  gitIgnoreRemove,
  jsComment,
  overwriteMessage,
  flattenPath,
} from '../utils/index.js';

const scriptsWatcher = chokidar.watch("./src/scripts", {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

scriptsWatcher.on("change", (path) => {    
  copyJS({
    path,
  });
}).on("unlink", (path) => {
  const themeFilePath = `theme/assets/${flattenPath(path, 'scripts')}`;

  try {
    /**
     * Check if a file already exists in theme/assets
     */
    const data = fs.readFileSync(themeFilePath, 'utf-8');

    /**
     * Check if the file is compliled/uncompiled
     */
    if (!data.toString().includes(jsComment)) {
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
