'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.visualiser = new Visualiser(this);
  this.sequencer = new Sequencer(this);
};

Player.prototype.load = function(song) {
  this.clear();
  this.currentSong = song;
  let sections = song.structure;
  let phrases = song.phrases;

  for (var section in sections) {
    let phrase = phrases[sections[section]];
    for (var bar in phrase.bars) {
      for (var beat = 1; beat <= phrase.bars[bar].timeSig.beatCount; beat++) {
        for (var semiquaver in phrase.bars[bar].beats[beat]) {
          let noteData = phrase.bars[bar].beats[beat][semiquaver];
          this.noteBuffer.push(noteData);
        };
      };
    };
  };
  this.visualiser.renderGridArea(song)
  this.sequencer.renderGridArea(song)
};

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.play = function() {
  this.visualiser.play();
};
