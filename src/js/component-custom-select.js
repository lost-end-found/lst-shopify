export default (function () {
  var CustomSelect = function (t) {
    this.element = t;
    this.select = this.element.getElementsByTagName('select')[0];
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.selectedOption = getSelectedOption(this);
    this.selectId = this.select.getAttribute('id');
    this.trigger = false;
    this.dropdown = false;
    this.customOptions = false;
    this.arrowIcon = this.element.getElementsByTagName('svg');
    this.label = document.querySelector('[for="' + this.selectId + '"]');
    this.labelContent = '';
    if (this.label) {
      this.labelContent = ', ' + this.label.textContent;
    }
    this.optionIndex = 0;

    initCustomSelect(this);
    initCustomSelectEvents(this);
  };

  function initCustomSelect(t) {
    // create the HTML for the custom dropdown element
    t.element.insertAdjacentHTML('beforeend', initButtonSelect(t) + initListSelect(t));

    // save custom elements
    t.dropdown = t.element.getElementsByClassName('js-select__dropdown')[0];
    t.trigger = t.element.getElementsByClassName('js-select__button')[0];
    t.customOptions = t.dropdown.getElementsByClassName('js-select__item');

    // hide default select
    t.select.classList.add('lst-hidden');
    if (t.arrowIcon.length > 0) t.arrowIcon[0].style.display = 'none';

    // store drowpdown min-width
    t.minWidth = parseInt(getComputedStyle(t.dropdown).getPropertyValue('min-width'));

    // place dropdown
    placeDropdown(t);
  }

  function initCustomSelectEvents(t) {
    // option selection in dropdown
    initSelection(t);

    // click events
    t.trigger.addEventListener('click', function () {
      toggleCustomSelect(t, false);
    });
    if (t.label) {
      // move focus to custom trigger when clicking on <select> label
      t.label.addEventListener('click', function () {
        moveFocus(t.trigger);
      });
    }
    // keyboard navigation
    t.dropdown.addEventListener('keydown', function (event) {
      if ((event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup')) {
        keyboardCustomSelect(t, 'prev', event);
      } else if ((event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown')) {
        keyboardCustomSelect(t, 'next', event);
      }
    });
    // native <select> element has been updated -> update custom select as well
    t.element.addEventListener('select-updated', function (event) {
      resetCustomSelect(t);
    });
  }

  function toggleCustomSelect(t, bool) {
    var ariaExpanded;
    if (bool) {
      ariaExpanded = bool;
    } else {
      ariaExpanded = t.trigger.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
    }
    t.trigger.setAttribute('aria-expanded', ariaExpanded);
    if (ariaExpanded == 'true') {
      var selectedOption = getSelectedOption(t);
      moveFocus(selectedOption); // fallback if transition is not supported
      t.dropdown.addEventListener('transitionend', function cb() {
        moveFocus(selectedOption);
        t.dropdown.removeEventListener('transitionend', cb);
      });
      placeDropdown(t);
    }
  }

  function placeDropdown(t) {
    // remove placement classes to reset position
    t.dropdown.classList.remove('select__dropdown--right', 'select__dropdown--up');
    // check if there's enough space up or down
    var triggerBoundingRect = t.trigger.getBoundingClientRect();
    var dropdownHeight = t.dropdown.offsetHeight;
    if (
      window.innerHeight - triggerBoundingRect.bottom - 5 < dropdownHeight &&
      triggerBoundingRect.top - 5 > dropdownHeight
    ) {
      t.dropdown.classList.add('select__dropdown--up');
    }
    // check if we need to move dropdown to the left
    var dropdownWidth = t.dropdown.offsetWidth;
    if (window.innerWidth - triggerBoundingRect.left < dropdownWidth) {
      t.dropdown.classList.add('select__dropdown--right');
    }
  }

  function keyboardCustomSelect(t, direction, event) {
    event.preventDefault();
    var index = Array.prototype.indexOf.call(t.customOptions, document.activeElement);
    index = direction == 'next' ? index + 1 : index - 1;
    if (index < 0) index = t.customOptions.length - 1;
    if (index >= t.customOptions.length) index = 0;
    moveFocus(t.customOptions[index]);
  }

  function initSelection(t) {
    t.dropdown.addEventListener('click', function (event) {
      var option = event.target.closest('.js-select__item');
      if (!option) return;
      selectOption(t, option);
    });
  }

  function selectOption(t, option) {
    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true') {
      // selecting the same option
      t.trigger.setAttribute('aria-expanded', 'false'); // hide dropdown
    } else {
      var selectedOption = t.dropdown.querySelector('[aria-selected="true"]');
      if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
      option.setAttribute('aria-selected', 'true');
      t.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
      t.trigger.setAttribute('aria-expanded', 'false');
      updateNativeSelect(t, option.getAttribute('data-index'));
      updateTriggerAria(t); // update trigger aria-label
    }
    // move focus back to trigger
    t.trigger.focus();
  }

  function updateNativeSelect(t, index) {
    t.select.selectedIndex = index;
    t.select.dispatchEvent(new CustomEvent('change', { bubbles: true })); // trigger change event
    t.select.dispatchEvent(new CustomEvent('input', { bubbles: true })); // trigger input event
  }

  function updateTriggerAria(t) {
    t.trigger.setAttribute('aria-label', t.options[t.select.selectedIndex].innerHTML + t.labelContent);
  }

  function getSelectedOption(t) {
    var option = t.dropdown.querySelector('[aria-selected="true"]');
    if (option) return option;
    else return t.dropdown.getElementsByClassName('js-select__item')[0];
  }

  function moveFocus(element) {
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
    }
  }

  function initButtonSelect(t) {
    // create the button element -> custom select trigger
    var customClasses = t.element.getAttribute('data-trigger-class')
      ? ' ' + t.element.getAttribute('data-trigger-class')
      : '';

    var label = t.options[t.select.selectedIndex].innerHTML + t.labelContent;

    var button =
      '<button type="button" class="js-select__button select__button' +
      customClasses +
      '" aria-label="' +
      label +
      '" aria-expanded="false" aria-controls="' +
      t.selectId +
      '-dropdown"><span aria-lst-="true" class="js-select__label select__label">' +
      t.selectedOption +
      '</span>';
    if (t.arrowIcon.length > 0 && t.arrowIcon[0].outerHTML) {
      var clone = t.arrowIcon[0].cloneNode(true);
      clone.classList.remove('select__icon');
      button = button + clone.outerHTML;
    }

    return button + '</button>';
  }

  function initListSelect(t) {
    // create custom select dropdown
    var list =
      '<div class="js-select__dropdown select__dropdown" aria-describedby="' +
      t.selectId +
      '-description" id="' +
      t.selectId +
      '-dropdown">';
    list = list + getSelectLabelSR(t);
    if (t.optGroups.length > 0) {
      for (var i = 0; i < t.optGroups.length; i++) {
        var optGroupList = t.optGroups[i].getElementsByTagName('option'),
          optGroupLabel =
            '<li><span class="select__item select__item--optgroup">' +
            t.optGroups[i].getAttribute('label') +
            '</span></li>';
        list =
          list + '<ul class="select__list" role="listbox">' + optGroupLabel + getOptionsList(t, optGroupList) + '</ul>';
      }
    } else {
      list = list + '<ul class="select__list" role="listbox">' + getOptionsList(t, t.options) + '</ul>';
    }
    return list;
  }

  function getSelectLabelSR(t) {
    if (t.label) {
      return (
        '<p class="lst-sr-only lst-px-2 lst-text-xs" id="' +
        t.selectId +
        '-description">' +
        t.label.textContent +
        '</p>'
      );
    } else {
      return '';
    }
  }

  function resetCustomSelect(t) {
    // <select> element has been updated (using an external control) - update custom select
    var selectedOption = t.dropdown.querySelector('[aria-selected="true"]');
    if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
    var option = t.dropdown.querySelector('.js-select__item[data-index="' + t.select.selectedIndex + '"]');
    option.setAttribute('aria-selected', 'true');
    t.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
    t.trigger.setAttribute('aria-expanded', 'false');
    updateTriggerAria(t);
  }

  function getOptionsList(t, options) {
    var list = '';
    for (var i = 0; i < options.length; i++) {
      var selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"';
      list =
        list +
        '<li><button type="button" class="reset js-select__item select__item select__item--option" role="option" data-value="' +
        options[i].value +
        '" ' +
        selected +
        ' data-index="' +
        t.optionIndex +
        '">' +
        options[i].text +
        '</button></li>';
      t.optionIndex = t.optionIndex + 1;
    }
    return list;
  }

  var selectInputs = document.getElementsByClassName('js-select');
  if (selectInputs.length > 0) {
    var selectArray = [];
    for (var i = 0; i < selectInputs.length; i++) {
      (function (i) {
        selectArray.push(new CustomSelect(selectInputs[i]));
      })(i);
    }

    // listen for key events
    window.addEventListener('keyup', function (event) {
      if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) {
        // close custom select on 'Esc'
        selectArray.forEach(function (element) {
          moveFocus(element.trigger); // if focus is within dropdown, move it to dropdown trigger
          toggleCustomSelect(element, 'false'); // close dropdown
        });
      }
    });
    // close custom select when clicking outside it
    window.addEventListener('click', function (event) {
      selectArray.forEach(function (element) {
        var select = event.target.closest('.js-select');
        if (!select || select !== element.element) toggleCustomSelect(element, 'false');
      });
    });
  }

  return CustomSelect;
})();
