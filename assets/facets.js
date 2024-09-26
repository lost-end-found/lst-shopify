// Combined facets.js and component-custom-select-vite.js
const CustomSelect = (function () {
  function CustomSelect(element) {
    this.element = element;
    this.select = this.element.getElementsByTagName('select')[0];
    if (!this.select) {
      console.error('No select element found within', element);
      return;
    }
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.selectId = this.select.getAttribute('id');
    this.trigger = null;
    this.dropdown = null;
    this.customOptions = null;
    this.arrowIcon = this.element.getElementsByTagName('svg');
    this.label = document.querySelector('[for="' + this.selectId + '"]');
    this.labelContent = this.label ? ', ' + this.label.textContent : '';
    this.optionIndex = 0;

    this.initCustomSelect();
    this.initCustomSelectEvents();
  }

  CustomSelect.prototype.initCustomSelect = function () {
    this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect());
    this.dropdown = this.element.querySelector('.js-select__dropdown');
    this.trigger = this.element.querySelector('.js-select__button');
    this.customOptions = this.dropdown ? this.dropdown.querySelectorAll('.js-select__item') : [];
    this.selectedOption = this.getSelectedOption();
    this.select.classList.add('lst-hidden');
    if (this.arrowIcon.length > 0) this.arrowIcon[0].style.display = 'none';
    if (this.dropdown) {
      this.placeDropdown();
    }
  };

  CustomSelect.prototype.initCustomSelectEvents = function () {
    if (this.trigger) {
      this.trigger.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggleCustomSelect();
      });
    }
    if (this.label) {
      this.label.addEventListener('click', () => this.moveFocus(this.trigger));
    }
    if (this.dropdown) {
      this.dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
          this.keyboardCustomSelect('prev', event);
        } else if (event.key === 'ArrowDown') {
          this.keyboardCustomSelect('next', event);
        }
      });
    }
    this.initSelection();
    document.addEventListener('click', (event) => {
      if (!this.element.contains(event.target)) {
        this.toggleCustomSelect(false);
      }
    });
  };

  CustomSelect.prototype.toggleCustomSelect = function (bool) {
    var ariaExpanded =
      bool !== undefined ? bool : this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
    this.trigger.setAttribute('aria-expanded', ariaExpanded);
    if (this.dropdown) {
      this.dropdown.style.display = ariaExpanded === 'true' ? 'block' : 'none';
      if (ariaExpanded === 'true') {
        this.placeDropdown();
      }
    }
    if (ariaExpanded === 'true') {
      var selectedOption = this.getSelectedOption();
      this.moveFocus(selectedOption);
    }
  };

  CustomSelect.prototype.placeDropdown = function () {
    if (!this.dropdown) return;

    // Remove placement classes to reset position
    this.dropdown.classList.remove('select__dropdown--right', 'select__dropdown--up');

    var triggerBoundingRect = this.trigger.getBoundingClientRect();

    // Check if there's enough space to the right
    var dropdownWidth = this.dropdown.offsetWidth;
    var shouldMoveRight = document.documentElement.clientWidth - 5 < triggerBoundingRect.left + dropdownWidth;
    this.dropdown.classList.toggle('select__dropdown--right', shouldMoveRight);

    // Check if there's enough space up or down
    var dropdownHeight = this.dropdown.offsetHeight;
    var moveUp = window.innerHeight - triggerBoundingRect.bottom - 5 < triggerBoundingRect.top;
    this.dropdown.classList.toggle('select__dropdown--up', moveUp);

    // Set max-height based on available space
    var maxHeight = moveUp ? triggerBoundingRect.top - 20 : window.innerHeight - triggerBoundingRect.bottom - 20;

    // Check if we need to set a min-width
    if (this.minWidth < triggerBoundingRect.width) {
      this.dropdown.setAttribute(
        'style',
        'max-height: ' + maxHeight + 'px; min-width: ' + triggerBoundingRect.width + 'px;'
      );
    } else {
      this.dropdown.setAttribute('style', 'max-height: ' + maxHeight + 'px;');
    }
  };

  CustomSelect.prototype.keyboardCustomSelect = function (direction, event) {
    event.preventDefault();
    const options = Array.from(this.customOptions);
    const focusedOption = this.dropdown.querySelector('.js-select__item:focus');
    let index = focusedOption ? options.indexOf(focusedOption) : -1;

    if (direction === 'next') {
      index = (index + 1) % options.length;
    } else {
      index = (index - 1 + options.length) % options.length;
    }

    options[index].focus();
  };

  CustomSelect.prototype.initSelection = function () {
    if (this.dropdown) {
      this.dropdown.addEventListener('click', (event) => {
        var option = event.target.closest('.js-select__item');
        if (option) this.selectOption(option);
      });
    }
  };

  CustomSelect.prototype.selectOption = function (option) {
    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') === 'true') {
      this.toggleCustomSelect(false);
    } else {
      var selectedOption = this.dropdown.querySelector('[aria-selected="true"]');
      if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
      option.setAttribute('aria-selected', 'true');
      this.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
      this.toggleCustomSelect(false);
      this.updateNativeSelect(option.getAttribute('data-index'));
      this.updateTriggerAria();
    }
    this.trigger.focus();
  };

  CustomSelect.prototype.updateNativeSelect = function (index) {
    this.select.selectedIndex = index;
    this.select.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    this.select.dispatchEvent(new CustomEvent('input', { bubbles: true }));
  };

  CustomSelect.prototype.updateTriggerAria = function () {
    this.trigger.setAttribute('aria-label', this.options[this.select.selectedIndex].innerHTML + this.labelContent);
  };

  CustomSelect.prototype.getSelectedOption = function () {
    if (!this.dropdown) return null;
    var option = this.dropdown.querySelector('[aria-selected="true"]');
    return option ? option : this.dropdown.querySelector('.js-select__item');
  };

  CustomSelect.prototype.moveFocus = function (element) {
    if (!element) return;
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
    }
  };

  CustomSelect.prototype.initButtonSelect = function () {
    var customClasses = this.element.getAttribute('data-trigger-class')
      ? ' ' + this.element.getAttribute('data-trigger-class')
      : '';
    var selectedOption = this.options[this.select.selectedIndex];
    var label = selectedOption ? selectedOption.innerHTML + this.labelContent : '';
    var button =
      '<button type="button" class="js-select__button select__button' +
      customClasses +
      '" aria-label="' +
      label +
      '" aria-expanded="false" aria-controls="' +
      this.selectId +
      '-dropdown"><span aria-lst-="true" class="js-select__label select__label">' +
      (selectedOption ? selectedOption.innerHTML : '') +
      '</span>';
    if (this.arrowIcon.length > 0 && this.arrowIcon[0].outerHTML) {
      var clone = this.arrowIcon[0].cloneNode(true);
      clone.classList.remove('select__icon');
      button += clone.outerHTML;
    }
    return button + '</button>';
  };

  CustomSelect.prototype.initListSelect = function () {
    var list =
      '<div class="js-select__dropdown select__dropdown" aria-describedby="' +
      this.selectId +
      '-description" id="' +
      this.selectId +
      '-dropdown">';
    list += this.getSelectLabelSR();
    if (this.optGroups.length > 0) {
      for (var i = 0; i < this.optGroups.length; i++) {
        var optGroupList = this.optGroups[i].getElementsByTagName('option'),
          optGroupLabel =
            '<li><span class="select__item select__item--optgroup">' +
            this.optGroups[i].getAttribute('label') +
            '</span></li>';
        list +=
          '<ul class="select__list" role="listbox">' + optGroupLabel + this.getOptionsList(optGroupList) + '</ul>';
      }
    } else {
      list += '<ul class="select__list" role="listbox">' + this.getOptionsList(this.options) + '</ul>';
    }
    return list + '</div>';
  };

  CustomSelect.prototype.getSelectLabelSR = function () {
    return this.label
      ? '<p class="sr-only lst-px-3 lg:lst-px-4 lst-text-xs" id="' +
          this.selectId +
          '-description">' +
          this.label.textContent +
          '</p>'
      : '';
  };

  CustomSelect.prototype.resetCustomSelect = function () {
    var selectedOption = this.dropdown.querySelector('[aria-selected="true"]');
    if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
    var option = this.dropdown.querySelector('.js-select__item[data-index="' + this.select.selectedIndex + '"]');
    option.setAttribute('aria-selected', 'true');
    this.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.updateTriggerAria();
  };

  CustomSelect.prototype.getOptionsList = function (options) {
    var list = '';
    for (var i = 0; i < options.length; i++) {
      var selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"';
      list +=
        '<li><button type="button" class="reset js-select__item select__item select__item--option" role="option" data-value="' +
        options[i].value +
        '" ' +
        selected +
        ' data-index="' +
        this.optionIndex +
        '">' +
        options[i].text +
        '</button></li>';
      this.optionIndex++;
    }
    return list;
  };

  return CustomSelect;
})();

// FacetFiltersForm functionality
class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);
    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        FacetFiltersForm.renderAdditionalElements(html);
        FacetFiltersForm.initializeCustomSelects();
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    FacetFiltersForm.renderAdditionalElements(html);
    FacetFiltersForm.initializeCustomSelects();
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = '(' + count + ')';
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = '(' + count + ')';
      containerDesktop.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = parsedHTML.querySelector(selector);
      const targetElement = document.querySelector(selector);

      if (activeFacetsElement && targetElement) {
        targetElement.innerHTML = activeFacetsElement.innerHTML;
      } else if (!targetElement) {
        console.warn(`Element with selector "${selector}" not found in the document.`);
      }
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      const sourceElement = parsedHTML.querySelector(selector);
      const targetElement = document.querySelector(selector);
      if (sourceElement && targetElement) {
        targetElement.innerHTML = sourceElement.innerHTML;
      }
    });

    const mobileForm = document.getElementById('FacetFiltersFormMobile');
    if (mobileForm) {
      const menuDrawer = mobileForm.closest('menu-drawer');
      if (menuDrawer && typeof menuDrawer.bindEvents === 'function') {
        menuDrawer.bindEvents();
      }
    }
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  static initializeCustomSelects() {
    const selectElements = document.getElementsByClassName('js-select');
    if (selectElements.length > 0) {
      Array.from(selectElements).forEach((element) => {
        new CustomSelect(element);
      });
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

// Helper function
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Initialize custom selects on page load
document.addEventListener('DOMContentLoaded', function () {
  FacetFiltersForm.initializeCustomSelects();
});
