$(document).ready(function () {
    var s = $(".sticky-section .each-box-fort");
    var o = "#9AC7FF";
    var c = s.find(".scroll-card");
    var d = c.length;
    var r = [];
    c.each(function (s) {
        var o = (s + 1) * 18 + 100;
        $(this).css("top", o + "px");
        r.push($(this).offset().top)
    });
    function l(s, o) {
        s != d ? scaleVal = 1 - (d - s) * o : scaleVal = 1;
        $(c).eq(s - 1).css("transform", "scale(" + scaleVal + ",1)")
    }
    var h = ["#1fbe8e", "#7a53ff", "#ffcb49", "#4583ff", "#ff6a4c"];
    $(window).scroll(function () {
        var s = $(window).scrollTop();
        for (var o = 0; o < d; o++) {
            var a = r[o] - s;
            var e = c.eq(o).find(".bs-shad");
            var i = c.eq(o).outerHeight();
            var n = i;
            var t = 7e-4;
            if (d > 6) {
                t = 2e-4
            }
            if (a <= 240 && !e.hasClass("box-shadow-added")) {
                e.css("box-shadow", "0 0 10px " + h[o % h.length]);
                e.addClass("box-shadow-added")
            } else if (a > 240 && e.hasClass("box-shadow-added")) {
                e.css("box-shadow", "none");
                e.removeClass("box-shadow-added")
            }
            while (a < n) {
                l(o + 1, t);
                n -= 50;
                if (d > 6) {
                    t += 2e-4
                } else {
                    t += 7e-4
                }
            }
            if (a > i + 50) {
                c.eq(o).css("transform", "scale(1,1)")
            }
        }
    })

});
