const sequentPlayer = new Player();

function createSong() {
  const mySong = new Song();
  const myPhrase = new Phrase();
  const bOne = new Bar();
  const bTwo = new Bar();
  const trumpetC = new Note("Trumpet", "C", 2, 4);
  const vLongVocalG = new Note("Vocal", "G", 2, 1);
  const vShortPiccoloA = new Note("Piccolo", "A", 2, 16);
  const bassoonC = new Note("Bassoon", "C", 2, 4);
  const shortPercE = new Note("Percussion", "E", 2, 8);
  const shortViolinD = new Note("Violin", "D", 2, 8);
  const celloA = new Note("Cello", "A", 2, 4);
  const long808Bb = new Note("808", "Bb", 2, 2);
  const vShortSynthFs = new Note("Synth", "F#", 2, 16);
  const shortSamplerC = new Note("Sampler", "C", 2, 8);
  const vLongGuitarB = new Note("Guitar", "B", 2, 1);
  const longShamisenG = new Note("Shamisen", "G", 2, 2);
  myPhrase.addBar(bOne, bTwo);
  mySong.addPhrase(myPhrase);
  bOne.beats[1][1].push(vLongVocalG);
  bOne.beats[1][2].push(vShortSynthFs);
  bOne.beats[1][3].push(longShamisenG);
  bOne.beats[1][4].push(shortSamplerC);
  bOne.beats[2][1].push(trumpetC);
  bOne.beats[2][2].push(bassoonC);
  bOne.beats[2][3].push(vShortPiccoloA);
  bOne.beats[2][4].push(shortPercE);
  bOne.beats[3][1].push(celloA);
  bOne.beats[4][1].push(shortViolinD);
  bTwo.beats[2][1].push(vLongGuitarB);
  bTwo.beats[4][1].push(long808Bb);
  const mySecondPhrase = new Phrase();
  mySong.addPhrase(mySecondPhrase);
  mySong.duplicatePhrase('A');
  return mySong;
};

const exampleSong = createSong();

function loadExampleSong() { // just begun
  sequentPlayer.load(exampleSong);
  renderGridArea(exampleSong);
};

function playSong(){
  sequentPlayer.play();
};

function renderGridArea(song){ // needs way more work
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
