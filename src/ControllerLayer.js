/**
 * Created by Chaoyu on 8/16/14.
 */

var ControllerLayer = cc.Layer.extend({
    xhrStatusLabel: null,

    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        var that = this;
        this._super();

        var winSize = cc.director.getWinSize();

        this.xhrStatusLabel = cc.LabelTTF.create("#", "Helvetica", 20);
        this.xhrStatusLabel.setColor(cc.color(0,0,0));//black color
        this.xhrStatusLabel.setPosition(cc.p(70, winSize.height - 20));
        this.addChild(this.xhrStatusLabel);

        setInterval(function(){
            that.sendGetRequest();
        }, 200);
    },

    sendGetRequest: function() {
        var that = this;
        var xhr = cc.loader.getXMLHttpRequest();

        xhr.open("GET", "http://localhost:3000/test.json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //var httpStatus = xhr.statusText;
                var responseObject = JSON.parse(xhr.responseText);

                if(responseObject.empty) {
                    //that.xhrStatusLabel.setString("No data");
                    console.log("no data");
                } else {
                    that.xhrStatusLabel.setString(responseObject.data);
                }
            } else {
                //that.xhrStatusLabel.setString("Serve Problem, Error Code: " + xhr.status);
            }
        };

        xhr.send();
    }
});
