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
                            that.resetStyle(0.1);
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

        // reset style and clean particles
        this.resetStyle(duration);
    },

    resetStyle: function(delay) {
        var that = this;

        this.delay(delay, function() {
            that.sprite.stopAllActions();
            while(that.emitters.length > 0) {
                that.removeChild(that.emitters.pop());
            }
            that.sprite.attr({
                rotation: 0,
                x: that.px(),
                y: that.py()//,
            });
            that.sprite.runAction(that.runningAction);
        });
    },

    delay: function(delay, func) {
        this.sprite.runAction(
            cc.Sequence.create(
                cc.DelayTime.create(delay),
                cc.CallFunc.create(func)
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

        var animationDuration = 4;
        var jumpByRight = cc.JumpBy.create(1, cc.p(50, 0),30, 2);
        var jumpByLeft = cc.JumpBy.create(1, cc.p(-50, 0), 30, 2);

        var jumpAction = cc.Sequence.create(
            jumpByRight, jumpByLeft, jumpByLeft, jumpByRight);

        //this.sprite.stopAllActions();
        this.sprite.runAction(
            //cc.Spawn.create(
                //cc.Repeat.create(cc.Animate.create(this.animation),10),
                jumpAction
            //)
        );

        AudioPlayer.playDancingEffect();
        this.resetStyle(animationDuration);
    },

    emitters: [],
    actionMagic: function() {
        cc.log("magic");

        var animationDuration = 4;
        var distance = 25;
        var array = [
            cc.p(0, 0),
            cc.p(-1.5*distance, distance),
            cc.p(-1.5*distance, -distance),
            cc.p(1.5*distance, distance),
            cc.p(1.5*distance, -distance),
            cc.p(0, 0)
        ];

        this.sprite.runAction(
            cc.CardinalSplineBy.create(1.8, array, 1.1).repeat(2)
        );

        var emitter = cc.ParticleSystem.create(res.phoenix_plist);
        this.emitters.push(emitter);
        this.addChild(emitter, 10);

        emitter.attr({
            scaleX: this.scaleRatioX()*2,
            scaleY: this.scaleRatioY()*2,
            x: this.px(),
            y: this.py()
        });

        var that = this;
        this.delay(animationDuration-0.5, function(){
            while(that.emitters.length > 0) {
                that.removeChild(that.emitters.pop());
            }
        });

        AudioPlayer.playMagicEffect();
        this.resetStyle(animationDuration);
    },

    actionTantrum: function() {
        cc.log("Tantrum");

        var animationDuration = 4;
        var distance = 13;
        var array = [
            cc.p(0, 0),
            cc.p(-distance, 2*distance),
            cc.p(0, 0),
            cc.p(distance, 2*distance),
            cc.p(0, 0)
        ];

        this.sprite.runAction(
            cc.CardinalSplineBy.create(animationDuration/8, array, 1.1).repeat(8)
        );

        var emitter = cc.ParticleFire.create();;
        this.emitters.push(emitter);
        this.addChild(emitter, 5);
        emitter.texture = cc.textureCache.addImage(res.fire_png);

        emitter.attr({
            scaleX: this.scaleRatioX(),
            scaleY: this.scaleRatioY()/1.5,
            x: this.px(),
            y: this.py()+200*this.scaleRatioY()
        });

        AudioPlayer.playTantrumEffect();
        this.resetStyle(animationDuration);
    },

    actionLove: function() {
        cc.log("love");
        var animationDuration = 4;

        AudioPlayer.playLoveEffect();
        this.resetStyle(animationDuration);
    },

    actionSleep: function() {
        cc.log("sleeping");
        var animationDuration = 4;

        AudioPlayer.playSleepEffect();
        this.resetStyle(animationDuration);
    },

    actionDressUp: function() {
        cc.log("dress up");
        var animationDuration = 4;

        AudioPlayer.playDressUpEffect();
        this.resetStyle(animationDuration);
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
