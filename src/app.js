/**
 * Created by maccha on 8/10/14.
 */
var GameScene = cc.Scene.extend({
    playerA: null,
    playerB: null,
    bg: null,
    objLayer: null,
    controller: null,

    onEnter:function () {
        this._super();
        //add three layer in the right order
        this.bg = new BackgroundLayer();
        this.addChild(this.bg);

        this.playerA = new AnimationLayer(1, 4, 0); // character id, starting row, starting col
        this.playerB = new AnimationLayer(2, 0, 4);
        this.addChild(this.playerA);
        this.addChild(this.playerB); // second player

        this.addChild(new StatusLayer());

        this.objLayer =new ObjectsLayer();
        this.addChild(this.objLayer);

        this.controller = new ControllerLayer()
        this.addChild(this.controller);
    },

    resetAll: function(){
        Config.ls.setItem('controller', 1);

        this.bg.removeChild(this.bg.spriteBG, true);
        this.bg.init();

        this.playerA.sprite.visible = false;
        this.playerB.sprite.visible = false;

        this.playerA.removeChild(this.playerA.sprite, true);
        this.playerB.removeChild(this.playerB.sprite, true);
        this.playerA.init();
        this.playerB.init();

        this.objLayer.hideAllSprites();
        this.objLayer.init();

        this.controller.resetController();
    }
});

