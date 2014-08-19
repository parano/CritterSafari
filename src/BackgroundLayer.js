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
        this.setListeners();
    },

    init: function () {
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

//        if ('keyboard' in cc.sys.capabilities) {
//            cc.eventManager.addListener({
//                event: cc.EventListener.KEYBOARD,
//                onKeyPressed: function (key) {
//                    //cc.log("Key down:" + key);
//                },
//                onKeyReleased: function (key) {
//                    //cc.log("Key up:" + key);
//                    switch(key) {
//                        case 49:
//                            that.parent.playerA.toggleVisibility();
//                            break;
//                        case 50:
//                            that.parent.playerB.toggleVisibility();
//                            break;
//                        case 51: // press 3
//                            that.setController(1);
//                            break;
//                        case 52: //press4
//                            that.setController(2);
//                            break;
//                        case 32: // press
//                            that.resetBoard();
//                            break;
//                    }
//                }
//            }, this);
//        }

    },

    eventListener: null,
    setListeners: function(){
        var that = this;
        this.eventListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: 'changeSetting',
            callback: function(event){
                var data = event.getUserData();
                console.log(data);
                if(data.target === 'reset') {
                    console.log('resetting');
                    Config.ls.setItem('controller', 1);
                    that.parent.resetAll();
                } else if (data.target === 'board') {
                    that.setBg(data.bg);
                } else if (data.target === 'controller') {
                    that.setController(data.id);
                }
            }
        });
        cc.eventManager.addListener(this.eventListener, 1);
    },

    toggleController: function() {
        if(+Config.ls.getItem('controller') === 1) {
            Config.ls.setItem('controller', 2);
        } else {
            Config.ls.setItem('controller', 1);
        }
    },

    setController: function(controller_id) {
        Config.ls.setItem('controller', controller_id);
    },

    resetBoard: function() {
        var event = new cc.EventCustom("board_reset");
        cc.eventManager.dispatchEvent(event);
    },

    setBg: function (bg) {
        // background setting stores in local storage
        // implemented in GameConfig.js
        if(bg === 'space') {
            Config.ls.setItem('bg', 'space');
        } else if(bg === 'forest') {
            Config.ls.setItem('bg', 'forest');
        }
        this.spriteBG.removeFromParent(true);
        //this.init();
        this.parent.resetAll();
    },

    scaleRatioX: function() {
        return this.s.width  / Constants.bg.width;
    },

    scaleRatioY: function() {
        return this.s.height / Constants.bg.height;
    }
});
