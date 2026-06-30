var jsonUrl = 'https://prezohoweb.zoho.com/sites/zweb/json/analytics-release-notes.json', getList = [], body = $("html, body"), year = '';
const yearData = new Date();
var yearNo = yearData.getFullYear(), pageNo = 1, totalNotesCount = 1, window_width = $(window).outerWidth(), curYear = yearNo, lastYear = '', startElm = 1, filterId = 1, selOption = 'new', pageView = true, tarTxt = '', FillCount = 0, topMove = 0, otherfillcount = 0, mnthfillcount = 0, urlValuesGet = new URLSearchParams(window.location.search), ecoClkCount = 0, functionClkCount = 0, dcClkCount = 0, editionClkCount = 0, copyHover = 0, functionList = [], dcList = [], editionList = [], funcFillNo = $('.other-top'), dcFillNo = $('.other-dc'), editionFillNo = $('.other-edition'), defaultFuncList = [], defaultDcList = [], defaultEditionList = [], yearSelectArry = [], getSession = null, refYearArry = [], curmonthNo = 0, pdfDataArry = [], yearsWithData = [];

var selectFilters = {
  year: [],
  Ecosystem: [],
  Function: [],
  DC: [],
  Edition: []
}


$(document).ready(function () {

  $('.notes-inner-box-sec').html('<div class="notes-loading">Loading release notes...</div>');

  $.getJSON(jsonUrl, function (json) {
    getList = json.release_notes[0].yearLists;
    yearsWithData = getList.map(function (y) { return Number(y.yearName); });
    lastYear = Number(getList[getList.length - 1].yearName);
    yearNo = Number(getList[0].yearName);
    curmonthNo = (getList[0].monthLists).length;
    urlExplore();
    zcsPagination(totalNotesCount, startElm, true);
    clearBtn();
    clearBtnUpdate();
    latestMnthUpdate()
  }).fail(function () {
    $('.notes-inner-box-sec').empty().before('<span class="error-show">Unable to load release notes. Please ensure the page is served via HTTP (not file://) and analytics-new.json is in the same folder.</span>');
  });

  var boxEnd = pageNo * 10;

  getSession = sessionStorage.getItem('sessionOpt');

  if (getSession == null) {
    sessionStorage.setItem('sessionOpt', 'alreadyOpen');
  }

  $('#search_text').on("keyup", function () {
    tarTxt = $('#search_text').val().toLocaleLowerCase();
    topMove = 0;
    zcsPagination(totalNotesCount, startElm, tarTxt)
  });

  if (window_width <= 1140) {
    var yearFill = $('.year-fill-sec');
    $('.mob-year-select').append(yearFill);
    var getSort = $('.sort-fillter');
    $('.mob-other-fillters').append(getSort);
    var otherFillters = $('.filters-section');
    $('.mob-other-fillters').append(otherFillters);
  }

  let startY = 0;
  let endY = 0;

  $(".drag-section").on("touchstart", function (event) {
    startY = event.originalEvent.touches[0].clientY;
  });

  $(".drag-section").on("touchend", function (event) {
    endY = event.originalEvent.changedTouches[0].clientY;

    if (startY - endY > 50) { } else if (endY - startY > 50) {
      applyAll()
    }
  });

  if (funcFillNo.length > 0) {
    for (let i = 0; i < funcFillNo.length; i++) {
      defaultFuncList.push($(funcFillNo[i]).attr('data-function'));
    }
  }
  if (dcFillNo.length > 0) {
    for (let i = 0; i < dcFillNo.length; i++) {
      defaultDcList.push($(dcFillNo[i]).attr('data-DC'));
    }
  }
  if (editionFillNo.length > 0) {
    for (let i = 0; i < editionFillNo.length; i++) {
      defaultEditionList.push($(editionFillNo[i]).attr('data-edition'));
    }
  }

});

$(window).on("scroll", function () {

  var mousePos = $(document).scrollTop();
  var topBtn = $('.zwf-new-footer').offset().top - $(window).outerHeight(true);
  if (window_width < 1140) {
    if (mousePos < topBtn) {
      $('.mob-fillter-sec').show();
    } else {
      $('.mob-fillter-sec').hide();
    }
  }
});

function latestMnthUpdate() {
  $('.year-list').html(yearNo);
  yearSelectArry.push(yearNo);
  if (yearsWithData.length <= 1) {
    $('.year-lft-arw').css({ "pointer-events": "none", "opacity": "0.4" });
  }
  if (yearNo == $('.year-list').html()) {
    $('.month-list').css({
      "pointer-events": "none",
      "opacity": "0.4"
    })
    for (let i = 1; i <= curmonthNo; i++) {
      $('.month-list:nth-child(' + i + ')').css({
        "pointer-events": "auto",
        "opacity": "1"
      }).addClass('new-mnth');
    }
  }
}

function getMonthCountForYear(y) {
  for (let i = 0; i < getList.length; i++) {
    if (Number(getList[i].yearName) === y) {
      return (getList[i].monthLists || []).length;
    }
  }
  return 12;
}

function yearChange(ele) {
  topMove = 0;
  $('.notes-inner-box-sec').empty();
  $('.error-show').remove();
  $('.error-list-show').remove();
  var curYear = Number($('.year-list').html());
  $('.month-list').removeClass('active');
  var arwside = $(ele).attr("data-side");
  var idx = yearsWithData.indexOf(curYear);
  if (idx === -1) { idx = 0; }

  if (arwside == "rgt") {
    if (idx > 0) {
      curYear = yearsWithData[idx - 1];
      curmonthNo = getMonthCountForYear(curYear);
      $('.year-list').html(curYear);
      $('.year-rgt-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.year-lft-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.month-list').css({ "pointer-events": "auto", "opacity": "1" });
      if (curYear == yearNo && curmonthNo > 0) {
        $('.month-list').css({ "pointer-events": "none", "opacity": "0.4" });
        for (let i = 1; i <= curmonthNo; i++) {
          $('.month-list:nth-child(' + i + ')').css({ "pointer-events": "auto", "opacity": "1" });
        }
      }
    } else {
      $('.year-rgt-arw').css({ "pointer-events": "none", "opacity": "0.4" });
      $('.year-lft-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.year-list').html(yearNo);
      curmonthNo = getMonthCountForYear(yearNo);
      $('.month-list').css({ "pointer-events": "none", "opacity": "0.4" });
      for (let i = 1; i <= curmonthNo; i++) {
        $('.month-list:nth-child(' + i + ')').css({ "pointer-events": "auto", "opacity": "1" });
      }
    }
  } else if (arwside == "lft") {
    if (idx >= 0 && idx < yearsWithData.length - 1) {
      curYear = yearsWithData[idx + 1];
      curmonthNo = getMonthCountForYear(curYear);
      $('.year-list').html(curYear);
      $('.year-lft-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.year-rgt-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.month-list').css({ "pointer-events": "auto", "opacity": "1" });
    } else {
      $('.year-lft-arw').css({ "pointer-events": "none", "opacity": "0.4" });
      $('.year-rgt-arw').css({ "pointer-events": "auto", "opacity": "1" });
      $('.month-list').css({ "pointer-events": "auto", "opacity": "1" });
      $('.year-list').html(curYear);
    }
  }

  curYear = Number($('.year-list').html());
  var existYear = 0;
  let index = yearSelectArry.indexOf(curYear);
  if (index == -1) {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year != curYear && existYear == 0) {
        existYear = 0;
      } else if (selectFilters.year[i].year == curYear) {
        existYear = 1;
      }
    }
    if (existYear == 0) {
      const createObj = new Object();
      var mnthArry = ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      createObj.year = curYear;
      createObj.month = mnthArry;
      selectFilters.year.push(createObj);
      for (let k = 0; k < mnthArry.length; k++) {
        $('[data-mnth=' + mnthArry[k] + ']').addClass('active');
      }
      monthFillUpdate();
      yearSelectArry.push(curYear);
    }
  }

  if (selectFilters.year.length != 0) {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year == curYear) {
        if (selectFilters.year[i].month.length >= 1) {
          for (let k = 0; k < selectFilters.year[i].month.length; k++) {
            $('[data-mnth="' + selectFilters.year[i].month[k] + '"]').addClass('active');
          }
        }
      }
    }
  }

  clearBtnUpdate();
  zcsPagination(totalNotesCount, startElm);
}



function monthChange(ele) {
  topMove = 0;
  $('.notes-inner-box-sec').empty();
  $('.error-show').remove();
  $('.error-list-show').remove();
  var monName = $(ele).attr("data-mnth");
  var curYear = Number($('.year-list').html());

  var existYear = 0;
  var exitMonth = 0;

  if (selectFilters.year.length == 0) {
    const createObj = new Object();
    createObj.year = curYear;
    createObj.month = [monName];
    selectFilters.year.push(createObj);
    existYear = 1;
    $(ele).addClass("active");
    monthFillUpdate()
  } else {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year != curYear && existYear == 0) {
        existYear = 0;
      } else if (selectFilters.year[i].year == curYear) {
        if (selectFilters.year[i].month.length >= 1) {
          for (let k = 0; k < selectFilters.year[i].month.length; k++) {
            if (selectFilters.year[i].month[k] != monName && exitMonth == 0) {
              exitMonth = 0;
            } else if (selectFilters.year[i].month[k] == monName) {
              let index = selectFilters.year[i].month.indexOf(monName);
              if (index !== -1) {
                selectFilters.year[i].month.splice(index, 1);
              }
              exitMonth = 1;
              $(ele).removeClass("active");
              var remElm = $('[data-yrmnth="' + curYear + '-' + monName + '"]')
              $(remElm).remove();
            }
          }
          if (exitMonth == 0) {
            selectFilters.year[i].month.push(monName);
            $(ele).addClass("active");
            monthFillUpdate()
          }
        }
        existYear = 1;
      }
      if (selectFilters.year[i].month.length == 0) {
        selectFilters.year.splice(i, 1);
      }
    }
    if (existYear == 0) {
      const createObj = new Object();
      createObj.year = curYear;
      createObj.month = [monName];
      selectFilters.year.push(createObj);
      $(ele).addClass("active");
      monthFillUpdate()
    }
  }

  existYear = 0;

  zcsPagination(totalNotesCount, startElm);
  monthFillUpdate();
  clearBtnUpdate();
}

function clearYear() {
  var clearYear = Number($('.year-list').html());
  $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
  $('.year-clr-btn').css({ opacity: "0.4", "pointer-events": "none" });
  if (selectFilters.year.length > 0) {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year == clearYear) {
        selectFilters.year.splice(i, 1);
        $('.month-list').removeClass('active');
      }
    }
  }
  monthFillUpdate();
  clearBtn()
  zcsPagination(totalNotesCount, startElm);
}

function addAllYear() {
  var addYear = Number($('.year-list').html());
  var yearExit = 0;
  if (addYear == yearData.getFullYear()) {
    $('.month-list.new-mnth').addClass('active');
  } else {
    $('.month-list').addClass('active');
  }

  $('.year-add-btn').css({ opacity: "0.4", "pointer-events": "none" });
  $('.year-clr-btn').css({ opacity: "1", "pointer-events": "auto" });
  if (selectFilters.year.length > 0) {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year == addYear) {
        if (selectFilters.year[i].year == yearData.getFullYear()) {
          for (let i = 1; i <= curmonthNo; i++) {
            selectFilters.year[i].month.push($('.month-list:nth-child(' + i + ')').attr('data-mnth'))
          }
          yearExit = 1;
        } else {
          selectFilters.year[i].month = ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          yearExit = 1;
        }
      }
    }
  }

  if (yearExit == 0) {
    if (addYear == yearData.getFullYear()) {
      var mnthAry = []
      for (let i = 1; i <= curmonthNo; i++) {
        mnthAry.push($('.month-list:nth-child(' + i + ')').attr('data-mnth'))
      }
      const createObj = new Object();
      createObj.year = addYear;
      createObj.month = mnthAry;
      selectFilters.year.push(createObj);
    } else {
      const createObj = new Object();
      createObj.year = addYear;
      createObj.month = ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      selectFilters.year.push(createObj);
    }
  }
  monthFillUpdate();
  clearBtn()
  zcsPagination(totalNotesCount, startElm);
}

function clearBtnUpdate() {
  var addYear = Number($('.year-list').html());
  var yearExit = 0;
  if (selectFilters.year.length > 0) {
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year == addYear) {
        if (selectFilters.year[i].year == yearData.getFullYear()) {
          if (selectFilters.year[i].month.length == 0) {
            $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
            $('.year-clr-btn').css({ opacity: "0.4", "pointer-events": "none" });
          } else if (selectFilters.year[i].month.length == curmonthNo) {
            $('.year-add-btn').css({ opacity: "0.4", "pointer-events": "none" });
            $('.year-clr-btn').css({ opacity: "1", "pointer-events": "auto" });
          } else {
            $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
            $('.year-clr-btn').css({ opacity: "1", "pointer-events": "auto" });
          }
          yearExit = 1;
        } else {
          if (selectFilters.year[i].month.length == 0) {
            $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
            $('.year-clr-btn').css({ opacity: "0.4", "pointer-events": "none" });
          } else if (selectFilters.year[i].month.length == 12) {
            $('.year-add-btn').css({ opacity: "0.4", "pointer-events": "none" });
            $('.year-clr-btn').css({ opacity: "1", "pointer-events": "auto" });
          } else {
            $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
            $('.year-clr-btn').css({ opacity: "1", "pointer-events": "auto" });
          }
          yearExit = 1;
        }
      }
    }
  }

  if (yearExit == 0) {
    $('.year-add-btn').css({ opacity: "1", "pointer-events": "auto" });
    $('.year-clr-btn').css({ opacity: "0.4", "pointer-events": "none" });
  }
}

function otherFillShow() {
  var exitFillter = 0;

  var checkArry = selectFilters.year.reverse();

  for (let i = 0; i < checkArry.length; i++) {

    if (checkArry[i].year >= 2024 && exitFillter == 0) {
      if (checkArry[i].year == 2024) {
        if (checkArry[i].month.indexOf('Nov') > -1 || checkArry[i].month.indexOf('Dec') > -1) {
          if ($('.eco-fill-sec .fillter-list li:first-child').hasClass('active') || selectFilters.Ecosystem.indexOf('Web') !== -1) {
            $('.sub-fillters').show();
          }
        } else {
          $('[data-fillname="function"]').remove();
          $('[data-fillname="dc"]').remove();
          $('[data-fillname="edition"]').remove();
          selectFilters.Function = [];
          selectFilters.DC = [];
          selectFilters.Edition = [];
          $('.other-top').removeClass('active');
          $('.other-dc').removeClass('active');
          $('.other-edition').removeClass('active');
          $('[data-opt="top-all"]').addClass('active');
          $('[data-opt="dc-all"]').addClass('active');
          $('[data-opt="edition-all"]').addClass('active');
          $('.sub-fillters').hide();
        }
      } else {
        if ($('.eco-fill-sec .fillter-list li:first-child').hasClass('active') || selectFilters.Ecosystem.indexOf('Web') !== -1) {
          $('.sub-fillters').show();
        }
      }
      exitFillter = 1;
    } else if (checkArry[i].year < 2024 && exitFillter == 0) {
      $('[data-fillname="function"]').remove();
      $('[data-fillname="dc"]').remove();
      $('[data-fillname="edition"]').remove();
      selectFilters.Function = [];
      selectFilters.DC = [];
      selectFilters.Edition = [];
      $('.other-top').removeClass('active');
      $('.other-dc').removeClass('active');
      $('.other-edition').removeClass('active');
      $('[data-opt="top-all"]').addClass('active');
      $('[data-opt="dc-all"]').addClass('active');
      $('[data-opt="edition-all"]').addClass('active');
      $('.sub-fillters').hide();
    }
  }
}

function ecoChange(ele) {
  var ecoTotalCnt = $('.eco-fill-sec .fillter-list li');
  topMove = 0;
  var ecoName = $(ele).attr("data-eco");
  var optName = $(ele).attr("data-opt");

  if (ecoName == 'all') {
    var getActiveList = $('.other-eco.active')
    if (getActiveList.length > 0) {
      for (let i = 0; i < getActiveList.length; i++) {
        var remElm = $('[data-fillid="' + ($(getActiveList[i]).attr("data-opt")) + '"]');
        $(remElm).remove();
      }
    }
    selectFilters.Ecosystem = [];
    $(ele).siblings().removeClass('active');
    $(ele).addClass("active");
    $('.sub-fillters').show();
    ecoClkCount = 0;
  } else {
    if ($(ele).hasClass('active')) {
      let index = selectFilters.Ecosystem.indexOf(ecoName);
      if (index !== -1) {
        selectFilters.Ecosystem.splice(index, 1);
      }
      $(ele).removeClass("active");
      if (ecoName == "Web" && selectFilters.Ecosystem.length > 0) {
        $('.sub-fillters').hide();
        $('[data-opt="top-all"]').trigger("click");
        $('[data-opt="dc-all"]').trigger("click");
        $('[data-opt="edition-all"]').trigger("click");
      }
      if (selectFilters.Ecosystem.length == 0) {
        $('[data-opt="eco-all"]').addClass('active');
        $('.sub-fillters').show();
      }
      var remElm = $('[data-fillid="' + (optName) + '"]')
      $(remElm).remove();
      otherfillcount -= 1;
      FillCount = otherfillcount + mnthfillcount;
      ecoClkCount -= 1;
    } else {
      $('[data-opt="eco-all"]').removeClass('active');
      selectFilters.Ecosystem.push(ecoName);
      if (selectFilters.Ecosystem.indexOf("Web") !== -1) {
        $('.sub-fillters').show();
      } else {
        $('.sub-fillters').hide();
        $('[data-opt="top-all"]').trigger("click");
        $('[data-opt="dc-all"]').trigger("click");
        $('[data-opt="edition-all"]').trigger("click");
      }
      $('.selected-fillters-list').append('<li data-fillid=' + optName + ' data-fillname="ecosystem">' + ecoName + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>')
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
      $(ele).addClass("active");
      ecoClkCount += 1;
    }
    if (ecoClkCount == ecoTotalCnt.length - 1) {
      $('[data-opt="eco-all"]').trigger("click");
      ecoClkCount = 0;
    }
  }

  zcsPagination(totalNotesCount, startElm)
  $('.fill-count').html(FillCount);
}

function functionChange(ele) {
  var fillTotalCnt = $('.topics-fill-sec .fillter-list li');
  topMove = 0;
  var topName = $(ele).attr("data-function");
  var optName = $(ele).attr("data-opt");

  if (topName == 'all') {
    var getActiveList = $('.other-top.active')
    if (getActiveList.length > 0) {
      for (let i = 0; i < getActiveList.length; i++) {
        var remElm = $('[data-fillid="' + ($(getActiveList[i]).attr("data-opt")) + '"]');
        $(remElm).remove();
      }
    }
    selectFilters.Function = [];
    $(ele).siblings().removeClass('active');
    $(ele).addClass("active");
    functionClkCount = 0;
  } else {
    if ($(ele).hasClass('active')) {
      let index = selectFilters.Function.indexOf(topName);
      if (index !== -1) {
        selectFilters.Function.splice(index, 1);
      }
      $(ele).removeClass("active");
      if (selectFilters.Function.length == 0) {
        $('[data-opt="top-all"]').addClass('active');
      }
      var remElm = $('[data-fillid="' + (optName) + '"]')
      $(remElm).remove();
      otherfillcount -= 1;
      FillCount = otherfillcount + mnthfillcount;
      functionClkCount -= 1;
    } else {
      $('[data-opt="top-all"]').removeClass('active');
      selectFilters.Function.push(topName);
      $('.selected-fillters-list').append('<li data-fillid=' + optName + ' data-fillname="function">' + topName + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>')
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
      $(ele).addClass("active");
      functionClkCount += 1;
    }
    if (functionClkCount == fillTotalCnt.length - 1) {
      $('[data-opt="top-all"]').trigger("click");
      functionClkCount = 0;
    }
  }
  zcsPagination(totalNotesCount, startElm);
  $('.fill-count').html(FillCount);
}

function dcChange(ele) {
  var dcTotalCnt = $('.dc-fill-sec .fillter-list li');
  topMove = 0;
  var dcpName = $(ele).attr("data-DC");
  var optName = $(ele).attr("data-opt");

  if (dcpName == 'all') {
    var getActiveList = $('.other-dc.active')
    if (getActiveList.length > 0) {
      for (let i = 0; i < getActiveList.length; i++) {
        var remElm = $('[data-fillid="' + ($(getActiveList[i]).attr("data-DC")) + '"]');
        $(remElm).remove();
      }
    }
    selectFilters.DC = [];
    $(ele).siblings().removeClass('active');
    $(ele).addClass("active");
    dcClkCount = 0;
  } else {
    if ($(ele).hasClass('active')) {
      let index = selectFilters.DC.indexOf(dcpName);
      if (index !== -1) {
        selectFilters.DC.splice(index, 1);
      }
      $(ele).removeClass("active");
      if (selectFilters.DC.length == 0) {
        $('[data-opt="dc-all"]').addClass('active');
      }
      var remElm = $('[data-fillid="' + (optName) + '"]')
      $(remElm).remove();
      otherfillcount -= 1;
      FillCount = otherfillcount + mnthfillcount;
      dcClkCount -= 1;
    } else {
      $('[data-opt="dc-all"]').removeClass('active');
      selectFilters.DC.push(dcpName);
      $('.selected-fillters-list').append('<li data-fillid=' + optName + ' data-fillname="dc">' + dcpName + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>')
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
      $(ele).addClass("active");
      dcClkCount += 1;
    }

    if (dcClkCount == dcTotalCnt.length - 1) {
      $('[data-opt="dc-all"]').trigger("click");
      dcClkCount = 0;
    }
  }
  zcsPagination(totalNotesCount, startElm);
  $('.fill-count').html(FillCount);
}

function editionChange(ele) {
  var editionTotalCnt = $('.edition-fill-sec .fillter-list li');
  topMove = 0;
  var ediName = $(ele).attr("data-edition");
  var optName = $(ele).attr("data-opt");

  if (ediName == 'all') {
    var getActiveList = $('.other-dc.active')
    if (getActiveList.length > 0) {
      for (let i = 0; i < getActiveList.length; i++) {
        var remElm = $('[data-fillid="' + ($(getActiveList[i]).attr("data-edition")) + '"]');
        $(remElm).remove();
      }
    }
    selectFilters.Edition = [];
    $(ele).siblings().removeClass('active');
    $(ele).addClass("active");
    editionClkCount = 0;
  } else {
    if ($(ele).hasClass('active')) {
      let index = selectFilters.Edition.indexOf(ediName);
      if (index !== -1) {
        selectFilters.Edition.splice(index, 1);
      }
      $(ele).removeClass("active");
      if (selectFilters.Edition.length == 0) {
        $('[data-opt="edition-all"]').addClass('active');
      }
      var remElm = $('[data-fillid="' + (optName) + '"]')
      $(remElm).remove();
      otherfillcount -= 1;
      FillCount = otherfillcount + mnthfillcount;
      editionClkCount -= 1;
    } else {
      $('[data-opt="edition-all"]').removeClass('active');
      selectFilters.Edition.push(ediName);
      $('.selected-fillters-list').append('<li data-fillid=' + optName + ' data-fillname="edition">' + ediName + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>')
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
      $(ele).addClass("active");
      editionClkCount += 1;
    }
    if (editionClkCount == editionTotalCnt.length - 1) {
      $('[data-opt="edition-all"]').trigger("click");
      editionClkCount = 0;
    }
  }
  zcsPagination(totalNotesCount, startElm);
  $('.fill-count').html(FillCount);
}

function pg_Nxt(dir, ele) {
  topMove = 1;
  if (dir == "pre") {
    $('[data-num="' + (Number(pageNo) - 1) + '"]').trigger("click");
  } else if (dir == "next") {
    $('[data-num="' + (Number(pageNo) + 1) + '"]').trigger("click");
  }
}

function slectType(ele) {
  var getVal = $(ele).find('option:selected');
  var value = getVal.val();
  if (value == 'old') {
    selOption = 'old'
  } else if (value == 'new') {
    selOption = 'new'
  }

  zcsPagination(totalNotesCount, startElm)
}


function zcsPagination(totalNotesCount, ele, notesVal) {
  otherFillShow();
  functionList = [];
  dcList = [];
  editionList = [];
  Ele_attr = ele
  pageNo = Ele_attr;
  if (Ele_attr != undefined) {
    Ele_attr = parseInt(Ele_attr);
  }
  if ($('.selected-fillters-list li').length > 0) {
    $('.download-btn').show();
  } else {
    $('.download-btn').hide();
  }

  var pg_sec = $('.pgi_numberSec'),
    pg_break, pg_break1, pagination_lnth, pg_startCunt, pg_endCunt, pagination_number = "",
    pg_start = 1,
    mid_dot = "...";
  totalNotesCount = modifyNotes();
  totalNotesCount = totalNotesCount - 1;
  if (totalNotesCount == 0) {
    $('<span class="error-show">Oops! We couldn\'t find any results. Kindly refine your search criteria.</span>').insertBefore($('.notes-inner-box-sec'));
  }

  var yearErrorCount = $('.year-fill-list');
  var mnthErrorCount = $('.year-fill-mnth');
  if (yearErrorCount.length > 0 || mnthErrorCount.length > 0) {
    $('.year-fill-error').show();
  } else {
    $('.year-fill-error').hide();
  }

  fillClickUpdate();

  if (Ele_attr) {
    if (totalNotesCount > 10) {
      $('.cs_pagination_Sec').show();
      pagination_lnth = Math.ceil(totalNotesCount / 10);
      if (pagination_lnth < 6) {
        pg_startCunt = pg_start,
          pg_endCunt = pagination_lnth;
      } else if (pagination_lnth > 5) {
        pg_startCunt = Ele_attr - 1,
          pg_endCunt = Ele_attr + 1;
        if (Ele_attr - pg_start < 3 || Ele_attr == 3) {
          pg_startCunt = pg_start;
        }
        if (pg_endCunt <= 2 && pagination_lnth > 2) {
          pg_endCunt = 3;
        }
        if (pagination_lnth - Ele_attr < 3) {
          pg_endCunt = pagination_lnth
        }
      }
      if (pg_startCunt > 0 && pg_endCunt <= pagination_lnth) {
        for (var i = pg_startCunt; i <= pg_endCunt; i++) {
          pagination_number += '<li class="pgi_numbers" onclick="pageNav(this)" data-num="' + i + '">' + i + '</li>'
        }
        if (pagination_lnth < 6) {
          pagination_number = pagination_number;
        } else if (pagination_lnth >= 6) {
          if (Ele_attr - pg_start < 3 && pagination_lnth > 3) {
            pg_break = '<li class="pgi_numbers mid_dots">' + mid_dot + '</li><li class="pgi_numbers" onclick="pageNav(this)" data-num="' + pagination_lnth + '">' + pagination_lnth + '</li>';
            pagination_number += pg_break;
          } else if (pagination_lnth - Ele_attr <= 2 && pagination_lnth > 3) {
            pg_break1 = '<li class="pgi_numbers" onclick="pageNav(this)" data-num="' + pg_start + '">' + pg_start + '</li><li class="pgi_numbers mid_dots">' + mid_dot + '</li>';
            pagination_number = pg_break1 + pagination_number;
          } else if (pagination_lnth - Ele_attr >= 3 && Ele_attr - pg_start >= 3 && pagination_lnth > 3) {
            pg_break1 = '<li class="pgi_numbers" onclick="pageNav(this)" data-num="' + pg_start + '">' + pg_start + '</li><li class="pgi_numbers mid_dots">' + mid_dot + '</li>';
            pg_break = '<li class="pgi_numbers mid_dots">' + mid_dot + '</li><li class="pgi_numbers" onclick="pageNav(this)" data-num="' + pagination_lnth + '">' + pagination_lnth + '</li>';
            pagination_number = pg_break1 + pagination_number + pg_break;
          }
        }
        pg_sec.empty();
        pg_sec.append(pagination_number);
        $('.pgi_numbers[data-num=' + Ele_attr + ']').addClass('active');
      } else {
        Ele.addClass('active').siblings().removeClass('active');
      }
    } else {
      $('.cs_pagination_Sec').hide();
    }
  }
  if (topMove == 1) {
    body.stop().animate({
      scrollTop: $('.main-notes-section').offset().top - 50
    }, 800)
  }
  if (pageNo > 1 && pageNo != pagination_lnth) {
    $('.pgi_prev').removeClass('pagearwactive');
    $('.pgi_nxt').removeClass('pagearwactive');
  } else if (pageNo == pagination_lnth) {
    $('.pgi_prev').removeClass('pagearwactive');
    $('.pgi_nxt').addClass('pagearwactive');
  } else {
    $('.pgi_prev').addClass('pagearwactive');
    $('.pgi_nxt').removeClass('pagearwactive');
  }

  setTimeout(function () { initNotesCarousels(); }, 0);
}

function refreshNotesCarouselLayout($carousel) {
  if (!$carousel || !$carousel.length) return;
  if (!$carousel.hasClass('slick-initialized')) return;
  try {
    $carousel.slick('setPosition');
  } catch (e) {
    /* Slick not ready */
  }
}

/** Recalculate Slick layout after slide images load (adaptiveHeight runs before decode otherwise). */
function bindNotesCarouselImageLoads($carousel) {
  var refresh = function () {
    refreshNotesCarouselLayout($carousel);
  };
  $carousel.find('img').each(function () {
    var img = this;
    if (img.complete) {
      return;
    }
    $(img).one('load.notesCarousel', refresh).one('error.notesCarousel', refresh);
  });
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(function () {
      requestAnimationFrame(refresh);
    });
  } else {
    setTimeout(refresh, 0);
  }
  setTimeout(refresh, 150);
}

function initNotesCarousels() {
  if (typeof $.fn.slick === 'undefined') return;
  $('.js-notes-carousel').each(function () {
    var $carousel = $(this);
    if ($carousel.hasClass('slick-initialized')) return;
    $carousel.slick({
      dots: false,
      arrows: true,
      adaptiveHeight: true,
      infinite: true,
      speed: 400,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow: '<button type="button" class="notes-carousel-prev" aria-label="Previous slide"></button>',
      nextArrow: '<button type="button" class="notes-carousel-next" aria-label="Next slide"></button>'
    });
    bindNotesCarouselImageLoads($carousel);
  });
}

function pageNav(ele) {
  topMove = 1;
  var Ele = $(ele),
    Ele_attr = Ele.attr("data-num");
  pageNo = Ele_attr;
  zcsPagination(totalNotesCount, Ele_attr)
}

function removeFillter(ele) {
  var getFillId = $(ele).parent().attr('data-fillid');
  $('[data-opt="' + (getFillId) + '"]').trigger("click");
}

function removemonth(ele) {
  var existYear = 0;
  var getYear = $(ele).parent().attr('data-yrmnth').split('-');
  for (let i = 0; i < selectFilters.year.length; i++) {
    if (selectFilters.year[i].year != getYear[0] && existYear == 0) {
      existYear = 0;
    } else if (selectFilters.year[i].year == getYear[0]) {
      let index = selectFilters.year[i].month.indexOf(getYear[1]);
      if (index !== -1) {
        selectFilters.year[i].month.splice(index, 1);
      }
    }
    existYear = 1;

    if (selectFilters.year[i].month.length == 0) {
      selectFilters.year.splice(i, 1);
    }
  }
  if (Number($('.year-list').html()) == getYear[0]) {
    $('[data-mnth="' + getYear[1] + '"]').removeClass('active');
  }
  $(ele).parent().remove();
  zcsPagination(totalNotesCount, startElm)
}

function modifyNotes() {
  $('.notes-inner-box-sec').empty();
  $('.error-show').remove();
  $('.error-list-show').remove();
  totalNotesCount = 1;
  pdfDataArry = [];
  if (pageNo == 1) {
    pagestart = 1
  } else {
    pagestart = ((pageNo - 1) * 10) + 1;
  }
  var boxEnd = pageNo * 10;

  var checkYear = 0;

  if (selOption == 'old') {
    for (let i = getList.length - 1; i >= 0; i--) {
      year = getList[i].yearName;
      if (selectFilters.year.length != 0) {
        for (let j = 0; j < selectFilters.year.length; j++) {
          if (selectFilters.year[j].year != year && checkYear == 0) {
            checkYear = 0;
          } else if (selectFilters.year[j].year == year) {
            monthList = getList[i].monthLists;
            for (let k = monthList.length - 1; k >= 0; k--) {
              var monthName = monthList[k].monthName;
              let index = selectFilters.year[j].month.indexOf(monthName);
              if (index !== -1) {
                modifyNotesInner(monthList[k], monthName, boxEnd)
              }
            }
            checkYear = 1;
          }
        }
      } else {
        monthList = getList[i].monthLists;
        for (let k = monthList.length - 1; k >= 0; k--) {
          var monthName = monthList[k].monthName;
          modifyNotesInner(monthList[k], monthName, boxEnd)
        }
      }
    }
  } else if (selOption = 'new') {

    for (let i = 0; i < getList.length; i++) {

      year = getList[i].yearName;

      if (selectFilters.year.length != 0) {
        for (let j = 0; j < selectFilters.year.length; j++) {
          if (selectFilters.year[j].year != year && checkYear == 0) {
            checkYear = 0;
          } else if (selectFilters.year[j].year == year) {
            monthList = getList[i].monthLists;
            for (let k = 0; k < monthList.length; k++) {
              var monthName = monthList[k].monthName;
              let index = selectFilters.year[j].month.indexOf(monthName);
              if (index !== -1) {
                modifyNotesInner(monthList[k], monthName, boxEnd)
              }
            }
            checkYear = 1;
          }
        }
      } else {
        monthList = getList[i].monthLists;
        for (let k = 0; k < monthList.length; k++) {
          var monthName = monthList[k].monthName;
          modifyNotesInner(monthList[k], monthName, boxEnd)
        }
      }
    }
  }

  clearBtn();
  return totalNotesCount

}

function modifyNotesInner(monthList, mnname, boxEnd) {
  var detailsLIst = monthList.DetailsList;
  for (let l = 0; l < detailsLIst.length; l++) {
    if (selectFilters.Ecosystem.length > 0) {
      for (let n = 0; n < selectFilters.Ecosystem.length; n++) {
        if (selectFilters.Ecosystem[n] == detailsLIst[l].Ecosystem || detailsLIst[l].Ecosystem == "All Ecosystems") {
          modifyNotesFunction(detailsLIst[l], mnname, boxEnd);
        }
      }
    } else {
      modifyNotesFunction(detailsLIst[l], mnname, boxEnd);
    }

  }
}

function modifyNotesFunction(detailsLIst, mnname, boxEnd) {

  if (selectFilters.Function.length > 0) {
    var funcValue = detailsLIst.Function;
    if (Array.isArray(funcValue)) {
      var matchFound = funcValue.some(function(f) {
        return selectFilters.Function.indexOf(f) !== -1 || f == "All";
      });
      if (matchFound) {
        modifyNotesDC(detailsLIst, mnname, boxEnd);
      }
    } else {
      let index = selectFilters.Function.indexOf(funcValue);
      if (index !== -1 || funcValue == "All") {
        modifyNotesDC(detailsLIst, mnname, boxEnd);
      }
    }
  } else {
    modifyNotesDC(detailsLIst, mnname, boxEnd);
  }
}

function modifyNotesDC(detailsLIst, mnname, boxEnd) {
  if (selectFilters.DC.length > 0) {
    var dcCount = getMatchingElements(selectFilters.DC, detailsLIst.DC);
    if (dcCount.length > 0 || detailsLIst.DC == "All DCs") {
      modifyNotesEdition(detailsLIst, mnname, boxEnd)
    }
  } else {
    modifyNotesEdition(detailsLIst, mnname, boxEnd)
  }
}

function modifyNotesEdition(detailsLIst, mnname, boxEnd) {
  if (selectFilters.Edition.length > 0) {
    var editionCount = getMatchingElements(selectFilters.Edition, detailsLIst.Edition);
    if (editionCount.length > 0 || detailsLIst.Edition == "All Editions") {
      if (tarTxt != '') {
        if (detailsLIst.Title.toLocaleLowerCase().indexOf(tarTxt) !== -1 || detailsLIst.Description.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
          if (detailsLIst.Title.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
            const regex = new RegExp(`(${tarTxt})`, "gi");

            var delTxt = detailsLIst.Title;
            delTxt = delTxt.replace(
              regex,
              '<span class="highlight">$1</span>'
            );
          } else {
            delTxt = detailsLIst.Title;
          }
          if (detailsLIst.Description.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
            const regex = new RegExp(`(${tarTxt})`, "gi");
            var desTxt = detailsLIst.Description;
            desTxt = desTxt.replace(
              regex,
              '<span class="highlight">$1</span>'
            );
          } else {
            desTxt = detailsLIst.Description;
          }
          createNotes(detailsLIst.Ecosystem, detailsLIst.Function, detailsLIst.Edition, detailsLIst.DC, year, mnname, delTxt, desTxt, detailsLIst.read_moreTxt, detailsLIst.Readmore_link, boxEnd, detailsLIst.ThumbImge, detailsLIst.VideoUrl)
        }
      } else {
        createNotes(detailsLIst.Ecosystem, detailsLIst.Function, detailsLIst.Edition, detailsLIst.DC, year, mnname, detailsLIst.Title, detailsLIst.Description, detailsLIst.read_moreTxt, detailsLIst.Readmore_link, boxEnd, detailsLIst.ThumbImge, detailsLIst.VideoUrl)
      }
    }
  } else {
    if (tarTxt != '') {
      if (detailsLIst.Title.toLocaleLowerCase().indexOf(tarTxt) !== -1 || detailsLIst.Description.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
        if (detailsLIst.Title.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
          const regex = new RegExp(`(${tarTxt})`, "gi");
          var delTxt = detailsLIst.Title;
          delTxt = delTxt.replace(
            regex,
            '<span class="highlight">$1</span>'
          );

        } else {
          delTxt = detailsLIst.Title;
        }
        if (detailsLIst.Description.toLocaleLowerCase().indexOf(tarTxt) !== -1) {
          const regex = new RegExp(`(${tarTxt})`, "gi");
          var desTxt = detailsLIst.Description;
          desTxt = desTxt.replace(
            regex,
            '<span class="highlight">$1</span>'
          );
        } else {
          desTxt = detailsLIst.Description;
        }

        createNotes(detailsLIst.Ecosystem, detailsLIst.Function, detailsLIst.Edition, detailsLIst.DC, year, mnname, delTxt, desTxt, detailsLIst.read_moreTxt, detailsLIst.Readmore_link, boxEnd, detailsLIst.ThumbImge, detailsLIst.VideoUrl)
      }
    } else {
      createNotes(detailsLIst.Ecosystem, detailsLIst.Function, detailsLIst.Edition, detailsLIst.DC, year, mnname, detailsLIst.Title, detailsLIst.Description, detailsLIst.read_moreTxt, detailsLIst.Readmore_link, boxEnd, detailsLIst.ThumbImge, detailsLIst.VideoUrl)
    }
  }
}

function getMatchingElements(arr1, arr2) {
  return arr1.filter(element => arr2.includes(element));
}

function createNotes(econame, topic, editon, dc, yer, mnth, titl, discp, mrtxt, mrlnk, boxnd, thumimg, vidUrl) {
  var notesBox = $("<div class='notes-box-wrap'></div>");
  var innerBox = $("<div class='notes-box-inner'></div>")
  var highlightList = $("<ul class='highlight-lists'></ul>");
  var notesSec = $("<div class='notes-cont-sec'></div>");
  var notesLft = $("<div class='notes-lft-sec'></div>");
  var notesRgt = $("<div class='notes-rgt-sec'><img src='" + thumimg + "'/></div>");
  var shareIcon = $("<span class='share-icon' data-show='0' onClick='shareBtn(this);'></span>");
  var shareClsIcon = $("<span class='share-close-icon' data-show='1' onClick='shareBtn(this);'></span>");
  var shareBtn = $("<span class='social-group'></span>");
  var socialBg = $("<span class='social-overlay' onClick='shareBg(this)';></span>");

  if (vidUrl != "") {
    var vidArry = vidUrl.split('?');
    vidArryFirst = vidArry[0].split('/');
    vidArryFirst = vidArryFirst[vidArryFirst.length - 1];
    var newVidUrl = "https://workdrive.zoho.com/file/" + vidArryFirst
  }

  if (econame != "") {
    var bgClr = '';
    switch (econame) {
      case "Web":
        bgClr = '#d2fbe9'
        break;
      case "Developer Platform":
        bgClr = '#ffc7bc'
        break;
      case "Marketplace":
        bgClr = '#d8daff'
        break;
      case "iOS Mobile App":
        bgClr = '#ffb2c0'
        break;
      case "Android Mobile App":
        bgClr = '#ebebeb'
        break;
      case "CRM for Everyone":
        bgClr = '#c7a9f0'
        break;
      default:
    }
    var ecoText = String(econame).trim();
    if (ecoText !== "") {
      var sublist = $("<li class='highlight-box' style='background-color: " + bgClr + ";'>" + ecoText + "</li>");
      $(highlightList).append(sublist);
    }
  }
  if (topic != "") {
    var topicArr = (Array.isArray(topic) ? topic : [topic]).filter(function (item) {
      return String(item).trim() !== "";
    });
    for (var t = 0; t < topicArr.length; t++) {
      var topicItem = String(topicArr[t]).trim();
      var sublist = $("<li class='highlight-box' style='background-color:#bcddfe;'>" + topicItem + "</li>");
      $(highlightList).append(sublist);
      if (topicItem == "All") {
        functionList = defaultFuncList;
      } else {
        let index = functionList.indexOf(topicItem);
        if (index == -1) {
          functionList.push(topicItem);
        }
      }
    }
  }
  if (editon != "") {
    var editonArry = (Array.isArray(editon) ? editon : [editon]).filter(function (item) {
      return String(item).trim() !== "";
    });
    for (let i = 0; i < editonArry.length; i++) {
      var editionItem = String(editonArry[i]).trim();
      if (editionItem == "All Editions") {
        editionList = defaultEditionList;
      } else {
        let index = editionList.indexOf(editionItem);
        if (index == -1) {
          editionList.push(editionItem)
        }
      }
    }
    if (editonArry.length > 1 && String(editonArry[0]).trim() !== "") {
      var sublist = $("<li class='highlight-box' style='background-color:#fef6c7;'>" + editonArry[0] + " onwards</li>");
      $(highlightList).append(sublist);
    } else if (editonArry.length === 1) {
      var sublist = $("<li class='highlight-box' style='background-color:#fef6c7;'>" + editonArry[0] + "</li>");
      $(highlightList).append(sublist);
    }
  }
  if (dc != "") {
    var dcArry = (Array.isArray(dc) ? dc : [dc]).filter(function (item) {
      return String(item).trim() !== "";
    });
    for (let i = 0; i < dcArry.length; i++) {
      var dcItem = String(dcArry[i]).trim();
      var sublist = $("<li class='highlight-box' style='background-color:#c8f5b2;'>" + dcItem + "</li>");
      $(highlightList).append(sublist);
      if (dcItem == "All DCs") {
        dcList = defaultDcList;
      } else {
        let index = dcList.indexOf(dcItem);
        if (index == -1) {
          dcList.push(dcItem)
        }
      }
    }
  }
  if (highlightList.children().length === 0) {
    $(highlightList).addClass("empty-highlight-list");
  } else {
    $(highlightList).removeClass("empty-highlight-list");
  }

  // var datelist = $("<li class='highlight-date'>" + mnth + "," + yer + "</li>")
  // if (datelist.length > 0) {
  //   $(highlightList).append(datelist);
  // }
  // else {
  //   $(highlightList).addClass("empty-highlight-list");
  // }
  $(notesLft).append('<h3>' + titl + '</h3>');
  $(notesLft).append(highlightList);
  $(notesLft).append('<div class="notes-para">' + discp + '</div>');
  var imageUrl = "";
  if (mrtxt != "" && vidUrl == "") {
    $(notesLft).append('<a class="learmore-btn" href="' + mrlnk + '" target="_blank">' + mrtxt + ' <span></span></a>');
    imageUrl = mrlnk;
    var copyBtn = $("<span class='copy-btn share-btn' data-copy='" + mrlnk + "' onclick='copyBtn(this)'><span class='copy-success-alert'>copy link</span></span>");
    var fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + mrlnk + '';
    var lnkUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + mrlnk + '';
  } else if (mrtxt == "" && vidUrl != "") {
    $(notesLft).append('<span class="watch-vid-btn vimvideo" data-video="' + vidUrl + '" aria-haspopup="dialog" aria-expanded="false" tabindex="0"><span>Watch Video</span> <span class="play-btn"></span></span>');
    imageUrl = vidUrl;
    var copyBtn = $("<span class='copy-btn share-btn' data-copy='" + vidUrl + "' onclick='copyBtn(this)'><span class='copy-success-alert'>copy link</span></span>");
    var fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + newVidUrl + '';
    var lnkUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + newVidUrl + '';
    $(notesRgt).addClass('vid-thumb');
  }

  if (titl == "The Zoho CRM Q1 2025 Update Is Here!") {
    $(notesRgt).addClass('vid-thumb');
  }


  var twitterText = `${titl}\n${discp}`;

  var twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(imageUrl)}`;
  var twitterBtn = $("<span class='twitter-btn share-btn'><a href=" + twitterUrl + " target='_blank'></a></span>");
  var fbBtn = $("<span class='fb-btn share-btn'><a href=" + fbUrl + " target='_blank'></a></span>");
  var lnkBtn = $("<span class='lnk-btn share-btn'><a href=" + lnkUrl + " target='_blank'></a></span>");
  $(shareBtn).append(fbBtn);
  $(shareBtn).append(twitterBtn);
  $(shareBtn).append(lnkBtn);
  $(shareBtn).append(copyBtn);


  $(notesSec).append(notesLft);
  if (thumimg !== '') {
    $(notesSec).append(notesRgt);
    $(notesSec).addClass('flx')
  }
  $(innerBox).append(notesSec);
  $(notesBox).append(innerBox);
  if (mrtxt != "" || vidUrl != "") {
    $(notesBox).append(shareIcon);
    $(notesBox).append(shareClsIcon);
    $(notesBox).append(shareBtn);
    if (window_width < 1500) {
      $(notesBox).append(socialBg);
    }
  }
  var createpdfObj = new Object();
  createpdfObj.sirealNo = totalNotesCount;
  createpdfObj.notesTitle = titl;
  createpdfObj.notesDesc = discp;
  createpdfObj.notesLink = mrlnk;
  pdfDataArry.push(createpdfObj);
  if (pageView == true) {
    if (totalNotesCount >= pagestart && totalNotesCount <= boxnd) {
      $('.notes-inner-box-sec').append(notesBox);
    }
  } else if (pageView == false) {
    $('.notes-inner-box-sec').append(notesBox);
  }
  totalNotesCount += 1;
}

function fillClickUpdate() {
  const updateAllStatus = (list, fillNo, allSelector, itemSelector, dataAttr) => {
    if (list.length > 0) {
      if (list.length === fillNo.length) {
        $(allSelector).css({ opacity: "1", "pointer-events": "auto" });
        if (!$(itemSelector + ".active").length) {
          $(allSelector).addClass("active");
        }
      } else {
        $(allSelector).css({ opacity: "0.4", "pointer-events": "none" }).removeClass("active");
      }

      $(itemSelector).css({ opacity: "0.4", "pointer-events": "none" });
      list.forEach((item) => {
        $(`[${dataAttr}="${item}"]`).css({ opacity: "1", "pointer-events": "auto" });
      });
    } else {
      $(allSelector).css({ opacity: "0.4", "pointer-events": "none" }).removeClass("active");
      $(itemSelector).css({ opacity: "0.4", "pointer-events": "none" });
    }
  };

  updateAllStatus(functionList, funcFillNo, '[data-opt="top-all"]', '.other-top', 'data-function');
  updateAllStatus(dcList, dcFillNo, '[data-opt="dc-all"]', '.other-dc', 'data-dc');
  updateAllStatus(editionList, editionFillNo, '[data-opt="edition-all"]', '.other-edition', 'data-edition');
}

function clearBtn() {
  var fillList = $('.selected-fillters-list li');
  if (fillList.length > 0) {
    $('.fillter-clr-btn').show();
  } else {
    $('.fillter-clr-btn').hide();
  }
}


function clearAll() {
  selectFilters.year = [];
  selectFilters.Ecosystem = [];
  selectFilters.Function = [];
  selectFilters.DC = [];
  selectFilters.Edition = [];
  $('.selected-fillters-list').empty();
  $('.fillter-list li').removeAttr('data-fillter');
  $('.fillter-list li').removeClass('active');
  $('.fillter-list:not(.month-list-sec) li:first-child').addClass('active');
  zcsPagination(totalNotesCount, startElm);
  FillCount = 0;
  otherfillcount = 0;
  mnthfillcount = 0;
  $('.fill-count').html(FillCount);
  $('.month-list').removeClass('active');
  $('.sub-fillters').show();
}


function viewAll() {
  pageView = false;
  $('.cs_viewall').removeClass('active');
  $('.cs_viewless').addClass('active');
  zcsPagination(totalNotesCount, startElm);
  $('.cs_pagination').hide();
}

function viewLess() {
  pageView = true;
  $('.cs_viewall').addClass('active');
  $('.cs_viewless').removeClass('active');
  zcsPagination(totalNotesCount, startElm);
  $('.cs_pagination').show();
  body.stop().animate({
    scrollTop: $('.main-notes-section').offset().top - 50
  }, 800)
}

function fillChoice(ele) {
  if ($(ele).attr("data-choice") == "year") {
    $('.year-fill').addClass('active');
    $('.other-fill').removeClass('active');
    if ($(ele).attr("data-select") == "open") {
      $('.mob-year-select').show();
      $('.mob-other-fillters').hide();
      $(ele).attr("data-select", "close");
      $(ele).addClass("active");
      $(ele).siblings().attr("data-select", "open");
      $(ele).siblings().removeClass("active");
      showAll()
    } else {
      $(ele).attr("data-select", "open");
      $(ele).removeClass("active");
      applyAll()
    }
  } else if ($(ele).attr("data-choice") == "fill") {
    $('.year-fill').removeClass('active');
    $('.other-fill').addClass('active');
    if ($(ele).attr("data-select") == "open") {
      $('.mob-year-select').hide();
      $('.mob-other-fillters').show();
      $(ele).attr("data-select", "close");
      $(ele).addClass("active");
      $(ele).siblings().attr("data-select", "open");
      $(ele).siblings().removeClass("active");
      showAll()
    } else {
      $(ele).attr("data-select", "open");
      $(ele).removeClass("active");
      applyAll()
    }
  }
}

function showAll() {
  $('.fillter-overlay').show();
  $('.mob-fillter-wrapper').addClass('show-mobfill');
  $('body').css('overflow', 'hidden');
}

function applyAll() {
  $('.fillter-overlay').hide();
  $('.mob-fillter-wrapper').removeClass('show-mobfill');
  $('body').css('overflow', 'auto');
  $('.mob-fill-opt-select span').attr("data-select", "open");
}

function shareBtn(ele) {
  if ($(ele).attr("data-show") == '0') {
    var extOpen = $('.share-close-icon.active');
    if (extOpen.length > 0) {
      $('.share-close-icon.active').trigger("click");
      setTimeout(function () {
        $(ele).parent().find('.social-group').removeClass('hide-social');
        $(ele).parent().find('.social-group').addClass('show-social');
        $(ele).parent().find('.share-icon').hide();
        $(ele).parent().find('.share-close-icon').show();
        $(ele).parent().find('.share-close-icon').addClass('active');
        if (window_width <= 1500) {
          $(ele).parent().find('.social-overlay').addClass('active');
        }
      }, 300)
    } else {
      $(ele).parent().find('.social-group').removeClass('hide-social');
      $(ele).parent().find('.social-group').addClass('show-social');
      $(ele).parent().find('.share-icon').hide();
      $(ele).parent().find('.share-close-icon').show();
      $(ele).parent().find('.share-close-icon').addClass('active');
      if (window_width <= 1500) {
        $(ele).parent().find('.social-overlay').addClass('active');
      }
    }

  } else {
    $(ele).parent().find('.social-group').removeClass('show-social');
    $(ele).parent().find('.social-group').addClass('hide-social');
    $(ele).parent().find('.share-icon').show();
    $(ele).parent().find('.share-close-icon').hide();
    $(ele).parent().find('.share-close-icon').removeClass('active');
    if (window_width <= 1500) {
      $(ele).parent().find('.social-overlay').removeClass('active');
    }
  }

}

function shareBg(ele) {
  $(ele).parent().find('.share-close-icon').trigger("click");
}

function urlUpdate() {
  var yearTxt = 'all';
  var labelTxt = 'all';
  var topicTxt = 'all';
  var DCTxt = 'all';
  var editionTxt = 'all';
  if (selectFilters.year.length > 0) {
    yearTxt = '';
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (yearTxt != '') {
        yearTxt = yearTxt.slice(0, -1);
        yearTxt += ';';
      }
      yearTxt += selectFilters.year[i].year + '-';
      for (let k = 0; k < selectFilters.year[i].month.length; k++) {
        yearTxt += selectFilters.year[i].month[k];
        yearTxt += ',';
      }
    }
    yearTxt = yearTxt.slice(0, -1);
  }

  if (selectFilters.Ecosystem.length > 0) {
    labelTxt = '';
    for (let i = 0; i < selectFilters.Ecosystem.length; i++) {
      labelTxt += selectFilters.Ecosystem[i] + ',';
    }
    labelTxt = labelTxt.slice(0, -1);
  }

  if (selectFilters.Function.length > 0) {
    topicTxt = '';
    for (let i = 0; i < selectFilters.Function.length; i++) {
      topicTxt += selectFilters.Function[i] + ',';
    }
    topicTxt = topicTxt.slice(0, -1);
  }

  if (selectFilters.DC.length > 0) {
    DCTxt = '';
    for (let i = 0; i < selectFilters.DC.length; i++) {
      DCTxt += selectFilters.DC[i] + ',';
    }
    DCTxt = DCTxt.slice(0, -1);
  }

  if (selectFilters.Edition.length > 0) {
    editionTxt = '';
    for (let i = 0; i < selectFilters.Edition.length; i++) {
      editionTxt += selectFilters.Edition[i] + ',';
    }
    editionTxt = editionTxt.slice(0, -1);
  }

  history.pushState(null, null, "?yearOpt=" + yearTxt + "&labelTag=" + labelTxt + "&topicTag=" + topicTxt + "&DCTag=" + DCTxt + "&editionTag=" + editionTxt);
}

function getParameterByName(name) {
  var urlParams = new URLSearchParams(window.location.search);
  var value = urlParams.get(name);
  return value !== null ? value : 'all';
}

function urlExplore() {
  var yearvals = getParameterByName("yearOpt");
  yearvals = decodeURIComponent(yearvals);
  if (yearvals != 'all' && getSession == null && yearvals !== "null") {
    var yearArry = yearvals.split(';');
  } else {
    var yearArry = '';
  }
  var labelList = getParameterByName("labelTag");
  labelList = decodeURIComponent(labelList);
  if (labelList != 'all' && getSession == null && labelList != "null") {
    var labelList = labelList.split(',');
  } else {
    var labelList = 'all';
  }
  var topicList = getParameterByName("topicTag");
  topicList = decodeURIComponent(topicList);
  if (topicList != 'all' && getSession == null && topicList != "null") {
    var topicList = topicList.split(',');
  } else {
    var topicList = 'all';
  }
  var dcList = getParameterByName("DCTag");
  dcList = decodeURIComponent(dcList);
  if (dcList != 'all' && getSession == null && dcList != "null") {
    var dcList = dcList.split(',');
  } else {
    var dcList = 'all';
  }
  var editionList = getParameterByName("editionTag");
  editionList = decodeURIComponent(editionList);
  if (editionList != 'all' && getSession == null && editionList != "null") {
    var editionList = editionList.split(',');
  } else {
    var editionList = 'all';
  }

  if (Array.isArray(yearArry)) {
    for (let i = 0; i < yearArry.length; i++) {
      var yearVal = yearArry[i].split('-');
      var monthList = yearVal[1].split(',');
      var monthArry = [];
      for (let k = 0; k < monthList.length; k++) {
        monthArry.push(monthList[k]);
        if (yearVal[0] == $('.year-list').html()) {
          $('[data-mnth=' + monthList[k] + ']').addClass('active');
        }
      }
      const createObj = new Object();
      createObj.year = yearVal[0];
      createObj.month = monthArry;
      selectFilters.year.push(createObj);
    }
    monthFillUpdate()
  }

  if (Array.isArray(labelList)) {
    for (let i = 0; i < labelList.length; i++) {
      selectFilters.Ecosystem.push(labelList[i].replace(/%20/g, " "));
      $('[data-opt="eco-all"]').removeClass('active');
      $('[data-opt=' + labelList[i].replace(/%20/g, "") + ']').addClass('active');
      $('.selected-fillters-list').append('<li data-fillid=' + labelList[i].replace(/%20/g, "") + '>' + labelList[i].replace(/%20/g, " ") + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>');
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
    }
  }

  if (Array.isArray(topicList)) {
    for (let i = 0; i < topicList.length; i++) {
      selectFilters.Function.push(topicList[i].replace(/%20/g, " "));
      $('[data-opt="top-all"]').removeClass('active');
      $('[data-opt=' + topicList[i].replace(/%20/g, "") + ']').addClass('active');
      $('.selected-fillters-list').append('<li data-fillid=' + topicList[i].replace(/%20/g, "") + '>' + topicList[i].replace(/%20/g, " ") + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>');
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
    }
  }

  if (Array.isArray(dcList)) {
    for (let i = 0; i < dcList.length; i++) {
      selectFilters.DC.push(dcList[i].replace(/%20/g, " "));
      $('[data-opt="dc-all"]').removeClass('active');
      $('[data-opt=' + dcList[i].replace(/%20/g, "") + ']').addClass('active');
      $('.selected-fillters-list').append('<li data-fillid=' + dcList[i].replace(/%20/g, "") + '>' + dcList[i].replace(/%20/g, " ") + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>');
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
    }
  }

  if (Array.isArray(editionList)) {
    for (let i = 0; i < editionList.length; i++) {
      selectFilters.Edition.push(editionList[i].replace(/%20/g, " "));
      $('[data-opt="edition-all"]').removeClass('active');
      $('[data-opt=' + editionList[i].replace(/%20/g, "") + ']').addClass('active');
      $('.selected-fillters-list').append('<li data-fillid=' + editionList[i].replace(/%20/g, "") + '>' + editionList[i].replace(/%20/g, " ") + '<span class="fillter-close-btn" onClick="removeFillter(this)"></span></li>');
      otherfillcount += 1;
      FillCount = otherfillcount + mnthfillcount;
    }
  }

  $('.fill-count').html(FillCount);

}

function newsPopup() {
  $('.news-popup').show();
  $('body').css('overflow', 'hidden');
}

function formClose() {
  $('.news-popup').hide();
  $('body').css('overflow', 'auto');
}

function showFill(ele) {
  if ($(ele).hasClass('active')) {
    $(ele).next().slideUp();
    $(ele).removeClass('active');
  } else {
    $(ele).next().slideDown(200);
    $(ele).addClass('active');
  }
}

$(document).on('mouseover', '.has-tooltip', function () {
  $(this).next().addClass("active")
});
$(document).on('mouseout', '.has-tooltip', function () {
  $(this).next().removeClass("active")
});

$(document).on('mouseover', '.copy-btn', function () {
  if (copyHover == 0) {
    $(this).children().addClass("active")
  }
});
$(document).on('mouseout', '.copy-btn', function () {

  if (copyHover == 0) {
    $(this).children().removeClass("active")
  }
});


function monthFillUpdate() {
  mnthfillcount = 0;
  $('.year-fill-list').remove();
  $('.year-fill-mnth').remove();
  var newMntArry = selectFilters.year;
  var refMonthArry = ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var refYearArry = []
  var yearList = [];
  var monthList = [];
  var mnthnum = 0;
  var contNum = 0;
  var nextnum = 0;
  var correcspondYear = 0;
  for (let i = 0; i < getList.length; i++) {
    refYearArry.push(getList[i].yearName)
  }
  newMntArry.sort((a, b) => a.year - b.year);
  for (let i = 0; i < selectFilters.year.length; i++) {
    if (selectFilters.year[i].month.length > 0) {
      selectFilters.year[i].month.sort((a, b) => refMonthArry.indexOf(a) - refMonthArry.indexOf(b));
      for (let k = 0; k < selectFilters.year[i].month.length; k++) {
        mnthnum = refMonthArry.indexOf(selectFilters.year[i].month[k]) + 1;
        if (selectFilters.year[i].month[k + 1] != undefined) {
          nextnum = refMonthArry.indexOf(selectFilters.year[i].month[k + 1]) + 1;
        } else {

          if (selectFilters.year[i + 1] != undefined) {
            if (selectFilters.year[i + 1].year == (selectFilters.year[i].year + 1)) {
              correcspondYear = 0;
            } else {
              correcspondYear = 1;
            }
            nextnum = refMonthArry.indexOf(selectFilters.year[i + 1].month[0]) + 1;
          }
        }

        if (mnthnum == contNum) {
          if (mnthnum == 12 && correcspondYear == 0) {
            contNum = 1;
          } else {
            contNum = mnthnum + 1;
          }
          if (nextnum != contNum) {
            let index = yearList.indexOf(selectFilters.year[i].year);
            if (index == -1) {
              yearList.push(selectFilters.year[i].year);
            }
            monthList.push(selectFilters.year[i].year + '&nbsp;' + selectFilters.year[i].month[k]);
            var mergeList = monthList.join(";");
            $('.selected-fillters-list').append('<li class="year-fill-list" data-yrmnth=' + mergeList + ' >' + monthList[0] + ' - ' + monthList[monthList.length - 1] + '<span class="fillter-close-btn" onClick="removemonthnew(this)"></span></li>');
            mnthfillcount += 1;
          } else {
            let index = yearList.indexOf(selectFilters.year[i].year);
            if (index == -1) {
              yearList.push(selectFilters.year[i].year);
            }
            monthList.push(selectFilters.year[i].year + '&nbsp;' + selectFilters.year[i].month[k]);
          }
        } else {
          if (mnthnum == 12 && correcspondYear == 0) {
            contNum = 1;
          } else {
            contNum = mnthnum + 1;
          }
          if (nextnum != contNum) {
            $('.selected-fillters-list').append('<li class="year-fill-mnth" data-yrmnth=' + selectFilters.year[i].year + '-' + selectFilters.year[i].month[k] + '>' + selectFilters.year[i].year + ' ' + selectFilters.year[i].month[k] + '<span class="fillter-close-btn" onClick="removemonthnew(this)"></span></li>');
            mnthfillcount += 1;
          } else {
            yearList = [];
            monthList = [];
            let index = yearList.indexOf(selectFilters.year[i].year);
            if (index == -1) {
              yearList.push(selectFilters.year[i].year);
            }
            monthList.push(selectFilters.year[i].year + '&nbsp;' + selectFilters.year[i].month[k]);
          }
        }

      }
    }
  }
  FillCount = otherfillcount + mnthfillcount;
  $('.fill-count').html(FillCount);
}

function removemonthnew(ele) {
  var getYearList = []
  if ($(ele).parent().hasClass('year-fill-mnth')) {
    getYearList.push($(ele).parent().attr('data-yrmnth').replace("-", ";"));
  } else {
    var yearOpt = $(ele).parent().attr('data-yrmnth').split(';');
    yearOpt.forEach(function (year) {
      year.replace(/\s+/g, ";");
      getYearList.push(year.replace(/\s+/g, ";"));
    });
  }

  for (h = 0; h < getYearList.length; h++) {
    var getYear = getYearList[h].split(";");
    var existYear = 0;
    for (let i = 0; i < selectFilters.year.length; i++) {
      if (selectFilters.year[i].year != getYear[0] && existYear == 0) {
        existYear = 0;
      } else if (selectFilters.year[i].year == getYear[0]) {
        let index = selectFilters.year[i].month.indexOf(getYear[1]);
        if (index !== -1) {
          selectFilters.year[i].month.splice(index, 1);
        }
      }
      existYear = 1;

      if (selectFilters.year[i].month.length == 0) {
        selectFilters.year.splice(i, 1);
      }
    }
    if (Number($('.year-list').html()) == getYear[0]) {
      $('[data-mnth="' + getYear[1] + '"]').removeClass('active');
    }
    $(ele).parent().remove();
  }
  clearBtn();
  zcsPagination(totalNotesCount, startElm);
}

function movePageTop() {
  $('.movetop-btn-wrap').css('opacity', '0');
  body.stop().animate({
    scrollTop: $('.main-notes-section').offset().top - 50
  }, 800)
  setTimeout(function () {
    $('.movetop-btn-wrap').css('opacity', '1');
  }, 900)
}

function copyBtn(b) {
  var c = $(b).data('copy');
  var a = document.createElement("textarea");
  a.value = c;
  document.body.appendChild(a);
  a.select();
  document.execCommand("copy");
  document.body.removeChild(a);
  $(b).children().html('copied');
  $(b).children().addClass('active');
  copyHover = 1;
  setTimeout(function () {
    $(b).children().removeClass("active");
  }, 2000)
  setTimeout(function () {
    $(b).children().html('copy link');
    copyHover = 0;
  }, 2500)
};


function generatePdf() {

  var searchTxt = []

  var searchArry = $('.selected-fillters-list li');

  for (let i = 0; i < searchArry.length; i++) {
    searchTxt.push($(searchArry[i]).text())
  }

  var curDate = new Date();

  const day = String(curDate.getDate()).padStart(2, '0');
  const month = String(curDate.getMonth() + 1).padStart(2, '0'); // months start from 0
  const year = curDate.getFullYear();

  const formattedDate = day + '/' + month + '/' + year;



  var pdfJsonData = {
    searchQuery: searchTxt,
    notesList: pdfDataArry,
    pdfDate: formattedDate
  }

  var btnElm = $('.download-btn')
  var originalText = btnElm.text();

  // Change text before AJAX call
  btnElm.text('Downloading...').prop('disabled', true);


  $.ajax({
    url: 'https://pdf-downloder-template-60047710355.development.catalystserverless.in/server/pdf_downloder_template_function/releasenotespdf',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(pdfJsonData),

    xhrFields: {
      responseType: 'blob'
    },

    success: function (blob) {
      // 1. Create a URL for the blob
      var link = document.createElement('a');
      var url = window.URL.createObjectURL(blob);

      // 2. Set download attribute and trigger click
      link.href = url;
      link.download = 'release-notes-' + day + '-' + month + '-' + year + '.pdf';
      document.body.appendChild(link);
      link.click();

      // 3. Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();

    },
    error: function (xhr, status, error) {
      console.error("Error details:", xhr.responseText);
      alert("Failed to generate PDF. Check console for details.");
      $btn.text(originalText).prop('disabled', false);
    },
    complete: function () {
      btnElm.text(originalText).prop('disabled', false);
    }
  });
}