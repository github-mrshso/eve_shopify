import fs from "fs";
import copy from "recursive-copy";

import {
  gitIgnoreAdd,
  jsComment,
  overwriteMessage,
  flattenPath,
} from '../utils/index.js';

export const copyJS = ({ path, isDirectory = false }) => {  
  try {
    /**
     * Check if a file already exists in theme/assets
     */
    const data = fs.readFileSync(`theme/assets/${flattenPath(path, 'scripts')}`, 'utf-8');

    /**
     * Check if the file is compliled/uncompiled
     */
    if (!data.toString().includes(jsComment)) {
      console.warn(`${overwriteMessage} Check '${path}'`)
      return; // exit
    }
  } catch (e) {
    // console.log('File did not exist')
  }

  /**
   * Begin Copying
   */
  copy(path, "theme", {
    overwrite: true,
    junk: true,
    ...(isDirectory
      ? {
          filter: ["**/*.js"],
        }
      : {}),
    ...(isDirectory
      ? {
          /**
           * Run during build for each file
           */
          rename: (filePath) => {
            const outputPath = `assets/${flattenPath(filePath, 'scripts')}`;

            // Add the file's theme/assets path file to .gitignore
            gitIgnoreAdd(`theme/${outputPath}`);

            return outputPath;
          },
        }
      : {
          rename: () => {
            /**
             * Run during watch on one file
             * 
             * Get filename from path passed
             * src/scripts/example.js -> example.js
             */
            const outputPath = `assets/${flattenPath(path, 'scripts')}`;

            // Add the file's theme/assets path file to .gitignore
            gitIgnoreAdd(`theme/${outputPath}`);
            
            console.log(`📦 '${path}' 📮 'theme/assets/${flattenPath(path, 'scripts')}'`);

            return outputPath;
          },
        }),
  })
    .then((results) => {
      results.map(result => {
        // Get the contents of the file
        const data = fs.readFileSync(result.dest, 'utf-8');

        if (data) {
          // Prepend the message to the top of the file
          fs.writeFileSync(result.dest, `${jsComment}\r\n\r\n${data}`, 'utf-8');
        }
      })
    })
    .catch((error) => {
      console.error("Copy failed: " + error);
    });
};

copyJS({
  path: "./src/scripts",
  isDirectory: true,
});
