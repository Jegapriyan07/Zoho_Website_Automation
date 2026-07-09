(function () {
    'use strict';

    var cards = document.querySelectorAll('.sticky-section .scroll-card');
    var cardTops = [];

    function cacheCardPositions() {
        cardTops = [];
        cards.forEach(function (card, index) {
            var offset = (index + 1) * 18 + 80;
            card.style.top = offset + 'px';
            cardTops.push(card.getBoundingClientRect().top + window.scrollY);
        });
    }

    function onStickyScroll() {
        if (!cards.length || window.innerWidth <= 991) {
            return;
        }

        var scrollTop = window.scrollY;

        cards.forEach(function (card, index) {
            var cardTop = cardTops[index] - scrollTop;
            var cardHeight = card.offsetHeight;
            var scaleThreshold = cardHeight;
            var scale = 0.0007;
            var scaleVal = 1;

            while (cardTop < scaleThreshold && scaleVal > 0.88) {
                scaleVal -= scale;
                scaleThreshold -= 50;
                scale += 0.0007;
            }

            if (cardTop < cardHeight) {
                card.style.transform = 'scale(' + Math.max(scaleVal, 0.88) + ', 1)';
            } else if (cardTop > cardHeight + 50) {
                card.style.transform = 'scale(1, 1)';
            }
        });
    }

    if (cards.length && window.innerWidth > 991) {
        cacheCardPositions();
        window.addEventListener('scroll', onStickyScroll, { passive: true });
        window.addEventListener('resize', function () {
            if (window.innerWidth <= 991) {
                cards.forEach(function (card) {
                    card.style.transform = '';
                });
                return;
            }
            cacheCardPositions();
            onStickyScroll();
        });
    }

    document.querySelectorAll('.z-accordianBox h4').forEach(function (heading) {
        heading.setAttribute('tabindex', '0');
        heading.setAttribute('role', 'button');

        function toggleFaq() {
            var isActive = heading.classList.contains('active');

            document.querySelectorAll('.z-accordianBox h4').forEach(function (h) {
                h.classList.remove('active');
            });
            document.querySelectorAll('.z-accordianBox > ul').forEach(function (ul) {
                ul.style.display = 'none';
            });

            if (!isActive) {
                heading.classList.add('active');
                var list = heading.parentElement.querySelector('ul');
                if (list) {
                    list.style.display = 'block';
                }
            }
        }

        heading.addEventListener('click', toggleFaq);
        heading.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq();
            }
        });
    });

    var firstFaq = document.querySelector('.z-accordianBox h4.active');
    if (firstFaq) {
        var firstList = firstFaq.parentElement.querySelector('ul');
        if (firstList) {
            firstList.style.display = 'block';
        }
    }
})();
