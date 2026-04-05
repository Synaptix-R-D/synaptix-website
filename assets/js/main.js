/* ===================================================================
   SYNAPTIX — Production JavaScript
   =================================================================== */

(function () {
    'use strict';

    // --- Nav scroll state ---
    const nav = document.getElementById('navbar');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    // --- Mobile menu toggle ---
    const toggle = document.querySelector('.nav-toggle');
    const navRight = document.querySelector('.nav-right');
    if (toggle && navRight) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('active');
            navRight.classList.toggle('open');
        });
        // Close menu when a link is clicked
        navRight.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                toggle.classList.remove('active');
                navRight.classList.remove('open');
            });
        });
    }

    // --- Smooth anchor scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Scroll reveal (IntersectionObserver) ---
    var revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(function (el, i) {
            el.style.transitionDelay = (i % 6) * 80 + 'ms';
            io.observe(el);
        });
    } else {
        // Fallback: show everything
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // --- Stat counter animation ---
    var statNums = document.querySelectorAll('.stat-num[data-target]');
    if (statNums.length > 0 && 'IntersectionObserver' in window) {
        var statIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statIO.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNums.forEach(function (el) { statIO.observe(el); });
    }

    function animateCounter(el) {
        var target = el.getAttribute('data-target');
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var targetNum = parseFloat(target.replace(/,/g, ''));
        var duration = 1200;
        var start = performance.now();

        function step(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * targetNum);

            // Format with commas if target had them
            var formatted = target.includes(',')
                ? current.toLocaleString()
                : current.toString();

            el.textContent = prefix + formatted + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // --- Signal canvas (ECG + EEG in device mock) ---
    var signalCanvas = document.getElementById('signalCvs');
    if (signalCanvas) {
        var ctx = signalCanvas.getContext('2d');

        function resizeSignalCanvas() {
            var rect = signalCanvas.parentElement.getBoundingClientRect();
            var dpr = window.devicePixelRatio || 1;
            signalCanvas.width = rect.width * dpr;
            signalCanvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        resizeSignalCanvas();
        window.addEventListener('resize', resizeSignalCanvas);

        function drawSignals(t) {
            var dpr = window.devicePixelRatio || 1;
            var w = signalCanvas.width / dpr;
            var h = signalCanvas.height / dpr;
            ctx.clearRect(0, 0, w, h);

            // EEG waveform (top half — cyan)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
            ctx.lineWidth = 1.5;
            for (var x = 0; x < w; x++) {
                var yEEG = h * 0.3
                    + Math.sin(x / 12 + t / 400) * 15
                    + Math.sin(x / 5 + t / 200) * 5;
                if (x === 0) ctx.moveTo(x, yEEG);
                else ctx.lineTo(x, yEEG);
            }
            ctx.stroke();

            // ECG waveform (bottom half — teal with QRS spikes)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 229, 195, 0.6)';
            ctx.lineWidth = 1.5;
            for (var x2 = 0; x2 < w; x2++) {
                var yECG = h * 0.7;
                var localX = (x2 + t * 0.08) % 80;
                if (localX > 30 && localX < 35) {
                    yECG -= (localX - 30) * 7;
                } else if (localX >= 35 && localX < 38) {
                    yECG += (localX - 35) * 14;
                } else if (localX >= 38 && localX < 42) {
                    yECG -= (localX - 38) * 5;
                } else {
                    yECG += Math.sin(x2 / 20 + t / 600) * 3;
                }
                if (x2 === 0) ctx.moveTo(x2, yECG);
                else ctx.lineTo(x2, yECG);
            }
            ctx.stroke();

            requestAnimationFrame(drawSignals);
        }

        requestAnimationFrame(drawSignals);
    }

    // --- CTA mailto links ---
    var contactEmail = window.SYNAPTIX_CONFIG
        ? window.SYNAPTIX_CONFIG.CONTACT_EMAIL
        : 'info@beatrite.com';

    document.querySelectorAll('[data-mailto]').forEach(function (el) {
        var subject = el.getAttribute('data-subject') || 'Inquiry - Synaptix';
        var mailto = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent(subject);
        el.setAttribute('href', mailto);
    });

})();
