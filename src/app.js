/**
 * Created by maccha on 8/10/14.
 */
var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        //add three layer in the right order
        this.addChild(new BackgroundLayer());
        this.addChild(new AnimationLayer(1, 4, 0)); // character id, starting row, starting col
        this.addChild(new AnimationLayer(2, 0, 4)); // second player
        this.addChild(new StatusLayer());
        this.addChild(new ObjectsLayer());
    }
});

