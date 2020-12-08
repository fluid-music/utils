const fs   = require('fs')
const path = require('path')
const mm   = require('music-metadata');
const walk = require('./common').walk

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
function handleInfoAndRelativePathMap(map) {
  result += '{\n'
  indentLevel++
  map.forEach((obj, baseName) => {
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

const pathsRelativeTo = path.dirname(path.resolve(outFile))
async function run() {
  // Create a specialized deep object representing the directory structure with:
  //     - Map objects for directories
  //     - JavaScript objects for files
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

  handleInfoAndRelativePathMap(dirMap)
  return result
}

run().then(() => {
  console.log(result)
}).catch(e => {
  console.error('walk error:', e)
})
