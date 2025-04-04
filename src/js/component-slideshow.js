function Util() {}

Util.hasClass = function (el, className) {
  return el.classList.contains(className);
};

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

Util.setAttributes = function (el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if (!element) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
};

Util.getIndexInArray = function (array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function (property, value) {
  return CSS.supports(property, value);
};

Util.extend = function () {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < length; i++) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function () {
  var Slideshow = function (opts) {
    this.options = Util.extend(Slideshow.defaults, opts);
    this.element = this.options.element;
    this.items = this.element.getElementsByClassName('js-slideshow__item');
    this.controls = this.element.getElementsByClassName('js-slideshow__control');
    this.selectedSlide = 0;
    this.autoplayId = false;
    this.autoplayPaused = false;
    this.navigation = false;
    this.navCurrentLabel = false;
    this.ariaLive = false;
    this.moveFocus = false;
    this.animating = false;
    this.supportAnimation = Util.cssSupports('transition');
    this.counter = this.element.getElementsByClassName('js-carousel__counter');
    this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
    this.animationOff =
      !Util.hasClass(this.element, 'slideshow--transition-fade') &&
      !Util.hasClass(this.element, 'slideshow--transition-slide') &&
      !Util.hasClass(this.element, 'slideshow--transition-prx');
    this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
    this.animatingClass = 'slideshow--is-animating';
    initCarouselCounter(this);
    initSlideshow(this);
    initSlideshowEvents(this);
    initAnimationEndEvents(this);
  };

  Slideshow.prototype.showNext = function () {
    showNewItem(this, this.selectedSlide + 1, 'next');
  };

  Slideshow.prototype.showPrev = function () {
    showNewItem(this, this.selectedSlide - 1, 'prev');
  };

  Slideshow.prototype.showItem = function (index) {
    showNewItem(this, index, false);
  };

  Slideshow.prototype.startAutoplay = function () {
    var self = this;
    if (this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
      self.autoplayId = setInterval(function () {
        self.showNext();
      }, self.options.autoplayInterval);
    }
  };

  Slideshow.prototype.pauseAutoplay = function () {
    var self = this;
    if (this.options.autoplay) {
      clearInterval(self.autoplayId);
      self.autoplayId = false;
    }
  };

  function initCarouselCounter(carousel) {
    console.log(carousel);
    if (carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.items.length;
    setCounterItem(carousel);
  }

  function setCounterItem(carousel) {
    if (carousel.counter.length == 0) return;
    var totalItems = carousel.selectedSlide + 1;
    if (totalItems > carousel.items.length) totalItems = carousel.items.length;
    carousel.counter[0].textContent = totalItems;
  }

  function initSlideshow(slideshow) {
    // basic slideshow settings
    // if no slide has been selected -> select the first one
    if (slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1)
      Util.addClass(slideshow.items[0], 'slideshow__item--selected');
    slideshow.selectedSlide = Util.getIndexInArray(
      slideshow.items,
      slideshow.element.getElementsByClassName('slideshow__item--selected')[0]
    );
    // create an element that will be used to announce the new visible slide to SR
    var srLiveArea = document.createElement('div');
    Util.setAttributes(srLiveArea, {
      class: 'lst-sr-only js-slideshow__aria-live',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    const bulletsWrapper = slideshow.element.getElementsByClassName('js-slideshow-bullets')[0];
    bulletsWrapper.appendChild(srLiveArea);
    slideshow.ariaLive = srLiveArea;
  }

  function initSlideshowEvents(slideshow) {
    // if slideshow navigation is on -> create navigation HTML and add event listeners
    if (slideshow.options.navigation) {
      // check if navigation has already been included
      if (slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
        var navigation = document.createElement('ol'),
          navChildren = '';

        var navClasses = slideshow.options.navigationClass + ' js-slideshow__navigation lst-col-start-3';
        if (slideshow.items.length <= 1) {
          navClasses = navClasses + ' hidden';
        }

        navigation.setAttribute('class', navClasses);
        for (var i = 0; i < slideshow.items.length; i++) {
          var className =
              i == slideshow.selectedSlide
                ? 'class="' +
                  slideshow.options.navigationItemClass +
                  ' ' +
                  slideshow.options.navigationItemClass +
                  '--selected js-slideshow__nav-item"'
                : 'class="' + slideshow.options.navigationItemClass + ' js-slideshow__nav-item"',
            navCurrentLabel =
              i == slideshow.selectedSlide
                ? '<span class="lst-sr-only js-slideshow__nav-current-label">Current Item</span>'
                : '';
          navChildren =
            navChildren +
            '<li ' +
            className +
            '><button class="reset"><span class="lst-sr-only">' +
            (i + 1) +
            '</span>' +
            navCurrentLabel +
            '</button></li>';
        }
        navigation.innerHTML = navChildren;
        const bulletsWrapper = slideshow.element.getElementsByClassName('js-slideshow-bullets')[0];
        bulletsWrapper.appendChild(navigation);
      }

      slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0];
      slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

      var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

      dotsNavigation.addEventListener('click', function (event) {
        navigateSlide(slideshow, event, true);
      });
      dotsNavigation.addEventListener('keyup', function (event) {
        navigateSlide(slideshow, event, event.key.toLowerCase() == 'enter');
      });
    }
    // slideshow arrow controls
    if (slideshow.controls.length > 0) {
      // hide controls if one item available
      if (slideshow.items.length <= 1) {
        Util.addClass(slideshow.controls[0], 'hidden');
        Util.addClass(slideshow.controls[1], 'hidden');
      }
      slideshow.controls[0].addEventListener('click', function (event) {
        event.preventDefault();
        slideshow.showPrev();
        updateAriaLive(slideshow);
      });
      slideshow.controls[1].addEventListener('click', function (event) {
        event.preventDefault();
        slideshow.showNext();
        updateAriaLive(slideshow);
      });
    }
    // swipe events
    if (slideshow.options.swipe) {
      //init swipe
      new SwipeContent(slideshow.element);
      slideshow.element.addEventListener('swipeLeft', function (event) {
        slideshow.showNext();
      });
      slideshow.element.addEventListener('swipeRight', function (event) {
        slideshow.showPrev();
      });
    }
    // autoplay
    if (slideshow.options.autoplay) {
      slideshow.startAutoplay();
      // pause autoplay if user is interacting with the slideshow
      if (!slideshow.options.autoplayOnHover) {
        slideshow.element.addEventListener('mouseenter', function (event) {
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('mouseleave', function (event) {
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
      }
      if (!slideshow.options.autoplayOnFocus) {
        slideshow.element.addEventListener('focusin', function (event) {
          slideshow.pauseAutoplay();
          slideshow.autoplayPaused = true;
        });
        slideshow.element.addEventListener('focusout', function (event) {
          slideshow.autoplayPaused = false;
          slideshow.startAutoplay();
        });
      }
    }
    // detect if external buttons control the slideshow
    var slideshowId = slideshow.element.getAttribute('id');
    if (slideshowId) {
      var externalControls = document.querySelectorAll('[data-controls="' + slideshowId + '"]');
      for (var i = 0; i < externalControls.length; i++) {
        (function (i) {
          externalControlSlide(slideshow, externalControls[i]);
        })(i);
      }
    }
    // custom event to trigger selection of a new slide element
    slideshow.element.addEventListener('selectNewItem', function (event) {
      // check if slide is already selected
      if (event.detail) {
        if (event.detail - 1 == slideshow.selectedSlide) return;
        showNewItem(slideshow, event.detail - 1, false);
      }
    });

    // keyboard navigation
    slideshow.element.addEventListener('keydown', function (event) {
      if ((event.keyCode && event.keyCode == 39) || (event.key && event.key.toLowerCase() == 'arrowright')) {
        slideshow.showNext();
      } else if ((event.keyCode && event.keyCode == 37) || (event.key && event.key.toLowerCase() == 'arrowleft')) {
        slideshow.showPrev();
      }
    });
  }

  function navigateSlide(slideshow, event, keyNav) {
    // user has interacted with the slideshow navigation -> update visible slide
    var target = Util.hasClass(event.target, 'js-slideshow__nav-item')
      ? event.target
      : event.target.closest('.js-slideshow__nav-item');
    if (keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
      slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
      slideshow.moveFocus = true;
      updateAriaLive(slideshow);
    }
  }

  function initAnimationEndEvents(slideshow) {
    // remove animation classes at the end of a slide transition
    for (var i = 0; i < slideshow.items.length; i++) {
      (function (i) {
        slideshow.items[i].addEventListener('animationend', function () {
          resetAnimationEnd(slideshow, slideshow.items[i]);
        });
        slideshow.items[i].addEventListener('transitionend', function () {
          resetAnimationEnd(slideshow, slideshow.items[i]);
        });
      })(i);
    }
  }

  function getImageColorAt(img, x, y) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    try {
      const imageData = ctx.getImageData(x, y, 1, 1).data;
      return {
        r: imageData[0],
        g: imageData[1],
        b: imageData[2],
        a: imageData[3],
        hex: `#${imageData[0].toString(16).padStart(2, '0')}${imageData[1].toString(16).padStart(2, '0')}${imageData[2]
          .toString(16)
          .padStart(2, '0')}`,
      };
    } catch (e) {
      console.error('Error getting image data:', e);
      return null;
    } finally {
      canvas.remove();
    }
  }

  function analyzeMultiplePoints(img, element) {
    const points = [
      { x: -5, y: -5 }, // top-left
      { x: -5, y: 0 }, // left
      { x: 0, y: -5 }, // top
      { x: 5, y: 5 }, // bottom-right
      { x: 0, y: 5 }, // bottom
      { x: 5, y: 0 }, // right
    ];

    const rect = element.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const results = points
      .map((point) => {
        const relativeX = Math.floor((rect.left - imgRect.left + point.x) * (img.naturalWidth / imgRect.width));
        const relativeY = Math.floor((rect.top - imgRect.top + point.y) * (img.naturalHeight / imgRect.height));

        return getImageColorAt(img, relativeX, relativeY);
      })
      .filter(Boolean); // Remove null results

    if (results.length === 0) return null;

    // Average the brightness of all points
    const avgBrightness =
      results.reduce((sum, color) => {
        return sum + (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
      }, 0) / results.length;

    return avgBrightness;
  }

  function updateArrowColor(slideshow) {
    const currentSlide = slideshow.items[slideshow.selectedSlide];
    const slideImage = currentSlide.querySelector('img');

    console.log(slideImage);

    if (!slideImage || !slideImage.complete) {
      // If there's no image or it's not loaded, skip color analysis
      return;
    }

    const arrowIcons = slideshow.controls;

    for (let i = 0; i < arrowIcons.length; i++) {
      const arrowIcon = arrowIcons[i];
      const brightness = analyzeMultiplePoints(slideImage, arrowIcon);

      if (brightness !== null) {
        // Set contrasting color based on background brightness
        arrowIcon.style.color = brightness > 128 ? '#000000' : '#ffffff';
      }
    }
  }

  function resetAnimationEnd(slideshow, item) {
    setTimeout(function () {
      // add a delay between the end of animation and slideshow reset - improve animation performance
      if (Util.hasClass(item, 'slideshow__item--selected')) {
        if (slideshow.moveFocus) Util.moveFocus(item);
        emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
        slideshow.moveFocus = false;
      }
      Util.removeClass(
        item,
        'slideshow__item--' +
          slideshow.animationType +
          '-out-left slideshow__item--' +
          slideshow.animationType +
          '-out-right slideshow__item--' +
          slideshow.animationType +
          '-in-left slideshow__item--' +
          slideshow.animationType +
          '-in-right'
      );
      item.removeAttribute('aria-hidden');
      slideshow.animating = false;
      Util.removeClass(slideshow.element, slideshow.animatingClass);
    }, 100);
  }

  function showNewItem(slideshow, index, bool) {
    if (slideshow.items.length <= 1) return;
    if (slideshow.animating && slideshow.supportAnimation) return;
    slideshow.animating = true;
    Util.addClass(slideshow.element, slideshow.animatingClass);
    if (index < 0) index = slideshow.items.length - 1;
    else if (index >= slideshow.items.length) index = 0;
    // skip slideshow item if it is hidden
    if (bool && Util.hasClass(slideshow.items[index], 'hidden')) {
      slideshow.animating = false;
      index = bool == 'next' ? index + 1 : index - 1;
      showNewItem(slideshow, index, bool);
      return;
    }
    // index of new slide is equal to index of slide selected item
    if (index == slideshow.selectedSlide) {
      slideshow.animating = false;
      return;
    }
    var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
    var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
    // transition between slides
    if (!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
    Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
    slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
    if (slideshow.animationOff) {
      Util.addClass(slideshow.items[index], 'slideshow__item--selected');
    } else {
      Util.addClass(slideshow.items[index], enterItemClass + ' slideshow__item--selected');
    }
    // reset slider navigation appearance
    resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
    slideshow.selectedSlide = index;
    // reset autoplay
    slideshow.pauseAutoplay();
    slideshow.startAutoplay();
    // reset controls/navigation color themes
    resetSlideshowTheme(slideshow, index);
    // emit event
    emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);

    updateArrowColor(slideshow);

    if (slideshow.animationOff) {
      slideshow.animating = false;
      Util.removeClass(slideshow.element, slideshow.animatingClass);
    }
    setCounterItem(slideshow);

    // After setting the new slide
    const newSlideImage = slideshow.items[index].querySelector('img');
    if (newSlideImage) {
      if (newSlideImage.complete) {
        updateArrowColor(slideshow);
      } else {
        newSlideImage.addEventListener(
          'load',
          () => {
            updateArrowColor(slideshow);
          },
          { once: true }
        );
      }
    }
  }

  function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
    var className = '';
    if (bool) {
      className =
        bool == 'next'
          ? 'slideshow__item--' + slideshow.animationType + '-out-right'
          : 'slideshow__item--' + slideshow.animationType + '-out-left';
    } else {
      className =
        newIndex < oldIndex
          ? 'slideshow__item--' + slideshow.animationType + '-out-left'
          : 'slideshow__item--' + slideshow.animationType + '-out-right';
    }
    return className;
  }

  function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
    var className = '';
    if (bool) {
      className =
        bool == 'next'
          ? 'slideshow__item--' + slideshow.animationType + '-in-right'
          : 'slideshow__item--' + slideshow.animationType + '-in-left';
    } else {
      className =
        newIndex < oldIndex
          ? 'slideshow__item--' + slideshow.animationType + '-in-left'
          : 'slideshow__item--' + slideshow.animationType + '-in-right';
    }
    return className;
  }

  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
    if (slideshow.navigation) {
      Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
      Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
      slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
      slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
    }
  }

  function resetSlideshowTheme(slideshow, newIndex) {
    var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
    if (dataTheme) {
      if (slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
      if (slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
    } else {
      if (slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
      if (slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
    }
  }

  function emitSlideshowEvent(slideshow, eventName, detail) {
    var event = new CustomEvent(eventName, { detail: detail });
    slideshow.element.dispatchEvent(event);
  }

  function updateAriaLive(slideshow) {
    slideshow.ariaLive.innerHTML = 'Item ' + (slideshow.selectedSlide + 1) + ' of ' + slideshow.items.length;
  }

  function externalControlSlide(slideshow, button) {
    // control slideshow using external element
    button.addEventListener('click', function (event) {
      var index = button.getAttribute('data-index');
      if (!index || index == slideshow.selectedSlide + 1) return;
      event.preventDefault();
      showNewItem(slideshow, index - 1, false);
    });
  }

  Slideshow.defaults = {
    element: '',
    navigation: true,
    autoplay: false,
    autoplayOnHover: false,
    autoplayOnFocus: false,
    autoplayInterval: 5000,
    navigationItemClass: 'slideshow__nav-item',
    navigationClass: 'slideshow__navigation',
    swipe: false,
  };

  window.Slideshow = Slideshow;

  //initialize the Slideshow objects
  var slideshows = document.getElementsByClassName('js-slideshow');
  if (slideshows.length > 0) {
    for (var i = 0; i < slideshows.length; i++) {
      (function (i) {
        var navigation =
            slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off'
              ? false
              : true,
          autoplay =
            slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on'
              ? true
              : false,
          autoplayOnHover =
            slideshows[i].getAttribute('data-autoplay-hover') &&
            slideshows[i].getAttribute('data-autoplay-hover') == 'on'
              ? true
              : false,
          autoplayOnFocus =
            slideshows[i].getAttribute('data-autoplay-focus') &&
            slideshows[i].getAttribute('data-autoplay-focus') == 'on'
              ? true
              : false,
          autoplayInterval = slideshows[i].getAttribute('data-autoplay-interval')
            ? slideshows[i].getAttribute('data-autoplay-interval')
            : 5000,
          swipe =
            slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on' ? true : false,
          navigationItemClass = slideshows[i].getAttribute('data-navigation-item-class')
            ? slideshows[i].getAttribute('data-navigation-item-class')
            : 'slideshow__nav-item',
          navigationClass = slideshows[i].getAttribute('data-navigation-class')
            ? slideshows[i].getAttribute('data-navigation-class')
            : 'slideshow__navigation';
        new Slideshow({
          element: slideshows[i],
          navigation: navigation,
          autoplay: autoplay,
          autoplayOnHover: autoplayOnHover,
          autoplayOnFocus: autoplayOnFocus,
          autoplayInterval: autoplayInterval,
          swipe: swipe,
          navigationItemClass: navigationItemClass,
          navigationClass: navigationClass,
        });
      })(i);
    }
  }
})();
