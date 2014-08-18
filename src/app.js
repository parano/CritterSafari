/**
 * Created by maccha on 8/10/14.
 */
var GameScene = cc.Scene.extend({
    playerA: null,
    playerB: null,
    bg: null,
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
        this.addChild(new ObjectsLayer());
        this.addChild(new ControllerLayer());
    },

    resetAll: function(){
        this.bg.removeChild(this.bg.spriteBG, true);
        this.bg.init();

        this.playerA.sprite.visible = false;
        this.playerB.sprite.visible = false;

        this.playerA.removeChild(this.playerA.sprite, true);
        this.playerB.removeChild(this.playerB.sprite, true);
        this.playerA.init();
        this.playerB.init();
        //this.playerA = new AnimationLayer(1, 4, 0); // character id, starting row, starting col
        //this.playerB = new AnimationLayer(2, 0, 4);
    }
});

