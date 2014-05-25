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

var digitToState = function (digit, 珠) {
    if (珠 === 0) {
        return digit >= 5;
    } else {
        return (digit % 5) >= 珠
    }
};

var 算盤 = function (element) {
    var そろばん = this;

    this.桁 = new Array();
    for (var i = 0; i < CONST.FIELD.KETA; i++) {
        this.桁.push(new Keta(i, this));
    }

    this.arrange = function () {
        for (var i = 0; i < CONST.FIELD.KETA; i++) {
            for (var j = 0; j < 5; j++) {
                そろばん.桁[i].珠[j].allocate(this.zoom);
            }
        }
    };

    this.onResize = function () {
        そろばん.width = element.width('80%').width();
        そろばん.height = element.height(そろばん.width / CONST.SOROBAN.WIDTH * CONST.SOROBAN.HEIGHT + 'px').height();
        そろばん.zoom = そろばん.width / CONST.SOROBAN.WIDTH;

        element.css({ 'margin-top': $(window).height() / 2 - そろばん.height / 2 });

        そろばん.arrange();
    };

    this.onResize();
    $(window).resize(this.onResize);

    this.queue = new Array();
    this.running = false;

    this.run = function () {
        if (そろばん.running === false) {
            そろばん.dequeue();
        }
    };

    this.dequeue = function (seBuzz) {
        if (そろばん.running && seBuzz) {
            seBuzz.stop();
            seBuzz.play();
        }
        if (そろばん.queue.length > 0) {
            そろばん.running = true;
            そろばん.queue.shift()();
        } else {
            そろばん.running = false;
        }
    };

    this.enqueue = function (item) {
        そろばん.queue.push(item);
        そろばん.run();
        console.log(そろばん.queue);
    };

    this.addDigit = function (桁, digit) {
        var counter = 桁;
        if (digit >= 0) {
            var carry = digit;
            while (carry !== 0 && counter < CONST.FIELD.KETA) {
                var sum = そろばん.桁[counter].digit + carry;
                そろばん.enqueue((function (counter, sum) { // fuckin' ES5 trick
                    そろばん.桁[counter].digit = sum % 10;
                    return function () {
                        そろばん.桁[counter].set(sum % 10);
                    };
                })(counter, sum));
                carry = Math.floor(sum / 10);
                counter++;
            }
        } else {
            var carry = -digit;
            while (carry !== 0 && counter < CONST.FIELD.KETA) {
                var sum = 10 + そろばん.桁[counter].digit - carry;
                そろばん.enqueue((function (counter, sum) { // fuckin' ES5 trick
                    そろばん.桁[counter].digit = sum % 10;
                    return function () {
                        そろばん.桁[counter].set(sum % 10);
                    };
                })(counter, sum));
                carry = 1 - Math.floor(sum / 10);
                counter++;
            }
        }
    };

    this.addNumber = function (桁, number) {
        var digits = new Array();
        if (number >= 0) {
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                digits.push(number % 10);
                number = Math.floor(number / 10);
            }
            for (var i = CONST.FIELD.KETA - 1; i >= 桁; i--) {
                そろばん.addDigit(i, digits[i - 桁]);
            }
        } else {
            number = -number;
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                digits.push(number % 10);
                number = Math.floor(number / 10);
            }
            for (var i = CONST.FIELD.KETA - 1; i >= 桁; i--) {
                そろばん.addDigit(i, -digits[i - 桁]);
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
                そろばん.enqueue((function (i, digit) { // fuckin' ES5 trick
                    そろばん.桁[i].digit = digit;
                    return function () {
                        そろばん.桁[i].set(digit);
                    };
                })(i, digits[i]));
            }
        } else {
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                そろばん.enqueue((function (i, digit) { // fuckin' ES5 trick
                    そろばん.桁[i].digit = digit;
                    return function () {
                        そろばん.桁[i].set(digit);
                    };
                })(i, digits[i]));
            }
        }
    };

    this.clear = function () {
        そろばん.enqueue(function () {
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                そろばん.桁[i].digit = 0;
            }

            var changes = new Array();
            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                for (var j = 0; j < 5; j++) {
                    if (digitToState(そろばん.桁[i].digit, j) === false ^ j !== 0) {
                        changes.push(そろばん.桁[i].珠[j]);
                    }
                }
            }

            for (var i = 0; i < CONST.FIELD.KETA; i++) {
                そろばん.桁[i].digit = 0;
            }

            if (changes.length > 0) {
                そろばん.enqueue(function () {
                    changes.shift().switch(function () {
                        そろばん.dequeue(se.clitter);
                    });
                    changes.forEach(function (change) {
                        change.switch();
                    });
                });

                そろばん.enqueue(function () {
                    setTimeout(function () {
                        そろばん.dequeue();
                    }, 500)
                })
            } else {
                そろばん.dequeue();
            }

            for (var i = CONST.FIELD.KETA - 1; i >= 0; i--) {
                そろばん.enqueue((function (i) { // fuckin' ES5 trick
                    return function () {
                        そろばん.桁[i].set(0);
                    };
                })(i));
            }
        });
    };
};

var Keta = function (number, そろばん) {
    var 桁 = this;

    this.桁 = number;
    this.digit = 0;

    this.珠 = new Array();
    for (var i = 0; i < 5; i++) {
        this.珠.push(new Tama(this.桁, i));
    }

    this.set = function (digit) {
        var changes = new Array();
        for (var i = 1; i <= 4; i++) {
            if (桁.珠[i].state === false ^ (digit % 5) < i) {
                changes.push(桁.珠[i]);
            }
        }

        if (changes.length > 0) {
            if (桁.珠[0].state === false ^ digit < 5) {
                changes.shift().switch(function () {
                    桁.珠[0].switch(function () {
                        そろばん.dequeue(se.crack);
                    });
                });
            } else {
                changes.shift().switch(function () {
                    そろばん.dequeue(se.crack);
                });
            }
            changes.forEach(function (change) {
                change.switch();
            });
        } else if (桁.珠[0].state === false ^ digit < 5) {
            桁.珠[0].switch(function () {
                そろばん.dequeue(se.crack);
            });
        } else {
            そろばん.dequeue();
        }
    };
};

var Tama = function (桁, number) {
    this.桁 = 桁;
    this.number = number;

    var 珠Id = '珠' + 桁 + '_' + number;
    var 影Id = '影' + 桁 + '_' + number;

    var $珠 = $('<img>', {
        id: 珠Id,
        class: '珠',
        src: 'img/tama.png'
    }).appendTo('#珠');

    var $影 = $('<img>', {
        id: 影Id,
        class: '影',
        src: 'img/shadow.png'
    }).appendTo('#影');

    this.state = false;
    this.zoom = 1;

    this.allocate = function (zoom) {
        this.zoom = zoom;
        $珠.css(this.珠CSS());
        $影.css(this.影CSS());
    }

    this.switch = function (callback) {
        this.state = !(this.state);
        $珠.animate(this.珠CSS(), CONST.SPEED, 'swing', function () {
            if (callback) callback();
        });
        $影.animate(this.影CSS(), CONST.SPEED, 'swing');
    }

    this.virtualX = function () {
        return CONST.FIELD.X
            + CONST.FIELD.KETAWIDTH * (CONST.FIELD.KETA - this.桁 - 0.5);
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

    this.珠CSS = function () {
        return {
            top: (this.virtualY() - CONST.TAMA.HEIGHT / 2) * this.zoom + 'px',
            left: (this.virtualX() - CONST.TAMA.WIDTH / 2) * this.zoom + 'px',
            width: CONST.TAMA.WIDTH * this.zoom,
            height: CONST.TAMA.HEIGHT * this.zoom
        };
    };

    this.影CSS = function () {
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

var Dealer = function (そろばん, element) {
    var dealer = this;

    this.そろばん = そろばん;
    this.element = element;

    
};

$(document).ready(function () {
    そろばん = new 算盤($('#そろばん'));

    そろばん.setNumber(new Date() / 1000);

    setInterval(function () {
        そろばん.addNumber(0, Math.random() * 10000);
    }, 1000);

    dealer = new Dealer();
});