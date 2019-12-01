'use strict'

function Instrument(name = "Piano", sounds = [], octave = 4, duration = 4) {
  this.name = name;
  this.sounds = sounds;
  sounds.length ? "noop" : this.createSound();
  this.octave = octave; // may want to take this out since it should really remain only as a note property
  this.duration = duration; // may want to take this out since it should really remain only as a note property
}

Instrument.prototype.createSound = function() {
  // default note sound
  let sound = {
    type : "note",
    waveform : ["triangle", "sine", "square", "sawtooth"][Math.floor(Math.random()*4)]
  }
  this.sounds.push(sound);
};

Instrument.prototype.removeSound = function(pos) {
  this.sounds.splice(pos - 1, 1);
}
