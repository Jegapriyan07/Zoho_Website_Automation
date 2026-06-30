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
            tocContainer.appendChild(li);
        } else if (tag === 'H3') {
            if (!currentH2Item) {
                tocContainer.appendChild(li);
                return;
            }
            if (!currentSubList) {
                currentSubList = document.createElement('ul');
                currentH2Item.appendChild(currentSubList);
            }
            currentSubList.appendChild(li);
        }
    });

    var tocLinks = tocContainer.querySelectorAll('a');
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
        tocLinks.forEach(function (link) {
            var li = link.parentElement;
            if (!li) return;
            li.classList.toggle('active', link.getAttribute('href') === '#' + id);
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
