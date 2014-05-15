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
    },
    SHADOW: {
        HEIGHT: 80,
        WIDTH: 116
    }
};

CONST.FIELD.WIDTH = CONST.FIELD.KETA * CONST.FIELD.KETAWIDTH;
CONST.FIELD.HEIGHT = CONST.FIELD.TOPHEIGHT + CONST.FIELD.MIDDLEHEIGHT + CONST.FIELD.BOTTOMHEIGHT;

var Soroban = function (element) {
    var soroban = this;

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
                soroban.tamas[i][j].allocate(this.zoom);
            }
        }
    };
    this.arrange();

    this.onResize = function () {
        soroban.width = element.width('80%').width();
        soroban.height = element.height(soroban.width / CONST.SOROBAN.WIDTH * CONST.SOROBAN.HEIGHT + 'px').height();
        soroban.zoom = soroban.width / CONST.SOROBAN.WIDTH;

        element.css({ 'margin-top': $(window).height() / 2 - soroban.height / 2 });

        soroban.arrange();
    };

    this.onResize();
    $(window).resize(this.onResize);
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
        $tama.css({
            top: (this.virtualY() - CONST.TAMA.HEIGHT / 2) * zoom + 'px',
            left: (this.virtualX() - CONST.TAMA.WIDTH / 2) * zoom + 'px',
            width: CONST.TAMA.WIDTH * zoom,
            height: CONST.TAMA.HEIGHT * zoom
        });
        $shadow.css({
            top: (this.virtualY() - CONST.SHADOW.HEIGHT / 2 + 5) * zoom + 'px',
            left: (
                    (this.virtualX() - CONST.SOROBAN.WIDTH / 2) * 0.98
                    + CONST.SOROBAN.WIDTH / 2
                    - CONST.SHADOW.WIDTH / 2
                ) * zoom + 'px',
            width: CONST.SHADOW.WIDTH * zoom,
            height: CONST.SHADOW.HEIGHT * zoom
        });
    }

    this.virtualX = function () {
        return CONST.FIELD.X
            + CONST.FIELD.KETAWIDTH * (CONST.FIELD.KETA - this.keta - 0.5);
    }

    this.virtualY = function () {
        if (this.number === 0) {
            if (this.state) {
                return CONST.FIELD.Y + CONST.FIELD.TOPHEIGHT - CONST.TAMA.HEIGHT / 2;
            } else {
                return CONST.FIELD.Y + CONST.TAMA.HEIGHT / 2;
            }
        } else {
            if (this.state) {
                return CONST.FIELD.Y
                    + CONST.FIELD.TOPHEIGHT
                    + CONST.FIELD.MIDDLEHEIGHT
                    + CONST.TAMA.HEIGHT * (this.number - 0.5);
            } else {
                return CONST.FIELD.Y
                    + CONST.FIELD.HEIGHT
                    - CONST.TAMA.HEIGHT * (4.5 - this.number);
            }
        }
    }
}

$(document).ready(function () {
    soroban = new Soroban($('#soroban'));
});