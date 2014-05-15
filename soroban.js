sorobanHeight = 318;
sorobanWidth = 1316;

var Soroban = function (element) {
    this.onResize = function () {
        this.width = element.width('80%').width();
        this.height = element.height(this.width / sorobanWidth * sorobanHeight + 'px').height();

        element.css({ 'margin-top': $(window).height() / 2 - this.height / 2 });
    };

    this.onResize();
    $(window).resize(this.onResize);
};

$(document).ready(function () {
    soroban = new Soroban($('#soroban'));
});