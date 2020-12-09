#!/usr/bin/env node

const fs    = require('fs')
const path  = require('path')
const chalk = require('chalk')
const mm    = require('music-metadata');
const walk  = require('./common').walk

if (process.argv.length < 3) {
  console.warn(chalk`{green Usage:} {bold $ afactory ./search/dir [outfile='audio-files.js']}

Recursively searches a directory for audio files, and generates a fluid-music
AudioFile technique for each audio file it finds. The output techniques will be
written to a common.js formatted JavaScript file which exports a deeply nested
JavaScript object reflecting the input directory structure.

{green Example:}
Assume your working directory contains the following files:
{bold ./drums/snare.wav
./drums/hi-hat/close.wav
./drums/hi-hat/open.wav}

1. Run {bold afactory} from the working directory:

{bold $ afactory ./ audio.js}

2. This creates {bold audio.js}, which looks like this:
` +
chalk.bold(`
const { AudioFile } = require('fluid-music').techniques
module.exports = {
  "drums": {
    "snare.wav":   new AudioFile({ /* init options */ }),
    "hi-hat": {
      "close.wav": new AudioFile({ /* init options */ }),
      "open.wav":  new AudioFile({ /* init options */ }),
    },
  },
};
`) + chalk`
3. You can how {bold require('./audio.js')}, to access the exported
objects, using them to manually create fluid-music tLibraries.
`)
  process.exit()
}

const args       = process.argv.slice(2);
const searchPath = path.resolve(args[0] || '.');
const outFile    = path.resolve(args[1] || path.join('.', 'audio-files.js'))
const stats      = fs.lstatSync(searchPath);
if (!stats.isDirectory()) throw new Error('search path is not a directory:', searchPath)

let result = 
`const { AudioFile } = require('fluid-music').techniques
module.exports = `

// Handle the specialized deep object that created in the run method.
let indentLevel = 0
let indent = () => new Array(indentLevel).fill('  ').join('')
function handleInfoAndRelativePathMap(dirMap) {

  result += '{\n'
  indentLevel++
  dirMap.forEach((obj, baseName) => {
    if (obj instanceof Map && !obj.size) return

    result +=  `${indent()}${JSON.stringify(baseName)}: `
    if (obj instanceof Map)  {
      handleInfoAndRelativePathMap(obj)
    }
    else {
      result += `new AudioFile({ path: path.join(__dirname, path.normalize(${JSON.stringify(obj.relativePath)})), info: ${JSON.stringify(obj.info)} }),\n`
    }
  })
  indentLevel--
  // Don't add a comma in outermost indentation levels
  result += indent()+ '}' + (indentLevel ? ',' : ';') + '\n'
}

/** Does this dirMap have any audio files in any of its children */
const hasAudioFile = (dirMap) => {
  for (const [key, obj] of dirMap.entries()) {
    if (!(obj instanceof Map) || hasAudioFile(obj)) return true
  }
  return false
}
/** Remove all empty child dirMaps */
function pruneEmptyDirs(dirMap) {
  for (const [key, obj] of dirMap.entries()) {
    if (obj instanceof Map) {
      if (!hasAudioFile(obj)) dirMap.delete(key)
      else pruneEmptyDirs(obj)
    }
  }
}

const pathsRelativeTo = path.dirname(path.resolve(outFile))
async function run() {
  // Create a deep 'dirMap' object representing the directory structure with:
  //     - Map objects for directories
  //     - JavaScript objects for audio files
  //
  // For example:
  // Map({
  //  'kick.wav': { info: {}, relativePath: '../some/path/kick.wav' }
  //  'rides': Map({
  //     'ride.wav': { info: {}, relativePath: '../some/path/rides/ride.wav' }
  //   })
  // })
  const dirMap = await walk(searchPath, async (fullPath) => {
    const metadata = await mm.parseFile(fullPath)
    const info = metadata.format

    // Identify a relative path from the output file to the audio file. Prefer
    // posix style paths, because we want our generated package to be cross-
    // platform compatible. Node's path.win32 methods handle both slashes okay
    // while path.posix only handles forward slashes. We want the string that
    // will be hardcoded into the file to always appear as a posix string.
    let relativePath = path.relative(pathsRelativeTo, fullPath)
    if (process.platform === 'win32') relativePath = relativePath.split(path.sep).join(path.posix.sep)
    return { info, relativePath }
  })
  pruneEmptyDirs(dirMap)
  handleInfoAndRelativePathMap(dirMap)
  return result
}

run().then(() => {
  fs.createWriteStream(outFile).write(result)
}).catch(e => {
  console.error('walk error:', e)
})
