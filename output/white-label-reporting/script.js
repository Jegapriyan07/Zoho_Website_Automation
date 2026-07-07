(function () {
    'use strict';

    document.querySelectorAll('.z-accordianBox h4').forEach(function (heading) {
        heading.addEventListener('click', function () {
            var box = heading.parentElement;
            var list = box.querySelector('ul');
            var isActive = heading.classList.contains('active');

            document.querySelectorAll('.z-accordianBox h4').forEach(function (h) {
                h.classList.remove('active');
            });
            document.querySelectorAll('.z-accordianBox > ul').forEach(function (ul) {
                ul.style.display = 'none';
            });

            if (!isActive && list) {
                heading.classList.add('active');
                list.style.display = 'block';
            }
        });
    });
})();
