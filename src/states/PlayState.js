import Container from '../extensions/Container';

class PlayState extends Phaser.State {

    constructor() {
        super();

        this.map = null;
        this.layer = null;
        this.tileSize;
        this.towerTool;

        this.playerX = null;
        this.playerY = null;
        this.player;
        this.score;
        this.scoreText;
        this.cursors;
        this.fx;
    }

    preload() {
        this.game.load.image('player', 'build/sprites/player.png');
        this.game.load.image('tower', 'build/sprites/tower.jpg');

        this.game.load.spritesheet('map1Button', 'build/sprites/map1_button_sprite_sheet.png', 70, 25);
        this.game.load.spritesheet('map2Button', 'build/sprites/map2_button_sprite_sheet.png', 70, 25);

        this.game.load.tilemap('map1', 'build/tilemaps/maps/map1_data.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('map2', 'build/tilemaps/maps/map2_data.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.spritesheet('ground', 'build/tilemaps/tiles/ground.png', 32, 32);
        this.game.load.spritesheet('tiles', 'build/tilemaps/tiles/tiles.png', 32, 32);

        this.game.load.audio('sfx', 'build/audio/fx_mixdown.ogg');
    }

    create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.setupMap('map1');

        // Un-comment this on to see the collision tiles
        //layer.debug = true;

        // Create example of a Container holding a set of buttons
        var buttonBox = new Container(this.game, null, 0/*Container.VERTICAL*/, 0, 2);
        buttonBox.reset(this.game.width - 95, 10);
        this.game.world.add(buttonBox);

        var button1 = this.game.add.button(0, 0, 'map1Button', this.map1Click, this, 2, 1, 0);
        buttonBox.add(button1);
        var button2 = this.game.add.button(0, 0, 'map2Button', this.map2Click, this, 2, 1, 0);
        buttonBox.add(button2);

        buttonBox.doLayout();

        var style1 = {font: "11px Arial", fill: "#FFFFFF", align: "center"};
        var style2 = {font: "16px Arial", fill: "#FFFFFF", align: "center"};

        // Create tool for making Towers (two sprites, with the top one being dragged around)
        this.game.add.sprite(this.game.width - 90, this.game.height - 150, 'tower');
        this.towerTool = this.game.add.sprite(this.game.width - 90, this.game.height - 150, 'tower');
        this.towerTool.inputEnabled = true;
        this.towerTool.input.enableDrag();
        this.towerTool.events.onDragStop.add(this.addOneTower, this);
        var text = "Tower";
        this.game.add.text(this.game.width - 78, this.game.height - 190, text, style1);
        text = "$100";
        this.game.add.text(this.game.width - 78, this.game.height - 175, text, style2);

        this.player = this.game.add.sprite(260, 100, 'player');
        this.game.physics.enable(this.player);
        this.player.anchor.set(0.5);

        this.player.body.setSize(31, 31, 0, 0);

        this.positionPlayer();

        this.game.camera.follow(this.player);

        this.score = 0;
        this.scoreText = this.game.add.text(this.game.width - 82, this.game.height - 270, '' + this.score,
            {font: "30px Arial", fill: "#fff", align: "center"});

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.fx = this.game.add.audio('sfx');
        this.fx.addMarker('ping', 10, 1.0);
    }

    // Add a tower at the mouse position
    addOneTower(sprite, pointer) {
        var x = sprite.x + this.tileSize / 2;
        var y = sprite.y + this.tileSize / 2;

        var xTile = Math.round(x / this.tileSize);
        var yTile = Math.round(y / this.tileSize);

        this.map.putTile(4, xTile, yTile);

        sprite.x = this.game.width - 90;
        sprite.y = this.game.height - 150;
    }

    hitCoin(sprite, tile) {
        var xTile = tile.x;
        var yTile = tile.y;

        this.map.putTile(1, xTile, yTile);
        this.layer.dirty = true;
        this.fx.play("ping");

        this.score += 5;
        this.scoreText.text = '' + this.score;

        return false;
    }

    hitTower(sprite, tile) {
        var xTile = tile.x;
        var yTile = tile.y;

        console.log("hit Tower " + xTile + " " + yTile);

        this.map.putTile(1, xTile, yTile);
        this.layer.dirty = true;
        this.fx.play("ping");

        return false;
    }

    map1Click(e) {
        this.player.reset(-100, -100);
        this.player.body.enable = false;

        this.setupMap("map1");
        this.positionPlayer();
    }

    map2Click(e) {
        this.player.reset(-100, -100);
        this.player.body.enable = false;

        this.setupMap("map2");
        this.positionPlayer();
    }

    update() {
        this.game.physics.arcade.collide(this.player, this.layer);

        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y -= 100;
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y += 100;
        }
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x -= 100;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x += 100;
        }
    }

    setupMap(mapName) {
        if (this.layer != null) this.layer.destroy();
        if (this.map != null) this.map.destroy();

        this.map = this.game.add.tilemap(mapName);

        this.map.addTilesetImage('ground', 'ground');
        this.map.addTilesetImage('tiles', 'tiles');

        this.map.setCollisionBetween(2, 3);
        this.map.setTileIndexCallback(3, this.hitCoin, this);
        this.map.setTileIndexCallback(4, this.hitTower, this);

        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.dirty = true;
        this.tileSize = 32;
    }

    positionPlayer() {
        var found = false;
        for (var x = 0; x < this.layer.layer.width && !found; x++)
            for (var y = 0; y < this.layer.layer.height && !found; y++) {
                var cell = this.map.getTile(x, y, this.layer, true);

                if (cell.index == 1) {
                    this.player.reset(x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2);
                    this.player.dirty = true;
                    found = true;
                }
            }

        this.game.world.bringToTop(this.player);
        this.player.body.enable = true;
    }
}

export default PlayState;