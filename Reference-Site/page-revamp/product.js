//Find dcdomainOne
function getDcDomain() {
    if (dcdomainOne == "eu") {
        $('body').addClass("get-country-eu");
    } else if (dcdomainOne == "in") {
        $('body').addClass("get-country-in");
    } else if (dcdomainOne == "com.au") {
        $('body').addClass("get-country-au");
    } else if (dcdomainOne == "com") {
        $('body').addClass("get-country-com");
    }
}

customvar.nonlogged = function () {
    customvar.dynamicLinks({
        "href": {
            ".zgh-login": 'https://accounts.' + Zdomain + '.' + dcdomainOne + '/signin?' + customvar.clang + 'servicename=ZohoReports&signupurl=https://www.' + ZUrlDomain + '.' + domainOne + langsrc + 'analytics/signup.html',
            ".zgh-signup": langsrc + 'analytics/signup.html',
        },
        "html": {
            "#block-block-4 .zgh-signup": Drupal.t('Sign Up Free'),
            ".zgh-accounts .zgh-signup": Drupal.t('Sign Up Free'),
        }
    });
    getDcDomain();
}

customvar.logged = function () {
    var b = (window.location.href.indexOf("?") > 0) ? ("?" + window.location.href.split("?")[1] + "&") : "?";
    var a = b + customvar.refval();
    customvar.dynamicLinks({
        "href": {
            ".act-btn.cta-btn, .zgh-userAccess a": 'https://analytics.' + Zdomain + '.' + dcdomainOne + a,
        },
        "html": {
            ".act-btn.cta-btn": Drupal.t('Access Zoho') + ' analytics',
        },
    });
    setTimeout(function () {
        $('.loggedin-userinfo .access-apps').attr('href', 'https://analytics.' + Zdomain + '.' + dcdomainOne + a)
    }, 500)
    getDcDomain();
}

customvar.supportId = function () {
    if (jQuery.inArray(CountryCode, countryEu) >= 0) {
        return "support@eu.zohoanalytics.com";
    } else {
        return "support@zohoanalytics.com";
    }
};

// New signup code//
var windowUrl = window.location.href
var getindex = windowUrl.indexOf('?');
if (getindex > 0) {
    if (windowUrl.indexOf('PLANID=') > 0 && windowUrl.indexOf('WEBSITETRYNOW=true') > 0) {
        windowUrl = windowUrl.split('?')[1];
    } else {
        windowUrl = windowUrl.split('?')[1] + "&zdbreferer=Home&PLANID=15&WEBSITETRYNOW=true"
    }
} else {
    windowUrl = "zdbreferer=Home&PLANID=15&WEBSITETRYNOW=true"
}

var successUrl = "https://analytics." + Zdomain + "." + dcdomainOne + "/ZDBHome.cc?" + windowUrl + ""

customvar.signupformloaded = function () {
    $('.signup-box .get-signup-plan').remove();
    $('.get-signup-plan').remove();
    $('.czone-dc').before('<div class="get-signup-plan added-placeholder"> <input id="cloud" name="x_accountType" value="2" type="radio" checked="checked"> <label for="cloud">' + Drupal.t('Cloud') + '</label> <input id="onpremise" name="x_accountType" value="1" type="radio"> <label for="onpremise">' + Drupal.t('On-premise') + '</label> </div>');
    addingform();
    if (typeof _globalcounty != 'undefined') {
        _globalcounty();
    }
}
try {
    addsignup(Obj = {
        Email: {
            "placeholder": currentUrlLang == 'jp' ? 'ビジネスメール' : Drupal.t('Business Email *'),
            "asterix": false
        },
        password: {
            "asterix": false,
            'placeholder': Drupal.t('Password *')
        },
        "contactnumber": {
            'placeholder': Drupal.t('Phone number *'),
            'required': ((currentUrlLang == 'jp') ? true : false),
            "asterix": false
        },
        "custominput": {
            "placeholder": Drupal.t("Employee count *"),
            "nameAttr": "x_employee_count",
            "required": CountryCode == 'BR'
        },
        "additionalfield": (currentUrlLang == 'jp' ? '<input type="hidden" id="x_phone" mandate="false" name="x_phone" placeholder="" type="text"></div></div>' : ''),
        servicename: "ZohoReports",
        serviceurl: encodeURIComponent(successUrl),
        "social-icon": "vi-google,vi-linkedin",
    });
} catch (e) { }

$(document).on('click', '.get-signup-plan input', function () {
    if ($(this).attr('id') == 'cloud') {
        $('.czone-dc form').show();
        $('.czone-dc .on-line-premise-container, .czone-dc form.zgdprform-zohocreator').hide();
    } else {
        $('.czone-dc form').hide();
        $('.czone-dc .on-line-premise-container, .czone-dc form.zgdprform-zohocreator').show();
        $('.czone-dc .on-line-premise-container form').show();
        addjqueryvalidate();
    }
});
// New signup code End//

// prodMenu privacy link 
function headerMenuLoaded() {
    let zwc_plink = customvar.getLink(customvar.productName);
    let zwc_privacylink = zwc_plink.footerPrivacyLink;

    $('.product-nav-links .zmenu-submenu a.zwc-running-privacy').attr('href', zwc_privacylink);
};


// Common Count for customers
let za_thousand_customers = 22,
    za_million_users = 4;
za_million_reports = 75;
$('[za-thousand-customers]').text(za_thousand_customers);
$('[za-million-users]').text(za_million_users);
$('[za-million-reports]').parent().css('display', 'none');
if (CountryCode == "JP" || currentLang == "ja") {
    $('[za-million-reports]').text(7500);
    $('[za-thousand-customers]').text('22,000');
    $('[za-million-users]').text(300);
}


// Common Count for customers end

$(document).ready(function (e) {
    //  promotion code
    if (currentUrlLang == "") {
        var _promoban = '<div class="zpromotion"> <div class="zpromotion-wrap"><p><span class="zone">Zoho Analytics has been recognized in the 2025 Gartner® Magic Quadrant™ for ABI Platforms.</span><a class="zmore" href="/analytics/2025-gartner-mq-report.html?src=banner">Read more</a></p> </div></div>';
        $(_promoban).insertBefore(".zw-product-header");
        $(".zpromoclose").click(function () {
            $(".zpromotion").slideUp()
        });
        // if (customvar.expiryDateCheck('18/07/2024', '31/08/2024')) {
        //     $('.zpromotion').css({ "display": "block" });
        // }
    }
    //  promotion code


    if (window.location.href.indexOf("/analytics/api/") > -1) {
        setSectionTop();
    }
});



/************************************************************************************************************/
/****************************************Footer Content Starts****************************************/
/**********************************************************************************************************/

/* Sliding Top Menu for Mobile */
var mobileSMjson = '{"Features":"analytics/features.html", "Pricing":"analytics/pricing.html", "Customers":"analytics/customers.html"}';
setSlidingMenuMobile();
/* Sliding Top Menu for Mobile - Ends*/

jQuery(document).ready(function () {

    if (currentUrlLang != "" && currentUrlLang != "jp" && currentUrlLang != "zh-hans" && currentUrlLang != "he" && currentUrlLang != "pt-br") {
        $('.common-links').addClass('remove-before');
        $('.node-type-features footer .all-features').css('display', 'none');

        // if (window.innerWidth > 767) {
        //     $('.product-nav-links > ul.menu').append('<li class="last leaf"><a href="/analytics/help/index.html" target="_blank">Resources</a></li>');
        //     $('.product-nav-links > ul.menu li:last-child').prev().removeClass("last");
        // } else {
        //     $('<li class="leaf"><a href="/analytics/help/index.html" target="_blank">Resources</a></li>').insertBefore('.product-nav-links > ul.menu li.featured-apps-part');
        // }
    }

});
/***********************************************************************************************************/
/****************************************Footer Content Ends***************************************/
/*********************************************************************************************************/

jQuery(document).ready(function () {

    jQuery('.breadcrumb .content-wrap li a').eq(1).attr('href', '/analytics/help/overview.html');

    /***************************   Feedback JS (HELP)  Start  ****************************************/
    var fromSearch = global_getUrlParam('zgs');
    if (fromSearch == "") {
        jQuery('.help-content-panel').append('<div class="feedback-widget"><span>Did you find what you were looking for? </span><a href="javascript:void(0);" id="yes" style="cursor: text;">Yes</a> | <a href="javascript:void(0);" id="no" style="cursor: text;">No</a></div><div class="iframes"><div class="frame"><span>x</span><iframe class="iframe yes" src="https://forms.zohopublic.com/zohoreport/form/sorrywecouldntbeofassistancewq/formperma/51AHCgEje1b23a1EF5D55D_FM" width="500px" height="480px">Yes</iframe><iframe class="iframe no" src="https://forms.zohopublic.com/zohoreport/form/Sorrywecouldntbeofassistance/formperma/74gEH0CF19646b6B2E69153eG" width="500px" height="440px">No</iframe></div></div>');
    }

    jQuery(document).bind('keydown', function (e) {
        if (e.which == 27) {
            $('.iframes').removeClass('active');
            $('.iframe').removeClass('active');
        }
    });

    jQuery('.feedback-widget a').click(function (e) {
        var sid = $(this).attr('id');
        jQuery('.iframe').removeClass('active');
        jQuery('.' + sid).addClass('active');
        jQuery('.iframes').addClass('active');
    });

    jQuery('.iframes').click(function (e) {
        jQuery('.iframes').removeClass('active');
        jQuery('.iframe').removeClass('active');
    });

    jQuery('.help-content-inner-wrap a').each(function (index, value) {
        if (jQuery(this).html() == 'support@zohoanalytics.com') {
            jQuery(this).addClass('support-mail-id')
        }
    });
    /***************************   Feedback JS (HELP)  End  ****************************************/

    jQuery(document).ready(function () {
        jQuery(".mobile-hmenu-icon").click(function () {
            jQuery(this).toggleClass("hide-menu-panel");
            jQuery(".main-content .menu-panel").toggleClass("slide-menu-panel");
        });

        jQuery('a[href*="#"]').click(function (e) {

            var target = this.hash;

            if (typeof (jQuery(target).offset()) != 'undefined') {
                jQuery('html, body').animate({
                    scrollTop: jQuery(target).offset().top - 80
                }, 1000);
            }
        });

    });

});

/********Bottom Promo Link*************/

jQuery(document).ready(function () {

    var locPath = window.location.pathname.split('/');
    if (locPath.length == 3) {
        var lpath = locPath[2].split('.html');
        jQuery('.bottom-promo .ct-action-btn').attr('href', '/analytics/signup.html?zdbreferer=' + lpath[0] + '&PLANID=15&WEBSITETRYNOW=true');
    }

});
/********Bottom Promo Link*************/

/******************Quick Links JS - START ***********************/
jQuery(document).ready(function () {
    var cPageName = window.location.pathname.split("/").pop();
    var quickList = ["onpremise-pricing.html", "onpremise-download.html", "personalised-demo.html", "compare-on-premise-editions.html", "onpremise-zoho-analytics-assist-program.html", "service-packs.html", "release-notes.html"];
    var quickLinks = "";
    if ($(".html").hasClass("node-type-new-product-resources") || $(".html").hasClass("zw-template-zp_help_detail_pages") || $(".html").hasClass("zw-template-zp_home")) {
        //Quick Links not needed
    } else if (jQuery.inArray(cPageName, quickList) !== -1) {
        quickLinks = '<div class="quick-connect-links-wrap"><span class="show-links-btn">&nbsp;</span><div class="quick-connect-links"><span class="hide-links-btn">&nbsp;</span><h4>' + Drupal.t("Next Steps") + '</h4><ul><li><a href="/analytics/onpremise-zoho-analytics-assist-program.html">Need Assistance?</a></li><li><a href="/analytics/video-demo.html">Video Demos </a></li><li><a  href="/analytics/onpremise/personalised-demo.html">Request a demo</a></li><li><a  href="https://demo.zohoanalytics.com">Online demo</a></li></ul></div></div>';

        // 'https://analytics.' + Zdomain + '.' + dcdomainOne + a,
    } else {
        quickLinks = '<div class="quick-connect-links-wrap"><span class="show-links-btn">&nbsp;</span><div class="quick-connect-links"><span class="hide-links-btn">&nbsp;</span><h4>' + Drupal.t("Next Steps") + '</h4><ul><li><a href="/analytics/contact-us.html">Need Assistance?</a></li><li><a href="/analytics/video-demo.html">Video Demos </a></li><li><a  class="dc-specific-only" href="https://analytics.' + Zdomain + '.' + dcdomainOne + '/workspace/sample">Featured Samples Gallery</a></li><li><a  href="/analytics/personalized-demo.html">Request a Demo</a></li></ul></div></div>';
    }
    if (quickLinks !== "") {
        jQuery('.zw-template-inner').append(quickLinks);
    }

    var ref = document.referrer;
    if (ref == "") { jQuery('.quick-connect-links').show() } else {
        jQuery('.quick-connect-links').hide();
        jQuery('.quick-connect-links-wrap .show-links-btn').show()
    }

    /******************Quick Links JS - END ***********************/
});
/*
function z_add_account_script() {
  var windowUrl = window.location.href
  var getindex = windowUrl.indexOf('?');
  if (getindex > 0) {
      if (windowUrl.indexOf('PLANID=') > 0 && windowUrl.indexOf('WEBSITETRYNOW=true') > 0) {
          windowUrl = windowUrl.split('?')[1];
      } else {
          windowUrl = windowUrl.split('?')[1] + "&zdbreferer=Home&PLANID=15&WEBSITETRYNOW=true"
      }
  } else {
      windowUrl = "zdbreferer=Home&PLANID=15&WEBSITETRYNOW=true"
  }

  var successUrl = "https://analytics." + Zdomain + "." + dcdomainOne + "/ZDBHome.cc?" + windowUrl + ""
  $('script#z-account-script').remove();
  var scriptEle = document.createElement("script");
  scriptEle.type = "text/javascript";
  scriptEle.id = "z-account-script";
  accountscallback(accountscallbackSignupText);
  if(customvar.OTP_based()){
      serviceUrl = customvar.alink + "servicename=ZohoReports&loadcss=false&mode=24&serviceurl=" + encodeURIComponent(successUrl);
      scriptEle.src = serviceUrl;
  }else{
      serviceUrl = customvar.alink + "servicename=ZohoReports&loadcss=false&serviceurl=" + encodeURIComponent(successUrl);
      scriptEle.src = serviceUrl;
  }

  document.getElementsByTagName("head")[0].appendChild(scriptEle);
}

function zohoGASignupEvent() {
  // This method will be overrided by GTM for GA tracker.
}

function onSignupReady() {
  $('.signup-box,.contentLft').css({ "opacity": "1", 'visibility': 'visible' });
  $("#signupbtn, .za-tos-container").removeClass('disabled-z-signup');
  $('.za-tos').removeAttr('disabled');
  $('.globalcountrycode-signup').removeAttr('disabled');
  $("#signupbtn").css({ 'opacity': 1 })
  $("#email").focus(); // No I18N
  $.validator.addMethod("isValidPhone", function (value, element) {
      var pattern = /^[0-9\s\(\)\+\-]+$/;
      var onlyCharacters = /^[\-\+]+$/;
      if (value != "") {
          if (!onlyCharacters.test(value)) {
              if (!pattern.test(value)) {
                  return false;
              }
          }
          if (value.length < 5) {
              return false;
          }
      }
      return true;
  });
  jQuery.validator.addMethod("statevalidation", function (value, element) {
      return (value == 'select your state') ? false : true;
  });
  var signupbtn = $('#signupbtn');
  $("#signupform").zaSignUp({ // No I18N
      x_signup: {
          password_required: true, // Password field
          confirmPassword_required: true, // Password field
          email_required: true, // Email Address field
          captcha_required: false // Captcha field
      },
      validator: {
          rules: {
              "r_address/1.phone": {
                  required: true,
                  isValidPhone: true
              },
              "country_state": {
                  "statevalidation": true,
              }
          },
          messages: {
              "r_address/1.phone": {
                  required: customvar.ePhoneNumber,
                  isValidPhone: customvar.eValidPhoneNumber
              },
              "country_state": {
                  "statevalidation": Drupal.t('Please select your state'),
              }
          }
      },
      onsubmit: function () {
          signupbtn.val(creatingthePortal);
          $("#signupbtn").addClass('disabled-z-signup');
          zohoGASignupEvent();
      },
      oncomplete: function (state) {
          if (state == $.fn.zaSignUp.SIGNUP_STATE.OTP_INITIATED){
              $('.get-signup-plan').hide()
              if(typeof invalidOtp != 'undefined'){
                  invalidOtp()
              }
          }else if (state == $.fn.zaSignUp.SIGNUP_STATE.OTP_ERROR){
              if(typeof otpError != 'undefined'){
                  otpError()
              }
          }
          
          oncompletecallback();

          if (state == $.fn.zaSignUp.SIGNUP_STATE.ERROR) {
              signupbtn.val(signupforFree);
              $("#signupbtn").removeClass('disabled-z-signup');
              //$(".zr-su-loadingContainer").css("display","none"); //No I18N
              //$("#za-signup-btn").removeClass("zr-su-deactivateSignupBtn").unbind( "click" );   //No I18N
          }
      },
      handleConfirmation: function (resp) {
          resp.doAction();
      }
  });

  $("#MarkRefURL").val(customvar.czmr());
  var str = customvar.czms();
  (str.split("|")[0] !== "") ? $("#MarkSrc").val(str.split("|")[0]) : '';
  (str.split("|")[1] !== "") ? $("#MarkLeadSrc").val(str.split("|")[1]) : '';
  (str.split("|")[2] !== "") ? $("#MarkLastSrc").val(str.split("|")[2]) : '';
}*/

/*--------------CRM Webform-------------*/
var mndFileds = new Array('Email', 'Phone', 'enterdigest');
var fldLangVal = new Array('Email', 'Phone', 'Captcha');
var name = '';
var email = '';
var captcha = false;
/* Do not remove this code. */
function reloadImg() {
    if (document.getElementById('imgid').src.indexOf('&d') !== -1) {
        document.getElementById('imgid').src = document.getElementById('imgid').src.substring(0, document
            .getElementById('imgid').src.indexOf('&d')) + '&d' + new Date().getTime();
    } else {
        document.getElementById('imgid').src = document.getElementById('imgid').src + '&d' + new Date()
            .getTime();
    }
}

function checkMandatory15842002219957000() {
    for (i = 0; i < mndFileds.length; i++) {
        var fieldObj = document.forms['z_crmwebform'][mndFileds[i]];
        if (fieldObj) {
            if (((fieldObj.value).replace(/^\s+|\s+$/g, '')).length == 0) {
                if (fieldObj.type == 'file') {
                    alert('Please select a file to upload.');
                    fieldObj.focus();
                    return false;
                }
                $('.f-error').hide();
                $('[name=' + mndFileds[i] + ']').next().css('display', 'block').text(fldLangVal[i] + ' cannot be empty.');
                fieldObj.focus();
                return false;
            } else if (fieldObj.nodeName == 'SELECT') {
                if (fieldObj.options[fieldObj.selectedIndex].value == '-None-') {
                    alert(fldLangVal[i] + ' cannot be none.');
                    fieldObj.focus();
                    return false;
                }
            } else if (fieldObj.type == 'checkbox') {
                if (fieldObj.checked == false) {
                    alert('Please accept  ' + fldLangVal[i]);
                    fieldObj.focus();
                    return false;
                }
            } else if (fieldObj.name == 'Email') {
                var Epattern = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if (!Epattern.test($('#zcf_email').val())) {
                    $('.f-error').hide();
                    $('[name=' + fieldObj.name + ']').next().css('display', 'block').text('Please enter a valid email address.');
                    return false;
                }
            } else if (fieldObj.name == 'Phone') {
                var pattern = /^[0-9\s\(\)\+\-]+$/;
                var onlyCharacters = /^[\-\+]+$/;
                if (!pattern.test($('#zcf_phone').val())) {
                    if (!onlyCharacters.test($('#zcf_phone').val())) {
                        $('.f-error').hide();
                        $('[name=' + fieldObj.name + ']').next().css('display', 'block').text('Please enter valid phone number.');
                        return false;
                    }
                }
            } else if (fieldObj.name == 'enterdigest') {
                if (captcha == false) {
                    if ($('#zcf_enterdigest').val().length < 6) {
                        $('.f-error').hide();
                        $('[name=' + fieldObj.name + ']').next().css('display', 'block').text('Please enter a valid captcha.');
                        return false;
                    } else {
                        var formdata = $("#z_crmwebform");
                        var finalData = formdata.serialize();
                        $.ajax({
                            type: "POST",
                            url: formdata.attr('action'),
                            data: finalData,
                            success: function (data) {
                                if (data.indexOf("Please enter the correct code") > -1) {
                                    reloadImg();
                                    $('.f-error').hide();
                                    $('[name=' + fieldObj.name + ']').next().css('display', 'block').text('Please enter a valid captcha.');
                                    captcha = false;
                                    return false;
                                } else {
                                    captcha = true;
                                    window.location = $("#z_crmwebform").find('[name="returnURL"]').val();
                                    return false;
                                }
                            }
                        });
                        return false
                    }
                }
            }
        }
    }
}


/*--------------CRM Webform-------------*/


var signupforFree = Drupal.t('Sign Up Free');
var creatingthePortal = Drupal.t("Creating Your Account...");

//$(document).ready(function () {
function addingform() {
    //if (currentUrlLang == "he") { langsrc = "/" }
    var $signupForm = '';
    var ccurl = window.location.href;
    var recWebinar;
    var phonfld = '';
    if ($('#czone-home').length > 0) {
        /*if (currentUrlLang == "jp") {
            phonfld = '<div class="sgfrm mobile-container"><input name="r_address/1.phone" placeholder="' + Drupal.t('Phone number') + '" type="text"></div>';
        }
        $('#czone-home').addClass('czone-dc');
        $('#czone-home').html('');*/
        // var cnfmurl = ['barc-2019-report.html', '451-research-2019-report.html', 'tec-2019-report.html', 'ebooks.html', '451-oct-2019-report.html', 'analyst-reports.html', 'request-callback.html', 'support-plans.html', 'bi-analytics-survey-2021.html', 'bi-data-quadrant-report-2021.html', 'dresner-report.html', 'tec-insight-report.html', 'analyst-speak.html', 'bi-emotional-footprint-report-2021.html', 'bi-emotional-footprint-report-2023.html', 'request-meeting.html', 'aheadcrm-2021-report.html', 'kuppingercole-report-2021.html', 'bi-analytics-survey-2022.html', 'bi-mm-dq-report-2022.html', 'dresner-report-2022.html', 'nucleus-10x-fasterinsights.html', 'bi-analytics-survey-2023.html', 'dresner-report-2023.html', 'constellation-2023.html', 'nucleusresearch-sparex-casestudy.html', 'bi-analytics-survey-2024.html', 'dresner-report-2024.html', 'das-embedded-report.html', 'cloud-computing-and-market-study-2025.html', 'powerbi-alternative-software.html', 'embedded-analytics-saas.html', 'ai-powered-embedded-analytics.html', 'embedded-analytics-sales.html'].some(function (cururl) {
        //     return window.location.href.indexOf(cururl) !== -1;
        // });
        var newsletter_cnfmurl = ['newsletter/'].some(function (newsletterurl) {
            return window.location.href.indexOf(newsletterurl) !== -1;
        });
        // var creator_cnfmurl = ['marketing-agency-analytics.html', 'market-research-analytics.html', 'embedded-analytics.html'].some(function (cururl) {
        //     return window.location.href.indexOf(cururl) !== -1;
        // });
        var creator_cnfmurl = ['embedded-analytics.html', 'embed.html', '/help/embedded-analytics-index.html', '/help/types-white-label-solution.html', '/help/whitelabel-setup.html', 'embedded-analytics-features.html', 'white-label-tool.html', 'what-is-white-label-bi-analytics.html', 'embedded-bi.html', 'embedded-dashboards.html', 'embed-api.html', 'white-label-reporting-tool.html', 'cloud-computing-and-market-study-2025.html', 'powerbi-alternative-software.html', 'embedded-analytics-saas.html', 'ai-powered-embedded-analytics.html', 'embedded-analytics-sales.html', 'embedded-reporting-tool.html', 'help/white-label/', 'analytics-for-agencies.html', 'embedded-analytics-fintech.html', 'embedded-analytics-architecture.html', 'dresner-report-2026.html'].some(function (cururl) {
            return window.location.href.indexOf(cururl) !== -1;
        });

        if (newsletter_cnfmurl) {
            $('body').addClass('crmWebForm nl_crmWebForm');
            if (global_getUrlParam('src') == 'contactSubmit') {
                $('#czone-home').addClass('zsuccess');
            }

            var ccurl = window.location.href;
            $contForm = '<div class="result">' + Drupal.t('Thank you for subscribing to the Zoho Analytics newsletter.') + '</div> <div id="crmWebToEntityForm" class="znl-form-wrap"> <meta http-equiv="content-type" content="text/html;charset=UTF-8"> <form action="https://crm.zoho.com/crm/WebToCaseForm" id="z_crmwebform" name=WebToCases15842002219957000 method="POST" onsubmit="return checkMandatory15842002219957000()"  class="cwf-updated za-newsletter-form"> <!-- Do not remove this code. --> <input type="text" style="display:none;" name="xnQsjsdp" value="3cc500101abee16b424d67860b5473bb33cd8ab0fd31519fb0e76a930012c594"/> <input type="hidden" name="zc_gad" id="zc_gad" value=""/> <input name="Subject" id="zcf_subject" type="hidden" value="" data-autoresize=""> <input type="text" style="display:none;" name="xmIwtLD" value="dcbe8ecbdabe526a6fd3a62f60179822502f3930e9fd713ee1694bc2dd11a681"/> <input type="text" style="display:none;" name="actionType" value="Q2FzZXM="/> <input type="hidden" name="returnURL" value=' + ccurl + '?src=contactSubmit> <!-- Do not remove this code. --> <input type="hidden" id="zcf_reported_by" name="Reported By" value=""> <input type="hidden" name="URL" value="" id="page_url"><input type="hidden" name="cookie_uid" value="" id="cookie_uid"> <fieldset class="biz-email-field"><input id="zcf_email" placeholder="' + Drupal.t('Your Email Address') + '*" type="text" name="Email" value=""><span class="f-error"></span></fieldset><fieldset><div class="zgdprform-countrylist-container">&nbsp;</div></fieldset><fieldset class="demofrm captcha"><input type="text" name="enterdigest" placeholder="' + Drupal.t('Captcha') + '*" id="zcf_enterdigest"/><span class="f-error"></span> <!-- Do not remove this code. --> <img id="imgid" src="https://crm.zoho.com/crm/CaptchaServlet?formId=dcbe8ecbdabe526a6fd3a62f60179822502f3930e9fd713ee1694bc2dd11a681&grpid=3cc500101abee16b424d67860b5473bb33cd8ab0fd31519fb0e76a930012c594"> <a href="javascript:;" class="reload-img" onclick="reloadImg()">Reload</a> </fieldset> <div class="zgdprform-opt-container">&nbsp;</div><div class="sgnbtn added-placeholder"><input type="submit" value="Submit"></div></form><iframe name="captchaFrame" id="captchaFrame" style="display:none;"></iframe></div>';
            $('#czone-home').append($contForm);
            // dresner-report-2026: remove ?src=contactSubmit from returnURL and hide success message
            if (window.location.href.indexOf('dresner-report-2026.html') !== -1) {
                $("input[name='returnURL']").val(ccurl);
                $('#czone-home .result').remove();
            }
        } else if (creator_cnfmurl) {
            $('body').addClass('creator-contactform white-Label-form-request');
            if (window.location.href.indexOf('dresner-report-2026.html') !== -1) {
                $("input[name='returnURL']").val(ccurl);
                $('#czone-home .result').remove();
            }
            if (global_getUrlParam('src') == 'whiteLabelRequest') {
                $('#czone-home').addClass('zsuccess');
            }
            var ccurl = window.location.href;
            $contForm = '<div class="result">' + Drupal.t('Your request has been sent. We will reach out to you shortly.') + '</div><form class="embedded-frm zgdprform-zohocreator" name="Zoho_Reports_White_Label_Request" id="Zoho_Reports_White_Label_Request" method="post" action="https://creator.zohopublic.in/addRecordValidate.do"novalidate="novalidate"> <input type="hidden" name="scriptembed" value="true"> <input type="hidden" name="formid" value="46442000141083017"> <input type="hidden" name="sharedBy" value="adventnetwebmaster"> <input type="hidden" id="MarkRefURL" name="MarkRefURL" value=""> <input type="hidden" id="MarkSrc" name="MarkSrc" value=""> <input type="hidden" id="MarkLeadSrc" name="MarkLeadSrc" value=""> <input type="hidden" id="MarkLastSrc" name="MarkLastSrc" value=""> <input name="privatelink" type="hidden" value="U2td0ESNkW9BXUm66QRWyeYEJRA6vPyT9f3bgAPOKmZfQJdtqSFZCdA31H9yG0fKBPFVPCtGDFhB37HgrfwWHHqvOwsZhrgPy8F8"> <input type="hidden" name="nexturl" value="' + ccurl + '?src=whiteLabelRequest&success=1"> <input type="hidden" name="URL" value="" id="page_url"> <input type="hidden" name="cookie_uid" value="" id="cookie_uid"> <input name="appLinkName" type="hidden" value="zoho-analytics-white-label-request"> <input name="formLinkName" type="hidden" value="Zoho_Reports_White_Label_Request"> <input name="subject" type="hidden" value="Zoho Analytics White Label Request"> <fieldset class="demofrm"> <input name="Name" placeholder="' + Drupal.t('Name') + '*" type="text" data-autoresize=""> </fieldset> <fieldset class="demofrm"> <input placeholder="' + Drupal.t('Work Email') + '*" type="text" name="Email_Address" id="wl-email" value=""> </fieldset> <fieldset class="demofrm phone-number"> <select id="MECountryListing" data-businessemail="business" name="Country" class="cont"> <option value="" name="-Select-" data-ipcode="-Select-" data-country-code="-Select-">-Select Country-</option> <option value="Afghanistan" name="Afghanistan" data-ipcode="AF" data-country-code="+93">Afghanistan</option> <option value="Aland Islands" name="Aland Islands" data-ipcode="AX" data-country-code="+358">Aland Islands</option> <option value="Albania" name="Albania" data-ipcode="AL" data-country-code="+355">Albania</option> <option value="Algeria" name="Algeria" data-ipcode="DZ" data-country-code="+213">Algeria</option> <option value="American Samoa" name="American Samoa" data-ipcode="AS" data-country-code="+1-684">American Samoa</option> <option value="Andorra" name="Andorra" data-ipcode="AD" data-country-code="+376">Andorra</option> <option value="Angola" name="Angola" data-ipcode="AO" data-country-code="+244">Angola</option> <option value="Anguilla" name="Anguilla" data-ipcode="AI" data-country-code="+1-264">Anguilla</option> <option value="Antarctica" name="Antarctica" data-ipcode="AQ" data-country-code="+672">Antarctica</option> <option value="Antigua and Barbuda" name="Antigua and Barbuda" data-ipcode="AG" data-country-code="+1-268">Antigua and Barbuda</option> <option value="Argentina" name="Argentina" data-ipcode="AR" data-country-code="+54">Argentina</option> <option value="Armenia" name="Armenia" data-ipcode="AM" data-country-code="+374">Armenia</option> <option value="Aruba" name="Aruba" data-ipcode="AW" data-country-code="+297">Aruba</option> <option value="Australia" name="Australia" data-ipcode="AU" data-country-code="+61">Australia</option> <option value="Austria" name="Austria" data-ipcode="AT" data-country-code="+43">Austria</option> <option value="Azerbaijan" name="Azerbaijan" data-ipcode="AZ" data-country-code="+994">Azerbaijan</option> <option value="Bahamas" name="Bahamas" data-ipcode="BS" data-country-code="+1-242">Bahamas</option> <option value="Bahrain" name="Bahrain" data-ipcode="BH" data-country-code="+973">Bahrain</option> <option value="Bangladesh" name="Bangladesh" data-ipcode="BD" data-country-code="+880">Bangladesh</option> <option value="Barbados" name="Barbados" data-ipcode="BB" data-country-code="+1-246">Barbados</option> <option value="Belarus" name="Belarus" data-ipcode="BY" data-country-code="+375">Belarus</option> <option value="Belgium" name="Belgium" data-ipcode="BE" data-country-code="+32">Belgium</option> <option value="Belize" name="Belize" data-ipcode="BZ" data-country-code="+501">Belize</option> <option value="Benin" name="Benin" data-ipcode="BJ" data-country-code="+229">Benin</option> <option value="Bermuda" name="Bermuda" data-ipcode="BM" data-country-code="+1-441">Bermuda</option> <option value="Bhutan" name="Bhutan" data-ipcode="BT" data-country-code="+975">Bhutan</option> <option value="Bolivia" name="Bolivia" data-ipcode="BO" data-country-code="+591">Bolivia</option> <option value="Bonaire, Sint Eustatius and Saba" name="Bonaire, Sint Eustatius and Saba" data-ipcode="BQ" data-country-code="+599">Bonaire, Sint Eustatius and Saba</option> <option value="Bosnia and Herzegovina" name="Bosnia and Herzegovina" data-ipcode="BA" data-country-code="+387">Bosnia and Herzegovina</option> <option value="Botswana" name="Botswana" data-ipcode="BW" data-country-code="+267">Botswana</option> <option value="Bouvet Island" name="Bouvet Island" data-ipcode="BV" data-country-code="+47">Bouvet Island</option> <option value="Brazil" name="Brazil" data-ipcode="BR" data-country-code="+55">Brazil</option> <option value="British Indian Ocean Territory" name="British Indian Ocean Territory" data-ipcode="IO" data-country-code="+246">British Indian Ocean Territory</option> <option value="British Virgin Islands" name="British Virgin Islands" data-ipcode="VG" data-country-code="+1-284">British Virgin Islands</option> <option value="Brunei Darussalam" name="Brunei Darussalam" data-ipcode="BN" data-country-code="+673">Brunei Darussalam</option> <option value="Bulgaria" name="Bulgaria" data-ipcode="BG" data-country-code="+359">Bulgaria</option> <option value="Burkina Faso" name="Burkina Faso" data-ipcode="BF" data-country-code="+226">Burkina Faso</option> <option value="Burundi" name="Burundi" data-ipcode="BI" data-country-code="+257">Burundi</option> <option value="Cabo Verde" name="Cabo Verde" data-ipcode="CV" data-country-code="+238">Cabo Verde</option> <option value="Cambodia" name="Cambodia" data-ipcode="KH" data-country-code="+855">Cambodia</option> <option value="Cameroon" name="Cameroon" data-ipcode="CM" data-country-code="+237">Cameroon</option> <option value="Canada" name="Canada" data-ipcode="CA" data-country-code="+1">Canada</option> <option value="Cayman Islands" name="Cayman Islands" data-ipcode="KY" data-country-code="+1-345">Cayman Islands</option> <option value="Central African Republic" name="Central African Republic" data-ipcode="CF" data-country-code="+236">Central African Republic</option> <option value="Chad" name="Chad" data-ipcode="TD" data-country-code="+235">Chad</option> <option value="Chile" name="Chile" data-ipcode="CL" data-country-code="+56">Chile</option> <option value="China" name="China" data-ipcode="CN" data-country-code="+86">China</option> <option value="Christmas Island" name="Christmas Island" data-ipcode="CX" data-country-code="+53">Christmas Island</option> <option value="Cocos" name="Cocos" data-ipcode="CC" data-country-code="+61">Cocos</option> <option value="Colombia" name="Colombia" data-ipcode="CO" data-country-code="+57">Colombia</option> <option value="Comoros" name="Comoros" data-ipcode="KM" data-country-code="+269">Comoros</option> <option value="Congo" name="Congo" data-ipcode="CG" data-country-code="+243">Congo</option> <option value="Congo, The Democratic Republic" name="Congo, The Democratic Republic" data-ipcode="CD" data-country-code="+242">Congo, The Democratic Republic</option> <option value="Cook Islands" name="Cook Islands" data-ipcode="CK" data-country-code="+682">Cook Islands</option> <option value="Costa Rica" name="Costa Rica" data-ipcode="CR" data-country-code="+506">Costa Rica</option> <option value="Cote d\'Ivoire" name="Cote d\'Ivoire" data-ipcode="CI" data-country-code="+225">Cote d\'Ivoire</option> <option value="Croatia" name="Croatia" data-ipcode="HR" data-country-code="+385">Croatia</option> <option value="Cuba" name="Cuba" data-ipcode="CU" data-country-code="+53">Cuba</option> <option value="Curacao" name="Curacao" data-ipcode="CW" data-country-code="+599">Curacao</option> <option value="Cyprus" name="Cyprus" data-ipcode="CY" data-country-code="+357">Cyprus</option> <option value="Czech Republic" name="Czech Republic" data-ipcode="CZ" data-country-code="+420">Czech Republic</option> <option value="Denmark" name="Denmark" data-ipcode="DK" data-country-code="+45">Denmark</option> <option value="Djibouti" name="Djibouti" data-ipcode="DJ" data-country-code="+253">Djibouti</option> <option value="Dominica" name="Dominica" data-ipcode="DM" data-country-code="+1-767">Dominica</option> <option value="Dominican Republic" name="Dominican Republic" data-ipcode="DO" data-country-code="+1-809">Dominican Republic</option> <option value="Ecuador" name="Ecuador" data-ipcode="EC" data-country-code="+593">Ecuador</option> <option value="Egypt" name="Egypt" data-ipcode="EG" data-country-code="+20">Egypt</option> <option value="El Salvador" name="El Salvador" data-ipcode="SV" data-country-code="+503">El Salvador</option> <option value="Equatorial Guinea" name="Equatorial Guinea" data-ipcode="GQ" data-country-code="+240">Equatorial Guinea</option> <option value="Eritrea" name="Eritrea" data-ipcode="ER" data-country-code="+291">Eritrea</option> <option value="Estonia" name="Estonia" data-ipcode="EE" data-country-code="+372">Estonia</option> <option value="Ethiopia" name="Ethiopia" data-ipcode="ET" data-country-code="+251">Ethiopia</option> <option value="Falkland Islands (Malvinas)" name="Falkland Islands (Malvinas)" data-ipcode="FK" data-country-code="+500">Falkland Islands (Malvinas)</option> <option value="Faroe Islands" name="Faroe Islands" data-ipcode="FO" data-country-code="+298">Faroe Islands</option> <option value="Fiji" name="Fiji" data-ipcode="FJ" data-country-code="+679">Fiji</option> <option value="Finland" name="Finland" data-ipcode="FI" data-country-code="+358">Finland</option> <option value="France" name="France" data-ipcode="FR" data-country-code="+33">France</option> <option value="French Guiana" name="French Guiana" data-ipcode="GF" data-country-code="+594">French Guiana</option> <option value="French Polynesia" name="French Polynesia" data-ipcode="PF" data-country-code="+689">French Polynesia</option> <option value="French Southern Territories" name="French Southern Territories" data-ipcode="TF" data-country-code="+262">French Southern Territories</option> <option value="Gabon" name="Gabon" data-ipcode="GA" data-country-code="+241">Gabon</option> <option value="Gambia" name="Gambia" data-ipcode="GM" data-country-code="+220">Gambia</option> <option value="Georgia" name="Georgia" data-ipcode="GE" data-country-code="+995">Georgia</option> <option value="Germany" name="Germany" data-ipcode="DE" data-country-code="+49">Germany</option> <option value="Ghana" name="Ghana" data-ipcode="GH" data-country-code="+233">Ghana</option> <option value="Gibraltar" name="Gibraltar" data-ipcode="GI" data-country-code="+350">Gibraltar</option> <option value="Greece" name="Greece" data-ipcode="GR" data-country-code="+30">Greece</option> <option value="Greenland" name="Greenland" data-ipcode="GL" data-country-code="+299">Greenland</option> <option value="Grenada" name="Grenada" data-ipcode="GD" data-country-code="+1-473">Grenada</option> <option value="Guadeloupe" name="Guadeloupe" data-ipcode="GP" data-country-code="+590">Guadeloupe</option> <option value="Guam" name="Guam" data-ipcode="GU" data-country-code="+1-671">Guam</option> <option value="Guatemala" name="Guatemala" data-ipcode="GT" data-country-code="+502">Guatemala</option> <option value="Guernsey" name="Guernsey" data-ipcode="GG" data-country-code="+44">Guernsey</option> <option value="Guinea" name="Guinea" data-ipcode="GN" data-country-code="+224">Guinea</option> <option value="Guinea-Bissau" name="Guinea-Bissau" data-ipcode="GW" data-country-code="+245">Guinea-Bissau</option> <option value="Guyana" name="Guyana" data-ipcode="GY" data-country-code="+592">Guyana</option> <option value="Haiti" name="Haiti" data-ipcode="HT" data-country-code="+509">Haiti</option> <option value="Heard Island and Mcdonald Islands" name="Heard Island and Mcdonald Islands" data-ipcode="HM" data-country-code="+672">Heard Island and Mcdonald Islands</option> <option value="Holy See" name="Holy See" data-ipcode="VA" data-country-code="+379">Holy See</option> <option value="Honduras" name="Honduras" data-ipcode="HN" data-country-code="+504">Honduras</option> <option value="Hong Kong/China" name="Hong Kong/China" data-ipcode="HK" data-country-code="+852">Hong Kong/China</option> <option value="Hungary" name="Hungary" data-ipcode="HU" data-country-code="+36">Hungary</option> <option value="Iceland" name="Iceland" data-ipcode="IS" data-country-code="+354">Iceland</option> <option value="India" name="India" data-ipcode="IN" data-country-code="+91">India</option> <option value="Indonesia" name="Indonesia" data-ipcode="ID" data-country-code="+62">Indonesia</option> <option value="Iran" name="Iran" data-ipcode="IR" data-country-code="+98">Iran</option> <option value="Iraq" name="Iraq" data-ipcode="IQ" data-country-code="+964">Iraq</option> <option value="Ireland" name="Ireland" data-ipcode="IE" data-country-code="+353">Ireland</option> <option value="Isle of Man" name="Isle of Man" data-ipcode="IM" data-country-code="+44-1624">Isle of Man</option> <option value="Israel" name="Israel" data-ipcode="IL" data-country-code="+972">Israel</option> <option value="Italy" name="Italy" data-ipcode="IT" data-country-code="+39">Italy</option> <option value="Jamaica" name="Jamaica" data-ipcode="JM" data-country-code="+1-876">Jamaica</option> <option value="Japan" name="Japan" data-ipcode="JP" data-country-code="+81">Japan</option> <option value="Jersey" name="Jersey" data-ipcode="JE" data-country-code="+44-1534">Jersey</option> <option value="Jordan" name="Jordan" data-ipcode="JO" data-country-code="+962">Jordan</option> <option value="Kazakhstan" name="Kazakhstan" data-ipcode="KZ" data-country-code="+7">Kazakhstan</option> <option value="Kenya" name="Kenya" data-ipcode="KE" data-country-code="+254">Kenya</option> <option value="Kiribati" name="Kiribati" data-ipcode="KI" data-country-code="+686">Kiribati</option> <option value="Korea, Democratic People\'s Republic" name="Korea, Democratic People\'s Republic" data-ipcode="KP" data-country-code="+850">Korea, Democratic People\'s Republic</option> <option value="Korea" name="Korea" data-ipcode="KR" data-country-code="+82">Korea</option> <option value="Kosovo" name="Kosovo" data-ipcode="XK" data-country-code="+383">Kosovo</option> <option value="Kuwait" name="Kuwait" data-ipcode="KW" data-country-code="+965">Kuwait</option> <option value="Kyrgyzstan" name="Kyrgyzstan" data-ipcode="KG" data-country-code="+996">Kyrgyzstan</option> <option value="Lao People\'s Democratic Republic" name="Lao People\'s Democratic Republic" data-ipcode="LA" data-country-code="+856">Lao People\'s Democratic Republic</option> <option value="Latvia" name="Latvia" data-ipcode="LV" data-country-code="+371">Latvia</option> <option value="Lebanon" name="Lebanon" data-ipcode="LB" data-country-code="+961">Lebanon</option> <option value="Lesotho" name="Lesotho" data-ipcode="LS" data-country-code="+266">Lesotho</option> <option value="Liberia" name="Liberia" data-ipcode="LR" data-country-code="+231">Liberia</option> <option value="Libya" name="Libya" data-ipcode="LY" data-country-code="+218">Libya</option> <option value="Liechtenstein" name="Liechtenstein" data-ipcode="LI" data-country-code="+423">Liechtenstein</option> <option value="Lithuania" name="Lithuania" data-ipcode="LT" data-country-code="+370">Lithuania</option> <option value="Luxembourg" name="Luxembourg" data-ipcode="LU" data-country-code="+352">Luxembourg</option> <option value="Macau/China" name="Macau/China" data-ipcode="MO" data-country-code="+853">Macau/China</option> <option value="Macedonia, The Former Yugoslav Republic" name="Macedonia, The Former Yugoslav Republic" data-ipcode="MK" data-country-code="+389">Macedonia, The Former Yugoslav Republic</option> <option value="Madagascar" name="Madagascar" data-ipcode="MG" data-country-code="+261">Madagascar</option> <option value="Malawi" name="Malawi" data-ipcode="MW" data-country-code="+265">Malawi</option> <option value="Malaysia" name="Malaysia" data-ipcode="MY" data-country-code="+60">Malaysia</option> <option value="Maldives" name="Maldives" data-ipcode="MV" data-country-code="+960">Maldives</option> <option value="Mali" name="Mali" data-ipcode="ML" data-country-code="+223">Mali</option> <option value="Malta" name="Malta" data-ipcode="MT" data-country-code="+356">Malta</option> <option value="Marshall Islands" name="Marshall Islands" data-ipcode="MH" data-country-code="+692">Marshall Islands</option> <option value="Martinique" name="Martinique" data-ipcode="MQ" data-country-code="+596">Martinique</option> <option value="Mauritania" name="Mauritania" data-ipcode="MR" data-country-code="+222">Mauritania</option> <option value="Mauritius" name="Mauritius" data-ipcode="MU" data-country-code="+230">Mauritius</option> <option value="Mayotte" name="Mayotte" data-ipcode="YT" data-country-code="+269">Mayotte</option> <option value="Mexico" name="Mexico" data-ipcode="MX" data-country-code="+52">Mexico</option> <option value="Micronesia, Federated States" name="Micronesia, Federated States" data-ipcode="FM" data-country-code="+691">Micronesia, Federated States</option> <option value="Moldova" name="Moldova" data-ipcode="MD" data-country-code="+373">Moldova</option> <option value="Monaco" name="Monaco" data-ipcode="MC" data-country-code="+377">Monaco</option> <option value="Mongolia" name="Mongolia" data-ipcode="MN" data-country-code="+976">Mongolia</option> <option value="Montenegro" name="Montenegro" data-ipcode="ME" data-country-code="+382">Montenegro</option> <option value="Montserrat" name="Montserrat" data-ipcode="MS" data-country-code="+1-664">Montserrat</option> <option value="Morocco" name="Morocco" data-ipcode="MA" data-country-code="+212">Morocco</option> <option value="Mozambique" name="Mozambique" data-ipcode="MZ" data-country-code="+258">Mozambique</option> <option value="Myanmar" name="Myanmar" data-ipcode="MM" data-country-code="+95">Myanmar</option> <option value="Namibia" name="Namibia" data-ipcode="NA" data-country-code="+264">Namibia</option> <option value="Nauru" name="Nauru" data-ipcode="NR" data-country-code="+674">Nauru</option> <option value="Nepal" name="Nepal" data-ipcode="NP" data-country-code="+977">Nepal</option> <option value="Netherlands" name="Netherlands" data-ipcode="NL" data-country-code="+31">Netherlands</option> <option value="Netherlands Antilles" name="Netherlands Antilles" data-ipcode="AN" data-country-code="+599">Netherlands Antilles</option> <option value="New Caledonia" name="New Caledonia" data-ipcode="NC" data-country-code="+687">New Caledonia</option> <option value="New Zealand" name="New Zealand" data-ipcode="NZ" data-country-code="+64">New Zealand</option> <option value="Nicaragua" name="Nicaragua" data-ipcode="NI" data-country-code="+505">Nicaragua</option> <option value="Niger" name="Niger" data-ipcode="NE" data-country-code="+227">Niger</option> <option value="Nigeria" name="Nigeria" data-ipcode="NG" data-country-code="+234">Nigeria</option> <option value="Niue" name="Niue" data-ipcode="NU" data-country-code="+683">Niue</option> <option value="Norfolk Island" name="Norfolk Island" data-ipcode="NF" data-country-code="+672">Norfolk Island</option> <option value="North Macedonia" name="North Macedonia" data-ipcode="MK" data-country-code="+389">North Macedonia</option> <option value="Northern Mariana Islands" name="Northern Mariana Islands" data-ipcode="MP" data-country-code="+1-670">Northern Mariana Islands</option> <option value="Norway" name="Norway" data-ipcode="NO" data-country-code="+47">Norway</option> <option value="Oman" name="Oman" data-ipcode="OM" data-country-code="+968">Oman</option> <option value="Pakistan" name="Pakistan" data-ipcode="PK" data-country-code="+92">Pakistan</option> <option value="Palau" name="Palau" data-ipcode="PW" data-country-code="+680">Palau</option> <option value="Palestine" name="Palestine" data-ipcode="PS" data-country-code="+970">Palestine</option> <option value="Panama" name="Panama" data-ipcode="PA" data-country-code="+507">Panama</option> <option value="Papua New Guinea" name="Papua New Guinea" data-ipcode="PG" data-country-code="+675">Papua New Guinea</option> <option value="Paraguay" name="Paraguay" data-ipcode="PY" data-country-code="+595">Paraguay</option> <option value="Peru" name="Peru" data-ipcode="PE" data-country-code="+51">Peru</option> <option value="Philippines" name="Philippines" data-ipcode="PH" data-country-code="+63">Philippines</option> <option value="Pitcairn Islands" name="Pitcairn Islands" data-ipcode="PN" data-country-code="+64">Pitcairn Islands</option> <option value="Poland" name="Poland" data-ipcode="PL" data-country-code="+48">Poland</option> <option value="Portugal" name="Portugal" data-ipcode="PT" data-country-code="+351">Portugal</option> <option value="Puerto Rico" name="Puerto Rico" data-ipcode="PR" data-country-code="+1">Puerto Rico</option> <option value="Qatar" name="Qatar" data-ipcode="QA" data-country-code="+974">Qatar</option> <option value="Raivavae" name="Raivavae" data-ipcode="PF" data-country-code="+689">Raivavae</option> <option value="Reunion" name="Reunion" data-ipcode="RE" data-country-code="+262">Reunion</option> <option value="Romania" name="Romania" data-ipcode="RO" data-country-code="+40">Romania</option> <option value="Russian Federation" name="Russian Federation" data-ipcode="RU" data-country-code="+7">Russian Federation</option> <option value="Rwanda" name="Rwanda" data-ipcode="RW" data-country-code="+250">Rwanda</option> <option value="Saint Barthelemy" name="Saint Barthelemy" data-ipcode="BL" data-country-code="+590">Saint Barthelemy</option> <option value="Saint Helena, Ascension and Tristan Da Cunha" name="Saint Helena, Ascension and Tristan Da Cunha" data-ipcode="SH" data-country-code="+290">Saint Helena, Ascension and Tristan Da Cunha</option> <option value="Saint Kitts and Nevis" name="Saint Kitts and Nevis" data-ipcode="KN" data-country-code="+1-869">Saint Kitts and Nevis</option> <option value="Saint Lucia" name="Saint Lucia" data-ipcode="LC" data-country-code="+1-758">Saint Lucia</option> <option value="Saint Martin" name="Saint Martin" data-ipcode="MF" data-country-code="+590">Saint Martin</option> <option value="Saint Pierre and Miquelon" name="Saint Pierre and Miquelon" data-ipcode="PM" data-country-code="+508">Saint Pierre and Miquelon</option> <option value="Saint Vincent and the Grenadines" name="Saint Vincent and the Grenadines" data-ipcode="VC" data-country-code="+1-784">Saint Vincent and the Grenadines</option> <option value="Samoa" name="Samoa" data-ipcode="WS" data-country-code="+685">Samoa</option> <option value="San Marino" name="San Marino" data-ipcode="SM" data-country-code="+378">San Marino</option> <option value="Sao Tome and Principe" name="Sao Tome and Principe" data-ipcode="ST" data-country-code="+239">Sao Tome and Principe</option> <option value="Saudi Arabia" name="Saudi Arabia" data-ipcode="SA" data-country-code="+966">Saudi Arabia</option> <option value="Senegal" name="Senegal" data-ipcode="SN" data-country-code="+221">Senegal</option> <option value="Serbia" name="Serbia" data-ipcode="RS" data-country-code="+381">Serbia</option> <option value="Seychelles" name="Seychelles" data-ipcode="SC" data-country-code="+248">Seychelles</option> <option value="Sierra Leone" name="Sierra Leone" data-ipcode="SL" data-country-code="+232">Sierra Leone</option> <option value="Singapore" name="Singapore" data-ipcode="SG" data-country-code="+65">Singapore</option> <option value="Sint Maarten" name="Sint Maarten" data-ipcode="SX" data-country-code="+1">Sint Maarten</option> <option value="Slovakia" name="Slovakia" data-ipcode="SK" data-country-code="+421">Slovakia</option> <option value="Slovenia" name="Slovenia" data-ipcode="SI" data-country-code="+386">Slovenia</option> <option value="Solomon Islands" name="Solomon Islands" data-ipcode="SB" data-country-code="+677">Solomon Islands</option> <option value="Somalia" name="Somalia" data-ipcode="SO" data-country-code="+252">Somalia</option> <option value="South Africa" name="South Africa" data-ipcode="ZA" data-country-code="+27">South Africa</option> <option value="South Georgia and The South Sandwich Islands" name="South Georgia and The South Sandwich Islands" data-ipcode="GS" data-country-code="+500">South Georgia and The South Sandwich Islands</option> <option value="South Sudan" name="South Sudan" data-ipcode="SS" data-country-code="+211">South Sudan</option> <option value="Spain" name="Spain" data-ipcode="ES" data-country-code="+34">Spain</option> <option value="Sri Lanka" name="Sri Lanka" data-ipcode="LK" data-country-code="+94">Sri Lanka</option> <option value="Sudan" name="Sudan" data-ipcode="SD" data-country-code="+249">Sudan</option> <option value="Suriname" name="Suriname" data-ipcode="SR" data-country-code="+597">Suriname</option> <option value="Svalbard and Jan Mayen" name="Svalbard and Jan Mayen" data-ipcode="SJ" data-country-code="+47">Svalbard and Jan Mayen</option> <option value="Swaziland" name="Swaziland" data-ipcode="SZ" data-country-code="+268">Swaziland</option> <option value="Sweden" name="Sweden" data-ipcode="SE" data-country-code="+46">Sweden</option> <option value="Switzerland" name="Switzerland" data-ipcode="CH" data-country-code="+41">Switzerland</option> <option value="Syrian Arab Republic" name="Syrian Arab Republic" data-ipcode="SY" data-country-code="+963">Syrian Arab Republic</option> <option value="Taiwan/China" name="Taiwan/China" data-ipcode="TW" data-country-code="+886">Taiwan/China</option> <option value="Tajikistan" name="Tajikistan" data-ipcode="TJ" data-country-code="+992">Tajikistan</option> <option value="Tanzania" name="Tanzania" data-ipcode="TZ" data-country-code="+255">Tanzania</option> <option value="Thailand" name="Thailand" data-ipcode="TH" data-country-code="+66">Thailand</option> <option value="Timor-Leste" name="Timor-Leste" data-ipcode="TL" data-country-code="+670">Timor-Leste</option> <option value="Togo" name="Togo" data-ipcode="TG" data-country-code="+228">Togo</option> <option value="Tokelau" name="Tokelau" data-ipcode="TK" data-country-code="+690">Tokelau</option> <option value="Tonga" name="Tonga" data-ipcode="TO" data-country-code="+676">Tonga</option> <option value="Trinidad and Tobago" name="Trinidad and Tobago" data-ipcode="TT" data-country-code="+1-868">Trinidad and Tobago</option> <option value="Tunisia" name="Tunisia" data-ipcode="TN" data-country-code="+216">Tunisia</option> <option value="Turkey" name="Turkey" data-ipcode="TR" data-country-code="+90">Turkey</option> <option value="Turkmenistan" name="Turkmenistan" data-ipcode="TM" data-country-code="+993">Turkmenistan</option> <option value="Turks and Caicos Islands" name="Turks and Caicos Islands" data-ipcode="TC" data-country-code="+1-649">Turks and Caicos Islands</option> <option value="Tuvalu" name="Tuvalu" data-ipcode="TV" data-country-code="+688">Tuvalu</option> <option value="Uganda" name="Uganda" data-ipcode="UG" data-country-code="+256">Uganda</option> <option value="Ukraine" name="Ukraine" data-ipcode="UA" data-country-code="+380">Ukraine</option> <option value="United Arab Emirates" name="United Arab Emirates" data-ipcode="AE" data-country-code="+971">United Arab Emirates</option> <option value="United Kingdom" name="United Kingdom" data-ipcode="GB" data-country-code="+44">United Kingdom</option> <option value="United States" name="United States" data-ipcode="US" data-country-code="+1">United States</option> <option value="United States Minor Outlying Islands" name="United States Minor Outlying Islands" data-ipcode="UM" data-country-code="+1">United States Minor Outlying Islands</option> <option value="Uruguay" name="Uruguay" data-ipcode="UY" data-country-code="+598">Uruguay</option> <option value="U.S. Virgin Islands" name="U.S. Virgin Islands" data-ipcode="VI" data-country-code="+1-340">U.S. Virgin Islands</option> <option value="Uzbekistan" name="Uzbekistan" data-ipcode="UZ" data-country-code="+998">Uzbekistan</option> <option value="Vanuatu" name="Vanuatu" data-ipcode="VU" data-country-code="+678">Vanuatu</option> <option value="Venezuela" name="Venezuela" data-ipcode="VE" data-country-code="+58">Venezuela</option> <option value="Vietnam" name="Vietnam" data-ipcode="VN" data-country-code="+84">Vietnam</option> <option value="Wallis and Futuna" name="Wallis and Futuna" data-ipcode="WF" data-country-code="+681">Wallis and Futuna</option> <option value="Western Sahara" name="Western Sahara" data-ipcode="EH" data-country-code="+212">Western Sahara</option> <option value="Yemen" name="Yemen" data-ipcode="YE" data-country-code="+967">Yemen</option> <option value="Zambia" name="Zambia" data-ipcode="ZM" data-country-code="+260">Zambia</option> <option value="Zimbabwe" name="Zimbabwe" data-ipcode="ZW" data-country-code="+263">Zimbabwe</option> </select> <input placeholder="' + Drupal.t('Phone Number') + '*" maxlength="15" name="Phone_Number1" type="text"> </fieldset> <fieldset class="demofrm ctextarea"> <textarea placeholder="' + Drupal.t('Brief overview of your organization') + '" name="Overview" type="text"></textarea> </fieldset> <fieldset class="added-placeholder sgnbtn"> <input type="submit" class="button" value="' + Drupal.t('Submit') + '"> </fieldset></form>'; $('#czone-home').append($contForm);
            $('#Zoho_Reports_White_Label_Request #page_url').val(window.location.href);
            $('#Zoho_Reports_White_Label_Request #nxtURL').val(window.location.href + '?success=1');

            // Store original text for all country options on page load
            $(document).ready(function () {
                $('#MECountryListing option').each(function () {
                    var $opt = $(this);
                    if (!$opt.data('original-text')) {
                        $opt.data('original-text', $opt.text());
                    }
                });
            });

            // Restore full country names when dropdown opens (focus/mousedown)
            // This ensures all options show full names in the dropdown list
            $(document).on('focus mousedown', '#MECountryListing', function () {
                var $select = $(this);

                // Store original text for all options if not already stored
                $select.find('option').each(function () {
                    var $opt = $(this);
                    if (!$opt.data('original-text')) {
                        $opt.data('original-text', $opt.text());
                    }
                });

                // Restore all options to their original text for the dropdown list
                // The selected option will be updated to ISO code after selection
                $select.find('option').each(function () {
                    var $opt = $(this);
                    var originalText = $opt.data('original-text');
                    if (originalText) {
                        $opt.text(originalText);
                    }
                });
            });

            // Country dropdown logic
            $(document).on('change', '#MECountryListing', function () {
                var $select = $(this);

                // FIRST: Store original text for all options if not already stored
                // This must happen before any text changes
                $select.find('option').each(function () {
                    var $opt = $(this);
                    if (!$opt.data('original-text')) {
                        // Store the current text as original if it hasn't been stored
                        // But if current text looks like an ISO code (short, 2-3 chars), 
                        // we need to get the original from the option's value or data
                        var currentText = $opt.text();
                        // If text is very short (likely ISO code), try to preserve what we have
                        // Otherwise store current text as original
                        $opt.data('original-text', currentText);
                    }
                });

                // SECOND: Restore ALL options (including previously selected) to original text
                // This prevents overlapping when switching between options
                $select.find('option').each(function () {
                    var $opt = $(this);
                    var originalText = $opt.data('original-text');
                    if (originalText) {
                        $opt.text(originalText);
                    }
                });

                // THIRD: Now get the newly selected option and update it
                var selectedOption = $select.find('option:selected');
                var countryCode = selectedOption.attr('data-country-code');
                var countryIsoCode = selectedOption.attr('data-ipcode');
                var countryName = selectedOption.val();

                // Remove validation error if country is selected
                $('#country-error').remove();
                $select.removeClass('error');

                // Skip if no country selected or invalid country code
                if (!countryCode || countryCode === '-Select-' || countryCode === '' || !countryIsoCode || countryIsoCode === '-Select-') {
                    // Remove country code display if no country selected
                    $('#country-code-display').remove();
                    return;
                }

                // FOURTH: Update only the newly selected option to show ISO code
                if (countryIsoCode && countryIsoCode !== '-Select-') {
                    selectedOption.text(countryIsoCode);
                }

                // Display ISO country code (optional - can be removed if not needed)
                $('#country-code-display').remove();

                var phoneField = $('input[name="Phone_Number1"]');
                var currentPhone = phoneField.val();

                // Remove any existing country code prefix from phone field
                if (currentPhone && currentPhone.trim() !== '') {
                    // Remove any existing country code pattern (starts with +)
                    currentPhone = currentPhone.replace(/^\+\d{1,4}[\s\-]?/, '');
                    // Prepend new country code
                    if (currentPhone.trim() !== '') {
                        phoneField.val(countryCode + ' ' + currentPhone);
                    } else {
                        phoneField.val(countryCode);
                    }
                } else {
                    // If phone field is empty, just add the country code
                    phoneField.val(countryCode);
                }

                // Store country code and ISO code in data attributes for potential use
                phoneField.attr('data-country-code', countryCode);
                phoneField.attr('data-country-iso', countryIsoCode);
                phoneField.attr('data-country-name', countryName);
            });

            // Phone number input validation
            $(document).on('input blur', 'input[name="Phone_Number1"]', function () {
                var phoneField = $(this);
                var phoneNumber = phoneField.val();
                var countryCode = phoneField.attr('data-country-code');
                var phonePattern = /^[0-9\s\(\)\+\-]+$/;
                var onlySpecialChars = /^[\-\+\s\(\)]+$/;

                $('#phone-error').remove();
                phoneField.removeClass('error');

                // Ensure country code is present if country is selected
                if (countryCode && countryCode !== '-Select-' && countryCode !== '') {
                    // Check if phone number starts with the country code
                    var countryCodePattern = countryCode.replace(/[+]/g, '\\+');
                    var regex = new RegExp('^' + countryCodePattern + '\\s?');

                    if (!regex.test(phoneNumber)) {
                        // If country code is missing, add it
                        if (phoneNumber.trim() !== '') {
                            phoneField.val(countryCode + ' ' + phoneNumber);
                            phoneNumber = phoneField.val();
                        } else {
                            phoneField.val(countryCode);
                            phoneNumber = countryCode;
                        }
                    }
                }

                if (phoneNumber && phoneNumber.trim() !== '') {
                    if (onlySpecialChars.test(phoneNumber)) {
                        phoneField.addClass('error');
                        phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + Drupal.t('Please enter a valid phone number') + '</div>');
                        return false;
                    }
                    if (!phonePattern.test(phoneNumber)) {
                        phoneField.addClass('error');
                        phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + Drupal.t('Please enter a valid phone number') + '</div>');
                        return false;
                    }
                    // Count digits excluding country code if present
                    var digitsOnly = phoneNumber.replace(/[\s\(\)\+\-]/g, '');
                    var minDigits = 5;
                    if (countryCode && countryCode !== '-Select-' && countryCode !== '') {
                        // Remove country code digits from count
                        var countryCodeDigits = countryCode.replace(/[+\-\s]/g, '');
                        digitsOnly = digitsOnly.replace(new RegExp('^' + countryCodeDigits), '');
                        minDigits = 5; // Minimum digits after country code
                    }
                    // if (digitsOnly.length < minDigits) {
                    //     phoneField.addClass('error');
                    //     phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + Drupal.t('Phone number must be at least 5 digits') + '</div>');
                    //     return false;
                    // }
                }
            });

            // Initialize country code on page load - set default country based on CountryCode
            setTimeout(function () {
                var countrySelect = $('#MECountryListing');
                if (countrySelect.length) {
                    // Store original text for all options
                    countrySelect.find('option').each(function () {
                        var $opt = $(this);
                        if (!$opt.data('original-text')) {
                            $opt.data('original-text', $opt.text());
                        }
                    });

                    // Set default country based on CountryCode variable if it exists
                    if (typeof CountryCode !== 'undefined' && CountryCode) {
                        var defaultOption = countrySelect.find('option[data-ipcode="' + CountryCode + '"]');
                        if (defaultOption.length > 0) {
                            countrySelect.val(defaultOption.val());
                            // Show ISO code in selected option
                            var countryIsoCode = defaultOption.attr('data-ipcode');
                            if (countryIsoCode && countryIsoCode !== '-Select-') {
                                defaultOption.text(countryIsoCode);
                            }
                            // Trigger change to initialize phone number with country code
                            countrySelect.trigger('change');
                        }
                    } else {
                        // If no CountryCode, check if country is already selected
                        if (countrySelect.val() && countrySelect.val() !== '') {
                            var selectedOption = countrySelect.find('option:selected');
                            var countryIsoCode = selectedOption.attr('data-ipcode');
                            if (countryIsoCode && countryIsoCode !== '-Select-') {
                                selectedOption.text(countryIsoCode);
                            }
                            countrySelect.trigger('change');
                        }
                    }
                }
            }, 100);

            if (global_getUrlParam('success') == '1') {
                $('.white-Label-form-request .signup-box .result').css('display', 'block');
                setTimeout(function () {
                    $('.white-Label-form-request .signup-box .result').css('display', 'none');
                }, 5000);
                $(".zreq-form").on("click", function (e) {
                    e.preventDefault();
                    $(".formSec").addClass("active").css("transition", "all ease 0.75s");
                    $("#czone-home").show();
                    $(".freeze_layer").fadeIn(400);
                    $("body").addClass("fixed-pos");
                    $('.white-Label-form-request .signup-box .result').css('display', 'block');
                    setTimeout(function () {
                        $('.white-Label-form-request .signup-box .result').css('display', 'none');
                    }, 5000);
                });
            }

        } else {
            $('.signup-box .get-signup-plan, .signup-box .banner-signup').show();
            $signupForm = '<div class="on-line-premise-container"><form action="https://creatorapp.zoho.in/adventnetwebmaster/products-get-quote-forms-details/form/Zoho_Reports_OnPremise_Download_Request/clientadd/NaSCuRf752bNeXVHOPAyushj15bz1jfkTY5AysfEaegDXbq46jU5zHfn2pqd2kra432G7vbtSM8n9tvmSrWyRYDAB9VCbb2Tr0JD?nexturl=https://www.zoho.com/analytics/onpremise/download-thankyou.html" class="zgdprform-zohocreator" colvalue="1"  formtype="1" id="licen-request" method="post"  novalidate="novalidate"><p style="display:none"><input id="Reg_Source" name="RegistrationSource" type="hidden" value="Web Downloads"><input name="ZohoService" type="hidden" value="Analytics"><input name="EditionRegistered" type="hidden" value="ANALYTICS_ONPREMISE"><input name="PotentialName" type="hidden" value="ANALYTICS_ONPREMISE"></p> <div class="zfield-container"> <div class="zfield"> <input class="form-control zc_textfield zc-LastName" placeholder="' + Drupal.t('Name *') + '" id="zc-LastName" maxlength="255" name="LastName" required="required" title="" type="text" value="" /> </div> </div> <div class="zfield-container"> <div class="zfield"> <input class="form-control zc_textfield zc-Email" id="zc-Email" placeholder="' + Drupal.t('Business Email *') + '" maxlength="255" name="Email" required="required" title="" type="text" value="" /> </div> </div><div class="zfield-container"> <div class="zfield"> <input class="form-control zc_textfield" id="onpremise-phone" required="required" maxlength="255" name="Phone" title="" type="text" value="" placeholder="' + Drupal.t('Phone *') + '" /> </div> </div><div class="zfield-container"> <div class="zfield deploy-option"><div class="deploy-mode-wrap"><select name="Deploy_on"><option value="">' + Drupal.t('Select Deployment mode *') + '</option><option id="WS" value="Windows">Windows Server</option><option id="LS" value="Linux">Linux Server</option><option id="AWS" value="AWS">AWS</option><option id="Docker" value="Docker">Docker</option><option id="Azure" value="Azure">Azure</option></select></div></div> </div> <div class="zfield-container md5sumval"><div class="zfield"><p><strong>MD5sum value:</strong> <span id="MD5sum-Windows">&nbsp;</span><span id="MD5sum-Linux">&nbsp;</span> </p></div></div><div class="zfield-container aws-field"> <div class="zfield"> <div class="aws-option-wrap"> <select class="form-input aws-option" required="required" name="Choose_a_deployment_tie" id="aws-deployment-tier" placeholder="Select"> <option value="">' + Drupal.t('Select deployment tier *') + '</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-fd4m3wjir4tnk?applicationId%3DAWSMPContessa%26ref_%3Dbeagle%26sr%3D0-1" value="BYOL">BYOL</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-7aakb7sjllzrq?sr%3D0-4%26ref_%3Dbeagle%26applicationId%3DAWSMPContessa" value="5 Users">5 ' + Drupal.t('Users') + '</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-l5kyn7fjb62fu?sr%3D0-3%26ref_%3Dbeagle%26applicationId%3DAWSMPContessa" value="10 Users">10 ' + Drupal.t('Users') + '</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-pxwakfffdsxmi?applicationId%3DAWSMPContessa%26ref_%3Dbeagle%26sr%3D0-2" value="50 Users">50 ' + Drupal.t('Users') + '</option> </select> </div> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkLeadSrc" maxlength="255" name="MarkLeadSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkLastSrc" maxlength="255" name="MarkLastSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkRefURL" maxlength="255" name="MarkRefURL" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkSrc" maxlength="255" name="MarkSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container country-fld"> <div class="zfield"> <span class="placecountryregion">' + Drupal.t('Country/Region') + '</span><div class="zgdprform-countrylist-container">&nbsp;</div> </div> </div><div class="zgdprform-opt-container">&nbsp;</div> <div class="zfield-container zfield-container-submit"><div class="zfield"> <input class="zc-live-primary-btn btn btn-download" id="buttn_visitor" title="" type="submit" value="' + Drupal.t('Download now') + '" /> </div> </div> </form></div>';
            $('#czone-home').append($signupForm);
        }
        //z_add_account_script();
        /*$('body').on('click', '#zoption-online', function () {
            $('.on-line-premise-container').hide();
            $('#signupform, .socl-signup').show();
            $('.zfield-container.aws-field').hide();
            $("#os-aws").prop('checked', false);
        });
        $('body').on('click', '#zoption-onpremise', function () {
            $('.on-line-premise-container').show();
            $('#signupform, .socl-signup').hide();
            addjqueryvalidate();
        });*/
        // } else if ($('#czone-signup').length > 0 && $('body').hasClass('zw-template-zp_signup_2_0')) {
    } else if ($('#czone-signup').length > 0) {
        //$('#czone-signup').html('');
        $('.signup-box .get-signup-plan, .signup-box .banner-signup').show();
        $('#czone-signup').addClass('czone-dc');
        $signupForm = '<div class="on-line-premise-container"> <form action="https://creatorapp.zoho.in/adventnetwebmaster/products-get-quote-forms-details/form/Zoho_Reports_OnPremise_Download_Request/clientadd/NaSCuRf752bNeXVHOPAyushj15bz1jfkTY5AysfEaegDXbq46jU5zHfn2pqd2kra432G7vbtSM8n9tvmSrWyRYDAB9VCbb2Tr0JD?nexturl=https://www.zoho.com/analytics/onpremise/download-thankyou.html" class="zgdprform-zohocreator" colvalue="1"  formtype="1" id="licen-request" method="post"  novalidate="novalidate"><p style="display:none"><input id="Reg_Source" name="RegistrationSource" type="hidden" value="Web Downloads"><input name="ZohoService" type="hidden" value="Analytics"><input name="EditionRegistered" type="hidden" value="ANALYTICS_ONPREMISE"><input name="PotentialName" type="hidden" value="ANALYTICS_ONPREMISE"></p> <div class="zfield-container sgfrm"> <div class="zfield"> <span class="placeholder">' + Drupal.t('Name') + ' *</span> <input class="form-control zc_textfield zc-LastName" id="zc-LastName" maxlength="255" name="LastName" required="required" title="" type="text" value="" /> </div> </div> <div class="zfield-container sgfrm"> <div class="zfield"> <span class="placeholder">' + Drupal.t('Business Email') + ' *</span> <input class="form-control zc_textfield zc-Email" id="zc-Email" maxlength="255" name="Email" required="required" title="" type="text" value="" /> </div> </div> <div class="zfield-container sgfrm"> <div class="zfield"> <span class="placeholder">' + Drupal.t('Phone') + ' *</span> <input class="form-control zc_textfield" id="onpremise-phone" required="required" maxlength="255" name="Phone" title="" type="text" value="" /> </div> </div> <div class="sgfrm"><div class="sgfrm za-select-container deploy-option"><span class="placeholder" aria-hidden="true">' + Drupal.t('Select Deployment mode *') + '</span><select id="customselect" name="Deploy_on" aria-label="Select Deployment mode"><option value="" selected="" data-tmval="temptitle">' + Drupal.t('Select Deployment mode *') + '</option><option id="WS" value="Windows">Windows Server</option><option id="LS" value="Linux">Linux Server</option><option id="AWS" value="AWS">AWS</option><option id="Docker" value="Docker">Docker</option><option id="Azure" value="Azure">Azure</option></select></div></div><div class="zfield-container md5sumval"><div class="zfield"><p><strong>MD5sum value:</strong> <span id="MD5sum-Windows">&nbsp;</span><span id="MD5sum-Linux">&nbsp;</span> </p></div></div><div class="zfield-container aws-field sgfrm"> <div class="zfield"> <div class="aws-option-wrap za-select-container"> <span class="placeholder" aria-hidden="true">' + Drupal.t('Select deployment tier *') + '</span> <select class="form-input aws-option" required="required" name="Choose_a_deployment_tie" id="aws-deployment-tier" placeholder="Select"> <option value="">' + Drupal.t('Select deployment tier *') + '</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-fd4m3wjir4tnk?applicationId%3DAWSMPContessa%26ref_%3Dbeagle%26sr%3D0-1" value="BYOL">BYOL</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-7aakb7sjllzrq?sr%3D0-4%26ref_%3Dbeagle%26applicationId%3DAWSMPContessa" value="5 Users">5 Users</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-l5kyn7fjb62fu?sr%3D0-3%26ref_%3Dbeagle%26applicationId%3DAWSMPContessa" value="10 Users">10 Users</option> <option title="https://aws.amazon.com/marketplace/pp/prodview-pxwakfffdsxmi?applicationId%3DAWSMPContessa%26ref_%3Dbeagle%26sr%3D0-2" value="50 Users">50 Users</option> </select> </div> </div> </div><div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkLeadSrc" maxlength="255" name="MarkLeadSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkLastSrc" maxlength="255" name="MarkLastSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkRefURL" maxlength="255" name="MarkRefURL" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container hidden"> <div class="zfield"> <input class="form-control zc_textfield" id="MarkSrc" maxlength="255" name="MarkSrc" title="" type="hidden" value="" /> </div> </div> <div class="zfield-container country-fld"> <div class="zfield"> <span class="placecountryregion">' + Drupal.t('Country/Region') + '</span><div class="zgdprform-countrylist-container">&nbsp;</div> </div> </div> <div class="zgdprform-opt-container">&nbsp;</div> <div class="zfield-container zfield-container-submit"> <div class="zfield"> <input class="zc-live-primary-btn btn btn-download" id="buttn_visitor" title="" type="submit" value="' + Drupal.t('Download now') + '" /> </div> </div> </form> </div>';
        $('#czone-signup').append($signupForm);
        //z_add_account_script();
        /*$('body').on('click', '#zoption-online', function () {
            $('.on-line-premise-container').hide();
            $('#signupform, .socl-signup').show();
            $('.zfield-container.aws-field').hide();
            $("#os-aws").prop('checked', false);
        });
        $('body').on('click', '#zoption-onpremise', function () {
            $('.on-line-premise-container').show();
            $('#signupform, .socl-signup').hide();
            addjqueryvalidate();
        });*/
    }


    setTimeout(function () {
        $('.zgdprform-countrylist-container, .zgdprform-state-container')
            .addClass('za-select-container');
    }, 1000);

    $('.on-line-premise-container form').each(function () {
        var hrefVal = $(this).attr("action");
        if (hrefVal.indexOf("oho.in") > 0) {
            var uHrefVal = hrefVal.replace("oho.in", "oho.com");
            $(this).attr({
                "action": uHrefVal
            });
        } else {
            var euHrefVal = hrefVal.replace("oho.eu", "oho.com");
            $(this).attr({
                "action": euHrefVal
            });
        }
    });
}//);


/*--------------Whitelabel creator form-------------*/

$(document).ready(function () {
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var $contact = getParameterByName('src');
    jQuery('.rd-success-msg').removeClass("out");
    var wlform = '<div class="rd-success-msg"><span></span><span>' + Drupal.t('Thanks for your interest. We shall get back to you shortly.') + '</span>';
    jQuery('body').append(wlform);
    if ($contact == 'whiteLabelRequest') {
        // var cururl = document.URL;
        // $("#nxtURL").attr("value", cururl);
        jQuery('.rd-success-msg').addClass("in");
        setTimeout(function () {
            jQuery('.rd-success-msg').removeClass("in");
            jQuery('.rd-success-msg').addClass("out");
        }, 3000);
    }

    function addWhiteLabelformValidate() {

        if ($('#czone-home').length > 0) {
            var FirstNameTxt = Drupal.t('Please enter your name');
            var BusinessEmail = Drupal.t('Please enter a valid email address');
            var PhoneNo = Drupal.t('Please enter a valid phone number');

            jQuery("#Zoho_Reports_White_Label_Request").validate({
                rules: {
                    Name: {
                        required: true
                    },
                    Email_Address: {
                        required: true,
                        email: true
                    },
                    Phone_Number1: {
                        required: true
                    }
                },
                messages: {
                    Name: FirstNameTxt,
                    Email_Address: BusinessEmail,
                    Phone_Number1: PhoneNo
                },
                submitHandler: function (form) {
                    var formdata = $("#Zoho_Reports_White_Label_Request");
                    var finalData = formdata.serialize();
                    var mailformat2 = /^[a-z0-9]([a-z0-9_\-\.\+]*)@([a-z0-9_\-\.]+)(\.[a-z]{2,4}){1,2}$/i;
                    var email2 = $('#wl-email').val();
                    if (!mailformat2.test(email2)) {
                        $('#wl-email').keyup(function () {
                            if ($('#wl-email').val() == '') {
                                $('#dwn-form-alert2').remove();
                            }
                        });
                        $('#dwn-form-alert2').remove();
                        $('#wl-email').after('<div id="dwn-form-alert2">Please enter a valid email address.</div>');
                        $('#wl-email').select();
                        return false;
                    }

                    // Validate phone number format
                    var phoneField = $('input[name="Phone_Number1"]');
                    var phoneNumber = phoneField.val();
                    var countryCode = phoneField.attr('data-country-code');
                    var phonePattern = /^[0-9\s\(\)\+\-]+$/;
                    var onlySpecialChars = /^[\-\+\s\(\)]+$/;

                    if (phoneNumber && phoneNumber.trim() !== '') {
                        // Ensure country code is present if country is selected
                        if (countryCode && countryCode !== '-Select-' && countryCode !== '') {
                            var countryCodePattern = countryCode.replace(/[+]/g, '\\+');
                            var regex = new RegExp('^' + countryCodePattern + '\\s?');
                            if (!regex.test(phoneNumber)) {
                                // Add country code if missing
                                phoneNumber = countryCode + ' ' + phoneNumber.replace(/^\+\d{1,4}[\s\-]?/, '');
                                phoneField.val(phoneNumber);
                            }
                        }

                        if (onlySpecialChars.test(phoneNumber)) {
                            $('#phone-error').remove();
                            phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + PhoneNo + '</div>');
                            phoneField.focus();
                            return false;
                        }
                        if (!phonePattern.test(phoneNumber)) {
                            $('#phone-error').remove();
                            phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + PhoneNo + '</div>');
                            phoneField.focus();
                            return false;
                        }

                        // Count digits - if country code is present, count digits excluding country code
                        var digitsOnly = phoneNumber.replace(/[\s\(\)\+\-]/g, '');
                        var minDigits = 5;
                        if (countryCode && countryCode !== '-Select-' && countryCode !== '') {
                            // Remove country code digits from count to validate remaining digits
                            var countryCodeDigits = countryCode.replace(/[+\-\s]/g, '');
                            var phoneWithoutCountryCode = digitsOnly.replace(new RegExp('^' + countryCodeDigits), '');
                            if (phoneWithoutCountryCode.length < minDigits) {
                                $('#phone-error').remove();
                                phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + PhoneNo + '</div>');
                                phoneField.focus();
                                return false;
                            }
                        } else {
                            // No country code, just check total digits
                            if (digitsOnly.length < minDigits) {
                                $('#phone-error').remove();
                                phoneField.after('<div id="phone-error" style="color: red; font-size: 11px; margin-top: 5px;">' + PhoneNo + '</div>');
                                phoneField.focus();
                                return false;
                            }
                        }
                    }
                    $('#phone-error').remove();
                    /*Embeded tracking*/
                    /* if (!$('.signup-box #Zoho_Reports_White_Label_Request input.button').hasClass('zwlf-disabled')) {
                        $.ajax({
                            type: "POST",
                            url: 'https://creator.zohopublic.com/addRecordValidate.do',
                            data: finalData,
                            success: function(data) {
                                var cscript = '<script type="text/javascript">try { window.ZTMData = window.ZTMData || []; window.ZTMData.push({ "event": "eventEmbeded" }); $zoho.salesiq.visitor.customaction({ "eventCategory": "Embedded-Analytics", "eventAction": "LeadSubmit", "eventLabel": "analytics" }); } catch (e) {};</script>';
                                $('body').append(cscript);
                            }
                        });
                        $('.signup-box #Zoho_Reports_White_Label_Request input.button').addClass('zwlf-disabled');
                    }*/
                    /*Embeded tracking end*/
                    var cscript = '<script type="text/javascript">try { window.ZTMData = window.ZTMData || []; window.ZTMData.push({ "event": "eventEmbeded" }); $zoho.salesiq.visitor.customaction({ "eventCategory": "Embedded-Analytics", "eventAction": "LeadSubmit", "eventLabel": "analytics" }); } catch (e) {};</script>';
                    // $('body').append(cscript);
                    form.submit();
                }

            });
        }

    }
    addWhiteLabelformValidate();


});

/*--------------Whitelabel creator form end-------------*/


/* Pricing Comp Page */
$(document).ready(function () {
    $('.node-type-new-product-pricing-comparision .bttomlinks p a').attr('href', 'http://zohopayments.wiki.zoho.' + 'com' + '/Zoho-Reports.html');

    // for (var i = 0; i < $('iframe').length; i++) {
    //     if (typeof $('iframe').eq(i).attr('src') != 'undefined') {
    //         var _v = $('iframe').eq(i).attr('src').split('.' + dcdomainOne).join('.' + _com);
    //         $('iframe').eq(i).attr('src', _v)
    //     }
    // }
    for (var i = 0; i < $('.popup-controller').length; i++) {
        if (typeof $('.popup-controller').eq(i).attr('data-form') != 'undefined') {
            var _v = $('.popup-controller').eq(i).attr('data-form').split('.' + dcdomainOne).join('.' + _com);
            $('.popup-controller').eq(i).attr('data-form', _v)
        }
    }
});

/* Pricing Comp Page - Ends */


/************** WEB form Code ************************/


function salesiq_visitor_W() {
    try {
        $zoho.salesiq.visitor.customaction('{"op":"Download","sn":"ZohoReports","version":"Windows"}');
    } catch (exp) { }
}

function salesiq_visitor_L() {
    try {
        $zoho.salesiq.visitor.customaction('{"op":"Download","sn":"ZohoReports","version":"Linux"}');
    } catch (exp) { }
}

function salesiq_visitor_aws() {
    try {
        $zoho.salesiq.visitor.customaction('{"op":"Download","sn":"ZohoReports","version":"aws"}');
    } catch (exp) { }
}

function salesiq_visitor_docker() {
    try {
        $zoho.salesiq.visitor.customaction('{"op":"Download","sn":"ZohoReports","version":"Docker"}');
    } catch (exp) { }
}


$(document).ready(function () {
    $('body').on('click', '#buttn_visitor', function () {
        if ($("#os-windows").is(':checked')) {
            salesiq_visitor_W();
        } else if ($("#os-linux").is(':checked')) {
            salesiq_visitor_L();
        } else if ($("#os-aws").is(':checked')) {
            salesiq_visitor_aws();
        } else if ($("#docker-onprem").is(':checked')) {
            salesiq_visitor_docker();
        }
    });
});


function toggleLappField() {
    $('#signup-termservice').toggleClass('unchecked');
    $('#signup-termservice').toggleClass('checked');
}



// ********** Zoho Analytics On-Premise Download form code End here *************


// function if DC india then block following mails
function validateBlockedDomains() {
    $('#dwn-form-alert').remove();
    var email = $("#zc-Email").val().trim();
    var country = $("#zcf_address_country").val();

    if (email === '') {
        $("#zc-Email").after('<label id="dwn-form-alert" style="color: red;">Please enter a valid business email</label>');
        $("#zc-Email").focus();
        return false;
    }

    var emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9_\-\.\+]*@([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        $("#zc-Email").after('<label id="dwn-form-alert" style="color: red;">Please use a valid business email</label>');
        $("#zc-Email").focus();
        return false;
    }

    var blockedDomains = ["@gmail.", "@gamil.", "@email.com", "@outlook.", "@icloud.", "@aol.", "@yahoo", "@ymail", "@mail.", "@msn", "@me.", "@mac.", "@hotmail", "@rediffmail", "@yandex", "@zohomail", "@privaterelay.appleid.com", "@live.", "@protonmail", "@zoho.com", "@proton.me", "@qq.com", "@163.com", "@free.fr", "@wanadoo.fr", "@orange.fr", "@rocketmail", "@googlemail", "@t-online", "@att.", "@gmx.de"];
    var emailDomain = "@" + email.split('@')[1].toLowerCase();

    if (country === "India" && blockedDomains.some(function (d) { return emailDomain.indexOf(d) !== -1; })) {
        $("#zc-Email").after('<label id="dwn-form-alert" style="color: red;">Please use a valid business email</label>');
        $("#zc-Email").focus();
        return false;
    }

    return true;
}

function addjqueryvalidate() {

    if (typeof jQuery.fn.validate !== 'function') {

        return;
    }

    if ($('#czone-home').length > 0 || $('#czone-signup').length > 0) {
        var LastNameTxt = Drupal.t('Please enter your name');
        var BusinessEmailTxt = Drupal.t('Please use a valid business email');
        var validEmail = Drupal.t('Please enter valid email address');
        var PhoneTxt = Drupal.t('Please enter a valid phone number');
        var osTxt = Drupal.t('Please select deployment mode');
        var DeployTire = Drupal.t('Please select deployment tier');
        var lappTxt = Drupal.t('Please read and accept the License Agreement & Privacy Policy');

        jQuery.validator.addMethod("validPhone", function (value, element) {
            return this.optional(element) || /^[\+\d][\d\s\-\(\)]+$/.test(value);
        }, "");

        jQuery("#licen-request").validate({
            onkeyup: function (element, event) {
                this.element(element);
            },
            onfocusout: function (element) {
                this.element(element);
            },
            rules: {
                LastName: { required: true },
                Email: { required: true },
                Phone: { required: true, validPhone: true },
                Deploy_on: { required: true },
                lapp: { required: true },
                Choose_a_deployment_tie: { required: true }
            },
            messages: {
                LastName: LastNameTxt,
                Email: { required: BusinessEmailTxt, email: validEmail },
                Phone: { required: PhoneTxt, validPhone: PhoneTxt },
                Deploy_on: osTxt,
                lapp: lappTxt,
                Choose_a_deployment_tie: DeployTire
            },
            submitHandler: function (form) {
                var $btn = $("#buttn_visitor");
                $btn.val(Drupal.t('Please wait...')).prop('disabled', true).css('opacity', '0.8');

                if (!validateBlockedDomains()) {
                    $btn.val(Drupal.t('Download now')).prop('disabled', false).css('opacity', '1');
                    return false;
                }

                form.submit();
            },
            invalidHandler: function () {
                $("#buttn_visitor").prop('disabled', false);
            }
        });

        $("#zc-Email").on("input", function () {
            validateBlockedDomains();
        });

        $(document).on("change", "#zcf_address_country", function () {
            validateBlockedDomains();
        });
        $(document).on("keypress", "#onpremise-phone", function (e) {
            var char = String.fromCharCode(e.which);
            if (!/[\d\s\+\-\(\)]/.test(char) && e.which !== 8) {
                e.preventDefault();
            }
        });

        $(document).on("input", "#onpremise-phone", function () {
            $(this).val($(this).val().replace(/[^\d\s\+\-\(\)]/g, ''));
            var validator = $("#licen-request").data("validator");
            if (validator) {
                validator.element("#onpremise-phone");
            }
        });
    }
}

$(document).ready(function () {

    var $form = $("#licen-request");

    if ($form.length > 0) {
        var baseAction = "https://creatorapp.zoho.in/adventnetwebmaster/products-get-quote-forms-details/form/Zoho_Reports_OnPremise_Download_Request/clientadd/NaSCuRf752bNeXVHOPAyushj15bz1jfkTY5AysfEaegDXbq46jU5zHfn2pqd2kra432G7vbtSM8n9tvmSrWyRYDAB9VCbb2Tr0JD?nexturl=";

        function updateFormAction(nextUrl) {
            $form.attr("action", baseAction + nextUrl);
        }

        function updateDeployOption() {
            var val = $('select[name="Deploy_on"]').val();
            var nextUrl = "";

            // MD5 visibility
            $('#MD5sum-Windows, #MD5sum-Linux').hide();
            if (val === 'Windows') {
                $('.md5sumval').show();
                $('#MD5sum-Windows').show();
            } else if (val === 'Linux') {
                $('.md5sumval').show();
                $('#MD5sum-Linux').show();
            } else {
                $('.md5sumval').hide();
            }

            // AWS field + button label + nextUrl
            if (val === 'Windows') {
                nextUrl = "https://www.zoho.com" + langsrc + "analytics/onpremise/download-thankyou.html?os=w";
                $("#Reg_Source").val("Web Downloads");
                $("#buttn_visitor").val(Drupal.t("Download now"));
                $('.aws-field').hide();
            } else if (val === 'Linux') {
                nextUrl = "https://www.zoho.com" + langsrc + "analytics/onpremise/download-thankyou.html?os=l";
                $("#Reg_Source").val("Web Downloads");
                $("#buttn_visitor").val(Drupal.t("Download now"));
                $('.aws-field').hide();
            } else if (val === 'Docker') {
                nextUrl = "https://hub.docker.com/r/zohoanalytics/onprem";
                $("#Reg_Source").val("Docker");
                $("#buttn_visitor").val(Drupal.t("Download now"));
                $('.aws-field').hide();
            } else if (val === 'Azure') {
                nextUrl = "https://azuremarketplace.microsoft.com/en-us/marketplace/apps/site24x7.zoho_analytics_on-premise?tab=Overview";
                $("#Reg_Source").val("Azure");
                $("#buttn_visitor").val(Drupal.t("Deploy now"));
                $('.aws-field').hide();
            } else if (val === 'AWS') {
                $('#aws-deployment-tier').val('');
                $("#Reg_Source").val("AWS");
                $("#buttn_visitor").val(Drupal.t("Deploy now"));
                $('.aws-field').show();
            } else {
                $('.aws-field').hide();
                $("#buttn_visitor").val(Drupal.t("Download now"));
            }

            if (nextUrl) {
                updateFormAction(nextUrl);
            }
        }

        // When AWS tier is selected, set URL from the option's title attribute
        $('body').on('change', '#aws-deployment-tier', function () {
            var awsUrl = $(this).find('option:selected').attr('title');
            if (awsUrl) {
                updateFormAction(awsUrl);
            }
        });

        $('body').on('change', "select[name='Deploy_on']", updateDeployOption);

        // Pre-select dropdown based on OS and run once on page load
        if (navigator.appVersion.indexOf("Win") !== -1) {
            $('select[name="Deploy_on"]').val('Windows');
        } else if (navigator.appVersion.indexOf("Linux") !== -1) {
            $('select[name="Deploy_on"]').val('Linux');
        }
        updateDeployOption();
    }

    // Handle download redirect on thank-you page
    var $osVal = global_getUrlParam('os');
    if ($osVal === 'w') {
        $('.main > .zcontainer').addClass('zcontainer-success');
        $('.zsuccess-msg a').attr('href', 'https://downloads.zohocdn.com/zaop/Zoho_Analytics_64bit.exe');
        location.href = "https://downloads.zohocdn.com/zaop/Zoho_Analytics_64bit.exe";
    } else if ($osVal === 'l') {
        $('.main > .zcontainer').addClass('zcontainer-success');
        $('.zsuccess-msg a').attr('href', 'https://downloads.zohocdn.com/zaop/Zoho_Analytics_64bit.bin');
        location.href = "https://downloads.zohocdn.com/zaop/Zoho_Analytics_64bit.bin";
    }

    addjqueryvalidate();

    $(document).on('submit', '#licen-request', function (e) {
        if (!validateBlockedDomains()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    });
});

$(document).ready(function () {
    // Function to set MD5 values (reusable)
    function setMD5Values() {
        if ($('#MD5sum-Windows').text().trim() === '') {
            $('#MD5sum-Windows').text('a1946cf60123466bbe7ad98da31c7856');
        }
        if ($('#MD5sum-Linux').text().trim() === '') {
            $('#MD5sum-Linux').text('a2dac108426db0e7d0ff8b351490ff50');
        }
    }

    // Set on page load
    setMD5Values();

    // Re-set after switch button click
    $(document).on('click', '.dc-switch-btn', function () {
        setTimeout(function () {
            setMD5Values();
        }, 100);
    });
});

// ********** Zoho Analytics On-Premise Download form code End here *************

$("#MarkRefURL").val(customvar.czmr());
var str = customvar.czms();
(str.split("|")[0] !== "") ? $("#MarkSrc").val(str.split("|")[0]) : '';
(str.split("|")[1] !== "") ? $("#MarkLeadSrc").val(str.split("|")[1]) : '';
(str.split("|")[2] !== "") ? $("#MarkLastSrc").val(str.split("|")[2]) : '';

$(document).ready(function () {
    /*CRM form Reported by*/
    $('#crmWebToEntityForm input[name="Name"]').keyup(function (e) {
        var getV = $(this).val();
        $("#crmWebToEntityForm input[name='Reported By']").attr('value', getV);
    });
    /*CRM form Reported by*/
});

/************** WEB form Code End ************************/


/*********************** Webinars Form Sarts ************************/
if ($('body').hasClass("zw-template-zp_recorded_webinar_detail_pages")) {
    $('body').click(function (e) {
        if (!$(e.target).hasClass("zvideo-mask") && !$(e.target).closest('.watch-now-popup').length && !$(e.target).closest('.za-play-btn').length) {
            $('.watch-now-popup').removeClass("active");
            setTimeout(function () {
                //$('.watch-now-popup').remove();
                $('span.zvideo-mask').removeClass("active");
                $('body').removeClass('crmWebForm');
                $('.za-play-btn').show();
            }, 500);
        }
    });

    function zcScptlessSubmit(parentNode) {
        var spmInput = parentNode.querySelector('#zc_spmSubmit');
        if (spmInput) { parentNode.removeChild(spmInput); }

        // Submit form data asynchronously so the page never redirects
        try {
            var formData = new FormData(parentNode);
            fetch(parentNode.action, { method: 'POST', body: formData, mode: 'no-cors' });
        } catch (e) { }

        // Close popup and autoplay the video
        window.zaVideoFormSubmitted = true;
        setTimeout(function () {
            $('.watch-now-popup').removeClass('active');
            $('body').removeClass('crmWebForm');
            $('span.zvideo-mask').removeClass('active');
            $('.za-play-btn').hide();
            var $iframe = $('.zwebinarvideo-wrap .zwebinarvideo-wrapinner iframe');
            $iframe[0] && $iframe.attr('allow', 'autoplay; fullscreen');
            var videoUrl = $iframe.attr('src');
            if (videoUrl) {
                var separator = videoUrl.indexOf('?') !== -1 ? '&' : '?';
                $iframe.attr('src', videoUrl + separator + 'autoplay=true&muted=true');
            }
            $('.zwebinarvideo-wrapinner span').removeClass('zvideo-mask');
        }, 300);

        return false;
    }

    var watchNowPopupNonEU = '<div class="watch-now-popup"><div class="signup-box"><h5>Thank you for your interest in this webinar. Please fill this form to continue.</h5><div class="result">Your request has been sent. We will reach out to you shortly.</div><div class="zanalytics-webinar-form"><form method="POST" id="zcampaignOptinForm" action="https://Zoho-ztl.maillist-manage.in/weboptin.zc" onsubmit="return zcScptlessSubmit(this)"><fieldset class="demofrm"><input name="FIRSTNAME" placeholder="First Name" type="text" maxlength="100"></fieldset><fieldset class="demofrm"><input name="LASTNAME" placeholder="Last Name" type="text" maxlength="50"></fieldset><fieldset class="demofrm"><input name="CONTACT_EMAIL" placeholder="Business Email *" type="email" required maxlength="100"></fieldset><fieldset class="demofrm"><input name="PHONE" placeholder="Phone Number" type="text" maxlength="20" class="phone-get"></fieldset><fieldset class="demofrm"><select name="COUNTRY" class="phone-get" changeitem="SIGNUP_FORM_FIELD" zc_display_name="Country"><option value="Choose an option">Choose an option</option><option value="Afghanistan">Afghanistan</option><option value="Aland Islands">Aland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua And Barbuda">Antigua And Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas">Bahamas</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia">Bolivia</option><option value="Bonaire, Saint Eustatius And Saba ">Bonaire, Saint Eustatius And Saba</option><option value="Bosnia And Herzegovina">Bosnia And Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory">British Indian Ocean Territory</option><option value="British Virgin Islands">British Virgin Islands</option><option value="Brunei">Brunei</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cape Verde">Cape Verde</option><option value="Cayman Islands">Cayman Islands</option><option value="Central African Republic">Central African Republic</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos Islands">Cocos Islands</option><option value="Colombia">Colombia</option><option value="Comoros">Comoros</option><option value="Cook Islands">Cook Islands</option><option value="Costa Rica">Costa Rica</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Curacao">Curacao</option><option value="Cyprus">Cyprus</option><option value="Czech Republic">Czech Republic</option><option value="Democratic Republic Of The Congo">Democratic Republic Of The Congo</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic">Dominican Republic</option><option value="East Timor">East Timor</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands">Falkland Islands</option><option value="Faroe Islands">Faroe Islands</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories">French Southern Territories</option><option value="Gabon">Gabon</option><option value="Gambia">Gambia</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-bissau">Guinea-bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island And Mcdonald Islands">Heard Island And Mcdonald Islands</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran">Iran</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle Of Man">Isle Of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Ivory Coast">Ivory Coast</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Kosovo">Kosovo</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Laos">Laos</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libya">Libya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia">Macedonia</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands">Marshall Islands</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia">Micronesia</option><option value="Moldova">Moldova</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="Netherlands Antilles">Netherlands Antilles</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger">Niger</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="North Korea">North Korea</option><option value="Northern Mariana Islands">Northern Mariana Islands</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestinian Territory">Palestinian Territory</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines">Philippines</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Republic Of The Congo">Republic Of The Congo</option><option value="Reunion">Reunion</option><option value="Romania">Romania</option><option value="Russia">Russia</option><option value="Rwanda">Rwanda</option><option value="Saint Barthelemy">Saint Barthelemy</option><option value="Saint Helena">Saint Helena</option><option value="Saint Kitts And Nevis">Saint Kitts And Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Martin">Saint Martin</option><option value="Saint Pierre And Miquelon">Saint Pierre And Miquelon</option><option value="Saint Vincent And The Grenadines">Saint Vincent And The Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome And Principe">Sao Tome And Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Serbia And Montenegro">Serbia And Montenegro</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Sint Maarten">Sint Maarten</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia And The South Sandwich Islands">South Georgia And The South Sandwich Islands</option><option value="South Korea">South Korea</option><option value="South Sudan">South Sudan</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan">Sudan</option><option value="Suriname">Suriname</option><option value="Svalbard And Jan Mayen">Svalbard And Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syria">Syria</option><option value="Taiwan">Taiwan</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania">Tanzania</option><option value="Thailand">Thailand</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad And Tobago">Trinidad And Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks And Caicos Islands">Turks And Caicos Islands</option><option value="Tuvalu">Tuvalu</option><option value="U.s. Virgin Islands">U.s. Virgin Islands</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates">United Arab Emirates</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Vatican">Vatican</option><option value="Venezuela">Venezuela</option><option value="Vietnam">Vietnam</option><option value="Wallis And Futuna">Wallis And Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option></select></fieldset><input type="hidden" name="fieldBorder" value="rgb(255, 255, 255)"><input type="hidden" name="zc_trackCode" id="zc_trackCode" value=""><input type="hidden" name="viewFrom" id="viewFrom" value="URL_ACTION"><input type="hidden" name="submitType" id="submitType" value="optinCustomView"><input type="hidden" name="lD" id="lD" value=""><input type="hidden" name="emailReportId" id="emailReportId" value=""><input type="hidden" name="zx" id="cmpZuid" value="1df991e1db"><input type="hidden" name="zcvers" value="2.0"><input type="hidden" name="oldListIds" id="allCheckedListIds" value=""><input type="hidden" name="mode" id="mode" value="OptinCreateView"><input type="hidden" name="zcld" id="zcld" value=""><input type="hidden" name="zctd" id="zctd" value=""><input type="hidden" name="document_domain" id="document_domain" value="crmplus.zoho.in"><input type="hidden" name="zc_Url" id="zc_Url" value="Zoho-ztl.maillist-manage.in"><input type="hidden" name="new_optin_response_in" id="new_optin_response_in" value="0"><input type="hidden" name="duplicate_optin_response_in" id="duplicate_optin_response_in" value="0"><input type="hidden" name="zc_formIx" id="zc_formIx" value="3z8b475ed6586b8b2a14ac0d6615eac36b8adab958b234415e4b39fd4a79601f3b"><input type="hidden" name="scriptless" id="scriptless" value="yes"><input type="hidden" id="zc_spmSubmit" name="zc_spmSubmit" value="ZCSPMSUBMIT"><div style="display:none" ishidden="true"><div><div><div name="SIGNUP_FORM_LABEL">Analytics - OD&nbsp;</div><select name="LEAD_CF10" changeitem="SIGNUP_FORM_FIELD" zc_display_name="Analytics - OD"><option value="Sales">Sales</option><option value="Marketing">Marketing</option><option value="Finance">Finance</option><option value="IT">IT</option><option value="Help Desk">Help Desk</option><option value="Project Mgmt">Project Mgmt</option><option value="HR">HR</option><option value="EA/WL">EA/WL</option><option value="Others">Others</option></select>&nbsp;</div></div><div></div></div><div class="sgnbtn added-placeholder"><input type="submit" value="Watch Now"></div></form></div></div></div>';

    var watchNowPopupEU = '<div class="watch-now-popup"><div class="signup-box"><h5>Thank you for your interest in this webinar. Please fill this form to continue.</h5><div class="result">Your request has been sent. We will reach out to you shortly.</div><div class="zanalytics-webinar-form"><form method="POST" id="zcampaignOptinForm" action="https://jvlz-zcmp.maillist-manage.eu/weboptin.zc" onsubmit="return zcScptlessSubmit(this)"><fieldset class="demofrm"><input name="FIRSTNAME" placeholder="First Name" type="text" maxlength="100"></fieldset><fieldset class="demofrm"><input name="LASTNAME" placeholder="Last Name" type="text" maxlength="50"></fieldset><fieldset class="demofrm"><input name="CONTACT_EMAIL" placeholder="Business Email *" type="email" required maxlength="100"></fieldset><fieldset class="demofrm"><input name="PHONE" placeholder="Phone Number" type="text" maxlength="20" class="phone-get"></fieldset><fieldset class="demofrm"><select name="COUNTRY" class="phone-get" changeitem="SIGNUP_FORM_FIELD" zc_display_name="Country"><option value="Choose an option">Choose an option</option><option value="Afghanistan">Afghanistan</option><option value="Aland Islands">Aland Islands</option><option value="Albania">Albania</option><option value="Algeria">Algeria</option><option value="American Samoa">American Samoa</option><option value="Andorra">Andorra</option><option value="Angola">Angola</option><option value="Anguilla">Anguilla</option><option value="Antarctica">Antarctica</option><option value="Antigua And Barbuda">Antigua And Barbuda</option><option value="Argentina">Argentina</option><option value="Armenia">Armenia</option><option value="Aruba">Aruba</option><option value="Australia">Australia</option><option value="Austria">Austria</option><option value="Azerbaijan">Azerbaijan</option><option value="Bahamas">Bahamas</option><option value="Bahrain">Bahrain</option><option value="Bangladesh">Bangladesh</option><option value="Barbados">Barbados</option><option value="Belarus">Belarus</option><option value="Belgium">Belgium</option><option value="Belize">Belize</option><option value="Benin">Benin</option><option value="Bermuda">Bermuda</option><option value="Bhutan">Bhutan</option><option value="Bolivia">Bolivia</option><option value="Bonaire, Saint Eustatius And Saba ">Bonaire, Saint Eustatius And Saba</option><option value="Bosnia And Herzegovina">Bosnia And Herzegovina</option><option value="Botswana">Botswana</option><option value="Bouvet Island">Bouvet Island</option><option value="Brazil">Brazil</option><option value="British Indian Ocean Territory">British Indian Ocean Territory</option><option value="British Virgin Islands">British Virgin Islands</option><option value="Brunei">Brunei</option><option value="Bulgaria">Bulgaria</option><option value="Burkina Faso">Burkina Faso</option><option value="Burundi">Burundi</option><option value="Cambodia">Cambodia</option><option value="Cameroon">Cameroon</option><option value="Canada">Canada</option><option value="Cape Verde">Cape Verde</option><option value="Cayman Islands">Cayman Islands</option><option value="Central African Republic">Central African Republic</option><option value="Chad">Chad</option><option value="Chile">Chile</option><option value="China">China</option><option value="Christmas Island">Christmas Island</option><option value="Cocos Islands">Cocos Islands</option><option value="Colombia">Colombia</option><option value="Comoros">Comoros</option><option value="Cook Islands">Cook Islands</option><option value="Costa Rica">Costa Rica</option><option value="Croatia">Croatia</option><option value="Cuba">Cuba</option><option value="Curacao">Curacao</option><option value="Cyprus">Cyprus</option><option value="Czech Republic">Czech Republic</option><option value="Democratic Republic Of The Congo">Democratic Republic Of The Congo</option><option value="Denmark">Denmark</option><option value="Djibouti">Djibouti</option><option value="Dominica">Dominica</option><option value="Dominican Republic">Dominican Republic</option><option value="East Timor">East Timor</option><option value="Ecuador">Ecuador</option><option value="Egypt">Egypt</option><option value="El Salvador">El Salvador</option><option value="Equatorial Guinea">Equatorial Guinea</option><option value="Eritrea">Eritrea</option><option value="Estonia">Estonia</option><option value="Ethiopia">Ethiopia</option><option value="Falkland Islands">Falkland Islands</option><option value="Faroe Islands">Faroe Islands</option><option value="Fiji">Fiji</option><option value="Finland">Finland</option><option value="France">France</option><option value="French Guiana">French Guiana</option><option value="French Polynesia">French Polynesia</option><option value="French Southern Territories">French Southern Territories</option><option value="Gabon">Gabon</option><option value="Gambia">Gambia</option><option value="Georgia">Georgia</option><option value="Germany">Germany</option><option value="Ghana">Ghana</option><option value="Gibraltar">Gibraltar</option><option value="Greece">Greece</option><option value="Greenland">Greenland</option><option value="Grenada">Grenada</option><option value="Guadeloupe">Guadeloupe</option><option value="Guam">Guam</option><option value="Guatemala">Guatemala</option><option value="Guernsey">Guernsey</option><option value="Guinea">Guinea</option><option value="Guinea-bissau">Guinea-bissau</option><option value="Guyana">Guyana</option><option value="Haiti">Haiti</option><option value="Heard Island And Mcdonald Islands">Heard Island And Mcdonald Islands</option><option value="Honduras">Honduras</option><option value="Hong Kong">Hong Kong</option><option value="Hungary">Hungary</option><option value="Iceland">Iceland</option><option value="India">India</option><option value="Indonesia">Indonesia</option><option value="Iran">Iran</option><option value="Iraq">Iraq</option><option value="Ireland">Ireland</option><option value="Isle Of Man">Isle Of Man</option><option value="Israel">Israel</option><option value="Italy">Italy</option><option value="Ivory Coast">Ivory Coast</option><option value="Jamaica">Jamaica</option><option value="Japan">Japan</option><option value="Jersey">Jersey</option><option value="Jordan">Jordan</option><option value="Kazakhstan">Kazakhstan</option><option value="Kenya">Kenya</option><option value="Kiribati">Kiribati</option><option value="Kosovo">Kosovo</option><option value="Kuwait">Kuwait</option><option value="Kyrgyzstan">Kyrgyzstan</option><option value="Laos">Laos</option><option value="Latvia">Latvia</option><option value="Lebanon">Lebanon</option><option value="Lesotho">Lesotho</option><option value="Liberia">Liberia</option><option value="Libya">Libya</option><option value="Liechtenstein">Liechtenstein</option><option value="Lithuania">Lithuania</option><option value="Luxembourg">Luxembourg</option><option value="Macao">Macao</option><option value="Macedonia">Macedonia</option><option value="Madagascar">Madagascar</option><option value="Malawi">Malawi</option><option value="Malaysia">Malaysia</option><option value="Maldives">Maldives</option><option value="Mali">Mali</option><option value="Malta">Malta</option><option value="Marshall Islands">Marshall Islands</option><option value="Martinique">Martinique</option><option value="Mauritania">Mauritania</option><option value="Mauritius">Mauritius</option><option value="Mayotte">Mayotte</option><option value="Mexico">Mexico</option><option value="Micronesia">Micronesia</option><option value="Moldova">Moldova</option><option value="Monaco">Monaco</option><option value="Mongolia">Mongolia</option><option value="Montenegro">Montenegro</option><option value="Montserrat">Montserrat</option><option value="Morocco">Morocco</option><option value="Mozambique">Mozambique</option><option value="Myanmar">Myanmar</option><option value="Namibia">Namibia</option><option value="Nauru">Nauru</option><option value="Nepal">Nepal</option><option value="Netherlands">Netherlands</option><option value="Netherlands Antilles">Netherlands Antilles</option><option value="New Caledonia">New Caledonia</option><option value="New Zealand">New Zealand</option><option value="Nicaragua">Nicaragua</option><option value="Niger">Niger</option><option value="Nigeria">Nigeria</option><option value="Niue">Niue</option><option value="Norfolk Island">Norfolk Island</option><option value="North Korea">North Korea</option><option value="Northern Mariana Islands">Northern Mariana Islands</option><option value="Norway">Norway</option><option value="Oman">Oman</option><option value="Pakistan">Pakistan</option><option value="Palau">Palau</option><option value="Palestinian Territory">Palestinian Territory</option><option value="Panama">Panama</option><option value="Papua New Guinea">Papua New Guinea</option><option value="Paraguay">Paraguay</option><option value="Peru">Peru</option><option value="Philippines">Philippines</option><option value="Pitcairn">Pitcairn</option><option value="Poland">Poland</option><option value="Portugal">Portugal</option><option value="Puerto Rico">Puerto Rico</option><option value="Qatar">Qatar</option><option value="Republic Of The Congo">Republic Of The Congo</option><option value="Reunion">Reunion</option><option value="Romania">Romania</option><option value="Russia">Russia</option><option value="Rwanda">Rwanda</option><option value="Saint Barthelemy">Saint Barthelemy</option><option value="Saint Helena">Saint Helena</option><option value="Saint Kitts And Nevis">Saint Kitts And Nevis</option><option value="Saint Lucia">Saint Lucia</option><option value="Saint Martin">Saint Martin</option><option value="Saint Pierre And Miquelon">Saint Pierre And Miquelon</option><option value="Saint Vincent And The Grenadines">Saint Vincent And The Grenadines</option><option value="Samoa">Samoa</option><option value="San Marino">San Marino</option><option value="Sao Tome And Principe">Sao Tome And Principe</option><option value="Saudi Arabia">Saudi Arabia</option><option value="Senegal">Senegal</option><option value="Serbia">Serbia</option><option value="Serbia And Montenegro">Serbia And Montenegro</option><option value="Seychelles">Seychelles</option><option value="Sierra Leone">Sierra Leone</option><option value="Singapore">Singapore</option><option value="Sint Maarten">Sint Maarten</option><option value="Slovakia">Slovakia</option><option value="Slovenia">Slovenia</option><option value="Solomon Islands">Solomon Islands</option><option value="Somalia">Somalia</option><option value="South Africa">South Africa</option><option value="South Georgia And The South Sandwich Islands">South Georgia And The South Sandwich Islands</option><option value="South Korea">South Korea</option><option value="South Sudan">South Sudan</option><option value="Spain">Spain</option><option value="Sri Lanka">Sri Lanka</option><option value="Sudan">Sudan</option><option value="Suriname">Suriname</option><option value="Svalbard And Jan Mayen">Svalbard And Jan Mayen</option><option value="Swaziland">Swaziland</option><option value="Sweden">Sweden</option><option value="Switzerland">Switzerland</option><option value="Syria">Syria</option><option value="Taiwan">Taiwan</option><option value="Tajikistan">Tajikistan</option><option value="Tanzania">Tanzania</option><option value="Thailand">Thailand</option><option value="Togo">Togo</option><option value="Tokelau">Tokelau</option><option value="Tonga">Tonga</option><option value="Trinidad And Tobago">Trinidad And Tobago</option><option value="Tunisia">Tunisia</option><option value="Turkey">Turkey</option><option value="Turkmenistan">Turkmenistan</option><option value="Turks And Caicos Islands">Turks And Caicos Islands</option><option value="Tuvalu">Tuvalu</option><option value="U.s. Virgin Islands">U.s. Virgin Islands</option><option value="Uganda">Uganda</option><option value="Ukraine">Ukraine</option><option value="United Arab Emirates">United Arab Emirates</option><option value="United Kingdom">United Kingdom</option><option value="United States">United States</option><option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option><option value="Uruguay">Uruguay</option><option value="Uzbekistan">Uzbekistan</option><option value="Vanuatu">Vanuatu</option><option value="Vatican">Vatican</option><option value="Venezuela">Venezuela</option><option value="Vietnam">Vietnam</option><option value="Wallis And Futuna">Wallis And Futuna</option><option value="Western Sahara">Western Sahara</option><option value="Yemen">Yemen</option><option value="Zambia">Zambia</option><option value="Zimbabwe">Zimbabwe</option></select></fieldset><input type="hidden" name="fieldBorder" value="rgb(255, 255, 255)"><input type="hidden" name="zc_trackCode" id="zc_trackCode" value=""><input type="hidden" name="viewFrom" id="viewFrom" value="URL_ACTION"><input type="hidden" name="submitType" id="submitType" value="optinCustomView"><input type="hidden" name="lD" id="lD" value=""><input type="hidden" name="emailReportId" id="emailReportId" value=""><input type="hidden" name="zx" id="cmpZuid" value="14acc97a80"><input type="hidden" name="zcvers" value="2.0"><input type="hidden" name="oldListIds" id="allCheckedListIds" value=""><input type="hidden" name="mode" id="mode" value="OptinCreateView"><input type="hidden" name="zcld" id="zcld" value=""><input type="hidden" name="zctd" id="zctd" value=""><input type="hidden" name="document_domain" id="document_domain" value="marketingplus.zoho.eu"><input type="hidden" name="zc_Url" id="zc_Url" value="jvlz-zcmp.maillist-manage.eu"><input type="hidden" name="new_optin_response_in" id="new_optin_response_in" value="0"><input type="hidden" name="duplicate_optin_response_in" id="duplicate_optin_response_in" value="0"><input type="hidden" name="zc_formIx" id="zc_formIx" value="3zb0cd2446af2262448638c637ed4e28c194f051a3270ea834c982bd8e6eefea92"><input type="hidden" name="scriptless" id="scriptless" value="yes"><input type="hidden" id="zc_spmSubmit" name="zc_spmSubmit" value="ZCSPMSUBMIT"><div style="display:none" ishidden="true"><div><div><div name="SIGNUP_FORM_LABEL">Analytics - OD&nbsp;</div><select name="CONTACT_CF79" changeitem="SIGNUP_FORM_FIELD" zc_display_name="Analytics - OD"><option value="Sales">Sales</option><option value="Marketing">Marketing</option><option value="Finance">Finance</option><option value="IT">IT</option><option value="Help Desk">Help Desk</option><option value="Project Mgmt">Project Mgmt</option><option value="HR">HR</option><option value="EA/WL">EA/WL</option><option value="Others">Others</option></select>&nbsp;</div></div><div></div></div><div class="sgnbtn added-placeholder"><input type="submit" value="Watch Now"></div></form></div></div></div>';

    var watchNowPopup = (dcdomainOne == 'eu') ? watchNowPopupEU : watchNowPopupNonEU;

    $(watchNowPopup).prependTo('.zwebinarvideo-wrap');

    var categoryName = $('.zwebinar-section').attr('data-category-name') || '';
    if (categoryName) {
        $('select[name="LEAD_CF10"], select[name="CONTACT_CF79"]').val(categoryName);
    }

    // Block autoplay being injected by zohocustom.js (changeiframeToWorkdrive) or any other script.
    // We intercept setAttribute on the iframe element itself so any src change is stripped of
    // autoplay/muted unless the form has been submitted (window.zaVideoFormSubmitted === true).
    var $videoIframe = $('.zwebinarvideo-wrap .zwebinarvideo-wrapinner iframe');
    var _videoIframeDom = $videoIframe[0];
    if (_videoIframeDom) {
        var _origSetAttr = _videoIframeDom.setAttribute.bind(_videoIframeDom);
        _videoIframeDom.setAttribute = function (name, value) {
            if (name === 'src' && !window.zaVideoFormSubmitted) {
                var v = String(value || '');
                if (v) {
                    var _base = v.split('?')[0];
                    var _params = (v.split('?')[1] || '').split('&').filter(function (p) {
                        return p && p.indexOf('autoplay') !== 0 && p.indexOf('muted') !== 0;
                    });
                    value = _base + (_params.length ? '?' + _params.join('&') : '');
                }
            }
            return _origSetAttr(name, value);
        };
        // Also strip from the current src if already set
        var _curSrc = _videoIframeDom.getAttribute('src');
        if (_curSrc && _curSrc.indexOf('autoplay') > -1) {
            _videoIframeDom.setAttribute('src', _curSrc);
        }
    }

    // Inject centered play button over the video thumbnail
    $('.zwebinarvideo-wrap .zwebinarvideo-wrapinner').append(
        '<button class="za-play-btn" aria-label="Watch now">' +
        '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="40" cy="40" r="40" fill="rgba(0,0,0,0.5)"/>' +
        '<polygon points="32,22 32,58 62,40" fill="#fff"/>' +
        '</svg>' +
        '</button>'
    );

    // Fix z-index, opacity, width and background overrides
    $('<style>').text(
        '.zw-template-zp_recorded_webinar_detail_pages .zwebinarvideo-wrapinner{position:relative !important;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .zwebinarvideo-wrapinner span.zvideo-mask{z-index:12 !important;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .zwebinarvideo-wrapinner .za-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:15;background:none;border:none;padding:0;cursor:pointer;width:80px;height:80px;transition:transform 0.2s;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .zwebinarvideo-wrapinner .za-play-btn:hover{transform:translate(-50%,-50%) scale(1.12);}' +
        '.zw-template-zp_recorded_webinar_detail_pages .zwebinarvideo-wrapinner .za-play-btn svg{width:80px;height:80px;display:block;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .watch-now-popup{opacity:0;background:#fff !important;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .watch-now-popup.active{opacity:1 !important;z-index:20 !important;overflow-y:auto !important;}' +
        '.zw-template-zp_recorded_webinar_detail_pages .watch-now-popup .signup-box{display:block !important;width:100% !important;max-width:100% !important;margin:0 !important;padding:0 !important;background:#fff !important;}'
    ).appendTo('head');

    $(document).on("click", ".za-play-btn, span.zvideo-mask", function () {
        if ($('span.zvideo-mask').hasClass("active") == false) {
            $('span.zvideo-mask').addClass("active");
            $('.za-play-btn').hide();

            var wrapHeight = $(".zwebinarvideo-wrap")[0].getBoundingClientRect().height;
            $(".watch-now-popup").css({ "height": wrapHeight + "px", "min-height": wrapHeight + "px" });

            setTimeout(function () {
                $('.watch-now-popup').addClass("active");
                $('body').addClass('crmWebForm');
                $('.watch-now-popup .signup-box').css({ display: 'block', width: '100%', maxWidth: '100%', margin: '0', background: '#fff' });
            }, 10);
        }
    });
}


function setValidationRules() {

    // Webinar crmWebForm starts

    var EmailVal = Drupal.t("Please enter email address");
    var validEmailVal = Drupal.t("Please enter a valid email address");
    var PhoneVal = Drupal.t("Please enter your phone number");
    var CaptchaVal = Drupal.t("Enter the verification code");

    $("#z_crmwebform").validate({
        submitHandler: function (form) {

            $("input[type='submit']").attr("disabled", true);
            $("input[type='submit']").prop("value", Drupal.t("Submitting..."));

            var formdata = $('#z_crmwebform');
            var finalData = formdata.serialize();
            $.ajax({
                type: "POST",
                url: formdata.attr("action"),
                data: finalData,
                success: function (data) {
                    if (data.indexOf("Error") > -1 || data.indexOf("Please enter the correct code") > -1) {
                        $('.reload-img').trigger('click');
                        $('#z_crmwebform').find("#zcf_enterdigest").val('').focus();
                        alert("Please enter the correct code");
                        $("input[type='submit']").attr("disabled", false);
                        $("input[type='submit']").prop("value", Drupal.t("Submit"));
                        return false;
                    } else {
                        captcha = true;
                        if ($.trim($('#z_crmwebform').find('input[name="returnURL"]').val()) == "")
                            location.reload();
                        else
                            window.location.href = $('#z_crmwebform').find('input[name="returnURL"]').val();
                    }
                }
            });
        }

    });

    /* Clear rules */
    $("#z_crmwebform").validate().settings.rules = {};

    $("#zcf_email").rules("add", {
        required: true,
        email: true,
        messages: {
            required: EmailVal,
            email: validEmailVal
        }
    });
    $("#zcf_phone").rules("add", {
        required: true,
        messages: {
            required: PhoneVal
        }
    });
    $("#zcf_enterdigest").rules("add", {
        required: true,
        messages: {
            required: CaptchaVal
        }
    });
}
// Webinar crmWebForm end
/*********************** Webinars Form Ends ************************/

/*COMMON UPDATE*/
$(document).ready(function () {
    /*DC Specific*/
    // $(".dc-specific-only").each(function () {
    //     var hrefVal = $(this).attr("href");
    //     if (hrefVal.indexOf(".in") > 0) {
    //         var uHrefVal = hrefVal.replace(".in", "." + dcdomainOne);
    //         $(this).attr({
    //             "href": uHrefVal
    //         });
    //     } else if (hrefVal.indexOf(".eu") > 0) {
    //         var uHrefVal = hrefVal.replace(".eu", "." + dcdomainOne);
    //         $(this).attr({
    //             "href": uHrefVal
    //         });
    //     } else if (hrefVal.indexOf(".au") > 0) {
    //         var uHrefVal = hrefVal.replace(".au", "." + ".com" + dcdomainOne);
    //         $(this).attr({
    //             "href": uHrefVal
    //         });
    //     } else {
    //         var euHrefVal = hrefVal.replace(".com", "." + dcdomainOne);
    //         $(this).attr({
    //             "href": euHrefVal
    //         });
    //     }
    // });
    /*DC Specific*/

    // Help pages only bottom what you're looking for section hide:
    if ($(".html").hasClass("zw-template-zp_help_detail_pages")) {
        $('.zw-template-zp_help_detail_pages .write-us-wrap').html("<div class='visually-analytics-wrap'><h3>Visually analyze any data.</h3><p>Create your own reports and dashboards in minutes.</p><a class='act-btn cta-btn' href='/analytics/signup.html'>Sign up for free</a></div>");
    }

    /*Dropdown added under product menu solution link*/
    if (currentUrlLang == "") {
        var dropSolutions = '<ul class="dropdown-menu"> <li class="sub-level zmenu-bydeployment"> <span class="dropdown-toggle nolink" data-toggle="dropdown">By Deployment</span> <ul class="sub-dropdown third-level"> <li><a href="/analytics/cloud-bi.html?src=top-header">Cloud</a></li> <li><a href="/analytics/onpremise.html?src=top-header">Onpremise</a></li> <li><a href="/analytics/embedded-analytics.html?src=top-header">Embedded BI</a></li> </ul> <li class="sub-level zmenu-byfunction"> <span class="dropdown-toggle nolink" data-toggle="dropdown">By Function</span> <ul class="sub-dropdown third-level"> <li><a href="/analytics/sales-analytics.html?src=top-header">Sales</a></li> <li><a href="/analytics/marketing-analytics.html?src=top-header">Marketing</a></li> <li><a href="/analytics/social-media-analytics.html?src=top-header">Social Media</a></li> <li><a href="/analytics/financial-analytics.html?src=top-header">Finance</a></li> <li><a href="/analytics/shopify-advanced-analytics.html?src=top-header">eCommerce</a></li> <li><a href="/analytics/project-management-analytics.html?src=top-header">Project Management</a></li> <li><a href="/analytics/helpdesk-analytics.html?src=top-header">IT / Helpdesk</a></li> <li><a href="/analytics/zoho-people-advanced-analytics.html?src=top-header">HR</a></li> </ul> </li> </li> </ul>';
        $(".product-nav-links .menu li a[href$='/analytics/solutions.html']").parent().addClass('expanded dropdown');
        $(".product-nav-links .menu li a[href$='/analytics/solutions.html']").append('<span class="caret"></span>');
        $(".product-nav-links .menu li a[href$='/analytics/solutions.html']").parent().append(dropSolutions);
        if (/Android|webOS|iPhone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $(".product-nav-links .menu li a[href$='/analytics/solutions.html']").attr('href', 'javascript:;');
        }
    }
    if (window.innerWidth < 992) {
        $(".product-nav-links .menu li a[href$='/analytics/solutions.html']").removeAttr('href').css('cursor', 'pointer');
    }
    /*Dropdown added under product menu solution link*/

    // webinar only new tag added
    if (($("body").hasClass("zw-template-zp_recorded_webinars")) || ($("body").hasClass("zw-template-zp_live_webinars"))) {
        var label_new = '<span class="zwp_labelnew">New</span>';
        $(".zhead-menu ul li a[href$='analytics-2020.html']").parent().prepend(label_new);
    }
    // webinar only new tag added
});

/*COMMON UPDATE*/


/*-- Request Demo PopUp ----*/
var rd_pupup_timeout;
var rd_pupup = "<div class='zcall-back-container-popup'><span class='zcallback-popup-close'>X</span><div class='zcall-back-container-popup-inner'><h2>Can't find what you are looking for?</h2><a href='/analytics/request-callback.html'>Request a call back</a></div></div><div class='zcallback-popup-overlay'>&nbsp;</div>";

function escapeRegExp(string) {

    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

function replaceAll(str, term, replacement) {

    return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);

}
var rd_url = window.location.pathname.split('/').pop().split('?')[0].replace('.html', '');
var rd_urlVal = replaceAll(rd_url, '-', '_');

function rd_popop_call() {
    rd_pupup_timeout = setTimeout(function () {
        $('.zcallback-popup-overlay').fadeIn(300, function () {
            $('.zcall-back-container-popup').fadeIn(300);
        })
    }, 30000);
}

$(document).on('click', '.zcallback-popup-close, .zcallback-popup-overlay', function () {
    $('.zcall-back-container-popup').fadeOut(200, function () {
        $('.zcallback-popup-overlay').fadeOut(200);
    });
    customvar.lsoinfo(rd_urlVal, 'closed');
    try {
        $zoho.salesiq.visitor.customaction('{"eventCategory":"Pricing-PopUp","eventAction":"Closed_' + rd_urlVal + '","eventLabel":"analytics"}');
    } catch (e) { }
});


$(window).on('load', function () {
    var rd_page_src = "";
    if ((customvar.pathname.indexOf('/analytics/pricing.html') >= 0 || customvar.pathname.indexOf('/analytics/pricing-comparison.html') >= 0 || customvar.pathname.indexOf('/analytics/onpremise-pricing.html') >= 0 || customvar.pathname.indexOf('/analytics/onpremise/compare-on-premise-editions.html') >= 0) && customvar.lsoinfo(rd_urlVal) != "closed") {
        $(rd_pupup).prependTo('body.lang-en');
        $('.zcall-back-container-popup-inner a').attr('href', '/analytics/request-callback.html?rd_ref=' + rd_urlVal);
        rd_popop_call();
    }
});

$(window).on('scroll', function () {
    if ($('.zcall-back-container-popup').length > 0 && $('body').hasClass('lang-en')) {
        clearTimeout(rd_pupup_timeout);
        rd_popop_call();
    }
});

// Shopify app changes
// for jurk related
setTimeout(function () {
    //$('#block-panels-mini-product-menu #mini-panel-product_menu, .product-nav-links.product-nav-links-new').css('opacity', '1');
    $('.zw-product-80 .product-nav-links').css('opacity', '1');
}, 1000);
// for jurk related end
$(document).ready(function () {
    if (window.location.href.indexOf("/analytics/apps/") > -1) {
        $('body').addClass('analytics-apps-only');
        $('.quick-connect-links-wrap').hide();
        $(window).on('load', function () {

            // product logo removing
            $('.zw-product-header .product-icon').attr('src', '/sites/zweb/images/commonroot/zoho-logo-web.svg');
            $('.analytics-apps-only .zw-product-header .product-title .zprd-display-name, .analytics-apps-only .product-header-top .product-title a').text('Advanced Analytics');
            $('.zw-product-header .product-title').css('opacity', '1');

            // product link changing
            $('.analytics-apps-only .zw-product-header .product-title>a, .analytics-apps-only .product-header-top .product-title>a, .analytics-apps-only .zw-product-header .product-title a').attr('href', '/analytics/apps/shopify/');

            // chat widget remove
            $('.write-us-wrap').remove();
            $('.analytics-apps-only .zsiq_theme1.zsiq_floatmain').hide();

            // product menu links removing and appending
            $('.product-nav-links .menu.nav').children().remove();
            var shopifyMenu = '<li class="zmenu-gallery"><a href="https://analytics.zoho.com/workspace/1867230000029911382" target="_blank">Gallery</a></li><li class="zmenu-pricing"><a href="/analytics/apps/shopify/pricing.html">Pricing</a></li><li class="zmenu-customers"><a href="/analytics/customers.html" target="_blank">Customers</a></li><li class="zmenu-customers"><a href="/analytics/apps/shopify/help/overview.html" data-goto="en//Resources">Resources</a></li>';
            $('.product-nav-links .menu.nav').append(shopifyMenu).css('opacity', 1);

            $('.zw-template-zp_help_detail_pages .breadcrumb ul li:first-child a').attr('href', '/analytics/apps/shopify/help/overview.html');

            // Phone number addition:   
            var aapps_ph = '<li class="aapps-ph-icon"><a href="tel:+18889009646">+1 888 900 9646</a></li>';
            $('.ZF-contact ul').prepend(aapps_ph);
        });

        // Quick Links JS - START   
        jQuery('#block-system-main').append('<div class="quick-connect-links-wrap"><span class="show-links-btn">&nbsp;</span> <div class="quick-connect-links"><span class="hide-links-btn">&nbsp;</span> <h4>' + Drupal.t("Next Steps") + '</h4> <ul> <li class="quick-connect1"><a target="_blank" href="https://crm.zoho.com/bookings/ZohoAnalyticsDemoBooking?rid=afc236fe26b3bb85873083258c8bccdf0ba97502d55b8ff55160f8c9d7b96966gidfec408bde1d43175c39d9d17fd9da63f2c72b4ddf901fa1cb856b443c90fbee2">' + Drupal.t("Request a demo") + '</a></li> <li class="quick-connect2"><a href="/analytics/help/contact-us.html">' + Drupal.t("Contact us") + '</a></li> <li class="quick-connect3"><a href="/analytics/apps/shopify/help/overview.html">' + Drupal.t("Resources") + '</a></li> </ul> </div> </div>');
        var ref = document.referrer;
        if (ref == "") {
            jQuery('.quick-connect-links').show()
        } else {
            jQuery('.quick-connect-links').hide();
            jQuery('.quick-connect-links-wrap .show-links-btn').show()
        }

        if (currentUrlLang != "") {
            $('.quick-connect-links-wrap').css('display', 'none');
        }
        // Quick Links JS - END 
    }
});
// Shopify app changes end


//verify otp UI's change button callback
function gobackcallback() {
    //$('.get-signup-plan').show()
}

// help page toggle hiding
jQuery(document).ready(function () {
    if ($("body").hasClass("zw-template-zp_help_detail_pages")) {
        $('.ztoogle-onpremise-container').hide();
    }
});


// disclaimer text for comparison pages
function zSCompDisc(getDate, getPrice, getElm) {
    if (currentUrlLang == '') {
        if (getPrice == false) {
            if (getElm == '') {
                $('.zw-template-inner').append('<section class="zs-disclaimer-section"><div class="content-wrap"><p class="zs-disclaimer-text zcomp-disclaimer" data-disclaimer-date="' + getDate + '" data-pricingvalue="false"></p></div></section>');
            }
            else {
                $(getElm).addClass('zcomp-disclaimer').attr('data-disclaimer-date', getDate).attr('data-pricingvalue', 'false');
            }
        }
        else {
            if (getElm == '') {
                $('.zw-template-inner').append('<section class="zs-disclaimer-section"><div class="content-wrap"><p class="zs-disclaimer-text zcomp-disclaimer" data-disclaimer-date="' + getDate + '"></p></div></section>');
            }
            else {
                $(getElm).addClass('zcomp-disclaimer').attr('data-disclaimer-date', getDate);
            }
        }
        customvar.comp_disclaimer();
    }
}
// disclaimer text for comparison pages ends


// rating section start
if ($('.rating-table').length > 0) {

    $('.rating-table').html('');

    var zrating_html = '<div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites finance-online"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="rating_count"><span class="count">4</span>.<span class="count">4</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate1 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites trust-radius"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">8</span>.<span class="count">7</span></span>/ 10</h5><div class="star-con"><span class="anim-star svg-sprites rate2 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites pc"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">4</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate3 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites get-app"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">3</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate4 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites capterra"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">6</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate5 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites google-play"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">4</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate6 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites app-store"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">4</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate7 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites softeware-suggest"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">4</span>.<span class="count">37</span></span>/ 5</h5><div class="star-con"><span class="anim-star svg-sprites rate8 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div class="rating-sec"><div class="rating-left"><span data-lazy class="svg-sprites gatner"></span></div><div class="rating-right"><h5 class="rating-txt"><span class="count rating_count"><span class="count">8</span>.<span class="count">7</span></span>/ 10</h5><div class="star-con"><span class="anim-star svg-sprites rate9 four_half1"></span><span class="gray-star svg-sprites"></span></div></div></div><div style="clear:both"></div>';

    $(".rating-table").append(zrating_html);
}
// rating section ends

//onpremise help
$(document).ready(function () {

    if (window.location.href.indexOf("/analytics/help/onpremise/") > -1) {
        const queryParams = new URLSearchParams(window.location.search);

        if (queryParams.get('header')) {
            document.body.classList.add("zrop-head-hide");
        }
        else {
            document.body.classList.remove("zrop-head-hide");
        }

        //search for onpremise folder
        $('.search-wrap .search-box form').attr("action", "/analytics/help/onpremise/search-results.html");
    }

    const timer = setInterval(() => {
        const mainElement = document.querySelector('.zrop-head-hide');
        const linksContainer = document.querySelector('.zoho-parent-wrapper');

        if (mainElement && linksContainer) {
            $(".zrop-head-hide .help-menu-panel ul.zoho-parent-wrapper li a").each(function () {
                if ($(this).attr("href")) {
                    $(this).attr("href", this + "?header=hide")
                }
            })
            clearInterval(timer);
        }
    }, 1000);
});

// Glossary page
$(document).ready(function () {
    if (window.location.href.indexOf("/analytics/glossary/") > -1) {
        // title and home text changing
        let zTitle = $('.zw-template-zp_glossary_detail_page  .zlist-content-wrap').find('h1').text();
        $(".zw-template-zp_glossary_detail_page  .top-section p").text(zTitle);
        $(".zw-template-zp_glossary_detail_page  .zlist-content-wrap .glossary-home").clone().insertBefore(".zw-template-zp_glossary_detail_page .top-section p");
    }
});

/* new footer div append */
function newFooterCallback() {
    const options = {
        "zwsupportemail": true,
        "zwsocial": [
            { "class": "zft-facebook", "url": "https://www.facebook.com/zoho" },
            { "class": "zft-twitter", "url": "https://twitter.com/zohoanalytics" },
            { "class": "zft-linkedin", "url": "https://www.linkedin.com/showcase/zohoanalytics" },
            { "class": "zft-youtube", "url": "https://www.youtube.com/c/zohoanalytics" },
            { "class": "zft-pinterest", "url": "https://www.pinterest.com/zohoanalytics" }
        ],
        "zwisobadges": {
            title: "Choose Privacy. Choose Zoho.",
            badges: [
                {
                    "class": "zsb-iso-ism",
                },
                {
                    "class": "zsb-iso-pim",
                },
                {
                    "class": "zsb-iso-csm",
                },
                {
                    "class": "zsb-iso-pdc",
                },
                {
                    "class": "zsb-iso-qms",
                },
                {
                    "class": "zsb-iso-soc2",
                },
                {
                    "class": "zsb-iso-gdpr"
                },
                {
                    "class": "zsb-iso-hippa"
                }
            ]
        }
    };
    zjCommonFooter(options);
}
/* End of new footer div append */


// Glossary banner

const getlistitem = document.getElementsByClassName('zpg-what-will-learn')[0];

if (getlistitem) {
    const bannerHTML = `
  <div class="wrapper">
      <h3>${Drupal.t("Go from data to insights in minutes using Zoho Analytics")}</h3>
      <a href="/analytics/signup.html" class="cta-btn act-btn" target="_blank">${Drupal.t("Sign up for free")}</a>
  </div>`;

    const bannerForList = document.createElement('div');
    bannerForList.innerHTML = bannerHTML;
    bannerForList.classList.add('banner');
    getlistitem.appendChild(bannerForList);
}

const getTabsidepane = document.querySelector('.page-container .tabsection .left-tab ul');
const getEmbededSidepane = document.querySelector('.za-embedded-analytics-cta-banner');

// If embedded banner exists, add only that banner
if (getEmbededSidepane) {
    const bannerHTML = `
        <div class="wrapper">
            <h3>${Drupal.t("Turn analytics into a native product experience")}</h3>
            <button class="cta-btn book-btn">Book my Demo</button>
        </div>`;

    const bannerForEmbededSidepane = document.createElement('div');
    bannerForEmbededSidepane.classList.add('banner');
    bannerForEmbededSidepane.innerHTML = bannerHTML;

    getTabsidepane.appendChild(bannerForEmbededSidepane);
}
// Otherwise, add the default banner
else if (getTabsidepane) {
    const bannerHTML = `
        <div class="wrapper">
            <h3>${Drupal.t("Go from data to insights in minutes using Zoho Analytics")}</h3>
            <a href="/analytics/signup.html" class="cta-btn act-btn" target="_blank">
                ${Drupal.t("Sign up for free")}
            </a>
        </div>`;

    const bannerForTab = document.createElement('div');
    bannerForTab.classList.add('banner');
    bannerForTab.innerHTML = bannerHTML;

    getTabsidepane.appendChild(bannerForTab);
}


// Global Partner Slider

const getGlobalPartnerSlider = document.getElementsByClassName('za-gartner-wrap')[0];
const getInnerPageGlobalPartnerSlider = document.getElementsByClassName('report-slider')[0];

if (getGlobalPartnerSlider) {
    const innerDiv = `
    <!-- <div class="zag-promo-list">
      <div class="zag-promo-box">
          <div class="zga-promo-img">
              <img width="200" height="43" src="/sites/zweb/images/otherbrandlogos/gartner-white.svg" alt="Gartner" />
          </div>
          <div>
              <p>${Drupal.t("Zoho Analytics has been recognized in the 2025 Gartner® Magic Quadrant™ for ABI Platforms.")}</p>
          </div>
          <div>
              <a href="/analytics/2025-gartner-mq-report.html" class="zrmore-cta">${Drupal.t("Read more")}</a>
          </div>
      </div> 
  </div> -->
  <div class="zag-promo-list">
      <div class="zag-promo-box">
          <div class="zga-promo-img">
              <img width="160" height="63" src="/sites/zweb/images/otherbrandlogos/dresner-advisory-services.svg"
                  alt="Dresner Advisory Services" class="zdresner-logo" />
          </div>
          <div>
              <p>${Drupal.t("Zoho ranked #3 in Dresner’s 2025 Cloud Computing & Business Intelligence Market Study.")}</p>
          </div>
          <div>
              <a href="/analytics/cloud-computing-and-market-study-2025.html" class="zrmore-cta">${Drupal.t("Read more")}</a>
          </div>
      </div>
  </div>
  <div class="zag-promo-list">
      <div class="zag-promo-box">
          <div class="zga-promo-img">
              <img width="140" height="44" src="/sites/zweb/images/otherbrandlogos/barc.svg" alt="BARC" />
          </div>
          <div>
              <p>${Drupal.t("91% of surveyed users would recommend Zoho Analytics, and 79% of surveyed users are satisfied with Zoho Analytics.")}</p>    
          </div>
          <div>
              <a href="/analytics/bi-analytics-survey-2024.html" class="zrmore-cta">${Drupal.t("Read more")}</a>
          </div>
      </div>
  </div>`;

    getGlobalPartnerSlider.innerHTML = innerDiv;
}

if (getInnerPageGlobalPartnerSlider) {
    const innerDiv = `<!-- Gartner quotes -->
               <!-- <div class="aem-report report3">
                  <h3>${Drupal.t("2025 Gartner Magic Quadrant for Analytics and Business Intelligence Platforms")}</h3>
                  <p>${Drupal.t("Zoho Analytics has been recognized in 2025 Gartner® Magic Quadrant™ for ABI Platforms.")}</p>
                  <a href="/analytics/2025-gartner-mq-report.html" target="_blank" class="read-more-link nonlang"
                      aria-label="${Drupal.t("Read more about Gartner Magic Quadrant recognition")}">${Drupal.t("Read more")}</a>
              </div> -->
              <!-- Barc quotes -->
              <div class="aem-report report1">
                  <h3>${Drupal.t("BARC - The BI & Analytics Survey 24")}</h3>
                  <p>${Drupal.t("91% of surveyed users recommend Zoho Analytics. Leader in Business Value, Advanced & Predictive Analytics and Ease of Use category in Analysis Focus peer group")}</p>
                  <a href="/analytics/bi-analytics-survey-2024.html" target="_blank"
                      class="read-more-link nonlang" aria-label="${Drupal.t("Read more about BARC BI & Analytics Survey")}">${Drupal.t("Read more")}</a>
              </div>
              <!-- Dresner Quotes -->
              <div class="aem-report report1">
                  <h3>${Drupal.t("Dresner Advisory's Wisdom of Crowds® Business Intelligence Market Study")}</h3>
                  <p>Zoho yet again rated as a Leader for both customer experience and vendor credibility by
                      ${Drupal.t("Dresner Advisory")}</p>
                  <a href="/analytics/dresner-report-2024.html" target="_blank"
                      class="read-more-link nonlang">${Drupal.t("Read more")}</a>
              </div>`;
    getInnerPageGlobalPartnerSlider.innerHTML = innerDiv;
}


// Global Partner Slider end


//Copy paste logic for help page

function copyKey(btn) {
    const pre = btn.previousElementSibling;
    const text = pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "Copied";
        setTimeout(() => btn.textContent = "Copy", 2000);
    });
}

function toggleCode(toggleBtn) {
    const block = toggleBtn.closest(".code-block");
    if (block.classList.contains("expanded")) {
        block.classList.remove("expanded");
        block.classList.add("collapsible");
        toggleBtn.textContent = "Read more";
    } else {
        block.classList.add("expanded");
        block.classList.remove("collapsible");
        toggleBtn.textContent = "Show less";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".code-block").forEach(block => {
        const pre = block.querySelector("pre");
        const lines = pre.innerText.split("\n").length;
        const readMore = block.querySelector(".read-more");
        if (lines > 10) {
            block.classList.add("collapsible");
            if (readMore) readMore.style.display = "block";
        }
    });
});

// CRM WebtoCase Form Start

// cnfmurl logic
function WebToCaseFormCnfmurl() {
    var cnfmurl = ['barc-2019-report.html', '451-research-2019-report.html', 'tec-2019-report.html', 'ebooks.html', '451-oct-2019-report.html', 'support-plans.html', 'bi-analytics-survey-2021.html', 'bi-data-quadrant-report-2021.html', 'tec-insight-report.html', 'analyst-speak.html', 'bi-emotional-footprint-report-2021.html', 'bi-emotional-footprint-report-2023.html', 'aheadcrm-2021-report.html', 'kuppingercole-report-2021.html', 'bi-analytics-survey-2022.html', 'bi-mm-dq-report-2022.html', 'nucleus-10x-fasterinsights.html', 'bi-analytics-survey-2023.html', 'dresner-report-2023.html', 'constellation-2023.html', 'nucleusresearch-sparex-casestudy.html', 'bi-analytics-survey-2024.html', 'dresner-report-2024.html', 'das-embedded-report.html', '2025-gartner-mq-report.html'].some(function (cururl) {
        return window.location.href.indexOf(cururl) !== -1;
    });
    if (cnfmurl) {
        addDynamicScript("zc-crm-webform").then(() => {
            $(".crm-form-wrap").zcform({
                formType: "WebToCaseForm",
                subject: "Zoho Analytics",
                formPosition: "slide",
                slideOrPopupTrigger: ".cnfmUrl-slide-form",
                fields: [
                    { id: "zcf_reported_by", validate: { required: true } },
                    { id: "zcf_email", label: "Business Email", validate: { required: true } },
                    { id: "zcf_phone", countryCode: true, validate: { required: true } }
                ],
                successMessage: "Your request has been sent. We will reach out to you shortly.",
                onSlideOrPopupOpen: ({ event, form, container }) => {
                    const titleElement = container.querySelector("#z_crmwebform_1_title");
                    if (event.target) {
                        const getButton = event.target;
                        const getSubject = getButton.getAttribute("data-subject");
                        const getTitle = getButton.getAttribute("data-title");
                        $(form).zcFind("zcf_subject").val(getSubject);
                        if (titleElement) titleElement.textContent = getTitle;
                    }
                },
                onSuccess: ({ form, container }) => {
                    const getFormButtonElement = document.querySelector(".cnfmUrl-slide-form");
                    const getPDFDoc = getFormButtonElement.getAttribute("data-pdf");
                    const getOtherDomainPDFDoc = getFormButtonElement.getAttribute("data-otherDomain-pdf");
                    if (getPDFDoc || getOtherDomainPDFDoc) {
                        if (getPDFDoc) {
                            window.location.href = customvar.zcCurrentDomain + getPDFDoc;
                        }
                        if (getOtherDomainPDFDoc) {
                            window.location.href = getOtherDomainPDFDoc;
                        }
                    }
                },
            });
        });
    }
}

$(document).ready(function () {
    WebToCaseFormCnfmurl();
});

function trustedBrandSlider() {

    const $trustIcon = $('.trust-icon');
    const $trustWrap = $('.trusted-icon-wrap');

    if (!$trustIcon.length || !$trustWrap.length) return;

    inTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/hdfc.svg',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/mahindra.svg',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/larsen-toubro.png',
            _imgWidth: 170
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/nippon-paint.png',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/tata-communications.svg',
            _imgWidth: 220
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/weikfield.png',
            _imgWidth: 100
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/casagrand.png',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/zomato.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/vedantu.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kotak.png',
            _imgWidth: 130
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/coromandel.png',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/infosys-knowledge-institute.svg',
            _imgWidth: 180
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/wipro-foundation.png',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sun-pharma.png',
            _imgWidth: 40
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/thermax-global.svg',
            _imgWidth: 40
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/wns.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/mckinsey.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cisco.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/spykar.png',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/bennett-coleman.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/viacom18.png',
            _imgWidth: 110
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/tnpl.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/supreme-industries.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/freight-tiger.png',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sun-jewels.svg',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/lixil.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/printo.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/disys.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/minda-corporation.png',
            _imgWidth: 120
        }
    ];

    const laTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/gdm-seeds.svg',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/eficacia.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-promax.png',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/holcim.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/wisynco.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/pilgrims.png',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/uol.svg',
            _imgWidth: 90
        }
    ];

    const afTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/smollan.svg',
            _imgWidth: 130
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/glencore.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/pg-group.png',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/avelabs.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg',
            _imgWidth: 100
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/nahdet-misr.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kwal.png',
            _imgWidth: 55
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/juta.svg',
            _imgWidth: 90
        }
    ];

    const ukTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/nhs.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kantar.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/globalstar.png',
            _imgWidth: 110
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/jcb.svg',
            _imgWidth: 85
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/shell.svg',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/foyle.svg',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/iris.png',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/vectura.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/alight-llc.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cadent-gas.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/rgis.png',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/evo.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/dps-group.png',
            _imgWidth: 200
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/emr.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/das-house.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/inchcape.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kelly-group.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/oliver.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/exertis.png',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/itransition.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/knights.png',
        }
    ];

    const euTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/loreal.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/jlr.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/saint-gobain.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/acer.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/securitas-direct.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/plastipak.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/jas.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/neonet.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/grupo-premo.png',
            _imgWidth: 130
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/suez.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kingspan.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/pierre-fabre.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/coloplast.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/groupe-beaumanoir.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kelly.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/hormann.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/tsg.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/concern.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/oetiker.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/agro-merchants.png',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/paccor.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/globalvia.png',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/bama.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sygnity.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/innovecs.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/alira-health.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/thieme.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sintef.svg',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kompan.svg',
        }
    ];

    const usTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/dennys.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kaiser-permanente.svg',
            _imgWidth: 110
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/caterpillar.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/mitsubishi-heavy-industries.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/leggett-platt.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/yamaha-financial-services.png',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/johnson-controls.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cummins.svg',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/capgemini.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/ima-group.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/flex.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/oaktree-capital.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/labcorp.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cbre.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/creme-de-la.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/aveanna.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/amplity-health.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sun-chemical.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/coach.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/capital-express.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/dole.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/heb.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/encora-digital.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/the-planet-group.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/eide-bailly.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/roadrunner-logistics.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/kerry-logistics.png',
        }
    ];


    const jpTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/fujifilm.svg',
            _imgWidth: 110
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/honda.svg',
            _imgWidth: 135
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/saraya.png',
            _imgWidth: 150
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/inpex-corporation.svg',
            _imgWidth: 140
        }
    ];

    const caTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/go-auto.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/physiotec.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/bakers-delight.png',
            _imgWidth: 130
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/vancouver-coastal-health.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cima.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/laura.svg',
        }
    ];

    const cnTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/season-group.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/tianjin-wanda-tyre.png',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/trane-technologies.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/high-fashion.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/com-lan.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cloudwise.svg',
            _imgWidth: 160
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/peninsula-dot-com.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/scania.svg',
        }
    ];

    const trTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/db-schenker.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/media-verse.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/verifact.png',
            _imgWidth: 110
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/tg-global.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/als-global.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/rio-tinto.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/toll-logo.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/alliance.png',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/phd.png',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/cfl.png',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/brian-hilton.png',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/bendigo-health.png',
            _imgWidth: 80
        }
    ];

    const apacTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/emapta.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/outsourced-doers.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/meibanpng.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/agoda.svg',
            _imgWidth: 80
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/nexen.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/ito.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sri-trang.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/central-retail.png',
            _imgWidth: 160
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/vinh-hoan.png',
            _imgWidth: 65
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/interplex.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/genesys.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/shiji.svg',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/amk-technology.png',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/pba-robotics.png',
            _imgWidth: 60
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/aurionpro-inc.svg',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/assa-rent.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/airtac.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/sc-asset.svg',
        }
    ];

    const meTrustIconList = [
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/emaar.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/iffco.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/gemseducation.svg',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/masafi.svg',
            _imgWidth: 90
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/americana-food.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/nvidia.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/premierinn.svg',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/manzilhealth.png',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/emirates-leisure-retail.png',
            _imgWidth: 120
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/qcs.png',
            _imgWidth: 140
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/leminar.png',
            _imgWidth: 70
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/orpak.png',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/al-dawaa.png',
            _imgWidth: 50
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/magrabi.svg',
        },
        {
            _imgPath: '/sites/zweb/images/otherbrandlogos/livenation.svg',
        }
    ];

    function addCountryData(countryList, extraClass) {
        if (extraClass) {
            $trustIcon.addClass(extraClass);
        }

        $trustIcon
            .addClass('zwc-trust-' + CountryCode.toLowerCase())
            .empty();

        countryList.forEach(item => {
            $trustIcon.append(`
                <span class="ae-icon">
                    <img 
                        src="${item._imgPath}" 
                        width="${item._imgWidth || 100}" 
                        loading="lazy"
                        alt="Trusted brand"
                    >
                </span>
            `);
        });
    }

    const _cusApacList = ['SG', 'MY', 'TH', 'VI', 'ID', 'PH'];

    if (CountryCode === 'US') {
        addCountryData(usTrustIconList);
    } else if (CountryCode === 'JP') {
        addCountryData(jpTrustIconList);
    } else if (CountryCode === 'CA') {
        addCountryData(caTrustIconList);
    } else if (CountryCode === 'CN') {
        addCountryData(cnTrustIconList);
    } else if (CountryCode === 'GB') {
        addCountryData(ukTrustIconList);
    } else if (customvar.lAmerica.indexOf(CountryCode) > -1) {
        addCountryData(laTrustIconList, 'zwc-trust-lamerica');
    } else if (customvar.meaList.indexOf(CountryCode) > -1) {
        addCountryData(meTrustIconList, 'zwc-trust-mealist');
    } else if (customvar.africaList.indexOf(CountryCode) > -1) {
        addCountryData(afTrustIconList, 'zwc-trust-africa');
    } else if (customvar.countryEu.indexOf(CountryCode) > -1 && CountryCode !== 'GB') {
        addCountryData(euTrustIconList, 'zwc-trust-eulist');
    } else if (customvar.countryTranstasman.indexOf(CountryCode) > -1) {
        addCountryData(trTrustIconList, 'zwc-trust-transtasman');
    } else if (_cusApacList.indexOf(CountryCode) > -1) {
        addCountryData(apacTrustIconList, 'zwc-trust-apac');
    } else {
        addCountryData(inTrustIconList);
    }

    function initSlickOnce() {
        $trustIcon.slick({
            slidesToScroll: 1,
            autoplay: true,
            arrows: false,
            centerMode: true,
            variableWidth: true,
            autoplaySpeed: 0,
            speed: 3000,
            pauseOnHover: false,
            pauseOnFocus: false,
            infinite: true,
            cssEase: 'linear'
        });
    }

    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    if (isInViewport($trustWrap[0])) {
        window.addEventListener('load', initSlickOnce, { once: true });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initSlickOnce();
                obs.disconnect();
            }
        });
    }, {
        root: null,
        threshold: 0,
        rootMargin: '0px 0px -10% 0px'
    });

    observer.observe($trustWrap[0]);
}

document.addEventListener('DOMContentLoaded', trustedBrandSlider);


// Embedded Template menu

const embeddedMenu = `<h5>Explore Related Topics</h5>
                         <ul>
                            <li><a href="/analytics/what-is-embedded-analytics.html">Embedded Analytics</a></li>
                            <li><a href="/analytics/embedded-reporting-tool.html">Embedded Reporting Tool</a></li>
                            <li><a href="/analytics/glossary/embedded-bi.html">Embedded BI</a></li>
                            <li><a href="/analytics/embedded-dashboards.html">Embedded Dashboards</a></li>
                            <li><a href="/analytics/what-is-white-label-bi-analytics.html">What is White Label BI?</a>
                            </li>
                            <li><a href="/analytics/embed-api.html">Embed API</a></li>
                            <li><a href="/analytics/ai-powered-embedded-analytics.html">AI-Powered Embedded
                                    Analytics</a></li>
                            <li><a href="/analytics/embedded-analytics-fintech.html">Embedded Analytics for FinTech</a></li>
                            <li><a href="/analytics/embedded-analytics-architecture.html">Embedded Analytics Architecture</a></li>
                        </ul>`;


const getParentElement = document.querySelector('.page-container .main-content .wrapper .right-wrapper');
if (getParentElement) {
    getParentElement.innerHTML = embeddedMenu;
    const currentPath = window.location.pathname;
    getParentElement.querySelectorAll('a').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.closest('li').classList.add('active');
            link.setAttribute('aria-current', 'page');
            link.addEventListener('click', e => e.preventDefault());
        }
    });
}

// Helppage Template 2.0

document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('.zw-template-zp_help_detail_pages_2_0');
    if (!root) return;

    var tocContainer = root.querySelector('.right-sidebar .inner ul');
    if (!tocContainer) return;

    var contentArea = root.querySelector('.page-content') || root.querySelector('.main-content');
    if (!contentArea) return;

    var headings = contentArea.querySelectorAll('h2, h3');
    if (!headings.length) return;

    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/-+/g, '_');
    }

    function getHeadingId(heading) {
        if (heading.id) return heading.id;

        var anchor = heading.querySelector('a.ck-anchor[id]');
        if (anchor) {
            heading.id = anchor.id;
            return anchor.id;
        }

        var id = slugify(heading.textContent);
        heading.id = id;
        return id;
    }

    function isInsideFaq(el) {
        return el.closest('.help-accordian') !== null;
    }

    tocContainer.innerHTML = '';

    var currentH2Item = null;
    var currentSubList = null;

    // Maps each heading element → the data-toc-section ID string of the top-level <li> that owns it.
    // Using an ID string (not an element reference) keeps the mapping valid even if the platform
    // JS rebuilds parts of the TOC DOM after our script runs.
    var headingToSection = new Map();
    var currentH2SectionId = null;

    function addAnchorLink(heading, id) {
        heading.classList.add('heading-anchor');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'anchor-link';
        btn.setAttribute('aria-label', 'Copy link to this section');
        btn.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
            '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
            '</svg>';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var url = window.location.origin + window.location.pathname + '#' + id;
            navigator.clipboard.writeText(url).then(function () {
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.classList.remove('copied');
                }, 1500);
            });
        });

        heading.appendChild(btn);
    }

    headings.forEach(function (heading) {
        if (isInsideFaq(heading)) return;

        var id = getHeadingId(heading);
        var text = heading.textContent.replace(/\s+/g, ' ').trim();
        var tag = heading.tagName;

        addAnchorLink(heading, id);

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = text;
        li.appendChild(a);

        if (tag === 'H2') {
            currentSubList = null;
            currentH2Item = li;
            currentH2SectionId = id;
            li.setAttribute('data-toc-section', id);
            tocContainer.appendChild(li);
            headingToSection.set(heading, id);
        } else if (tag === 'H3') {
            if (!currentH2Item) {
                li.setAttribute('data-toc-section', id);
                tocContainer.appendChild(li);
                headingToSection.set(heading, id);
                return;
            }
            if (!currentSubList) {
                currentSubList = document.createElement('ul');
                currentH2Item.appendChild(currentSubList);
            }
            currentSubList.appendChild(li);
            headingToSection.set(heading, currentH2SectionId);
        }
    });

    var sectionHeadings = [];

    headings.forEach(function (heading) {
        if (!isInsideFaq(heading) && heading.id) {
            sectionHeadings.push(heading);
        }
    });

    if (!sectionHeadings.length) return;

    var scrollOffset = 120;
    var scrollTicking = false;

    function setActiveToc(id) {
        // Find the active heading element
        var activeHeading = null;
        for (var k = 0; k < sectionHeadings.length; k++) {
            if (sectionHeadings[k].id === id) { activeHeading = sectionHeadings[k]; break; }
        }

        // Resolve which data-toc-section value owns this heading.
        // Using a string ID (not an element reference) stays valid even if the platform JS
        // rebuilds TOC nodes after our initial build.
        var ownerSectionId = activeHeading ? headingToSection.get(activeHeading) : null;

        // Re-query the live DOM each call so we never operate on stale/detached nodes.
        tocContainer.querySelectorAll('a').forEach(function (link) {
            var li = link.parentElement;
            if (!li) return;
            li.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });

        tocContainer.querySelectorAll(':scope > li').forEach(function (li) {
            var isOwner = ownerSectionId !== null && li.getAttribute('data-toc-section') === ownerSectionId;
            li.classList.toggle('expanded', isOwner);

            // Set max-height directly as inline !important so it beats any platform
            // stylesheet rule (including !important rules from zohocustom.css / product.css
            // that may tie sub-list visibility to their own .active class).
            var subUl = li.querySelector(':scope > ul');
            if (subUl) {
                subUl.style.setProperty('max-height', isOwner ? '600px' : '0px', 'important');
                subUl.style.setProperty('opacity', isOwner ? '1' : '0', 'important');
                subUl.style.setProperty('pointer-events', isOwner ? 'auto' : 'none', 'important');
            }
        });
    }

    function updateActiveToc() {
        scrollTicking = false;

        var activeHeading = sectionHeadings[0];
        var i;
        var top;

        for (i = 0; i < sectionHeadings.length; i++) {
            top = sectionHeadings[i].getBoundingClientRect().top;
            if (top <= scrollOffset) {
                activeHeading = sectionHeadings[i];
            }
        }

        var nearBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 2;

        if (nearBottom) {
            activeHeading = sectionHeadings[sectionHeadings.length - 1];
        }

        if (activeHeading && activeHeading.id) {
            setActiveToc(activeHeading.id);
        }
    }

    function onTocScroll() {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateActiveToc);
        }
    }

    window.addEventListener('scroll', onTocScroll, { passive: true });
    window.addEventListener('resize', onTocScroll, { passive: true });
    updateActiveToc();

    initCollapsibleTables(root);
    initImageLightbox(root);
    initVideoAccordion(root);
    initAiToolsDropdown(root);
});

function initImageLightbox(root) {
    var contentArea = root.querySelector('.page-content') || root.querySelector('.main-content');
    if (!contentArea) return;

    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image preview');
    closeBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"/>' +
        '<line x1="6" y1="6" x2="18" y2="18"/>' +
        '</svg>';

    var imgEl = document.createElement('img');
    imgEl.className = 'lightbox-img';
    imgEl.alt = '';

    overlay.appendChild(closeBtn);
    overlay.appendChild(imgEl);
    root.appendChild(overlay);

    function openLightbox(src, alt) {
        imgEl.src = src;
        imgEl.alt = alt || '';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        imgEl.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });

    var images = contentArea.querySelectorAll('img');
    images.forEach(function (img) {
        img.classList.add('lightbox-trigger');
        img.addEventListener('click', function () {
            openLightbox(img.src, img.alt);
        });
    });
}

function initCollapsibleTables(root) {
    var MAX_VISIBLE_ROWS = 6;
    var tables = root.querySelectorAll('.page-content table');

    tables.forEach(function (table) {
        var tbody = table.querySelector('tbody');
        if (!tbody) return;

        var rows = tbody.querySelectorAll('tr');
        var headerRow = rows[0];
        var dataRows = Array.from(rows).slice(1);

        if (dataRows.length <= MAX_VISIBLE_ROWS) return;

        var hiddenRows = dataRows.slice(MAX_VISIBLE_ROWS);
        var hiddenCount = hiddenRows.length;

        hiddenRows.forEach(function (row) {
            row.classList.add('table-row-hidden');
        });

        var wrapper = document.createElement('div');
        wrapper.className = 'table-collapse-wrap';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);

        table.classList.add('table-collapsible');

        var fadeOverlay = document.createElement('div');
        fadeOverlay.className = 'table-fade-overlay';
        wrapper.appendChild(fadeOverlay);

        var toggleBar = document.createElement('div');
        toggleBar.className = 'table-toggle-bar';

        var toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'table-toggle-btn';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML =
            '<svg class="table-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="6 9 12 15 18 9"/>' +
            '</svg>' +
            '<span class="table-toggle-text">Show ' + hiddenCount + ' more rows</span>' +
            '<span class="table-toggle-badge">' + dataRows.length + ' total</span>';

        var expanded = false;

        toggleBtn.addEventListener('click', function () {
            expanded = !expanded;
            hiddenRows.forEach(function (row) {
                row.classList.toggle('table-row-hidden', !expanded);
            });
            wrapper.classList.toggle('table-expanded', expanded);
            toggleBtn.setAttribute('aria-expanded', String(expanded));
            toggleBtn.querySelector('.table-toggle-text').textContent = expanded
                ? 'Show less'
                : 'Show ' + hiddenCount + ' more rows';
        });

        toggleBar.appendChild(toggleBtn);
        wrapper.appendChild(toggleBar);
    });
}

function initAiToolsDropdown(root) {
    var contentArea = root.querySelector('.page-content') || root.querySelector('.main-content');
    if (!contentArea) return;

    var pageUrl = window.location.href.split('#')[0];

    var SPARKLE_SVG =
        '<svg class="ai-tools-sparkle" width="14" height="14" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs><linearGradient id="ai-grad" x1="256" x2="256" y1="1" y2="511" gradientUnits="userSpaceOnUse">' +
        '<stop stop-color="#3381f6"/><stop offset="1" stop-color="#e960ff"/></linearGradient></defs>' +
        '<path fill="url(#ai-grad)" d="M277.6 47.3c13.4 0 22.7 9.5 23.5 21.7 2.3 34 11.3 66.1 29.2 95.3 20.8 33.7 50.9 54.3 89.6 62.6 13.2 2.8 26.5 4 40 4 10.3 0 18.6 6.4 21.4 16.1 3.9 13.8-6 27.6-20.4 28.1-24.6.9-48.2 6.2-70.7 16.1-43.5 19.1-70 52-79.6 98.5-2.8 13.6-3.9 27.4-4 41.2-.1 11.6-8.2 20.7-19.8 22-11.4 1.3-22.6-7.9-23.6-19.3-2.3-28.6-9.8-55.7-23.4-80.9-21.2-39.2-53.8-63.6-97.4-73.1-14.4-3.1-28.9-4.4-43.6-4.5-11.6-.1-20.5-7.9-22.1-19.1-1.9-13.1 8-24.6 21.3-25.1 28.3-1 55.2-7.5 80.5-20.1 40.3-20.1 64.9-52.5 74.5-96.5 3.1-14.4 4.5-28.9 4.5-43.6 0-6.9 2.1-12.9 7.2-17.6 4.1-3.9 9-5.8 12.9-5.8z"/>' +
        '</svg>';

    var CHEVRON_SVG =
        '<svg class="ai-tools-chevron" width="10" height="10" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path fill="currentColor" d="m302.3 397 190.3-188.9c12.9-12.8 19.4-29.7 19.4-46.5 0-16.7-6.4-33.4-19.1-46.2-25.5-25.7-67.1-25.8-92.8-.3L256 258 111.9 115c-25.7-25.5-67.3-25.4-92.8.3-25.6 25.7-25.4 67.2.3 92.7l190.4 189c25.5 25.4 66.9 25.4 92.5 0z"/>' +
        '</svg>';

    // Icon for each menu item
    var ITEM_ICONS = {
        chatgpt:
            '<img src="https://prezohoweb.zoho.com/sites/zweb/images/otherbrandlogos/chatgpt.png" alt="ChatGPT" width="18" height="18" loading="lazy">',
        claude:
            '<img src="https://prezohoweb.zoho.com/sites/zweb/images/otherbrandlogos/claude-icon.svg" alt="Claude" width="18" height="18" loading="lazy">',
        copy:
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
            '</svg>',
        view:
            '<svg width="14" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
            '<polyline points="14 2 14 8 20 8"/>' +
            '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' +
            '</svg>'
    };

    function buildMenuHTML() {
        var items = [
            { action: 'chatgpt', icon: ITEM_ICONS.chatgpt, label: 'Open in ChatGPT', desc: 'Open in ChatGPT to ask questions about this page', external: true },
            { action: 'claude', icon: ITEM_ICONS.claude, label: 'Open in Claude', desc: 'Open in Claude to ask questions about this page', external: true },
            { action: 'copy', icon: ITEM_ICONS.copy, label: 'Copy as Markdown', desc: 'Copy this page as markdown to use with AI assistants', external: false },
            { action: 'view', icon: ITEM_ICONS.view, label: 'View as Markdown', desc: 'Open this page as markdown in a new tab', external: true }
        ];
        return items.map(function (item) {
            return '<button type="button" class="ai-tools-item" data-action="' + item.action + '" role="menuitem">' +
                '<span class="ai-tools-item-icon">' + item.icon + '</span>' +
                '<span class="ai-tools-item-content">' +
                '<span class="ai-tools-item-label">' + item.label + (item.external ? ' <svg class="ai-ext-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' : '') + '</span>' +
                '<span class="ai-tools-item-desc">' + item.desc + '</span>' +
                '</span>' +
                '</button>';
        }).join('');
    }

    function closeAllDropdowns() {
        contentArea.querySelectorAll('.ai-tools-dropdown.open').forEach(function (d) {
            d.classList.remove('open');
            var trigger = d.querySelector('.ai-tools-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.ai-tools-dropdown')) closeAllDropdowns();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAllDropdowns();
    });

    function getSectionContent(heading) {
        var title = heading.textContent.replace(/\s+/g, ' ').trim();
        var md = '# ' + title + '\n\n';
        var node = heading.nextElementSibling;
        while (node && node.tagName !== 'H1') {
            var tag = node.tagName;
            if (tag === 'P') {
                md += (node.innerText || node.textContent).trim() + '\n\n';
            } else if (tag === 'H3') {
                md += '### ' + (node.innerText || node.textContent).trim() + '\n\n';
            } else if (tag === 'UL' || tag === 'OL') {
                Array.from(node.querySelectorAll('li')).forEach(function (li) {
                    md += '- ' + (li.innerText || li.textContent).trim() + '\n';
                });
                md += '\n';
            } else {
                var text = (node.innerText || node.textContent).trim();
                if (text) md += text + '\n\n';
            }
            node = node.nextElementSibling;
        }
        return md.trim();
    }

    function showToast(msg, isError) {
        var toast = document.createElement('div');
        toast.className = 'ai-tools-toast' + (isError ? ' ai-tools-toast--error' : '');
        toast.textContent = msg;
        root.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('visible'); });
        setTimeout(function () {
            toast.classList.remove('visible');
            setTimeout(function () { toast.remove(); }, 300);
        }, 2200);
    }

    var headings = contentArea.querySelectorAll('h1');
    headings.forEach(function (heading) {
        if (heading.closest('.help-accordian')) return;

        var sectionId = heading.id || '';
        var sectionTitle = heading.textContent.replace(/\s+/g, ' ').trim();

        var dropdown = document.createElement('div');
        dropdown.className = 'ai-tools-dropdown';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'ai-tools-trigger';
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = SPARKLE_SVG + ' AI Tools ' + CHEVRON_SVG;

        var menu = document.createElement('div');
        menu.className = 'ai-tools-menu';
        menu.setAttribute('role', 'menu');
        menu.innerHTML = buildMenuHTML();

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = dropdown.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) {
                dropdown.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        menu.querySelectorAll('.ai-tools-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                var action = item.getAttribute('data-action');
                var anchorUrl = pageUrl + (sectionId ? '#' + sectionId : '');
                var prompt = 'Read ' + anchorUrl + ' and answer questions about the "' + sectionTitle + '" section.';

                if (action === 'chatgpt') {
                    window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(prompt), '_blank', 'noopener');
                } else if (action === 'claude') {
                    window.open('https://claude.ai/new?q=' + encodeURIComponent(prompt), '_blank', 'noopener');
                } else if (action === 'copy') {
                    var md = getSectionContent(heading);
                    navigator.clipboard.writeText(md).then(function () {
                        showToast('Copied!', false);
                    }).catch(function () {
                        showToast('Copy failed', true);
                    });
                } else if (action === 'view') {
                    var md = getSectionContent(heading);
                    var blob = new Blob([md], { type: 'text/plain;charset=utf-8' });
                    var blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank', 'noopener');
                    setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 60000);
                }
                closeAllDropdowns();
            });
        });

        dropdown.appendChild(trigger);
        dropdown.appendChild(menu);
        heading.appendChild(dropdown);
    });
}

function initVideoAccordion(root) {
    var triggers = root.querySelectorAll('.video-accordion-trigger');

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var item = trigger.closest('.video-accordion-item');
            var isOpen = item.classList.contains('open');

            var allItems = root.querySelectorAll('.video-accordion-item');
            allItems.forEach(function (el) {
                el.classList.remove('open');
                el.querySelector('.video-accordion-trigger').setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });
}