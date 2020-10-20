# Fluid Music Utilities

This installs several CLI helper tools for creating `fluid-music` recipes.

Use `npm install -g @fluid-music/utils` to install:

- `sample-scan`
- `transcribe-chords`

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

## `transcribe-chords`

A super quick way to transcribe midi chords in JSON using a midi keyboard.

```
$ npm install -g @fluid-music/utils
$ transcribe-chords chords.js
Usage: $ transcribe-chords out.js # (Currently writing to "chords.js")
connected: "Midi Through Port-0"
connected: "MPK Mini Mk II MIDI 1"
```

Now play some chords on any connected midi device to generate a file like the one below (use `ctrl+c` to stop recording).

```javascript
const chords = [
  {
    name: "Cm",
    notes: [ 60, 63, 67 ],
  },
  {
    name: "Ab",
    notes: [ 56, 60, 63 ],
  },
  {
    name: "Bb",
    notes: [ 58, 62, 65 ],
  },
];

module.exports = chords;
```

If you are using the fluid engine, you can create a `tLibrary` like this

```javascript
const fluid = require('fluid-music')
const chords = require('./midi-chords')

const techniques = chords.map(chord => new fluid.techniques.MidiChord(chord))
const tLibrary = fluid.tLibrary.fromArray(techniques)

// tLibrary will look like this:
{
  a: MidiChord({ name: 'Cm', notes: [60, 63, 67] }),
  b: MidiChord({ name: 'Ab', notes: [56, 60, 63] }),
  c: MidiChord({ name: 'Bb', notes: [58, 62, 65] })
}
```
