/**
 * Created by maccha on 8/10/14.
 */
var Constants = {
    bg: {
        width: 1536,
        height: 2048
    },
    space_matrix: [
        [null, null, {x:769, y:1624}, {x:993, y:1585}, {x:1300, y:1600} ],
        [{x:246, y:1337}, {x:523, y:1370}, {x:743, y:1356}, {x:1004, y:1336}, {x:1265, y:1354}],
        [{x:200, y:1112}, {x:479, y:1081}, {x:754, y:1135}, {x:1003, y:1082}, {x:1287, y:1058}],
        [{x:256, y:823}, {x:515, y:866}, {x:777, y:847}, {x:1028, y:861}, {x:1313, y:813}],
        [{x:211, y:623}, {x:496, y:560}, {x:769, y:576}, {x:1012, y:595}, null]
    ],
    forest_matrix: [
        [{x:251, y:1584}, {x:485, y:1551}, {x:726, y:1567}, {x:982, y:1574}, {x:1226, y:1566} ],
        [{x:236, y:1307}, {x:495, y:1330}, {x:733, y:1291}, {x:1004, y:1336}, {x:1265, y:1354}],
        [{x:238, y:1082}, {x:479, y:1061}, {x:754, y:1073}, {x:1013, y:1082}, {x:1287, y:1068}],
        [{x:236, y:840}, {x:505, y:836}, {x:737, y:853}, {x:1008, y:861}, {x:1298, y:843}],
        [{x:231, y:623}, {x:496, y:569}, {x:726, y:576}, null, {x:1312, y:595}]
    ],
    // fox monkey pig rabbit
    dancingFramesLen: [16, 45, 20, 37],
    dressupFramesLen: [6, 45, 10, 53],
    loveFramesLen: [16, 13, 20, 16],
    magicFramesLen: [32, 9, 5, 61],
    sleepFramesLen: [5, 20, 45, 18],
    tantrumFramesLen: [16, 4, 22, 19]
};

var Config = {
    ls: null,
    default_bg: "forest",
    default_princess_id_1: 0,
    default_princess_id_2: 1,
    default_controller_id: 1,


    init: function() {
        this.ls = cc.sys.localStorage;
        this.ls.setItem('bg', this.default_bg);
        this.ls.setItem('princess1', this.default_princess_id_1);
        this.ls.setItem('princess2', this.default_princess_id_2);
        this.ls.setItem('controller', this.default_controller_id);
    }
}

Config.init();