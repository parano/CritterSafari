/**
 * Created by maccha on 8/10/14.
 */
var GameScene = cc.Scene.extend({
    playerA: null,
    playerB: null,
    onEnter:function () {
        this._super();
        //add three layer in the right order
        this.addChild(new BackgroundLayer());

        this.playerA = new AnimationLayer(1, 4, 0); // character id, starting row, starting col
        this.playerB = new AnimationLayer(2, 0, 4);
        this.addChild(this.playerA);
        this.addChild(this.playerB); // second player
        this.addChild(new StatusLayer());
        this.addChild(new ObjectsLayer());
    }
});

