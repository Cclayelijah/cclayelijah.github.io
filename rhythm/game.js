const WIDTH = 600;
const HEIGHT = 600;

// startup
let phaserGame;
window.addEventListener("load", () => {
  if (phaserGame == null) {
    phaserGame = new PhaserGame();
    phaserGame.init();
  }
});

class PhaserGame {
  init() {
    let config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      width: WIDTH,
      height: HEIGHT,
      scene: MenuScene,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
    };

    this.game = new Phaser.Game(config);
  }
}

/**
 * First Scene: html games require user to focus the window (click or key down) before playing audio so we do this
 */
class MenuScene {
  create() {
    this.cameras.main.setBackgroundColor("#566573");
    this.text = this.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      "MY RHYTHM GAME\n\nPress Space to start",
      { fontFamily: "arial", fontSize: "40px" }
    );
    this.text.setOrigin(0.5, 0.5);
  }

  update() {
    if (isKeyPressed("Space")) {
      this.scene.add("main", MainScene);
      this.scene.start("main");
    }
  }
}

class MainScene {
  async preload() {
    this.load.audio("song", "audio.mp3");
  }

  create() {
    this.cameras.main.setBackgroundColor("#566573");
    /*---------------*/
    // Notes timestamps, made with the other script "record.html". They are relative to the start of the song, meaning a value of 1000 equals to 1 second after the song has started
    this.noteTimestamps = JSON.parse(
      '[{"timestamp":340},{"timestamp":1398},{"timestamp":1751},{"timestamp":2281},{"timestamp":2634},{"timestamp":2810},{"timestamp":3163},{"timestamp":3869},{"timestamp":4398},{"timestamp":5457},{"timestamp":5634},{"timestamp":5987},{"timestamp":6692},{"timestamp":7398},{"timestamp":7751},{"timestamp":7928},{"timestamp":8457},{"timestamp":8810},{"timestamp":9516},{"timestamp":10222},{"timestamp":11634},{"timestamp":12163},{"timestamp":12339},{"timestamp":12692},{"timestamp":13045},{"timestamp":13575},{"timestamp":14104},{"timestamp":14457},{"timestamp":14987},{"timestamp":15516},{"timestamp":15869},{"timestamp":16398},{"timestamp":16928},{"timestamp":17281},{"timestamp":18339},{"timestamp":18692},{"timestamp":19398},{"timestamp":19751},{"timestamp":20104},{"timestamp":20810},{"timestamp":21516},{"timestamp":21869},{"timestamp":22222},{"timestamp":22751},{"timestamp":22928},{"timestamp":23634},{"timestamp":23987},{"timestamp":24339},{"timestamp":24869},{"timestamp":25398},{"timestamp":25751},{"timestamp":26281},{"timestamp":26810},{"timestamp":27163},{"timestamp":27692},{"timestamp":28222},{"timestamp":28575},{"timestamp":29281},{"timestamp":29634},{"timestamp":29987},{"timestamp":30692},{"timestamp":31398},{"timestamp":32104},{"timestamp":32104},{"timestamp":32810},{"timestamp":33869},{"timestamp":34222},{"timestamp":39869},{"timestamp":40222},{"timestamp":40575},{"timestamp":41104},{"timestamp":41281},{"timestamp":41810},{"timestamp":42339},{"timestamp":42692},{"timestamp":43222},{"timestamp":43751},{"timestamp":44104},{"timestamp":45516},{"timestamp":45869},{"timestamp":46222},{"timestamp":46751},{"timestamp":46928},{"timestamp":47634},{"timestamp":48163},{"timestamp":48339},{"timestamp":48869},{"timestamp":49045}]'
    );
    this.timeToFall = WIDTH; // ms, time for the note to go to the bottom. The lower the faster/hardest
    this.lastNoteIndex = 0; // last note spawned
    this.offset = -200; // custom configuration set by user to resovle timing issues caused by latency.
    this.notes = []; // array of notes already spawned
    this.colliders = []; // colliders for player input vs falling note
    this.combo = 0;
    this.timeStamps = {};
    /*--------------*/

    // this is the red bar at the bottom. Does nothing, just for info
    this.noteCore = this.add.circle(WIDTH / 2, HEIGHT / 2, 70, 0x2c3e50);
    this.bounceCore;
    // this.noteCore.setStrokeStyle(12, 0x566573);

    this.comboText = this.add.text(WIDTH / 2, 50, "COMBO", {
      fontFamily: "arial",
      fontSize: "40px",
    });
    this.comboText.setOrigin(0.5, 0.5);

    // Help text under the red bar
    this.helpText = this.add.text(
      WIDTH / 2,
      550,
      "Press z or x when the circle closes.",
      { fontFamily: "arial", fontSize: "20px" }
    );
    this.helpText.setOrigin(0.5, 0.5);

    // We create the audio object and play it
    this.song = this.sound.add("song");
    this.song.volume = 0.1;
    this.song.play();

    // set the start time of the game
    this.startTime = Date.now();
  }

  update() {
    this.handlePlayerInput();
    this.spawnNotes();
    this.checkNoteCollisions();
  }

  spawnNotes() {
    // lets look up to the 10 next notes and spawn if needed
    for (let i = this.lastNoteIndex; i < this.lastNoteIndex + 10; i++) {
      let note = this.noteTimestamps[i];
      if (!note) break;

      // Spawn note if: is not already spawned, and the timing is right. From the start of the song, we need to consider the time it takes for the note to fall so we start it at the timestamp minus the time to fall
      if (
        note.spawned != true &&
        note.timestamp <=
          Date.now() - this.startTime + this.timeToFall + this.offset
      ) {
        this.spawnNote(note.timestamp);
        this.lastNoteIndex = i;
        note.spawned = true;
      }
    }
  }

  spawnNote(timeStamp) {
    // This is self explanatory. Spawn the note and let it fall to the bottom.
    let note = this.add.circle(WIDTH / 2, HEIGHT / 2, 200);
    note.setStrokeStyle(12, 0xbb8fce);
    note.state = timeStamp;
    note.clicked = false;
    this.notes.push(note);
    this.physics.add.existing(note);
    this.tweens.add({
      targets: note,
      scaleX: 0.35,
      scaleY: 0.35,
      duration: this.timeToFall,
      completeDelay: 150,
      onComplete: () => {
        if (!note.clicked) {
          note.destroy();
          this.notes.splice(this.notes.indexOf(note), 1);
          console.log("miss");
          this.cameras.main.shake(100, 0.01);
          this.combo = 0;
          this.updateScore();
        }
      },
    });
  }

  handlePlayerInput() {
    if (isKeyPressed("KeyZ") || isKeyPressed("KeyX")) {
      // we create a new collider at the position of the red bar
      let collider = this.add.circle(WIDTH / 2, HEIGHT / 2, 20, 0x566573);

      // attach physics
      this.physics.add.existing(collider);

      // little tween to grow
      this.tweens.add({
        targets: collider,
        scale: 4,
        duration: 100,
        alpha: 0,
        onComplete: () => {
          collider.destroy();
        },
      });

      // add the collider to the list
      this.colliders.push(collider);

      // animate noteCore
      if (!this.bounceCore || !this.bounceCore.isPlaying())
        this.bounceCore = this.tweens.add({
          targets: this.noteCore,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 80,
          yoyo: true,
          repeat: 0,
          ease: "Sine.easeInOut",
        });
    }
  }

  hitNote(expected, actual) {
    if (expected <= actual + 150 && expected >= actual - 150) return true;
    return false;
  }

  checkNoteCollisions() {
    this.physics.overlap(this.colliders, this.notes, (collider, note) => {
      // the collider collided
      collider.collided = true;
      // remove the collider from list
      this.colliders.splice(this.colliders.indexOf(collider), 1);

      console.log(note.state);
      console.log(Date.now() - this.startTime);

      if (this.hitNote(note.state, Date.now() - this.startTime + this.offset)) {
        console.log("hit");
        note.clicked = true;
        note.destroy();
        this.notes.splice(this.notes.indexOf(note), 1);
        this.combo += 1;
        this.updateScore();
      } else {
        console.log("miss");
        this.cameras.main.shake(100, 0.01);
        this.combo = 0;
        this.updateScore();
      }
    });
  }

  updateScore() {
    this.comboText.text = this.combo;
  }
}
