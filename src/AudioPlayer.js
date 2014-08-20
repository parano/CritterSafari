/**
 * Created by Chaoyu Yang on 8/11/14.
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
            that.audioEngine.stopMusic();
        }, delay * 1000);
    },

    playDancingEffect: function(delay){
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