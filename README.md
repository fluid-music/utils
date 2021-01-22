# Fluid Music Utilities

This installs several CLI helper tools for creating `fluid-music` recipes.

Use `npm install -g @fluid-music/utils` to install:

- `afactory`
- `transcribe-chords`

## `afactory`

Recursively searches a directory for audio files, and generates a fluid-music
AudioFile technique for each audio file it finds. The output techniques will be
written to a common.js formatted JavaScript file which exports a deeply nested
JavaScript object reflecting the input directory structure.

### Usage:

`$ afactory ./search/dir [outfile='audio-files.js']`

### Example:
Assume your working directory contains the following files:

```
./drums/snare.wav
./drums/hi-hat/close.wav
./drums/hi-hat/open.wav
```

**Step 1:** Run `afactory` from the working directory:

```
$ afactory ./ audio.js
```

**Step 2:** `afactory` will create an `audio.js` file, which looks like this:
```javascript
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
```
**Step 3:** You can now `require('./audio.js')`, to access the exported objects,
using them to manually create fluid-music `tLibrary` objects.


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
const fluid = require('fluid-music')
const { MidiChord } = fluid.techniques

const chords = [
  new MidiChord({
    name: 'Gm',
    notes: [55, 58, 62],
  }),

  new MidiChord({
    name: 'Bbsus4',
    notes: [58, 60, 63, 65],
  }),

  new MidiChord({
    name: 'Cm',
    notes: [60, 63, 67],
  }),
]

module.exports = chords
```

You can create a `tLibrary` like this:

```javascript
const fluid = require('fluid-music')
const chords = require('./midi-chords')

const tLibrary = fluid.tLibrary.fromArray(techniques)

// tLibrary will look like this:
{
  a: MidiChord({ name: 'Gm',     notes: [55, 58, 62] }),
  b: MidiChord({ name: 'Bbsus4', notes: [58, 60, 63, 65] })
  c: MidiChord({ name: 'Cm',     notes: [60, 63, 67] }),
}
```
