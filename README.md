

## `sample-scan`

`$ sample-scan [search-dir=.] [outfile.js]`

sample-scan recursively searches "search-dir" for audio files, and generates a
common.js file containing meta data about the files.

The metadata for each file includes a ".path" property which will be specified
relative to the current working directory.

The `.format` property is provided by the [music-metadata](https://www.npmjs.com/package/music-metadata) npm package.

```javascript
module.exports = {
  "kick-acoustic-001.wav": { // key is the base filename
    "format": {
      "tagTypes": [],
      "trackInfo": [],
      "container": "WAVE",
      "codec": "PCM",
      "bitsPerSample": 16,
      "sampleRate": 44100,
      "numberOfChannels": 1,
      "bitrate": 88200,
      "lossless": true,
      "numberOfSamples": 52919,
      "duration": 1.1999773242630385
    },
    "path": "../fluid-music-kit/media/kick-acoustic-001.wav"
  },
  "kick-acoustic-002": { /* ... */ }
}
```