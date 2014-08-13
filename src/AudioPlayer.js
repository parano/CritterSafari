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

    playDancingEffect: function(){
        //cc.log("dancing sound effect playing...");
        this.audioEngine.playMusic(res.effect_test_mp3, false);
    },

    playMagicEffect: function(){
        this.audioEngine.playMusic(res.effect_test_mp3, false);
    },

    playTantrumEffect: function(){
        this.audioEngine.playMusic(res.effect_test_mp3, false);
    },

    playLoveEffect: function(){
        this.audioEngine.playMusic(res.effect_test_mp3, false);
    },

    playSleepEffect: function(){
        this.audioEngine.playMusic(res.effect_test_mp3, false);
    },

    playDressUpEffect: function(){
        this.audioEngine.playMusic(res.effect_test_mp3, false);
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