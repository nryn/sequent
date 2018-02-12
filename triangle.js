class Triangle {

  constructor(context) {
    this.context = context;
    this.durationMap = {
      1: 2,
      2: 1.2,
      4: 1,
      8: 0.6,
      16: 0.4
    } // this is about right for 120 bpm
  }

  init() {
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'triangle';

    this.gainNode = this.context.createGain();
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  play(value, time, duration) {
    this.init();

    this.oscillator.frequency.value = value;
    this.gainNode.gain.setValueAtTime(1, time);

    this.oscillator.start(time);
    this.stop(time, duration);

  }

  stop(time, duration) {
    let mappedDuration = this.durationMap[duration]
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + mappedDuration);
    this.oscillator.stop(time + mappedDuration);
  }

}
