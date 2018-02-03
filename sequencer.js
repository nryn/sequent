'use strict'

function Sequencer(player) {
  this.player = player;
};

Sequencer.prototype.play = function() {

};

Sequencer.prototype.renderGridArea = function(song) {
  let sequencerTable = document.getElementById('sequencer-grid');
  while (sequencerTable.hasChildNodes()) {
    sequencerTable.removeChild(sequencerTable.lastChild); // let's empty the grid before rendering it, just in case
  };

  song.scale.forEach(function(note) {
    let row = document.createElement('tr');
    row.classList.add(note);
    row.classList.add("seq_note_row");
    row.classList.add("collapsed");
    sequencerTable.appendChild(row);
    let barCounter = 0;
    song.phrases[song.structure[0]].bars.forEach(function(bar) {
      barCounter++;
      for (var i = 1; i <= bar.timeSig.beatCount; i++) {
        let noteCell = document.createElement('td');
        noteCell.id = note + "_bar" + barCounter + "_beat" + i;
        noteCell.classList.add("bar" + barCounter);
        noteCell.classList.add("beat" + i);
        noteCell.classList.add("seq_note_cell");
        noteCell.classList.add("collapsed");
        if (barCounter % 2 == 0) {
          noteCell.classList.add("strike");
        }

        let noteCellTwo = noteCell.cloneNode(true);
        let noteCellThree = noteCell.cloneNode(true);
        let noteCellFour = noteCell.cloneNode(true);

        noteCell.classList.add("semi1");
        noteCell.style.backgroundColor = "#1ebbbb";
        noteCellTwo.classList.add("semi2");
        noteCellTwo.style.backgroundColor = "#7bdad9";
        noteCellThree.classList.add("semi3");
        noteCellThree.style.backgroundColor = "#b5edee";
        noteCellFour.classList.add("semi4");
        noteCellFour.style.backgroundColor = "#cff6f6";

        row.appendChild(noteCell); // bar.i[1]
        row.appendChild(noteCellTwo); // bar.i[2]
        row.appendChild(noteCellThree); // bar.i[3]
        row.appendChild(noteCellFour); // bar.i[4]
      };
    });
  });
  // this.drawSequencerNotes(song);
  this.expandGridArea();
};

Sequencer.prototype.expandGridArea = function () {
  let sequencerTable = document.getElementById('sequencer-grid');
  let noteRows = document.querySelectorAll('.seq_note_row');
  let noteCells = document.querySelectorAll('.seq_note_cell');

  sequencerTable.classList.remove("collapsed");

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

Sequencer.prototype.createSong = function () {

};
