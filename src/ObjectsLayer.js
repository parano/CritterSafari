/**
 * Created by Chaoyu Yang on 8/13/14.
 */
var ObjectsLayer = cc.Layer.extend({
    s: null,
    object_names: ['fox', 'monkey', 'pig', 'rabbit'],
    object_prefix: ['F', 'M', 'P', 'R'],
    sprites: [],
    sprites_frames: [res.fox_plist, res.monkey_plist, res.pig_plist, res.rabbit_plist],
    sprites_images: [res.fox_png, res.monkey_png, res.pig_png, res.rabbit_png],
    sprites_default_images: [res.fox_sprite_png, res.monkey_sprite_png, res.pig_sprite_png, res.rabbit_sprite_png],
    dancingFrames: [[],[],[],[]],
    magicFrames: [[],[],[],[]],
    loveFrames: [[],[],[],[]],
    tantrumFrames: [[],[],[],[]],
    dressupFrames: [[],[],[],[]],
    sleepingFrames: [[],[],[],[]],
    tileMatrix: null,

    ctor: function() {
        this._super();
        this.init();

        this.setAllListeners();
    },

    initSprites: function(index) {
        this.sprites[index] = cc.Sprite.create(this.sprites_default_images[index]);
        this.addChild(this.sprites[index], index);
        var row = Constants.objects_initial_location[Config.ls.getItem('bg')][index].row;
        var col = Constants.objects_initial_location[Config.ls.getItem('bg')][index].col;
        this.sprites[index].attr({
            scaleX: 1.7*this.scaleRatioX(),
            scaleY: 1.7*this.scaleRatioY(),
            x: this.px(row, col),
            y: this.py(row, col),
            visible: (Config.ls.getItem(this.object_names[index]+'Viz') === 'true')
        });
    },

    initAnimations: function(index) {
        var frame,str;
        cc.spriteFrameCache.addSpriteFrames(this.sprites_frames[index]);
        var spriteSheet = cc.SpriteBatchNode.create(this.sprites_images[index]);
        this.addChild(spriteSheet);

        for(var i=1; i<=Constants.dancingFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Dance-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.dancingFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.magicFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Magic-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.magicFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.loveFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Love-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.loveFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.tantrumFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Tantrum-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.tantrumFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.dressupFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_DressUp-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.dressupFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.sleepFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Sleep-" + i + " (dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.sleepingFrames[index].push(frame);
        }
    },

    init: function() {
        this._super();

        this.s = cc.director.getWinSize();

        if(Config.ls.getItem('bg') === 'space') {
            this.tileMatrix = Constants.space_matrix;
        } else {
            this.tileMatrix = Constants.forest_matrix;
        }

        for(var i= 0; i<4; i++) {
            this.initSprites(i);
            this.initAnimations(i);
        }
    },

    toggleVisibility: function(index) {
        var visible = this.sprites[index].visible;
        this.setVisibility(index, !visible);
    },

    setVisibility: function(index, visible) {
        Config.ls.setItem(this.object_names[index] + 'Viz', visible);
        this.sprites[index].visible = visible;
    },

    px: function(row, col) {
        return this.tileMatrix[row][col].x * this.scaleRatioX();
    },

    py: function(row, col) {
        return this.tileMatrix[row][col].y * this.scaleRatioY();
    },

    scaleRatioX: function() {
        return this.s.width  / Constants.bg.width;
    },

    scaleRatioY: function() {
        return this.s.height / Constants.bg.height;
    },

    actionListener: null,
    eventListener: null,
    setAllListeners: function() {
        var that = this;
        this.eventListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: 'objects',
            callback: function(event){
                var data = event.getUserData();
                that.setVisibility(data.targetObject, data.visible);
            }
        });
        cc.eventManager.addListener(this.eventListener, 1);

        this.actionListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "action",
            callback: function(event){
                var object_row, object_col;
                var event_row = event.getUserData().row;
                var event_col = event.getUserData().col;
                var action = event.getUserData().action;

                for(var i=0; i<4; i++) {
                    object_row = Constants.objects_initial_location[Config.ls.getItem('bg')][i].row;
                    object_col = Constants.objects_initial_location[Config.ls.getItem('bg')][i].col;
                    if(that.nearby(event_row, event_col, object_row, object_col)){
                        switch(action)  {
                            case 'dancing':
                                that.dancingAction(i);
                                break;
                            case 'sleeping':
                                that.sleepingAction(i);
                                break;
                            case 'dressup':
                                that.dressupAction(i);
                                break;
                            case 'magic':
                                that.magicAction(i);
                                break;
                            case 'love':
                                that.loveAction(i);
                                break;
                            case 'tantrum':
                                that.tantrumAction(i);
                                break;
                        }
                    }
                }


            }
        });
        cc.eventManager.addListener(this.actionListener, 1);
    },

    nearby: function(x1, y1, x2, y2){
        return (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) < 2;
    },

    dancingAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.dancingFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.dancingFramesLen[index])
            )
        );
    },
    magicAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.magicFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.magicFramesLen[index] + 1)
            )
        );
    },
    loveAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.loveFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.loveFramesLen[index] + 1)
            )
        );
    },
    tantrumAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.tantrumFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.tantrumFramesLen[index] + 1)
            )
        );
    },
    dressupAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.dressupFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.dressupFramesLen[index] + 1)
            )
        );
    },
    sleepingAction: function(index) {
        var fps = 10; // 1/s
        var duration = 4; //s

        this.sprites[index].stopAllActions();
        this.sprites[index].attr({
            scaleX: 4* this.scaleRatioX(),
            scaleY: 4* this.scaleRatioY()
        });

        this.sprites[index].runAction(
            cc.Animate.create(
                cc.Animation.create(this.sleepingFrames[index], 1/fps)
            ).repeat(
                Math.floor(duration*fps/Constants.sleepFramesLen[index] + 1)
            )
        );
    },
    resetSpriteAfter: function(delay, index) {
        var that = this;
        setTimeout(function() {
            that.resetSprite(index);
        }, delay * 1000);
    },
    resetSprite: function(index) {
        // reset object sprite to first frame
        //cc.log(this.sprites[index]);
    },
    hideAllSprites: function() {
        for(var i=0; i<4; i++) {
            this.sprites[i].visible = false;
        }
    }
});
