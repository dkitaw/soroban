var CONST = {
    SOROBAN: {
        HEIGHT: 318,
        WIDTH: 1316
    },
    FIELD: {
        X: 58,
        Y: 25,
        KETA: 15,
        KETAWIDTH: 80,
        TOPHEIGHT: 60,
        MIDDLEHEIGHT: 10,
        BOTTOMHEIGHT: 180
    },
    TAMA: {
        HEIGHT: 40,
        WIDTH: 84
    }
};

CONST.FIELD.WIDTH = CONST.FIELD.KETA * CONST.FIELD.KETAWIDTH;
CONST.FIELD.HEIGHT = CONST.FIELD.TOPHEIGHT + CONST.FIELD.MIDDLEHEIGHT + CONST.FIELD.BOTTOMHEIGHT;

var Soroban = function (element) {
    this.onResize = function () {
        this.width = element.width('80%').width();
        this.height = element.height(this.width / CONST.SOROBAN.WIDTH * CONST.SOROBAN.HEIGHT + 'px').height();
        this.zoom = this.width / CONST.SOROBAN.WIDTH;

        element.css({ 'margin-top': $(window).height() / 2 - this.height / 2 });
    };

    this.onResize();
    $(window).resize(this.onResize);

    this.tamas = new Array();
    for (var i = 0; i < CONST.FIELD.KETA; i++) {
        var ketaArray = new Array();
        for (var j = 0; j < 5; j++) {
            ketaArray.push(new Tama(i, j));
        }
        this.tamas.push(ketaArray);
    }

    this.arrange = function () {
        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            for (var j = 0; j < 5; j++) {
                this.tamas[i][j].allocate(this.zoom);
            }
        }
    };
};

var Tama = function (keta, number) {
    this.keta = keta;
    this.number = number;

    var tamaId = 'tama' + keta + '_' + number;
    var shadowId = 'shadow' + keta + '_' + number;

    var $tama = $('<img>', {
        id: tamaId,
        class: 'tama',
        src: 'img/tama.png'
    }).appendTo('#tamas');

    var $shadow = $('<img>', {
        id: shadowId,
        class: 'shadow',
        src: 'img/shadow.png'
    }).appendTo('#shadows');

    this.state = false;

    this.allocate = function (zoom) {
    }

    this.virtualX = function () {
        return CONST.FIELD.X
            + CONST.FIELD.KETAWIDTH * (CONST.FIELD.KETA - this.keta - 0.5)
            - CONST.TAMA.WIDTH / 2;
    }

    this.virtualY = function () {
        if (this.number === 0) {
            if (this.state) {
                return CONST.FIELD.Y + CONST.FIELD.TOPHEIGHT - CONST.TAMA.HEIGHT;
            } else {
                return CONST.FIELD.Y;
            }
        } else {
            if (this.state) {
                return CONST.FIELD.Y
                    + CONST.FIELD.TOPHEIGHT
                    + CONST.FIELD.MIDDLEHEIGHT
                    + CONST.TAMA.HEIGHT * (this.number - 1);
            } else {
                return CONST.FIELD.Y
                    + CONST.FIELD.HEIGHT
                    - CONST.TAMA.HEIGHT * (5 - this.number);
            }
        }
    }
}

$(document).ready(function () {
    soroban = new Soroban($('#soroban'));
});