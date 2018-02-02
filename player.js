'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      this.renderNotesInGridCells(this.noteBuffer[noteCounter++]); // this key line sends the notes to be rendered in the grid
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

Player.prototype.renderNotesInGridCells = function(noteList) {
  let tempo = this.currentSong.tempo;
  noteList.forEach(function(note) {
    let cell = document.getElementById(note.note + "_" + note.instrument);
    let fillerDiv = document.createElement('div');
    fillerDiv.classList.add('filler');
    cell.appendChild(fillerDiv);
    fillerDiv.classList.add('triggered'+note.duration);
    setTimeout(function() {
      cell.removeChild(fillerDiv);
    }, 1500); // remove element after arbitrary second and a half
  });
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
  renderGridArea(song);
};

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

function renderGridArea(song){
  let playbackTable = document.getElementById('grid');
  while (playbackTable.hasChildNodes()) {
    playbackTable.removeChild(playbackTable.lastChild); // let's empty the grid before rendering it, just in case
  };
  const noteInScale = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const instruments = song.getInstrumentList();

  noteInScale.forEach(function(note) {
    let row = document.createElement('tr');
    row.classList.add(note);
    row.classList.add("note_row");
    row.classList.add("collapsed");
    playbackTable.appendChild(row);
    instruments.forEach(function(instrument) {
      let noteCell = document.createElement('td');
      noteCell.id = note + "_" + instrument;
      noteCell.classList.add(instrument);
      noteCell.classList.add("note_cell");
      noteCell.classList.add("collapsed");
      row.appendChild(noteCell);
    });
  });
  expandGridArea();
};

function expandGridArea() {
  let playbackTable = document.getElementById('grid');
  let noteRows = document.querySelectorAll('.note_row');
  let noteCells = document.querySelectorAll('.note_cell');

  playbackTable.classList.remove("collapsed");

  for ( let i=0; i < noteRows.length; i++ ) {
    let animateRow = expandElementsFunctionFactory(i, noteRows);
    setTimeout(animateRow, i * i * 18);
  };

  for ( let i=0; i < noteCells.length; i++ ) {
    let animateCells = expandElementsFunctionFactory(i, noteCells);
    setTimeout(animateCells, i * 24);
  };

  function expandElementsFunctionFactory(iterator, nodeList) {
    var element = nodeList[iterator];
    return function() {
      element.classList.remove('collapsed');
    };
  };
};
