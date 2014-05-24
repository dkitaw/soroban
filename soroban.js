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
    SPEED: 60
};

CONST.FIELD.WIDTH = CONST.FIELD.KETA * CONST.FIELD.KETAWIDTH;
CONST.FIELD.HEIGHT = CONST.FIELD.TOPHEIGHT + CONST.FIELD.MIDDLEHEIGHT + CONST.FIELD.BOTTOMHEIGHT;

var se = {
    crack: new buzz.sound('se/crack', {
        formats: ['mp3', 'wav']
    }),
    clitter: new buzz.sound('se/clitter', {
        formats: ['mp3', 'wav']
    })
};

var digitToState = function (digit, tama) {
    if (tama === 0) {
        return digit >= 5;
    } else {
        return (digit % 5) >= tama
    }
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

    this.onResize = function () {
        soroban.width = element.width('80%').width();
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

    this.dequeue = function (seBuzz) {
        if (soroban.running && seBuzz) {
            seBuzz.stop();
            seBuzz.play();
        }
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
        console.log(soroban.queue);
    };

    this.addDigit = function (keta, digit) {
        var counter = keta;
        if (digit >= 0) {
            var carry = digit;
            while (carry !== 0 && counter < CONST.FIELD.KETA) {
                var sum = soroban.ketas[counter].digit + carry;
                soroban.enqueue((function (counter, sum) { // fuckin' ES5 trick
                    soroban.ketas[counter].digit = sum % 10;
                    return function () {
                        soroban.ketas[counter].set(sum % 10);
                    };
                })(counter, sum));
                carry = Math.floor(sum / 10);
                counter++;
            }
        } else {
            var carry = -digit;
            while (carry !== 0 && counter < CONST.FIELD.KETA) {
                var sum = 10 + soroban.ketas[counter].digit - carry;
                soroban.enqueue((function (counter, sum) { // fuckin' ES5 trick
                    soroban.ketas[counter].digit = sum % 10;
                    return function () {
                        soroban.ketas[counter].set(sum % 10);
                    };
                })(counter, sum));
                carry = 1 - Math.floor(sum / 10);
                counter++;
            }
        }
    };

    this.addNumber = function (keta, number) {
        var digits = new Array();
        if (number >= 0) {
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                digits.push(number % 10);
                number = Math.floor(number / 10);
            }
            for (var i = CONST.FIELD.KETA - 1; i >= keta; i--) {
                soroban.addDigit(i, digits[i - keta]);
            }
        } else {
            number = -number;
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                digits.push(number % 10);
                number = Math.floor(number / 10);
            }
            for (var i = CONST.FIELD.KETA - 1; i >= keta; i--) {
                soroban.addDigit(i, -digits[i - keta]);
            }
        }
    };

    this.setNumber = function (number, desc) {
        var digits = new Array();
        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            digits.push(number % 10);
            number = Math.floor(number / 10);
        }

        if (!desc) {
            for (var i = CONST.FIELD.KETA - 1; i >= 0; i--) {
                soroban.enqueue((function (i, digit) { // fuckin' ES5 trick
                    soroban.ketas[i].digit = digit;
                    return function () {
                        soroban.ketas[i].set(digit);
                    };
                })(i, digits[i]));
            }
        } else {
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                soroban.enqueue((function (i, digit) { // fuckin' ES5 trick
                    soroban.ketas[i].digit = digit;
                    return function () {
                        soroban.ketas[i].set(digit);
                    };
                })(i, digits[i]));
            }
        }
    };

    this.clear = function () {
        var changes = new Array();
        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            for (var j = 0; j < 5; j++) {
                if (digitToState(soroban.ketas[i].digit, j) === false ^ j !== 0) {
                    changes.push(soroban.ketas[i].tamas[j]);
                }
            }
        }

        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            soroban.ketas[i].digit = 0;
        }

        if (changes.length > 0) {
            soroban.enqueue(function () {
                changes.shift().switch(function () {
                    soroban.dequeue(se.clitter);
                });
                changes.forEach(function (change) {
                    change.switch();
                });
            });

            soroban.enqueue(function () {
                setTimeout(function () {
                    soroban.dequeue();
                }, 500)
            })
        } else {
            soroban.dequeue();
        }

        for (var i = CONST.FIELD.KETA - 1; i >= 0; i--) {
            soroban.enqueue((function (i) { // fuckin' ES5 trick
                return function () {
                    soroban.ketas[i].set(0);
                };
            })(i));
        }
    };
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
                    keta.tamas[0].switch(function () {
                        soroban.dequeue(se.crack);
                    });
                });
            } else {
                changes.shift().switch(function () {
                    soroban.dequeue(se.crack);
                });
            }
            changes.forEach(function (change) {
                change.switch();
            });
        } else if (keta.tamas[0].state === false ^ digit < 5) {
            keta.tamas[0].switch(function () {
                soroban.dequeue(se.crack);
            });
        } else {
            soroban.dequeue();
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
        $tama.animate(this.tamaCSS(), CONST.SPEED, 'swing', function () {
            if (callback) callback();
        });
        $shadow.animate(this.shadowCSS(), CONST.SPEED, 'swing');
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

var Dealer = function (soroban, element) {
    var dealer = this;

    this.soroban = soroban;
    this.element = element;

    
};

$(document).ready(function () {
    soroban = new Soroban($('#soroban'));

    soroban.setNumber(new Date() / 1000);

    setInterval(function () {
        soroban.addNumber(0, Math.random() * 10000);
    }, 1000);
});