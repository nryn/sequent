'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.visualiser = new Visualiser(this);
  this.sequencer = new Sequencer();
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
  // visualiser.renderGridArea(song)
  // sequencer.renderGridArea(song)
  renderGridArea(song); // above instead of these
};

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.play = function() {
  this.visualiser.play();
};

function renderGridArea(song){
  let playbackTable = document.getElementById('player-grid');
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
  let playbackTable = document.getElementById('player-grid');
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
