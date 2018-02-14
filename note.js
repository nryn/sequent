'use strict'

function Note(instrument = "No instrument assigned", note = "No note assigned", octave = 4, duration = 4) {
  this.instrument = instrument;
  this.note = note;
  this.octave = octave;
  this.duration = duration;
}
