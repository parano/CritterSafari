/**
 * Created by CChaoyu Yang on 8/13/14.
 */
var AnimationLayer = cc.Layer.extend({
    s: null,
    ctor: function() {
        this._super();
        this.init();
    },

    init: function() {
        this._super();

        this.s = cc.director.getWinSize();

    }
});
