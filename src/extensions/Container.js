class Container extends Phaser.Group {

    constructor(game, parent, direction, hGap, vGap) {
        super(game);

        this.game = game;
        this.VERTICAL = 0;
        this.HORIZONTAL = 1;

        this.parent = parent;

        this.direction = (direction != undefined) ? direction : 0;
        this.hGap = (hGap != undefined) ? hGap : 2;
        this.vGap = (vGap != undefined) ? vGap : 2;
        this.invalid = true;
    }

    doLayout() {
        if (this.direction == this.HORIZONTAL) {
            var x = this.hGap;
            var maxHeight = 0;

            container.forEach(function (child) {
                child.x = x;
                child.y = this.vGap;

                if (child.__proto__ == Container.prototype) {
                    child.doLayout(child);
                }

                x += child.width + this.hGap;
                if (child.height > maxHeight) maxHeight = child.height;
            });
            this.width = x;
            this.height = maxHeight + 2 * this.vGap;
        }
        else if (this.direction == this.VERTICAL) {
            var y = this.vGap;
            var maxWidth = 0;

            container.forEach(function (child) {
                child.x = this.hGap;
                child.y = y;

                if (child.__proto__ == Container.prototype) {
                    child.doLayout();
                }

                y += child.height + container.vGap;
                if (child.width > maxWidth) maxWidth = child.width;
            });
            this.width = maxWidth + 2 * this.hGap;
            this.height = y;
        }
        else {
            console.log("Unknown layout mode");
            return;
        }
        this.invalid = false;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.invalid = true;
    }
}

export default Container;
