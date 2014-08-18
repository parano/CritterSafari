/**
 * Created by maccha on 8/11/14.
 */


var AudioPlayer = {
    audioEngine: null,
    init: function() {
        // set default volume
        this.audioEngine = cc.audioEngine;
        this.audioEngine.setEffectsVolume(0.5);
        this.audioEngine.setMusicVolume(0.5);
    },

    stopMusicAfter: function(delay) {
        var that = this;
        setTimeout(function() {
            cc.log("stop!");
            that.audioEngine.stopMusic();
        }, delay * 1000);
    },

    playDancingEffect: function(delay){
        //cc.log("dancing sound effect playing...");
        this.audioEngine.playMusic(res.dancing_mp3, false);
        this.stopMusicAfter(delay);
    },

    playMagicEffect: function(delay){
        this.audioEngine.playMusic(res.magic_mp3, false);
        this.stopMusicAfter(delay);
    },

    playTantrumEffect: function(delay){
        this.audioEngine.playMusic(res.tantrum_mp3, false);
        this.stopMusicAfter(delay);
    },

    playLoveEffect: function(delay){
        this.audioEngine.playMusic(res.love_mp3, false);
        this.stopMusicAfter(delay);
    },

    playSleepEffect: function(delay){
        this.audioEngine.playMusic(res.sleeping_mp3, false);
        this.stopMusicAfter(delay);
    },

    playDressUpEffect: function(delay){
        this.audioEngine.playMusic(res.dressup_mp3, false);
        this.stopMusicAfter(delay);
    },

    stopAllMusic: function(){
        this.audioEngine.stopAllMusic();
    }
};

AudioPlayer.init();

/*
 * sample code from cocos2d test

var playMusic = function () {
    cc.log("play background music");
    audioEngine.playMusic(MUSIC_FILE, false);
};

var stopMusic = function () {
    cc.log("stop background music");
    audioEngine.stopMusic();
};


// is background music playing
var isMusicPlaying = function () {
    if (audioEngine.isMusicPlaying()) {
        cc.log("background music is playing");
    }
    else {
        cc.log("background music is not playing");
    }
};

var playEffect = function () {
    cc.log("play effect");
    soundId = audioEngine.playEffect(EFFECT_FILE);
};

var playEffectRepeatly = function () {
    cc.log("play effect repeatly");
    soundId = audioEngine.playEffect(EFFECT_FILE, true);
};

var stopEffect = function () {
    cc.log("stop effect");
    audioEngine.stopEffect(soundId);
};

*/