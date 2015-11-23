import PlayState from './states/PlayState';

class Game extends Phaser.Game {

    constructor() {
        super(920, 577, Phaser.CANVAS, 'content', null);
        this.state.add('play', PlayState, false);
        this.state.start('play');
    }
}

new Game();
