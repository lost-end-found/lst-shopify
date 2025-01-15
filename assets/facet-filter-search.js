class FacetFilterSearch {
  constructor() {
    this.init();
  }

  init() {
    this.searchInputs = document.querySelectorAll('[data-facet-filter-search]');
    this.bindEvents();
  }

  bindEvents() {
    this.searchInputs.forEach((input) => {
      // Prevent form submission on enter key
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return false;
        }
      });

      // Prevent event propagation to avoid form refresh
      input.addEventListener('keyup', (e) => {
        e.stopPropagation();
      });

      input.addEventListener('input', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleSearch(e);
      });
    });
  }

  handleSearch(event) {
    const searchInput = event.target;
    const searchTerm = searchInput.value.toLowerCase();
    const facetItems = searchInput.closest('.facets-wrap').querySelectorAll('.facets__item');

    facetItems.forEach((item) => {
      const label = item.querySelector('.facet-checkbox__text-label');
      if (!label) return;

      const text = label.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = '';
        item.classList.remove('hidden');
      } else {
        item.style.display = 'none';
        item.classList.add('hidden');
      }
    });
  }
}

// Initialize the filter search when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FacetFilterSearch();
});

// Re-initialize when the section is reloaded by Shopify
document.addEventListener('shopify:section:load', () => {
  new FacetFilterSearch();
});
