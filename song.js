'use strict'

function Song(name = "Untitled", tempo = 120, keySignature = "Cmaj") {
  this.name = name;
  this.tempo = tempo;
  this.keySignature = keySignature;
  this.structure = [];
  this.instruments = [];
  this.phrases = {};
  this.scale = ["B", "Bb", "A", "Ab", "G", "F#", "F", "E", "Eb", "D", "C#", "C"];
  this.sectionMap=new WeakMap;
  this.sectionLetter = "A".charCodeAt(0) - 1;
}

Song.prototype.addInstrument = function(instrumentName, instrumentSounds) {
  let newInstrument = new Instrument(instrumentName, instrumentSounds);
  this.instruments.push(newInstrument);
  return newInstrument;
}

Song.prototype.removeInstrument = function(instrumentName) {
  let instrumentsToRemove = this.instruments.filter(function(instrument) {
    return instrument.name == instrumentName;
  });
  instrumentsToRemove.forEach(function(instrument) {
    this.removeNotesforInstrument(instrument);
    this.instruments.splice(this.instruments.indexOf(instrument), 1)
  }.bind(this));
}

Song.prototype.getInstrumentByName = function(instrumentName) {
  return this.instruments.filter(function(instrument) {
    return instrument.name == instrumentName;
  })[0];
}

Song.prototype.generateSection = function(phrase) {
  if (!this.sectionMap.has(phrase)) this.sectionMap.set(phrase,++this.sectionLetter);
  return String.fromCharCode(this.sectionMap.get(phrase));
};

Song.prototype.addPhrase = function() {
  for (var phrase in arguments) {
    let section = this.generateSection(arguments[phrase]);
    this.structure.push(section);
    if (!this.phrases[section]) {
      this.phrases[section] = arguments[phrase];
    };
  };
};

Song.prototype.movePhrase = function(fromPos, toPos) {
  let thePhrase = this.removePhrase(fromPos-1);
  this.structure.splice(toPos-1,0,thePhrase[0]);
};

Song.prototype.removePhrase = function(pos) {
  return this.structure.splice(pos,1);
};

Song.prototype.duplicatePhrase = function(section) {
  this.structure.push(section);
};

Song.prototype.removeNotesforInstrument = function(instrumentToRemove) {
  Object.keys(this.phrases).forEach(function(phrase) {
    this.phrases[phrase].bars.forEach(function(bar, barIndex) {
      Object.keys(this.phrases[phrase].bars[barIndex].beats).forEach(function(beat, beatIndex) {
        Object.keys(this.phrases[phrase].bars[barIndex].beats[beatIndex + 1]).forEach(function(semi, semiIndex) {
          this.phrases[phrase].bars[barIndex].beats[beatIndex + 1][semiIndex + 1] = this.phrases[phrase].bars[barIndex].beats[beatIndex + 1][semiIndex + 1].filter(function(note) {
            return note.instrument == instrumentToRemove ? null : note;
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};
