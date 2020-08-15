# Fluid Music Utilities

This installs several CLI helper tools for creating `fluid-music` recipes.

Use `npm install -g @fluid-music/utils` to install:

- `sample-scan`
- `make-nlib`

## `sample-scan`

`$ sample-scan [search-dir=.] [outfile.js]`

sample-scan recursively searches "search-dir" for audio files, and generates a
common.js file containing meta data about the files.

The metadata for each file includes a ".path" property which will be specified
relative to the current working directory.

The `.info` property structure is determined by [music-metadata](https://www.npmjs.com/package/music-metadata)'s `.format` field.

```javascript
module.exports = {
  "kick-acoustic-001.wav": { // key is the base filename
    "info": {
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

## `make-nlib`

A super simple way to create nLibraries containing chords with a MIDI keyboard.

```
$ npm install -g @fluid-music/utils
$ make-nlib output.js
Usage: $ make-nlib out.js # (Currently writing to "output.js")
connected: "Midi Through Port-0"
connected: "MPK Mini Mk II MIDI 1"
```

Now play some chords on any connected midi device to generate a file like the one below (use `ctrl+c` to stop recording).

```javascript
const nLibrary = {
  "a": {
    type: "midiChord",
    name: "Cm",
    notes: [ 60, 63, 67 ],
  },
  "b": {
    type: "midiChord",
    name: "Ab",
    notes: [ 56, 60, 63 ],
  },
  "c": {
    type: "midiChord",
    name: "Bb",
    notes: [ 58, 62, 65 ],
  },
};

module.exports.nLibrary = nLibrary;
```
