/**
 * Created by Chaoyu Yang on 8/10/14.
 */

var AnimationLayer = cc.Layer.extend({
    spriteSheet: null,
    runningAction: null,
    sprite: null,
    s: null,
    row: 4,
    col: 0,
    tileMatrix: null,
    animation: null,

    ctor: function () {
        this._super();
        this.init();
    },

    initController: function () {
        var that = this;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    cc.log("Key down:" + key);
                },
                onKeyReleased: function (key, event) {
                    //cc.log("Key up:" + key);
                    switch(key){
                        // move princess
                        case 37: // press left arrow
                            that.move('left');
                            break;
                        case 38: //press up arrow
                            that.move('up');
                            break;
                        case 39: // press right arrow
                            that.move('right');
                            break;
                        case 40: // press down arrow
                            that.move('down');
                            break;
                        case 32: // press space
                            that.move('reset');
                            break;

                        // change background
                        case 67: // press c
                            that.changeBg();
                            break;

                        // change princess
                        case 49: // press 1
                            that.changePrincess("pink");
                            break;
                        case 50: // press 2
                            that.changePrincess("pink");
                            break;
                        case 51: // press 3
                            that.changePrincess("pink");
                            break;

                        // actions:
                        case 68: // press d
                            that.actionDancing();
                            break;
                        case 83: // press s
                            that.actionSleep();
                            break;
                        case 85: // press u
                            that.actionDressUp();
                            break;
                        case 77: // press m
                            that.actionMagic()
                            break;
                        case 76: // press l
                            that.actionLove();
                            break;
                        case 84: // press t
                            that.actionTantrum();
                            break;
                    }
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }
    },

    initSprite: function() {
        // create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.princess_plist);
        this.spriteSheet = cc.SpriteBatchNode.create(res.princess_png);
        this.addChild(this.spriteSheet);


        // init runningAction
        var animationFrames = [];
        for (var i = 1; i <= 3; i++) {
            var str = "pink_front_" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animationFrames.push(frame);
        }

        this.animation = cc.Animation.create(animationFrames, 0.3);
        this.runningAction = cc.RepeatForever.create(cc.Animate.create(this.animation));
        this.sprite = cc.Sprite.create("#pink_front_1.png");
        this.sprite.attr({
            //scaleX: this.scaleRatioX(),
            //scaleY: this.scaleRatioY(),
            x: this.px(),
            y: this.py()
        });
        this.sprite.setScaleY(this.scaleRatioY());
        this.sprite.setScaleX(this.scaleRatioX());

        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite);
    },

    init: function () {
        this._super();
        this.s = cc.director.getWinSize();
        //cc.director.setContentScaleFactor(Constants.bg.width * 1.5 / this.s.width);

        if(Config.ls.getItem('bg') === 'space') {
            this.tileMatrix = Constants.space_matrix;
        } else {
            this.tileMatrix = Constants.forest_matrix;
        }

        this.initController();
        this.initSprite();
    },

    px: function() {
        return this.tileMatrix[this.row][this.col].x * this.scaleRatioX();
    },

    py: function() {
        return this.tileMatrix[this.row][this.col].y * this.scaleRatioY();
    },

    scaleRatioX: function() {
        return this.s.width  / Constants.bg.width;
    },

    scaleRatioY: function() {
        return this.s.height / Constants.bg.height;
    },

    updatePosition: function(duration) {
        this.sprite.stopAllActions();
        this.sprite.attr({
            rotation: 0
        });
        this.sprite.runAction(this.runningAction);
        this.sprite.runAction(cc.MoveTo.create(
            duration,
            cc.p(this.px(),this.py())
        ).easing(cc.easeInOut(2)));
    },

    resetStyle: function(delay) {
        var that = this;

        this.sprite.runAction(
            cc.Sequence.create(
                cc.DelayTime.create(delay),
                cc.CallFunc.create(function() {
                    that.sprite.stopAllActions();
                    that.sprite.attr({
                        rotation: 0,
                        x: that.px(),
                        y: that.py()//,
                    });
                    that.sprite.runAction(that.runningAction);
                })
            )
        );
    },

    resetPrincess: function() {
        this.row = 4;
        this.col = 0;
        this.updatePosition(0.3);
    },

    move: function(direction) {
        switch(direction) {
            case "left":
                if(this.col>0 && this.tileMatrix[this.row][this.col-1] != null) {
                    this.col -= 1;
                }
                break;
            case "right":
                if(this.col<4 && this.tileMatrix[this.row][this.col+1] != null) {
                    this.col += 1;
                }
                break;
            case "up":
                if(this.row>0 && this.tileMatrix[this.row-1][this.col] != null) {
                    this.row -= 1;
                }
                break;
            case "down":
                if(this.row<4 && this.tileMatrix[this.row+1][this.col] != null) {
                    this.row += 1;
                }
                break;
            case "reset":
            default :
                this.resetPrincess();
                return;
        }
        this.updatePosition(1);
    },

    actionDancing: function (Sequence) {
        cc.log("Dancing Playing!!!");

        //blink
        //var blinkAction = cc.Blink.create(4,20);

        //rotate
        //var rotateAction = cc.Sequence.create(
        //    cc.RotateTo.create(0.5, -90),
        //    cc.RotateTo.create(0.5, 90)
        //);

        var cx = this.px(),
            cy = this.py();
        var jumpByRight = cc.JumpBy.create(1, cc.p(50, 0),30, 2);
        var jumpByLeft = cc.JumpBy.create(1, cc.p(-50, 0), 30, 2);

        var jumpAction = cc.Sequence.create(
            jumpByRight, jumpByLeft, jumpByLeft, jumpByRight);

        this.sprite.stopAllActions();
        this.sprite.runAction(
            cc.Spawn.create(
                cc.Repeat.create(cc.Animate.create(this.animation),10),
                jumpAction
            )
        );

        AudioPlayer.playDancingEffect();
        this.resetStyle(4);
    },

    actionSleep: function() {
        cc.log("sleeping");
    },

    actionMagic: function() {
        cc.log("magic");
    },

    actionDressUp: function() {
        cc.log("dress up");
    },

    actionLove: function() {
        cc.log("love");
    },

    actionTantrum: function() {
        cc.log("Tantrum");
    },

    changeBg: function () {
        // background setting stores in local storage
        // implemented in GameConfig.js
        if(Config.ls.getItem('bg') === 'space') {
            Config.ls.setItem('bg', 'forest');
        } else {
            Config.ls.setItem('bg', 'space');
        }
        cc.game.run();
    },

    changePrincess: function (princess) {
        Config.ls.setItem('princess', princess);
        cc.game.run();
    }
});
