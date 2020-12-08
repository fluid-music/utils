const path = require('path');
const fs   = require('fs');

const dirsToSkip = ['node_modules', '.git'];
const extsToGet = ['.wav', 'aiff', '.aif', '.mp3']; // '.m4a', '.ogg'];

/**
 * @callback takeAction
 * @param {string} fullPath
 */

/**
 * recursively walk a directory, calling `takeAction` on each audio file
 * @param {string} dirname
 * @param {takeAction} takeAction
 */
const walk = async (dirname, takeAction = v=>console.log(v)) => {
  const results = new Map()
  const files = await fs.promises.readdir(dirname);
  for (const file of files) {
    let name = path.join(dirname, file);
    const stats = await fs.promises.lstat(name);

    if (results.get(file)) {
      console.warn(`WARNING: omitting unacceptable or non-unique file: ${name}`);
      continue;
    }
    // Skip symbolic links to mitigate the risk of an infinite loop
    if (!stats.isSymbolicLink() && stats.isDirectory() && dirsToSkip.indexOf(file) === -1) results.set(file, await walk(name, takeAction));
    if (stats.isFile() && extsToGet.indexOf(path.extname(name).toLowerCase()) !== -1) results.set(file, await takeAction(name));
  }
  return results
};

module.exports = {
  walk
}
