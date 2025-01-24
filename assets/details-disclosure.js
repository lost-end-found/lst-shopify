class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.bindHoverEvents();
  }

  bindHoverEvents() {
    const megaMenus = document.querySelectorAll('.mega-menu');
    
    megaMenus.forEach(menu => {
      let timeout;
      const summary = menu.querySelector('summary');
      const content = menu.querySelector('.mega-menu__content');
      
      const show = () => {
        clearTimeout(timeout);
        // Close all other mega menus first
        megaMenus.forEach(otherMenu => {
          if (otherMenu !== menu) {
            const otherContent = otherMenu.querySelector('.mega-menu__content');
            otherContent.style.visibility = 'hidden';
            otherContent.style.opacity = '0';
            otherContent.style.transform = 'translateY(-0.625rem)';
            otherMenu.removeAttribute('open');
          }
        });
        
        menu.setAttribute('open', '');
        content.style.visibility = 'visible';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        this.onToggle();
      };

      const hide = () => {
        timeout = setTimeout(() => {
          content.style.visibility = 'hidden';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-0.625rem)';
          menu.removeAttribute('open');
          this.header.preventHide = false;
        }, 400); // Increased delay to 400ms
      };

      const handleMouseLeave = (event) => {
        const relatedTarget = event.relatedTarget;
        // Check if moving between menu and content
        if (menu.contains(relatedTarget)) {
          clearTimeout(timeout);
          return;
        }
        hide();
      };

      summary.addEventListener('mouseenter', show);
      content.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        show();
      });
      summary.addEventListener('mouseleave', handleMouseLeave);
      content.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
