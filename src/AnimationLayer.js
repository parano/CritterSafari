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
    animationGap: 300,

    ctor: function (character_id, starting_row, starting_col) {
        this._super();

        this.character_id = character_id;
        this.starting_row = starting_row;
        this.starting_col = starting_col;

        this.init();
        this.initListeners();
    },

    initListeners: function () {
        var that = this;
        this.updateCharacterListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: 'updateCharacter',
            callback: function(event){
                var data = event.getUserData();
                //console.log(data);

                if(data.player_id === that.character_id) {
                    if(data.event === 'updateVisibility') {
                        that.setVisibility(data.value);
                        that.parent.resetAll();
                    } else if(data.event === 'color') {
                        that.setColor(data.value);
                        that.parent.resetAll();
                    }
                }
            }
        });
        cc.eventManager.addListener(this.updateCharacterListener, 1);

        this.actionListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: 'action',
            callback: function(event){
                //console.log('action event received');

                var data = event.getUserData();
                //console.log(data);

                var actionType = data.action;

                if(data.player_id === that.character_id) {
                    if(actionType === 'left') {
                        console.log('moving left');
                        that.move('left');
                    } else if(actionType === 'up') {
                        that.move('up');
                    } else if(actionType === 'right') {
                        that.move('right');
                    } else if(actionType === 'down') {
                        that.move('down');
                    } else if(actionType === 'dance') {
                        that.dispatchActionEvent('dancing');
                        that.actionDancing();
                    } else if(actionType === 'sleep') {
                        that.dispatchActionEvent('sleeping');
                        that.actionSleep();
                    } else if(actionType === 'dressup') {
                        that.dispatchActionEvent('dressup');
                        that.actionDressUp();
                    } else if(actionType === 'magic') {
                        that.dispatchActionEvent('magic');
                        that.actionMagic();
                    } else if(actionType === 'love') {
                        that.dispatchActionEvent('love');
                        that.actionLove();
                    } else if(actionType === 'tantrum') {
                        that.dispatchActionEvent('tantrum');
                        that.actionTantrum();
                    }
                }
            }
        });
        cc.eventManager.addListener(this.actionListener, 1);
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
            y: this.py(),
            visible: (Config.ls.getItem('player'+ this.character_id +'Viz') === 'true')
        });
        this.sprite.setScaleY(this.scaleRatioY());
        this.sprite.setScaleX(this.scaleRatioX());

        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite);
    },

    init: function () {
        this._super();
        this.s = cc.director.getWinSize();

        var color_id = Config.ls.getItem('princess' + this.character_id);
        this.color = this.colors[color_id];

        this.row = this.starting_row;
        this.col = this.starting_col;

        if(Config.ls.getItem('bg') === 'space') {
            this.tileMatrix = Constants.space_matrix;
        } else {
            this.tileMatrix = Constants.forest_matrix;
        }

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

    setVisibility: function(visible) {
        Config.ls.setItem('player' + this.character_id + 'Viz', visible);
        this.sprite.visible = visible;
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
        setTimeout(this.runNext, duration*1000 + this.animationGap);
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

    resetSprite: function() {
        that.move('reset');
        that.resetStyle(0.1);
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

    actionDancing: function () {
        console.log("Dancing Playing!!!");

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
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    emitters: [],
    actionMagic: function() {
        console.log("magic");

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
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    actionTantrum: function() {
        console.log("Tantrum");

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
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    actionLove: function() {
        console.log("love");
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
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    actionSleep: function() {
        console.log("sleeping");
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
            y: this.py()+100*this.scaleRatioY()
        });

        AudioPlayer.playSleepEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    actionDressUp: function() {
        console.log("dress up");
        var animationDuration = 4;
        var fps = 10;
        var that = this;
        this.sprite.stopAllActions();


        var animationFrames = [];
        animationFrames.push(cc.spriteFrameCache.getSpriteFrame(this.color + "_front_1.png"));
        animationFrames.push(cc.spriteFrameCache.getSpriteFrame(this.color + "_front_2.png"));
        animationFrames.push(cc.spriteFrameCache.getSpriteFrame(this.color + "_left.png"));
        animationFrames.push(cc.spriteFrameCache.getSpriteFrame(this.color + "_back.png"));
        animationFrames.push(cc.spriteFrameCache.getSpriteFrame(this.color + "_right.png"));
        this.sprite.runAction(
            cc.Animate.create(
                cc.Animation.create(animationFrames, 1/fps)
            ).repeat(fps/5*animationDuration)
        );

        var emit = function() {
            var emitter = cc.ParticleSystem.create(res.dressup_plist);
            that.emitters.push(emitter);
            that.addChild(emitter, 10);
            emitter.attr({
                scaleX: that.scaleRatioX(),
                scaleY: that.scaleRatioY(),
                x: that.px(),
                y: that.py() - 50 * that.scaleRatioY()
            });
        }

        for(var i=0; i<5; i++) {
            setTimeout(emit, i*animationDuration/5*1000);
        }

        AudioPlayer.playDressUpEffect(animationDuration - 0.2);
        this.resetStyle(animationDuration);
        setTimeout(this.runNext, animationDuration*1000 + this.animationGap);
    },

    runNext: function(){
        var event = new cc.EventCustom('runNext');
        cc.eventManager.dispatchEvent(event);
    },

    setColor: function(color_id) {
        this.setVisibility(true);
        Config.ls.setItem('princess' + this.character_id, color_id);
    },

    dispatchActionEvent: function(action) {
        var event = new cc.EventCustom("action");
        event.setUserData({
            row: this.row,
            col: this.col,
            action: action
        });
        cc.eventManager.dispatchEvent(event);
    }
});
