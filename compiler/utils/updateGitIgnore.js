import fs from 'fs';

export const gitIgnoreAdd = (path) => {
  const data = fs.readFileSync('.gitignore', 'utf-8');

  if (data.indexOf(path) <= 1) {
    fs.writeFileSync('.gitignore', `${data}${path}\n`, 'utf-8');
    console.log(`🐙 '${path}' added to .gitignore`);
  }
};

export const gitIgnoreRemove = (path) => {
  const data = fs.readFileSync('.gitignore', 'utf-8');

  if (data.indexOf(path) > -1) {
    fs.writeFileSync(
      '.gitignore',
      data
        .toString()
        .replace(new RegExp(path), '') // remove the path from the file data
        .replace(/[\r\n]+/g, '\n'), // remove all empty lines but one
      'utf-8'
    );

    console.log(`🐙 '${path}' removed from .gitignore`);
  }
};
