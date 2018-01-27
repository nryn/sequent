'use strict'

function Note(instrument = "Piano", note = "C", octave = 2, duration = 4) {
  this.instrument = instrument;
  this.note = note;
  this.octave = octave;
  this.duration = duration;
}

module.exports = Note;
