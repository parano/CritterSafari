/**
 * Created by Chaoyu Yang on 8/10/14.
 */
var BackgroundLayer = cc.Layer.extend({
    spriteBG: null,
    s: null,
    bg_png: null,

    ctor:function () {
        this._super();
        this.init();
    },

    init: function () {
        var that;
        this._super();
        this.s = cc.director.getWinSize();

        if(Config.ls.getItem('bg') === 'space') {
            this.bg_png = res.GameBoard_space_png;
        } else {
            this.bg_png = res.GameBoard_forest_png;
        }

        //create the background image and position it at the center of screen
        var centerPos = cc.p(this.s.width / 2, this.s.height / 2);
        this.spriteBG = cc.Sprite.create(this.bg_png);
        this.spriteBG.attr({
            scaleX: this.scaleRatioX(),
            scaleY: this.scaleRatioY()
        });

        this.spriteBG.setPosition(centerPos);
        this.addChild(this.spriteBG);

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
                        case 50: // press 2
                            that.toggleController();
                            break;
                        case 32: // press
                            that.resetBoard();
                            break;
                    }
                }
            }, this);
        }
    },

    toggleController: function() {
        if(+Config.ls.getItem('controller') === 1) {
            Config.ls.setItem('controller', 2);
        } else {
            Config.ls.setItem('controller', 1);
        }
    },

    resetBoard: function() {
        var event = new cc.EventCustom("board_reset");
        cc.eventManager.dispatchEvent(event);
    },


    scaleRatioX: function() {
        return this.s.width  / Constants.bg.width;
    },

    scaleRatioY: function() {
        return this.s.height / Constants.bg.height;
    }
});
