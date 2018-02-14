'use strict'

function Instrument(name = "Piano", sounds = []) {
  this.name = name;
  this.sounds = []
  this.createSound();
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

Instrument.prototype.changeSound = function(pos, newSoundSettings) {

  // example of a noise sound

  // newSoundSettings = {
  //   type : "noise",
  //   filterType : "highpass",
  //   filterFrequency : 1000,
  //   noiseDuration : 1
  // }

  this.sounds[pos] = newSoundSettings;
}
