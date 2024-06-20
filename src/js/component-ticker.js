function Util() {}

Util.addClass = function (el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function (el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.osHasReducedMotion = function () {
  if (!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (matchMediaObj) return matchMediaObj.matches;
  return false;
};

// File#: _1_ticker
// Usage: codyhouse.co/license
(function () {
  var Ticker = function (element) {
    this.element = element;
    this.list = this.element.getElementsByTagName('ul')[0];
    this.items = this.list.children;
    this.paused = false;
    // clones info
    this.clones = this.list.innerHTML;
    this.clonesNumber = 1;
    this.itemsLength = this.items.length;
    // animation duration
    this.animationDuration = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--ticker-animation-duration')
    );
    initTicker(this);
  };

  function initTicker(ticker) {
    // clone ticker children
    setTickerWidth(ticker);
    cloneItems(ticker);
    initAnimation(ticker);

    // resize/font loaded event
    ticker.element.addEventListener('update-ticker', function (event) {
      setTickerWidth(ticker);
      cloneItems(ticker);
    });

    // click on control button events
    ticker.element.addEventListener('anim-ticker', function (event) {
      ticker.paused = false;
      Util.removeClass(ticker.element, 'ticker--paused');
    });

    ticker.element.addEventListener('pause-ticker', function (event) {
      ticker.paused = true;
      Util.addClass(ticker.element, 'ticker--paused');
    });

    // all set
    Util.addClass(ticker.element, 'ticker--loaded');
  }

  function setTickerWidth(ticker) {
    var width = 0;
    for (var i = 0; i < ticker.itemsLength; i++) {
      width = width + getItemWidth(ticker.items[i]);
    }
    // check if we need to update the number of clones
    if (width < window.innerWidth) {
      ticker.clonesNumber = Math.ceil(window.innerWidth / width) * 2 - 1;
    } else {
      ticker.clonesNumber = 1;
    }

    // update list width
    ticker.list.style.width = (ticker.clonesNumber + 1) * width + 'px';
  }

  function getItemWidth(item) {
    var style = window.getComputedStyle(item);
    return parseFloat(style.marginRight) + parseFloat(style.marginLeft) + item.offsetWidth;
  }

  function cloneItems(ticker) {
    ticker.list.innerHTML = ticker.clones;
    for (var i = 0; i < ticker.clonesNumber; i++) {
      ticker.list.insertAdjacentHTML('beforeend', ticker.clones);
    }
    // update animation duration
    ticker.element.style.setProperty(
      '--ticker-animation-duration',
      ticker.animationDuration * (ticker.clonesNumber + 1) + 's'
    );
  }

  function initAnimation(ticker) {
    // init observer - animate ticker only when in viewport
    var observer = new IntersectionObserver(tickerObserve.bind(ticker));
    observer.observe(ticker.element);
  }

  function tickerObserve(entries) {
    if (entries[0].isIntersecting) {
      if (!this.paused) Util.addClass(this.element, 'ticker--animate');
    } else {
      Util.removeClass(this.element, 'ticker--animate');
    }
  }

  function initTickerController(controller) {
    // play/pause btn controller
    var tickerContainer = document.getElementById(controller.getAttribute('aria-controls'));
    if (!tickerContainer) return;
    var tickerList = tickerContainer.getElementsByClassName('js-ticker');
    if (tickerList.length < 1) tickerList = [tickerContainer];
    // detect click
    controller.addEventListener('click', function (event) {
      var playAnimation = controller.getAttribute('aria-pressed') == 'true';
      var animEvent = playAnimation ? 'anim-ticker' : 'pause-ticker';
      playAnimation
        ? controller.setAttribute('aria-pressed', 'false')
        : controller.setAttribute('aria-pressed', 'true');
      for (var i = 0; i < tickerList.length; i++) {
        tickerList[i].dispatchEvent(new CustomEvent(animEvent));
      }
    });
  }

  //initialize the Ticker objects
  var tickers = document.getElementsByClassName('js-ticker'),
    requestAnimationFrameSupported = window.requestAnimationFrame,
    reducedMotion = Util.osHasReducedMotion(),
    intersectionObserverSupported =
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window &&
      'intersectionRatio' in window.IntersectionObserverEntry.prototype;

  if (tickers.length > 0) {
    var tickersArray = [];
    for (var i = 0; i < tickers.length; i++) {
      if (!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
        // animation is off if requestAnimationFrame/IntersectionObserver is not supported or reduced motion is on
        Util.addClass(tickers[i], 'ticker--anim-off');
      } else {
        (function (i) {
          tickersArray.push(new Ticker(tickers[i]));
        })(i);
      }
    }

    if (tickersArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-ticker');

      // on resize -> update ticker width
      window.addEventListener('resize', function () {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      // wait for font to be loaded -> update ticker width
      if (document.fonts) {
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
          doneResizing();
        };
      }

      function doneResizing() {
        for (var i = 0; i < tickersArray.length; i++) {
          (function (i) {
            tickersArray[i].element.dispatchEvent(customEvent);
          })(i);
        }
      }

      // ticker play/pause buttons
      var tickerControl = document.getElementsByClassName('js-ticker-control');
      if (tickerControl.length > 0) {
        for (var i = 0; i < tickerControl.length; i++) {
          if (!requestAnimationFrameSupported || reducedMotion || !intersectionObserverSupported) {
            Util.addClass(tickerControl[i], 'hidden');
          } else {
            (function (i) {
              initTickerController(tickerControl[i]);
            })(i);
          }
        }
      }
    }
  }
})();
