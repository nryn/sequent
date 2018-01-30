'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.play = function() {
  if (this.currentSong && this.noteBuffer.length > 0) {
    let noteCounter = 0; // we'll compare this to total number of notes in the song, in order to break out of the loop at the end.
    let semiquaverTiming = songBpmToSemiquaverMilliseconds(this.currentSong.tempo); // figure out smallest note timing based on the overall song tempo
    let expectedTiming = Date.now() + semiquaverTiming; // expect a semiquaver to be as long as a semiquaver
    setTimeout(playNote.bind(this), semiquaverTiming); // wait a semiquaver, then play a note
    function playNote() {
      let drift = Date.now() - expectedTiming; // check again, how long did it really take to step in to this function?
      if (drift > semiquaverTiming) { // shouldn't happen.
          throw "Can't reliably play back. The window might be inactive.";
      };

      console.log(noteCounter, this.noteBuffer[noteCounter++]); // the would-be key line in this function. this should rather send the data to the visualiser while incrementing the counter

      expectedTiming += semiquaverTiming; // add another semiquaver's worth, so we try to predict the time of our next loop
      if (noteCounter < this.noteBuffer.length) {
        setTimeout(playNote.bind(this), Math.max(0, semiquaverTiming - drift)); // settingTimeout to the same setTimeout callback we're already inside, creating a loop. takes into account drift
      };
    };
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
