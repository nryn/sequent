'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.play = function() {
  if (this.currentSong && this.noteBuffer.length > 0) {
    let counter = 0;
    let intervalId = setInterval(function() {
      console.log(counter, this.noteBuffer[counter++]); // this should rather send the data to the visualiser
      if (counter >= this.noteBuffer.length) { clearInterval(intervalId) };
    }.bind(this), songBpmToSemiquaverMilliseconds(this.currentSong.tempo));
  };
};

function songBpmToSemiquaverMilliseconds(bpm) {
  return 60000 / bpm / 4; // There are 60 seconds in a minute, and 1,000 MS in a second. Then we divide by 4 to get semiquavers out of the beat.
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
};

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

module.exports = Player;
