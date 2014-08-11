/**
 * Created by Chaoyu Yang on 8/10/14.
 */
var BackgroundLayer = cc.Layer.extend({
    spriteBG: null,
    s: null,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();
        this.s = cc.director.getWinSize();

        //create the background image and position it at the center of screen
        var centerPos = cc.p(this.s.width / 2, this.s.height / 2);
        this.spriteBG = cc.Sprite.create(res.GameBoard_Space_png);
        this.spriteBG.attr({
            scaleX: this.scaleRatioX(),
            scaleY: this.scaleRatioY()
        });

        this.spriteBG.setPosition(centerPos);
        this.addChild(this.spriteBG);
    },

    scaleRatioX: function() {
        return this.s.width  / Constants.bg.width;
    },

    scaleRatioY: function() {
        return this.s.height / Constants.bg.height;
    }
});
