'use strict'

function Sequencer(player) {
  this.player = player;
  // this.toggledSection = toggledSection();
};

Sequencer.prototype.play = function() {

};

Sequencer.prototype.renderGridArea = function(song, currentOnscreenPhrase, currentOnscreenInstrument) {
  this.currentOnscreenPhrase = currentOnscreenPhrase;
  this.currentOnscreenInstrument = currentOnscreenInstrument;

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
    song.phrases[currentOnscreenPhrase].bars.forEach(function(bar) {
      barCounter++;
      for (var i = 1; i <= bar.timeSig.beatCount; i++) {
        let noteCell = document.createElement('td');
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

        noteCell.id = note + "_bar" + barCounter + "_beat" + i + "_semi1";
        noteCell.classList.add("semi1");
        noteCell.style.backgroundColor = "#1ebbbb";
        noteCellTwo.id = note + "_bar" + barCounter + "_beat" + i + "_semi2";
        noteCellTwo.classList.add("semi2");
        noteCellTwo.style.backgroundColor = "#7bdad9";
        noteCellThree.id = note + "_bar" + barCounter + "_beat" + i + "_semi3";
        noteCellThree.classList.add("semi3");
        noteCellThree.style.backgroundColor = "#b5edee";
        noteCellFour.id = note + "_bar" + barCounter + "_beat" + i + "_semi4";
        noteCellFour.classList.add("semi4");
        noteCellFour.style.backgroundColor = "#cff6f6";

        row.appendChild(noteCell); // bar.i[1]
        row.appendChild(noteCellTwo); // bar.i[2]
        row.appendChild(noteCellThree); // bar.i[3]
        row.appendChild(noteCellFour); // bar.i[4]
      };
    });
  });
  this.drawLoadedNotes(currentOnscreenPhrase, currentOnscreenInstrument);
  this.expandGridArea();
};

Sequencer.prototype.drawLoadedNotes = function(currentOnscreenPhrase, currentOnscreenInstrument) {
  let sections = this.player.currentSong.structure;
  let phrase = this.player.currentSong.phrases[currentOnscreenPhrase];
  let instrument = currentOnscreenInstrument;

  for (var bar in phrase.bars) {
    for (var beat = 1; beat <= phrase.bars[bar].timeSig.beatCount; beat++) {
      for (var semiquaver in phrase.bars[bar].beats[beat]) {
        let noteList = phrase.bars[bar].beats[beat][semiquaver];
        noteList.forEach(function(note) {
          if (note.instrument == instrument) {
            let cell = document.getElementById(note.note + "_bar" + (parseInt(bar) + 1) + "_beat" + beat + "_semi" + semiquaver);
            let fillerDiv = document.createElement('div');
            fillerDiv.classList.add('seq_filler');
            cell.appendChild(fillerDiv);
          };
        });
      };
    };
  };
};

Sequencer.prototype.expandGridArea = function() {
  let sequencerTable = document.getElementById('sequencer-grid');
  let noteRows = document.querySelectorAll('.seq_note_row');
  let noteCells = document.querySelectorAll('.seq_note_cell');

  sequencerTable.classList.remove("collapsed");

  for ( let i=0; i < noteRows.length; i++ ) {
    let animateRow = expandElementsFunctionFactory(i, noteRows);
    setTimeout(animateRow, i * i * 2);
  };

  for ( let i=0; i < noteCells.length; i++ ) {
    let animateCells = expandElementsFunctionFactory(i, noteCells);
    setTimeout(animateCells, i * 3);
  };

  function expandElementsFunctionFactory(iterator, nodeList) {
    var element = nodeList[iterator];
    return function() {
      element.classList.remove('collapsed');
    };
  };
};

Sequencer.prototype.showSongInfo = function(song) {
  const songControlsArea = document.getElementById('sequencer-song-controls');
  songControlsArea.style.transform = "scaleY(0)"; // initially collapse song info area
  const titleArea = document.getElementById("sequencer-title");
  removeAllChildren(titleArea);
  let heading = document.createElement('h1');
  heading.innerHTML = "'" + song.name + "'";
  titleArea.appendChild(heading);

  const sectionDropdown = document.getElementById('sequencer-transport-bar-section-selector');
  removeAllChildren(sectionDropdown);
  sectionDropdown.setAttribute("onchange", "sequentPlayer.sequencer.showSection(this.value)")
  song.structure.forEach(function(sectionLetter) {
    let sectionOption = document.createElement('option');
    sectionOption.innerHTML = sectionLetter;
    sectionOption.setAttribute("value", sectionLetter)
    sectionDropdown.appendChild(sectionOption);
  });

  const instrumentDropdown = document.getElementById('sequencer-transport-bar-instrument-selector');
  removeAllChildren(instrumentDropdown);
  instrumentDropdown.setAttribute("onchange", "sequentPlayer.sequencer.showInstrument(this.value)")
  song.getInstrumentList().forEach(function(instrument) {
    let instrumentOption = document.createElement('option');
    instrumentOption.innerHTML = instrument;
    instrumentOption.setAttribute("value", instrument)
    instrumentDropdown.appendChild(instrumentOption);
  });
  songControlsArea.style.transform = "scaleY(1)"; //expand song info area
};

Sequencer.prototype.showSection = function(sectionLetter) {
  this.renderGridArea(this.player.currentSong, sectionLetter, this.currentOnscreenInstrument);
};

Sequencer.prototype.showInstrument = function(instrument) {
  this.renderGridArea(this.player.currentSong, this.currentOnscreenPhrase, instrument);
};

Sequencer.prototype.createSong = function() {

};

function removeAllChildren(parentNode) {
  while (parentNode.hasChildNodes()) {
    parentNode.removeChild(parentNode.lastChild);
  };
};
