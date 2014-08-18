/**
 * Created by Chaoyu on 8/16/14.
 */

var ControllerLayer = cc.Layer.extend({
    //StatusLabel for debugging only
    //xhrStatusLabel: null,

    commandSequence: [],

    ctor:function () {
        this._super();
        this.commandSequence = [];
        this.init();
    },

    init:function () {
        var that = this;
        this._super();
        this.keyboardEventListener();

        //var winSize = cc.director.getWinSize();

        //this.xhrStatusLabel = cc.LabelTTF.create("#", "Helvetica", 20);
        //this.xhrStatusLabel.setColor(cc.color(0,0,0));//black color
        //this.xhrStatusLabel.setPosition(cc.p(70, winSize.height - 20));
        //this.addChild(this.xhrStatusLabel);

//        setInterval(function(){
//            that.sendGetRequest();
//        }, 200);
    },

    keyboardEventListener: function(){
        var that = this;
        var event;
        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key) {
                    //cc.log("Key down:" + key);
                },
                onKeyReleased: function (key) {
                    //cc.log("Key up:" + key);
                    switch(key) {
                        case 49: // press 1, show character 1
                            event = new cc.EventCustom('updateCharacter');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                event: 'updateVisibility',
                                value: true
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 50: // press 2, hide character 1
                            event = new cc.EventCustom('updateCharacter');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                event: 'updateVisibility',
                                value: false
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 51: // press 3, show character 2
                            event = new cc.EventCustom('changeSetting');
                            event.setUserData({
                                target: 'controller',
                                id: 1
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 52: // press4, hide character 2
                            event = new cc.EventCustom('changeSetting');
                            event.setUserData({
                                target: 'controller',
                                id: 2
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 32: // press space
                            event = new cc.EventCustom('changeSetting');
                            event.setUserData({
                                target: 'reset'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;


                        case 37: // press left arrow
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'left'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 38: //press up arrow
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'up'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 39: // press right arrow
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'right'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 40: // press down arrow
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'down'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;

                        // change background
                        case 67: // press c
                            event = new cc.EventCustom('changeSetting');
                            event.setUserData({
                                target: 'board',
                                bg: 'forest'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 88: // press x
                            event = new cc.EventCustom('changeSetting');
                            event.setUserData({
                                target: 'board',
                                bg: 'space'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;

                        // change princess color
                        case 8+Config.ls.getItem('controller'): // press q, color pink
                            event = new cc.EventCustom('updateCharacter');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                event: 'color',
                                data: 0 // pink
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 87: // press w, color green
                            event = new cc.EventCustom('updateCharacter');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                event: 'color',
                                data: 1 // green
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 69: // press e, color blue
                            event = new cc.EventCustom('updateCharacter');
                            event.setUserData({
                                target: 'player',
                                player_id: +Config.ls.getItem('controller'),
                                event: 'color',
                                data: 2 // blue
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;

                        // actions:
                        case 68: // press d
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'dance'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 83: // press s
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'sleeping'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 85: // press u
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'dressup'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 77: // press m
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'magic'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 76: // press l
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'love'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                        case 84: // press t
                            event = new cc.EventCustom('action');
                            event.setUserData({
                                player_id: +Config.ls.getItem('controller'),
                                action: 'tantrum'
                            });
                            cc.eventManager.dispatchEvent(event);
                            break;
                    }
                }
            }, this);
        }
    },

    sendGetRequest: function() {
        var that = this;
        var xhr = cc.loader.getXMLHttpRequest();

        xhr.open("GET", "http://localhost:3000/instruction.json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //var httpStatus = xhr.statusText;
                var responseObject = JSON.parse(xhr.responseText);

                if(responseObject.empty) {
                    //that.xhrStatusLabel.setString("No data");
                    //console.log("no data");
                } else {
                    //that.xhrStatusLabel.setString(responseObject.data);
                    console.log(responseObject.data);
                    that.commandSequence.push(responseObject.data);
                }
            } else {
                //that.xhrStatusLabel.setString("Serve Problem, Error Code: " + xhr.status);
            }
        };

        xhr.send();
    }
});
