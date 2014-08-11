/**
 * Created by maccha on 8/10/14.
 */
var Constants = {
    bg: {
        width: 1536,
        height: 2048
    },
    space_matrix: [
        [null, null, {x:745, y:1824}, {x:993, y:1785}, {x:1300, y:1846} ],
        [{x:237, y:1534}, {x:523, y:1570}, {x:733, y:1576}, {x:1004, y:1556}, {x:1265, y:1554}],
        [{x:200, y:1312}, {x:479, y:1281}, {x:754, y:1335}, {x:1003, y:1282}, {x:1287, y:1278}],
        [{x:256, y:1023}, {x:515, y:1066}, {x:777, y:1047}, {x:1028, y:1081}, {x:1313, y:1033}],
        [{x:211, y:823}, {x:488, y:773}, {x:769, y:786}, {x:1012, y:815}, null]
    ]
};

var Config = {
    ls: null,
    default_bg: "space",
    default_princess: "pink",

    init: function(){
        this.ls = cc.sys.localStorage;
        this.ls.setItem('bg', this.default_bg);
        this.ls.setItem('princess', this.default_princess);
    }
}

Config.init();