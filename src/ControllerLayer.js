/**
 * Created by Chaoyu Yang on 8/16/14.
 */
var ControllerLayer = cc.Layer.extend({
    commandSequence: [],
    color_id: null,
    object_id: null,

    ctor:function () {
        this._super();
        this.commandSequence = [];

        this.color_id = {
            pink: 0,
            green: 1,
            blue: 2
        };

        this.object_id = {
            fox: 0,
            monkey: 1,
            pig: 2,
            rabbit: 3
        };

        this.init();
    },

    init:function () {
        var that = this;
        this._super();

        // Using Keyboard Event for Wizard of oz user testing
        //this.keyboardEventListener();

        this.initListener();

        setInterval(function(){
            that.sendGetRequest();
            that.dispatchInstruction();
        }, 200);
    },

    initListener: function() {
        var that = this;
        this.runNextListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: 'runNext',
            callback: function(event){
                that.executeNext();
            }
        });
        cc.eventManager.addListener(this.runNextListener, 1);
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
    },

    // lablelling if character is running a sequence
    isRunning: false,
    dispatchInstruction: function() {
        if(this.commandSequence.length > 0) {
            var that = this;
            var commandObject = this.commandSequence.shift();
            var event;

            switch(commandObject.type) {
                case 'show character':
                    event = new cc.EventCustom('updateCharacter');
                    event.setUserData({
                        player_id: +Config.ls.getItem('controller'),
                        event: 'color',
                        value: this.color_id[commandObject.value],
                        isRunning: this.isRunning
                    });
                    cc.eventManager.dispatchEvent(event);
                    break;
                case 'hide character':
                    event = new cc.EventCustom('updateCharacter');
                    event.setUserData({
                        player_id: +Config.ls.getItem('controller'),
                        event: 'updateVisibility',
                        value: false,
                        isRunning: this.isRunning
                    });
                    cc.eventManager.dispatchEvent(event);
                    break;
                case 'add object':
                    event = new cc.EventCustom('objects');
                    event.setUserData({
                        targetObject: this.object_id[commandObject.value],
                        visible: true,
                        isRunning: this.isRunning
                    });
                    cc.eventManager.dispatchEvent(event);
                    break;
                case 'remove object':
                    event = new cc.EventCustom('objects');
                    event.setUserData({
                        targetObject: this.object_id[commandObject.value],
                        visible: false,
                        isRunning: this.isRunning
                    });
                    cc.eventManager.dispatchEvent(event);
                    break;
                case 'set bg':
                    event = new cc.EventCustom('changeSetting');
                    event.setUserData({
                        target: 'board',
                        bg: commandObject.value,
                        isRunning: this.isRunning
                    });
                    cc.eventManager.dispatchEvent(event);
                    break;
                case 'run':
                    this.run(commandObject.steps, commandObject.func);
                    break;
                default:
                    break;
            }
        }
    },

    steps: null,
    funcSteps: null,
    run: function(steps, funcSteps) {
        if(!this.isRunning) {
            this.isRunning = true;
            this.steps = steps;
            this.funcSteps = funcSteps;
            this.executeNext();
        }
    },

    executeNext: function() {
        var that = this;
        if(this.steps && this.steps.length > 0){
            var current_step = this.steps.shift();
            console.log("current step: " + current_step);
            if(current_step === 'function') {
                if(this.funcSteps) {
                    this.steps = this.funcSteps.concat(this.steps);
                }
                this.executeNext();
            } else {
                var event = new cc.EventCustom('action');
                event.setUserData({
                    player_id: +Config.ls.getItem('controller'),
                    action: current_step
                });
                cc.eventManager.dispatchEvent(event);
            }
        } else {
            setTimeout(function(){
                that.resetGameSettings();
            }, 1200);
        }
    },

    resetController: function(){
        this.isRunning = false;
        this.steps = null;
        this.funcSteps = null;
    },

    resetGameSettings: function() {
        var event = new cc.EventCustom('changeSetting');
        event.setUserData({
            target: 'reset'
        });
        cc.eventManager.dispatchEvent(event);
    }
});
