window.addEventListener("load", onload);

function onload() {
    var observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            var anchorHref = entry.target.href.substr(entry.target.href.lastIndexOf('#'));
            var anchor = document.querySelector('a[href="' + anchorHref + '"]');
            if (entry.isIntersecting === true) {
                anchor.classList.add('active');
                var li = anchor.parentElement;
                do {
                    if (!li.classList.contains('force-active') && !li.classList.contains('force-inactive')) {
                        li.classList.add('active');
                    }
                    li = li.parentElement.parentElement;
                } while (li.parentElement.tagName.toLowerCase() == "ul");
            }
            else {
                if (anchor)
                    anchor.classList.remove('active');
            }
        });
    }, { threshold: [1] });

    document.querySelectorAll("a.anchor").forEach((el) => {
        observer.observe(el);
    });

    document.getElementById('toc').addEventListener('click', (e) => {
        if (e.target.classList.contains('toc-entry')) {
            if (e.target.classList.contains('force-active')) {
                e.target.classList.remove('active');
                e.target.classList.remove('force-active');
                e.target.classList.add('force-inactive');
            } 
            else if (e.target.classList.contains('force-inactive')) {
                e.target.classList.add('active');
                e.target.classList.remove('force-inactive');
                e.target.classList.add('force-active');
            }
            else if (e.target.classList.contains('active')) {
                e.target.classList.remove('active');
                e.target.classList.add('force-inactive');
            }
            else {
                e.target.classList.add('active');
                e.target.classList.add('force-active');
            }
        }
    });
}



