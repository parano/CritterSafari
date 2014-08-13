/**
 * Created by Chaoyu Yang on 8/10/14.
 */

var AnimationLayer = cc.Layer.extend({
    spriteSheet: null,
    runningAction: null,
    sprite: null,
    s: null,
    starting_row: null,
    starting_col: null,
    row: null,
    col: null,
    tileMatrix: null,
    animation: null,
    colors: ['pink', 'green', 'blue'],
    color: null,
    character_id: null,

    ctor: function (character_id, starting_row, starting_col) {
        this._super();

        this.character_id = character_id;
        var color_id = Config.ls.getItem('princess1');
        this.color = this.colors[color_id];
        this.starting_row = starting_row;
        this.starting_col = starting_col;
        this.row = starting_row;
        this.col = starting_col;

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
                        case 81: // press q
                            that.nextColor();
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
            var str = this.color + "_front_" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animationFrames.push(frame);
        }

        this.animation = cc.Animation.create(animationFrames, 0.3);
        this.runningAction = cc.RepeatForever.create(cc.Animate.create(this.animation));
        this.sprite = cc.Sprite.create("#" + this.color +"_front_1.png");
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
        this.row = this.starting_row;
        this.col = this.starting_col;
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
        var distance = 80 * this.scaleRatioX();
        var jumpByRight = cc.JumpBy.create(1, cc.p(distance, 0), 0.6*distance, 2);
        var jumpByLeft = cc.JumpBy.create(1, cc.p(-distance, 0), 0.6*distance, 2);

        var jumpAction = cc.Sequence.create(
            jumpByRight, jumpByLeft, jumpByLeft, jumpByRight);

        //this.sprite.stopAllActions();
        this.sprite.runAction(
            //cc.Spawn.create(
                //cc.Repeat.create(cc.Animate.create(this.animation),10),
                jumpAction
            //)
        );

        AudioPlayer.playDancingEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
    },

    emitters: [],
    actionMagic: function() {
        cc.log("magic");

        var animationDuration = 4;
        var distance = 50*this.scaleRatioX();
        var array = [
            cc.p(0, 0),
            cc.p(-2*distance, distance),
            cc.p(-2*distance, -distance),
            cc.p(2*distance, distance),
            cc.p(2*distance, -distance),
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

        AudioPlayer.playMagicEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
    },

    actionTantrum: function() {
        cc.log("Tantrum");

        this.sprite.stopAllActions();
        this.sprite.setSpriteFrame(
            cc.spriteFrameCache.getSpriteFrame(this.color + "_tantrum.png"));

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

        AudioPlayer.playTantrumEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
    },

    actionLove: function() {
        cc.log("love");
        var animationDuration = 4;

        var emitter = cc.ParticleSystem.create();
        this.emitters.push(emitter);
        this.addChild(emitter, 10);
        emitter.texture = cc.textureCache.addImage(res.love_png);

        emitter.duration = -1;

        // gravity
        emitter.gravity = cc.p(0, 0);

        // angle
        emitter.angle = 90;
        emitter.angleVar = 360;

        // speed of particles
        emitter.speed = 160;
        emitter.speedVar = 20;

        // radial
        emitter.radialAccel = -120;
        emitter.radialAccelVar = 0;

        // tagential
        emitter.tangentialAccel = 30;
        emitter.tangentialAccelVar = 0;

        // emitter position
        emitter.x = 160;
        emitter.y = 240;
        emitter.posVar = cc.p(0, 0);

        // life of particles
        emitter.life = 4;
        emitter.lifeVar = 1;

        // spin of particles
        emitter.startSpin = 0;
        emitter.startSizeVar = 0;
        emitter.endSpin = 0;
        emitter.endSpinVar = 0;

        // color of particles
        var startColor = cc.color(128, 128, 128, 255);
        emitter.startColor = startColor;

        var startColorVar = cc.color(128, 128, 128, 255);
        emitter.startColorVar = startColorVar;

        var endColor = cc.color(26, 26, 26, 50);
        emitter.endColor = endColor;

        var endColorVar = cc.color(26, 26, 26, 50);
        emitter.endColorVar = endColorVar;

        // size, in pixels
        emitter.startSize = 80.0 * this.scaleRatioX();
        emitter.startSizeVar = 40.0 * this.scaleRatioX();
        emitter.endSize = cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE;

        // emits per second

        emitter.emissionRate = emitter.totalParticles / emitter.life;

        // additive
        emitter.setBlendAdditive(true);

        emitter.attr({
            scaleX: this.scaleRatioX()*2,
            scaleY: this.scaleRatioY()*2,
            x: this.px(),
            y: this.py()
        });

        AudioPlayer.playLoveEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
    },

    actionSleep: function() {
        cc.log("sleeping");
        var animationDuration = 5;

        this.sprite.stopAllActions();
        this.sprite.setSpriteFrame(
            cc.spriteFrameCache.getSpriteFrame(this.color + "_front_3.png"));

        var emitter = cc.ParticleSystem.create(res.sleeping_plist);
        this.emitters.push(emitter);
        this.addChild(emitter, 10);

        emitter.attr({
            scaleX: this.scaleRatioX()*2,
            scaleY: this.scaleRatioY()*2,
            x: this.px(),
            y: this.py()
        });

        AudioPlayer.playSleepEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
    },

    actionDressUp: function() {
        cc.log("dress up");
        var animationDuration = 4;

        AudioPlayer.playDressUpEffect(animationDuration - 0.2);
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

    nextColor: function() {
        var color_id = Config.ls.getItem('princess1');
        color_id = (++color_id)%3; // next id
        Config.ls.setItem('princess'+this.character_id, color_id);
        //this.color = this.colors[color_id];
        cc.game.run();
    }


});
