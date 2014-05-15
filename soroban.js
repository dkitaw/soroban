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
    },
    SPEED: 200
};

CONST.FIELD.WIDTH = CONST.FIELD.KETA * CONST.FIELD.KETAWIDTH;
CONST.FIELD.HEIGHT = CONST.FIELD.TOPHEIGHT + CONST.FIELD.MIDDLEHEIGHT + CONST.FIELD.BOTTOMHEIGHT;

var se = {
    crack: new buzz.sound('se/crack.mp3')
};

var Soroban = function (element) {
    var soroban = this;

    this.ketas = new Array();
    for (var i = 0; i < CONST.FIELD.KETA; i++) {
        this.ketas.push(new Keta(i, this));
    }

    this.arrange = function () {
        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            for (var j = 0; j < 5; j++) {
                soroban.ketas[i].tamas[j].allocate(this.zoom);
            }
        }
    };
    this.arrange();

    this.onResize = function () {
        soroban.width = element.width('60%').width();
        soroban.height = element.height(soroban.width / CONST.SOROBAN.WIDTH * CONST.SOROBAN.HEIGHT + 'px').height();
        soroban.zoom = soroban.width / CONST.SOROBAN.WIDTH;

        element.css({ 'margin-top': $(window).height() / 2 - soroban.height / 2 });

        soroban.arrange();
    };

    this.onResize();
    $(window).resize(this.onResize);

    this.queue = new Array();
    this.running = false;

    this.run = function () {
        if (soroban.running === false) {
            soroban.dequeue();
        }
    };

    this.dequeue = function () {
        if (soroban.queue.length > 0) {
            soroban.running = true;
            soroban.queue.shift()();
        } else {
            soroban.running = false;
        }
    };

    this.enqueue = function (item) {
        soroban.queue.push(item);
        soroban.run();
    };

    this.enqueue(function () {
        soroban.ketas[0].set(3);
    });
    this.enqueue(function () {
        soroban.ketas[1].set(8);
    });
    this.enqueue(function () {
        soroban.ketas[2].set(2);
    });
    this.enqueue(function () {
        soroban.ketas[3].set(1);
    });
    this.enqueue(function () {
        soroban.ketas[4].set(9);
    });
    this.enqueue(function () {
        soroban.ketas[5].set(4);
    });
};

var Keta = function (number, soroban) {
    var keta = this;

    this.keta = number;
    this.digit = 0;

    this.tamas = new Array();
    for (var i = 0; i < 5; i++) {
        this.tamas.push(new Tama(this.keta, i));
    }

    this.set = function (digit) {
        var changes = new Array();
        for (var i = 1; i <= 4; i++) {
            if (keta.tamas[i].state === false ^ (digit % 5) < i) {
                changes.push(keta.tamas[i]);
            }
        }

        if (changes.length > 0) {
            if (keta.tamas[0].state === false ^ digit < 5) {
                changes.shift().switch(function () {
                    keta.tamas[0].switch(soroban.dequeue);
                });
            } else {
                changes.shift().switch(soroban.dequeue);
            }
            changes.forEach(function (change) {
                change.switch();
            });
        } else if (keta.tamas[0].state === false ^ digit < 5) {
            keta.tamas[0].switch(soroban.dequeue);
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
    this.zoom = 1;

    this.allocate = function (zoom) {
        this.zoom = zoom;
        $tama.css(this.tamaCSS());
        $shadow.css(this.shadowCSS());
    }

    this.switch = function (callback) {
        this.state = !(this.state);
        $tama.animate(this.tamaCSS(), CONST.SPEED, 'linear', function () {
            se.crack.stop();
            se.crack.play();
            if (callback) callback();
        });
        $shadow.animate(this.shadowCSS(), CONST.SPEED, 'linear');
    }

    this.virtualX = function () {
        return CONST.FIELD.X
            + CONST.FIELD.KETAWIDTH * (CONST.FIELD.KETA - this.keta - 0.5);
    };

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
    };

    this.tamaCSS = function () {
        return {
            top: (this.virtualY() - CONST.TAMA.HEIGHT / 2) * this.zoom + 'px',
            left: (this.virtualX() - CONST.TAMA.WIDTH / 2) * this.zoom + 'px',
            width: CONST.TAMA.WIDTH * this.zoom,
            height: CONST.TAMA.HEIGHT * this.zoom
        };
    };

    this.shadowCSS = function () {
        return {
            top: (this.virtualY() - CONST.SHADOW.HEIGHT / 2 + 5) * this.zoom + 'px',
            left: (
                    (this.virtualX() - CONST.SOROBAN.WIDTH / 2) * 0.98
                    + CONST.SOROBAN.WIDTH / 2
                    - CONST.SHADOW.WIDTH / 2
                ) * this.zoom + 'px',
            width: CONST.SHADOW.WIDTH * this.zoom,
            height: CONST.SHADOW.HEIGHT * this.zoom
        };
    }
};

$(document).ready(function () {
    soroban = new Soroban($('#soroban'));
});