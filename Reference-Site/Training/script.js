
(function () {
    // Timezone mapping from abbreviations to IANA timezone identifiers
    const timezoneMap = {
        'CET': 'Europe/Paris',          // Central European Time
        'CEST': 'Europe/Paris',          // Central European Summer Time
        'CST': 'America/Chicago',       // Central Standard Time
        'CDT': 'America/Chicago',       // Central Daylight Time
        'AEDT': 'Australia/Sydney',      // Australian Eastern Daylight Time
        'AEST': 'Australia/Sydney',      // Australian Eastern Standard Time
        'IST': 'Asia/Kolkata',          // Indian Standard Time
        'EST': 'America/New_York',      // Eastern Standard Time
        'PST': 'America/Los_Angeles',   // Pacific Standard Time
        'GMT': 'Europe/London',         // Greenwich Mean Time
        'UTC': 'UTC'                    // Coordinated Universal Time
    };

    // Shared helper: converts data-* attributes on a schedule item to a UTC Date
    function getWebinarStartUTC(scheduleItem) {
        try {
            const year = parseInt(scheduleItem.getAttribute('data-year'));
            const month = parseInt(scheduleItem.getAttribute('data-month'));
            const day = parseInt(scheduleItem.getAttribute('data-day'));
            const hour = parseInt(scheduleItem.getAttribute('data-hour'));
            const timezoneAbbr = scheduleItem.getAttribute('data-timezone');

            if (!year || !month || !day || isNaN(hour) || !timezoneAbbr || !timezoneMap[timezoneAbbr]) {
                return null;
            }

            const webinarTimezone = timezoneMap[timezoneAbbr];
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: webinarTimezone,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });

            let webinarUTC = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
            let parts = formatter.formatToParts(webinarUTC);
            let obj = {};
            parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = parseInt(p.value); });

            const hourDiff = hour - obj.hour;
            if (hourDiff !== 0) {
                webinarUTC = new Date(webinarUTC.getTime() + hourDiff * 60 * 60 * 1000);
                parts = formatter.formatToParts(webinarUTC);
                obj = {};
                parts.forEach(p => { if (p.type !== 'literal') obj[p.type] = parseInt(p.value); });
            }

            return webinarUTC;
        } catch (e) {
            return null;
        }
    }

    function isWebinarExpired(scheduleItem) {
        try {
            const webinarUTC = getWebinarStartUTC(scheduleItem);
            if (!webinarUTC) return false;

            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const formatterUser = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });

            const now = new Date();
            const nowInUserTZ = formatterUser.formatToParts(now);
            const currentTime = {};
            nowInUserTZ.forEach(part => { if (part.type !== 'literal') currentTime[part.type] = parseInt(part.value); });

            const webinarInUserTZ = formatterUser.formatToParts(webinarUTC);
            const webinarTime = {};
            webinarInUserTZ.forEach(part => { if (part.type !== 'literal') webinarTime[part.type] = parseInt(part.value); });

            if (currentTime.year !== webinarTime.year) return currentTime.year > webinarTime.year;
            if (currentTime.month !== webinarTime.month) return currentTime.month > webinarTime.month;
            if (currentTime.day !== webinarTime.day) return currentTime.day > webinarTime.day;
            if (currentTime.hour !== webinarTime.hour) return currentTime.hour > webinarTime.hour;
            if (currentTime.minute !== webinarTime.minute) return currentTime.minute > webinarTime.minute;
            return currentTime.second > webinarTime.second;

        } catch (error) {
            return false;
        }
    }

    // Convert all schedule item times to the user's local timezone
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    function getUserTZAbbr() {
        const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date());
        const tz = parts.find(p => p.type === 'timeZoneName');
        return tz ? tz.value : Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    function fmt12h(date) {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    }

    function convertTimesToUserTZ() {
        const userTZAbbr = getUserTZAbbr();
        const dateFmt = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        });

        document.querySelectorAll('.schedule-item').forEach(function (item) {
            if (item.classList.contains('sched-hidden')) return;

            const startUTC = getWebinarStartUTC(item);
            if (!startUTC) return;

            const isExpert = !!item.closest('.sched-col--expert');
            const durationHours = isExpert ? 6 : 3;
            const endUTC = new Date(startUTC.getTime() + durationHours * 60 * 60 * 1000);

            // Update time range (e.g. "10:00 AM to 1:00 PM")
            const timeRangeEl = item.querySelector('.sched-time-range');
            if (timeRangeEl) {
                timeRangeEl.textContent = fmt12h(startUTC) + ' to ' + fmt12h(endUTC);
            }

            // Update timezone label
            const tzEl = item.querySelector('.sched-tz');
            if (tzEl) tzEl.textContent = userTZAbbr;

            // Update date panel to user's local date
            const dateSpans = item.querySelectorAll('.sched-date span');
            if (dateSpans.length >= 3) {
                const parts = dateFmt.formatToParts(startUTC);
                const d = {};
                parts.forEach(function (p) { if (p.type !== 'literal') d[p.type] = parseInt(p.value); });
                dateSpans[0].textContent = MONTHS[d.month - 1];
                dateSpans[1].textContent = String(d.day).padStart(2, '0');
                dateSpans[2].textContent = d.year;
            }
        });
    }

    // Hide expired webinars when DOM is ready
    function hideExpiredWebinars() {
        document.querySelectorAll('.schedule-item').forEach(function (item) {
            if (isWebinarExpired(item)) {
                item.classList.add('sched-hidden');
            }
        });
        convertTimesToUserTZ();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideExpiredWebinars);
    } else {
        hideExpiredWebinars();
    }
})();
$(document).ready(function () {
    $('.banner-slide').slick({
        arrows: false,
        dots: true,
        speed: 1200,
        autoplay: true,
        autoplaySpeed: 8000,
        draggable: false,
        //adaptiveHeight:true
    });

    $('.bnr-cont a[data-href]').on('click', function () {
        var thisHref = $(this).data('href');
        $('html, body').animate({ scrollTop: $("div[data-section='" + thisHref + "']").offset().top - 50 }, 1000);
    });

    /*$('.bnr-cont .courses-link').on('click', function(){
        $('html, body').animate({scrollTop: $(".courses").position().top - 10 },1000);
    });*/
});

