import sass from "sass";
import glob from "glob";
import fs from "fs";

import {
  gitIgnoreAdd,
  cssComment,
  overwriteMessage,
  flattenPath,
} from '../utils/index.js';

export const stylesIgnore = /(^|[\/\\])\.|_\w+.scss/; // ignore dotfiles, _*.scss files

export const copyStyles = ({ path }) => {
  glob(path, {}, (err, files) => {
    files
      .filter((file) => ![...file.split(`/`)].pop().match(stylesIgnore))
      .forEach((file) => {
        // Get the *.sass -> *.css file name
        const fileName = flattenPath(file, 'styles').replace('.scss', '.css');

        // Transpile the Sass to CSS
        const result = sass.renderSync({
          file: file,
          outputStyle: 'compressed',
        });
        const outputPath = `theme/assets/${fileName}`;

        try {
          /**
           * Check if a file already exists in theme/assets
           */
          const data = fs.readFileSync(outputPath, 'utf-8');

          /**
           * Check if the file is compliled/uncompiled
           */
          if (!data.toString().includes(cssComment)) {
            console.warn(`${overwriteMessage} Check '${outputPath}'`);
            return; // exit
          }
        } catch (e) {
          // console.log('File did not exist')
        }

        // Prepend the message to the top of the file
        fs.writeFileSync(
          `./${outputPath}`,
          `${cssComment}\r\n\r\n${result.css.toString()}`
        );

        // Add the file's theme/assets path file to .gitignore
        gitIgnoreAdd(outputPath);
      });
  });
};

copyStyles({
  path: "./src/styles/**/*.scss"
});
