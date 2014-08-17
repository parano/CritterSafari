/**
 * Created by maccha on 8/10/14.
 */
var StatusLayer = cc.Layer.extend({
    labelCoin: null,
    labelMeter: null,
    coins: 0,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super();

        /*
            var winsize = cc.director.getWinSize();

            this.xhrStatusLabel = cc.LabelTTF.create("Coins:0", "Helvetica", 20);
            this.xhrStatusLabel.setColor(cc.color(0,0,0));//black color
            this.xhrStatusLabel.setPosition(cc.p(70, winsize.height - 20));
            this.addChild(this.xhrStatusLabel);

            this.labelMeter = cc.LabelTTF.create("0M", "Helvetica", 20);
            this.labelMeter.setPosition(cc.p(winsize.width - 70, winsize.height - 20));
            this.addChild(this.labelMeter);
        */
    }
});
