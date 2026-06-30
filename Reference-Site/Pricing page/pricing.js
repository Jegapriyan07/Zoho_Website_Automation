if (window.location.href.includes("/it/") && global_getUrlParam("itpricingtest") == "") {
    let e = window.location.pathname.replace("/it/", "/") + "?zredirect=f";
    window.location.replace(e)
}
var zCurrentCurrencySym = "", currencyOrderArray, currencySymbolArray, currencyArray, cTextVal, countryCodeToBeUsed = "-";
$(document).ready(function() {
    countryCodeToBeUsed = CountryCode;
    $(".zwc_comp_inner_heading").attr({
        tabindex: "0",
        role: "button",
        "aria-expanded": "false"
    });
    $(".pricing-tab>span").attr({
        tabindex: "0",
        role: "button"
    });
    $(".label-text.yearly").attr("aria-label", $(".save-tab").first().text());
    $(".zwc_comp_row").attr("role", "row");
    $(".zwc_comp_cell").attr("role", "cell");
    $(".zwc_comp_inner_details").attr("role", "table");
    $(".pricing-faq li h3").attr("role", "presentation");
    $(".pricing-faq li h3 button").attr("aria-expanded", "false");
    $(".zwc_tick").attr({
        role: "text",
        "aria-label": Drupal.t("available")
    });
    $(".zwc_info_tooltip_icon,.zwc_checkmark,.feature-box ul li.has-tooltip .price-tooltip, .highlighted-box p.has-tooltip .price-tooltip,.save-tab").attr("aria-hidden", "true");
    $(".zwc_comp_cell.has-tooltip tooltip").attr({
        role: "tooltip",
        tabindex: "0"
    });
    $('<span class="zwc_pointer_circle" aria-hidden="true"></span>').appendTo($(".zwc_slide"));
    $(".zwc_comp_inner_heading.zwc_slide").on("click keydown", function(e) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            $(this).toggleClass("zwc_active");
            $(this).siblings(".zwc_comp_inner_details").slideToggle();
            if ($(this).hasClass("zwc_active")) {
                $(this).attr("aria-expanded", "true")
            } else {
                $(this).attr("aria-expanded", "false")
            }
            setExpandCollapse()
        } else if (e.key === "ArrowDown") {
            let e = $(this).parent().next(".zwc_comp_inner_wrap").find(".zwc_comp_inner_heading.zwc_slide");
            if (e.length) {
                e.focus()
            }
        } else if (e.key === "ArrowUp") {
            let e = $(this).parent().prev(".zwc_comp_inner_wrap").find(".zwc_comp_inner_heading.zwc_slide");
            if (e.length) {
                e.focus()
            }
        }
    });
    $(".product-block").each(function() {
        if ($(this).find(".feature-wrap").length > 0)
            $('<div class="zmore-features"><span class="zmore-features-show" role="button">' + Drupal.t("Show Features") + '</span><span class="zmore-features-hide" role="button">' + Drupal.t("Hide Features") + "</span></div>").insertAfter($(this).find(".main-box"))
    });
    $(".zmore-features").on("click", function() {
        $(this).toggleClass("zshow");
        $(this).parent().find(".highlighted-box").slideToggle();
        $(this).parent().find(".feature-wrap").slideToggle()
    });
    if ($(".pricing-tab").length > 0) {
        $('<div class="zmobile-mon-yearly-container"><select id="zmobile-mon-yearly" class="zmobile-mon-yearly"><option value="M">' + Drupal.t("Monthly") + '</option><option value="Y">' + Drupal.t("Yearly") + "</option></select></div>").appendTo(".pricing-tab");
        if ($(".pricing-tab > span.yearly").hasClass("active"))
            $(".zmobile-mon-yearly").val("Y");
        else
            $(".zmobile-mon-yearly").val("M")
    }
    $(".pricing-faq ul li h3").each(function() {
        let e = $(this).html();
        $(this).html(`<button>${e}<span class="arrow"></span></button>`)
    });
    $(".pricing-faq ul li:first-child").addClass("zactive").find("button").attr("aria-expanded", "true");
    $(".most-popular-plan").parent(".content-wrap").addClass("has-most-popular-plan");
    var e = $(".zjson-file-name").attr("data-filename");
    if (e == undefined) {
        e = productName + "-pricing-val.json"
    }
    var t = $(".zadditionaljson-file-name").attr("data-filename");
    var i = "";
    if (t != undefined && t != "") {
        i = t.split(";")
    }
    currencyArray = $(".zcurrency-symbol-array").attr("data-currency").split(";");
    var a = ["one", "sign", "crm", "forms", "crmplus", "cliq", "salesiq", "projects", "vault", "creator", "desk", "people", "reports", "docs", "recruit", "contactmanager", "sites", "flow", "salesinbox", "bugtracker", "motivator", "showtime", "meeting", "social", "connect", "assist", "sprints", "wiki", "campaigns", "officeplatform", "pagesense", "backstage", "teamdrive", "survey", "workplace", "orchestly", "workerly", "analytics", "peopleplus", "workdrive"];
    if (getDomain == "www.orchestly.com") {
        getDomain = "www.zoho.com";
        productName = "zohoorchestly"
    }
    var r = "zweb";
    var n = "www.zohowebstatic.com";
    if (customvar.productName == "zohobigin" || customvar.productName == "zillum" || customvar.productName == "trainercentral") {
        var r = "oweb";
        n = "oweb.zohowebstatic.com";
        if (getDomain.includes(_prewww)) {
            n = "prewwwo.zohowebstatic.com"
        }
    }
    var o = "local";
    var c = true;
    var s = 1;
    $(".zpricegroup").each(function(e, t) {
        $(this).addClass("zpricegroup" + s);
        s++;
        if ($.trim($(this).attr("id")) == "" || $.trim($(this).attr("id")) == null)
            c = false
    });
    c = true;
    if (c) {
        if (getDomain == _preZ)
            n = _preZ;
        else if (getDomain == _zcmsZC)
            n = _zcmsZC;
        else if (customvar.host.indexOf("bigin.com") == 7)
            n = "prewwwo.zohowebstatic.com";
        var l = ["AI", "AG", "AR", "AW", "BS", "BB", "BZ", "BM", "BO", "BR", "KY", "CL", "CO", "CR", "CW", "DM", "DO", "EC", "SV", "FK", "GD", "GU", "GT", "GY", "HT", "HN", "JM", "JP", "MX", "KZ", "NI", "PA", "PY", "PE", "PR", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "SX", "SR", "TT", "TC", "UY", "VE", "VG", "VI", "GP", "MQ", "GS"];
        var d = ["TD", "DZ", "MG", "MW", "BQ", "AX", "CI", "GH", "PS", "CV", "CF", "ZW", "CG", "GW", "CD", "MR", "SS", "AO", "KM", "ML", "GN", "DJ", "PN", "GQ", "BJ", "ER", "TN", "TG", "TZ", "TK", "YT", "UG", "RW", "BV", "RE", "MU", "BW", "MZ", "NA", "SL", "SN", "MS", "ST", "MA", "ET", "SB", "YE", "ZM", "NE", "SO", "SD", "JO", "WF", "EH", "BI", "TF", "BF", "LS", "LY", "GA", "SZ", "CM", "LR", "GM", "SJ", "LB", "PF", "GF"];
        var p = ["analytics", "assist", "backstage", "bookings", "bugtracker", "campaigns", "commerce", "connect", "creator", "creatorplus", "desk", "flow", "forms", "lens", "marketinghub", "officeplatform", "one", "people", "peopleplus", "recruit", "sign", "sites", "social", "sprints", "survey", "vault", "workdrive", "workerly", "crm", "crmplus", "marketingautomation"];
        var u = ["workplace", "mail", "projects", "bigin", "remotely", "routeiq", "salesiq", "pagesense", "showtime", "learn", "cliq", "docs", "zeptomail", "dataprep", "contracts", "shifts", "wiki", "meeting"];
        var f = "https://" + n + "/sites/" + r + "/json/pricing/" + productName + "-pricing-val.json";
        var h = $(".zalternatejson-file-name");
        if (h.length) {
            var m = h[0].getAttribute("data-filename");
            if (m) {
                f = "https://" + n + "/sites/" + r + "/json/pricing/" + m
            }
        }
        $.getJSON(f).done(function(e) {
            menuArray = e;
            var o = "";
            var c = "";
            var t = menuArray.priceLists.currencyOrder;
            currencyOrderArray = t.split(";");
            $.each(currencyOrderArray, function(e, t) {
                var i = currencySymbolArray[currencyCodeArray.indexOf(t)];
                var a = t;
                if (a == "OLDUSD" || a == "USDAFRICA")
                    a = "USD";
                let r;
                const n = {
                    NGN: "Naira",
                    KES: "Kenyan Shillings",
                    EGP: "Egyptian Pounds",
                    MEX: "MEX $",
                    IDR: "Rupiah",
                    BRL: "Brazilian Reals",
                    MYR: "Ringgit",
                    ZAR: "Rand"
                };
                if (n.hasOwnProperty(a)) {
                    r = n[a]
                } else {
                    r = a
                }
                o += '<span class="' + t + ' changeCurrency" data-currency="' + t + ", " + i + '" role="tab" tabindex="0" aria-label="' + r + '">' + a + "</span>";
                c += '<option class="' + t + '" value="' + t + '" role="button" tabindex="0">' + t + "</option>"
            });
            currencyArray = currencyOrderArray;
            $(".changePrice .changePriceContainer").attr("role", "tablist").html(o);
            y(menuArray);
            if (i.length > 0) {
                $.each(i, function(e) {
                    $.getJSON("https://" + n + "/sites/" + r + "/json/pricing/" + i[e]).done(function(e) {
                        y(e)
                    })
                })
            }
        }).fail(function() {
            C()
        });
        function y(t) {
            $.each(t.priceLists.priceSets, function(e) {
                if ($(".zpricegroup#" + t.priceLists.priceSets[e].setId).length > 0) {
                    if ($(".zpricegroup#" + t.priceLists.priceSets[e].setId).attr("data-price") == "") {
                        $(".zpricegroup#" + t.priceLists.priceSets[e].setId).attr("data-price", t.priceLists.priceSets[e].priceValue)
                    }
                }
                if ($("[data-jsonid='" + t.priceLists.priceSets[e].setId + "']").length > 0) {
                    if ($("[data-jsonid='" + t.priceLists.priceSets[e].setId + "']").attr("data-price") == "") {
                        $("[data-jsonid='" + t.priceLists.priceSets[e].setId + "']").attr("data-price", t.priceLists.priceSets[e].priceValue)
                    }
                }
            });
            C()
        }
    } else {
        C()
    }
    function g() {
        w();
        _();
        if (window.innerWidth >= 768) {
            $(".product-block").not(".blockCustomHt").css("min-height", "auto");
            var e = 0;
            $(".product-block").not(".blockCustomHt").each(function() {
                if (e < $(this).height())
                    e = $(this).height()
            });
            $(".product-block").not(".blockCustomHt").each(function() {
                if ($(this).hasClass("most-popular-plan"))
                    $(this).css({
                        "min-height": e + 20
                    });
                else
                    $(this).css("min-height", e + 2)
            })
        } else {
            $(".product-block").not(".blockCustomHt").css({
                "min-height": "inherit"
            })
        }
    }
    function w() {
        if (window.innerWidth >= 768) {
            $(".main-box").css("min-height", "auto");
            var e = 0;
            $(".main-box").each(function() {
                if (e < $(this).height())
                    e = $(this).height()
            });
            $(".main-box").css("min-height", e)
        } else {
            $(".main-box").css({
                "min-height": "inherit"
            })
        }
    }
    function _() {
        if (window.innerWidth >= 768) {
            $(".highlighted-box").css("min-height", "auto");
            var e = 0;
            $(".highlighted-box").each(function() {
                if (e < $(this).height())
                    e = $(this).height()
            });
            $(".highlighted-box").css("min-height", e)
        } else {
            $(".highlighted-box").css({
                "min-height": "inherit"
            })
        }
    }
    function z(e) {
        return e.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    g();
    $(window).resize(function() {
        g()
    });
    function x() {
        $(".trynow-plan").each(function() {
            $(this).attr("href", $(this).attr("href").replace("zoho.com", Zdomain + "." + dcdomainOne))
        });
        $.each(allProductlowerCase, function(e, t) {
            eachAppFromAllApps = t.split(",");
            $.each(eachAppFromAllApps, function(e, t) {
                if (t != "" && t != null) {
                    $(".zw-template-inner [href*='" + t + ".zoho.com']").not(".trynow-plan").each(function() {
                        if ($(this).attr("href").indexOf(t + ".zoho.com") >= 0 && $(this).attr("href").indexOf(".com.au") < 0) {
                            OtherPrdPricingURL = $(this).attr("href");
                            OtherPrdPricingURLDc = OtherPrdPricingURL.replace("zoho.com", Zdomain + "." + dcdomainOne);
                            $(this).attr("href", OtherPrdPricingURLDc)
                        }
                    })
                }
            })
        })
    }
    function b() {
        if (l.indexOf(countryCodeToBeUsed) > -1 && p.indexOf(productName) > -1) {
            v("OLDUSD", "US$")
        } else {
            v("USD", "US$")
        }
    }
    $(window).on("load", function() {
        $("[data-planname-en]").each(function() {
            let e = $(this).attr("data-planname-en");
            $(this).text(e)
        });
        if (langsrc == "/pt-br/") {
            $(".zpricingfaq-pt-br").html('Aceitamos pagamentos com Visa, American Express e PayPal. Para faturamento anual, aceitamos transferências internacionais. Para mais detalhes, envie um e-mail para <a href="mailto:vendas@zohocorp.com">vendas@zohocorp.com</a>.')
        }
        g();
        x();
        C();
        $(".pricing-wrap .has-tooltip>span").not(".price-tooltip").each(function() {
            $(this).parent().addClass("has-infoicon");
            let e = $(this).closest(".has-tooltip").clone().find(".zcurrency-symbol, .z-price-text").remove().end().find(".price-tooltip").text().trim();
            $(this).append(`<i class="info-icon" tabindex="0" aria-label="${e}" role="tooltip"></i>`)
        });
        $(".zwc_comp_cell.has-tooltip tooltip").each(function() {
            let e = $(this).clone().find(".zcurrency-symbol, .z-price-text").remove().end().find("p").text().trim();
            $(this).attr("aria-label", e)
        });
        $(".zwc_comp_row").each(function() {
            $(this).find(".zwc_comp_cell").each(function(e) {
                if (e === 0)
                    return;
                const t = $(".zwc_comp_header .zwc_comp_cell").eq(e).find("h3").text().trim();
                const i = $(this).text().trim() == "-" ? Drupal.t("not available") : "";
                $(this).attr("aria-label", `${t} ${i}`)
            })
        })
    });
    function C() {
        if (domainOne == "cn" || domainOne == "com.cn") {
            if (currencyArray.indexOf("CNY") >= 0) {
                v("CNY", "¥")
            } else {
                b()
            }
        } else {
            if (countryCodeToBeUsed == "-") {
                b()
            } else {
                if (countryEu.indexOf(countryCodeToBeUsed) > -1) {
                    if (countryCodeToBeUsed == "GB" && currencyArray.indexOf("GBP") >= 0) {
                        $(".EUR, .GBP").addClass("showThis");
                        v("GBP", "£")
                    } else if (countryCodeToBeUsed == "TR" && currencyArray.indexOf("USD") >= 0) {
                        v("USD", "€")
                    } else if (currencyArray.indexOf("EUR") >= 0) {
                        $(".EUR, .GBP").addClass("showThis");
                        v("EUR", "€")
                    } else {
                        b()
                    }
                } else if (d.indexOf(countryCodeToBeUsed) > -1) {
                    if (currencyArray.indexOf("USDAFRICA") >= 0) {
                        v("USDAFRICA", "US$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "IN") {
                    if (currencyArray.indexOf("INR") >= 0) {
                        v("INR", "₹")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "BR") {
                    if (currencyArray.indexOf("BRL") >= 0) {
                        v("BRL", "R$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "JP") {
                    if (currencyArray.indexOf("JPY") >= 0) {
                        v("JPY", "¥")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "AU") {
                    if (currencyArray.indexOf("AUD") >= 0) {
                        v("AUD", "A$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "NZ") {
                    if (currencyArray.indexOf("NZD") >= 0) {
                        v("NZD", "NZ$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "MY") {
                    if (currencyArray.indexOf("MYR") >= 0) {
                        v("MYR", "RM")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "SG") {
                    if (currencyArray.indexOf("SGD") >= 0) {
                        $(".USD, .SGD").addClass("showThis");
                        v("SGD", "S$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "AE") {
                    if (currencyArray.indexOf("AED") >= 0) {
                        $(".USD, .AED").addClass("showThis");
                        v("AED", "AED")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "SA") {
                    if (langsrc == "/pt-br/") {
                        if (currencyArray.indexOf("OLDUSD") >= 0 && p.indexOf(productName) > -1) {
                            v("OLDUSD", "US$")
                        } else {
                            v("USD", "US$")
                        }
                    } else {
                        if (currencyArray.indexOf("SAR") >= 0) {
                            v("SAR", "SAR")
                        } else {
                            b()
                        }
                    }
                } else if (countryCodeToBeUsed == "MX") {
                    if (currencyArray.indexOf("MXN") >= 0) {
                        v("MXN", "Mex$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "ZA") {
                    if (currencyArray.indexOf("ZAR") >= 0) {
                        $(".USDAFRICA, .ZAR").addClass("showThis");
                        v("ZAR", "R")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "NG") {
                    if (currencyArray.indexOf("NGN") >= 0) {
                        v("NGN", "₦")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "KE") {
                    if (currencyArray.indexOf("KES") >= 0) {
                        $(".USDAFRICA, .KES").addClass("showThis");
                        v("KES", "KES")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "EG") {
                    if (currencyArray.indexOf("EGP") >= 0) {
                        v("EGP", "E£")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "CA") {
                    if (currencyArray.indexOf("CAD") >= 0) {
                        v("CAD", "C$")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "TH") {
                    if (currencyArray.indexOf("THB") >= 0) {
                        $(".USD, .THB").addClass("showThis");
                        v("THB", "฿")
                    } else {
                        b()
                    }
                } else if (countryCodeToBeUsed == "ID") {
                    if (currencyArray.indexOf("IDR") >= 0) {
                        v("IDR", "Rp")
                    } else {
                        b()
                    }
                } else {
                    b()
                }
            }
        }
        if ($(".changeCurrency.showThis").length <= 1 && $(".pricing-tab-wrap").length == 0) {
            $(".changePrice").hide()
        }
        g();
        $(".changeCurrency").not(".showThis").not(".action").remove()
    }
    Number.isInteger = Number.isInteger || function(e) {
        return typeof e === "number" && isFinite(e) && Math.floor(e) === e
    }
    ;
    function v(c, s) {
        zCurrentCurrencySym = s;
        c = $.trim(c);
        cTextVal = $.trim(c);
        var l = currencyArray.indexOf(c);
        var d = 0;
        var p = "zpricegroup-monthly";
        if ($(".pricing-tab span.label-text.active").length > 0) {
            d = $(".pricing-tab span.label-text.active").attr("data-value");
            if (d == 0) {
                p = "zpricegroup-monthly";
                $(".label-text.monthly").attr("aria-pressed", "true");
                $(".label-text.yearly").attr("aria-pressed", "false")
            } else {
                p = "zpricegroup-yearly";
                $(".label-text.monthly").attr("aria-pressed", "false");
                $(".label-text.yearly").attr("aria-pressed", "true")
            }
        }
        $(".changeCurrency").removeClass("action").attr("aria-selected", "false");
        $(".changeCurrency." + c).addClass("action").attr("aria-selected", "true");
        $("#zmobile-currency").val(c);
        $(".zpricegroup").each(function() {
            var e = $(this).attr("data-price").split("//");
            if ($(this).attr("data-price").indexOf("//") == -1) {
                e[1] = e[0]
            }
            var t = e[d].split(";");
            var i = "";
            if ($.isNumeric(t[l])) {
                var a = t[l];
                $(".product-block .price .zcurrency-symbol").css("text-transform", "uppercase");
                if (c == "MXN" || c == "IDR") {
                    $(".product-block .price .zcurrency-symbol").css("text-transform", "none")
                }
                if (c == "AUD" && countryCodeToBeUsed == "AU" || c == "BRL" && countryCodeToBeUsed == "BR") {
                    if ($.trim($(".ztax-container > p#z-notax").text()) == "") {
                        $(".ztax-container > p#z-notax").text(Drupal.t("Prices mentioned are inclusive of local taxes.")).show()
                    } else {
                        $(".ztax-container > p").hide();
                        $(".ztax-container > p#z-notax").show()
                    }
                } else {
                    if ($.trim($(".ztax-container > p#z-taxplus").text()) == "") {
                        $(".ztax-container > p#z-taxplus").text(Drupal.t("Local taxes (VAT, GST, etc.) will be charged in addition to the prices mentioned.")).show()
                    } else {
                        $(".ztax-container > p").hide();
                        $(".ztax-container > p#z-taxplus").show()
                    }
                }
                const n = {
                    "₦": "Naira",
                    KES: "Kenyan Shillings",
                    "E£": "Egyptian Pounds",
                    MEX$: "MEX $",
                    Rp: "Rupiah",
                    R$: "Brazilian Reals",
                    RM: "Ringgit",
                    R: "Rand"
                };
                function r(e, t) {
                    if (n.hasOwnProperty(e)) {
                        const [i,a="00"] = parseFloat(t).toFixed(2).split(".");
                        const r = parseInt(a) > 0 ? ` and ${a} cents` : "";
                        return `${n[e]} ${i}${r}`
                    } else {
                        return `${e}${t}`
                    }
                }
                const o = r(s, a);
                if ($(this).find(".zprice-visually-hidden").length) {
                    $(this).find(".zprice-visually-hidden").text(`${o}`)
                } else {
                    $(this).css("position", "relative");
                    $(this).append(`<span class="zprice-visually-hidden">${o}</span>`);
                    $(".zprice-visually-hidden").css({
                        position: "absolute",
                        width: "inherit",
                        height: "inherit",
                        padding: "0",
                        overflow: "hidden",
                        border: "0",
                        left: "0",
                        right: "0",
                        opacity: "0",
                        "font-size": "1px"
                    })
                }
                if (c == "EUR" || c == "IDR" || c == "BRL") {
                    try {
                        if (a.indexOf(".") != -1)
                            a = new Intl.NumberFormat("de",{
                                maximumFractionDigits: 10,
                                minimumFractionDigits: 2
                            }).format(a);
                        else
                            a = new Intl.NumberFormat("de",{
                                maximumFractionDigits: 10
                            }).format(a)
                    } catch (e) {}
                    if (a.indexOf(",") != -1) {
                        priceVal = a.split(",")[0];
                        i = "<em>," + a.split(",")[1] + "</em>";
                        a = priceVal + i
                    } else {
                        if (c == "IDR") {
                            if (a.length > 3) {
                                lastFourCharacters = "<em class='zidr_small'>" + a.substr(-4) + "</em>";
                                remainingString = a.substr(0, a.length - 4);
                                a = remainingString + lastFourCharacters
                            }
                        }
                    }
                } else if (c == "INR") {
                    try {
                        if (a.indexOf(".") != -1)
                            a = new Intl.NumberFormat("en-IN",{
                                maximumFractionDigits: 10,
                                minimumFractionDigits: 2
                            }).format(a);
                        else
                            a = new Intl.NumberFormat("en-IN",{
                                maximumFractionDigits: 10
                            }).format(a)
                    } catch (e) {}
                    if (a.indexOf(".") != -1) {
                        priceVal = a.split(".")[0];
                        i = "<em>." + a.split(".")[1] + "</em>";
                        a = priceVal + i
                    }
                } else {
                    if (c == "AUD" && countryCodeToBeUsed == "AU") {
                        a = Number(a) + Number(a / 10);
                        if (productName != "catalyst") {
                            if (!Number.isInteger(a))
                                a = a.toFixed(2)
                        }
                    }
                    $(this).find(".zprice-visually-hidden").text(`${s}${a}`);
                    try {
                        hasDecimal = false;
                        if (a.indexOf(".") != -1) {
                            hasDecimal = true;
                            a = new Intl.NumberFormat("en",{
                                maximumFractionDigits: 10,
                                minimumFractionDigits: 2
                            }).format(a)
                        } else {
                            a = new Intl.NumberFormat("en",{
                                maximumFractionDigits: 10
                            }).format(a);
                            hasDecimal = false
                        }
                    } catch (e) {}
                    if (hasDecimal == true) {
                        priceVal = a.split(".")[0];
                        i = "<em>." + a.split(".")[1] + "</em>";
                        a = priceVal + i
                    }
                }
                $(this).addClass("zdisplay").children(".z-price-text").attr("aria-hidden", "true").html(a);
                $(this).children(".zcurrency-symbol").attr("aria-hidden", "true").html(s)
            } else {
                $(this).children(".z-price-text").html(Drupal.t(t[l]));
                $(this).children(".zcurrency-symbol").html("")
            }
            $(".pricing-wrap").removeClass(function(e, t) {
                return (t.match(/\bzpricegroup-\S+/g) || []).join(" ")
            });
            $(".pricing-wrap").addClass(p)
        });
        $(".ztogglegroup").each(function() {
            var e = $(this).attr("data-toggleval").split(";");
            if (e[d] == "-") {
                e[d] = "&nbsp;"
            }
            $(this).html(e[d])
        })
    }
    $("body").on("click keydown", ".changeCurrency", function(e) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            var t = $(this).attr("data-currency").split(",");
            dCurrency = $.trim(t[1]);
            if (dCurrency == "$") {
                dCurrency = "US$";
                if (countryCodeToBeUsed == "TR")
                    dCurrency = "€"
            }
            if (document.domain == _zcmsZC || global_getUrlParam("zc") == "all") {
                if (t[0] == "AUD") {
                    autoCCVal = currencyCountryArray[currencyCodeArray.indexOf(t[0])];
                    window.location = window.location.origin + window.location.pathname + "?zc=all&autoCC=" + autoCCVal
                }
            }
            v(t[0], dCurrency)
        }
    });
    $(document).on("click keydown", ".pricing-tab span.label-text", function(e) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            if (!$(this).hasClass("active")) {
                $(".pricing-tab span.label-text").toggleClass("active");
                if ($(this).hasClass("monthly")) {
                    $(".zmobile-mon-yearly").val("M")
                } else if ($(this).hasClass("yearly")) {
                    $(".zmobile-mon-yearly").val("Y")
                }
                var t = $(".changeCurrency.action").attr("data-currency").split(",");
                dCurrency = $.trim(t[1]);
                if (dCurrency == "$") {
                    dCurrency = "US$";
                    if (countryCodeToBeUsed == "TR")
                        dCurrency = "€"
                }
                v(t[0], dCurrency);
                g()
            }
        }
    });
    if ($("body").hasClass("lang-zh-hans") && $(".pricing-tab .yearly").length > 0) {
        $(".pricing-tab .yearly").trigger("click")
    }
    $(".feature-box ul li.has-tooltip, .highlighted-box p.has-tooltip").each(function(e, t) {
        $(this).on("mouseenter focus", function() {
            $(this).find("span.price-tooltip").not(".zpricegroup, .ztogglegroup").addClass("active").focus()
        });
        $(this).on("mouseleave blur", function() {
            $(this).find("span.price-tooltip").not(".zpricegroup, .ztogglegroup").removeClass("active").blur()
        })
    });
    $(document).on("focus", ".info-icon", function() {
        $(this).parent().next(".price-tooltip").addClass("active").focus()
    });
    $(document).on("blur", ".info-icon", function() {
        $(this).parent().next(".price-tooltip").removeClass("active").blur()
    });
    $(".zwc_comp_cell.has-tooltip tooltip").each(function(e, t) {
        $(this).on("mouseenter focus", ".zwc_comp_cell.has-tooltip tooltip", function() {
            $(this).addClass("active")
        });
        $(this).on("mouseenter blur", ".zwc_comp_cell.has-tooltip tooltip", function() {
            $(this).removeClass("active")
        })
    })
});
$(".pricing-faq ul>li").on("click keydown", function(e) {
    if (!$(".pricing-faq .content-wrap").hasClass("expand-all")) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            if ($(this).hasClass("zactive")) {
                $(this).removeClass("zactive").find("p, .faq-list").slideUp()
            } else {
                $(".pricing-faq ul li").removeClass("zactive").find("button").attr("aria-expanded", "false");
                $(".pricing-faq p,.pricing-faq .faq-list").slideUp(300);
                $(this).addClass("zactive").find("button").attr("aria-expanded", "true");
                $(this).find("p, .faq-list").slideDown(300)
            }
        } else if (e.key === "ArrowDown") {
            let e = $(this).next("li").find("h3 button");
            if (e.length) {
                e.focus()
            }
        } else if (e.key === "ArrowUp") {
            let e = $(this).prev("li").find("h3 button");
            if (e.length) {
                e.focus()
            }
        }
    }
});
$(document).on("change", ".zmobile-mon-yearly", function() {
    if ($(this).val() == "M") {
        $(".zmobile-mon-yearly").val("M");
        $(".pricing-tab > span.monthly").trigger("click")
    } else if ($(this).val() == "Y") {
        $(".zmobile-mon-yearly").val("Y");
        $(".pricing-tab > span.yearly").trigger("click")
    }
});
$(document).on("change", "#zmobile-currency", function() {
    $(".changePriceContainer .changeCurrency." + $(this).val()).trigger("click")
});
function setExpandCollapse() {
    if ($(".zwc_comp_inner_heading.zwc_slide:visible").length == $(".zwc_comp_inner_heading.zwc_slide.zwc_active:visible").length) {
        $(".zwc_accordion_text").text(Drupal.t("Collapse All"));
        $(".zwc_accordion_text").removeClass("zwc_expand_accordion")
    }
    if (!$(".zwc_comp_inner_heading.zwc_slide.zwc_active:visible").length) {
        $(".zwc_accordion_text").text(Drupal.t("Expand All"));
        $(".zwc_accordion_text").addClass("zwc_expand_accordion")
    }
}
$(document).ready(function() {
    const e = ['.zwc_comp_inner_heading:not(".heading-tooltip")', ".zwc_comp_inner_heading.heading-tooltip > .has-tooltip", ".zwc_comp_inner_details .zwc_comp_row .zwc_comp_cell:first-child"];
    addDynamicScript("plan_features_filter").then(function() {
        $(".zwc_search_box_container").zwc_feature_filter({
            pricing: true,
            accordion: true,
            optionListSelector: e
        })
    });
    const t = $(".zwc_comparison_container .zwc_comp_header .zwc_divide_cell");
    t.append('<div class="zwc_cell_section"><span class="zwc_feature_text" role="button">' + Drupal.t("Hide Common Features") + '</span></div><div class="zwc_cell_section"><span class="zwc_accordion_text zwc_expand_accordion" role="button">' + Drupal.t("Expand All") + "</span></div>");
    $(".zwc_accordion_text").on("click keydown", function(e) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            if ($(".zwc_accordion_text").hasClass("zwc_expand_accordion")) {
                $(".zwc_comp_inner_heading.zwc_slide").addClass("zwc_active").attr("aria-expanded", "true").siblings(".zwc_comp_inner_details").slideDown();
                $(".zwc_accordion_text").text(Drupal.t("Collapse All")).removeClass("zwc_expand_accordion")
            } else {
                $(".zwc_comp_inner_heading.zwc_slide").removeClass("zwc_active").attr("aria-expanded", "false").siblings(".zwc_comp_inner_details").slideUp();
                $(".zwc_accordion_text").text(Drupal.t("Expand All")).addClass("zwc_expand_accordion")
            }
        }
    });
    $(".zwc_feature_text").on("click keydown", function(e) {
        if (e.type === "click" || e.key === "Enter" || e.key === " ") {
            if (e.target.tagName.toLowerCase() !== "a") {
                e.preventDefault()
            }
            $(".zwc_commom_feature").parent().toggle();
            Array.from($(".zwc_commom_feature").parent()).forEach(function(e) {
                let t = Array.from($(e).parent().children()).every(function(e) {
                    return $(e).css("display") == "none"
                });
                if (t) {
                    $(e).parent().parent().css("display", "none")
                } else {
                    $(e).parent().parent().css("display", "block")
                }
            });
            if ($(".zwc_commom_feature").parent().css("display") == "none") {
                $(".zwc_feature_text").text("Show All Features")
            } else {
                $(".zwc_feature_text").text("Hide Common Features")
            }
            setExpandCollapse()
        }
    });
    $(window).scroll(function() {
        if ($(".zwc_comparison_wrap").length) {
            if ($(window).scrollTop() >= $(".zwc_comparison_wrap").offset().top + $(".zwc_comparison_wrap").height()) {
                $(".z-bottom-cta-menu").addClass("zshow_bottom_cta")
            } else {
                $(".z-bottom-cta-menu").removeClass("zshow_bottom_cta")
            }
        }
        $(".zwc_comparison_table_wrap").each(function(e, t) {
            if ($(window).scrollTop() >= $(this).find(".zwc_comp_inner_wrap").offset().top && $(window).scrollTop() <= $(this).offset().top + $(this).height() - 200) {
                $(this).find(".zwc_comp_header_fixed").addClass("zwc_comp_header_show")
            } else {
                $(this).find(".zwc_comp_header_fixed").removeClass("zwc_comp_header_show")
            }
        });
        $(".zwc_comp_header_fixed.zwc_comp_header_show").each(function() {
            $(".zwc_comp_header_fixed.zwc_comp_header_show").css("margin-top", $(window).scrollTop() - $(this).parent().offset().top)
        })
    })
});
