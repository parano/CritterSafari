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

//    foxSprite: null,
//    monkeySprite: null,
//    pigSprite: null,
//    rabbitSprite: null,

    ctor: function() {
        this._super();
        this.init();
    },

    initSprites: function(index) {
        this.sprites[index] = cc.Sprite.create(this.sprites_default_images[index]);
        this.addChild(this.sprites[index], index);
        var row = Constants.objects_initial_location[index].row;
        var col = Constants.objects_initial_location[index].col;
        this.sprites[index].attr({
            scaleX: this.scaleRatioX(),
            scaleY: this.scaleRatioY(),
            x: this.px(row, col),
            y: this.py(row, col)
        });
    },


    initAnimations: function(index) {
        var frame,str;
        cc.spriteFrameCache.addSpriteFrames(this.sprites_frames[index]);
        var spriteSheet = cc.SpriteBatchNode.create(this.sprites_images[index]);
        this.addChild(spriteSheet);

        for(var i=1; i<=Constants.dancingFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Dance-" + i + "(dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.dancingFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.magicFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Magic-" + i + "(dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.magicFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.loveFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Love-" + i + "(dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.loveFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.tantrumFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Tantrum-" + i + "(dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.tantrumFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.dressupFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_DressUp-" + i + "(dragged).tiff";
            frame = cc.spriteFrameCache.getSpriteFrame(str);
            this.dressupFrames[index].push(frame);
        }

        for(var i=1; i<=Constants.sleepFramesLen[index]; i++) {
            str = this.object_prefix[index] + "_Sleep-" + i + "(dragged).tiff";
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

        that = this;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key) {
                    cc.log("Key down:" + key);
                },
                onKeyReleased: function (key) {
                    cc.log("Key up:" + key);
                    switch(key) {
                        case 55: // press 7

                            break;
                        case 56: // press 8

                            break;
                        case 57: // press 9

                            break;
                        case 48: // press 0

                            break;
                    }
                }
            }, this);
        }
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
    }
});
