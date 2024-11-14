if (!customElements.get('language-switch-form')) {
  customElements.define(
    'language-switch-form',
    class LanguageSwitchForm extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          input: this.querySelector('input[name="locale_code"]'),
          button: this.querySelector('.language-switch-button'),
        };

        if (this.elements.button) {
          this.elements.button.addEventListener('click', this.onButtonClick.bind(this));
        }
      }

      onButtonClick(event) {
        event.preventDefault();
        const form = this.querySelector('form');
        this.elements.input.value = event.currentTarget.dataset.value;
        if (form) form.submit();
      }
    }
  );
}
