'use strict'

const Song = require('./song');
const Phrase = require('./phrase');
const Bar = require('./bar');
const Note = require('./note');

// Let's make a song with one phrase, two bars of 4/4, each with C2s every quarter note.

const myFirstSong = new Song();
const myFirstPhrase = new Phrase();
const barOne = new Bar();
const barTwo = new Bar();

myFirstPhrase.addBar(barOne, barTwo);
myFirstSong.addPhrase(myFirstPhrase);

const trumpetC = new Note("Trumpet", "C", 2);

barOne.beats[1][1].push(trumpetC);
barOne.beats[2][1].push(trumpetC);
barOne.beats[3][1].push(trumpetC);
barOne.beats[4][1].push(trumpetC);

// ok let's add some 2s and 4s on the second bar

barTwo.beats[2][1].push(trumpetC);
barTwo.beats[4][1].push(trumpetC);

// let's add a second phrase too

const mySecondPhrase = new Phrase();
myFirstSong.addPhrase(mySecondPhrase);

// let's repeat the first phrase after (section A)

myFirstSong.duplicatePhrase('A');

// let's see what the whole song object looks like

const util = require('util')
console.log(util.inspect(myFirstSong, {showHidden: false, depth: null}))

// could log JSON to stdout so can "| jq ." on command line...
// console.log(JSON.stringify(myFirstSong));

// and that's how it could be done
