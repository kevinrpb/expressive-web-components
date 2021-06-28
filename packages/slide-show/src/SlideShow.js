import { html, css, LitElement } from 'lit-element';

function mod(n, m) {
  return ((n % m) + m) % m;
}

export class SlideShow extends LitElement {
  static get styles() {
    return css`
      :host {
        position: relative;
      }

      :host figure {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        margin: 0;
      }

      :host figure {
        opacity: 0;
        transition: opacity 1s linear;
      }

      :host figure.active {
        opacity: 1;
      }

      :host figure img {
        height: 100%;
        width: 100%;

        object-fit: cover;

        border-radius: var(--slide-show-img-border-radius);
      }

      :host figure figcaption {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        text-align: center;
        /* background-color: rgba(0, 0, 0, 0.4); */
        color: white;
      }

      :host slide-show-controls {
        position: absolute;
        left: 0.5em;
        bottom: 0.5em;
        top: 0.5em;
        width: calc(100% - 1em);
      }

      :host slide-show-controls > slide-selectors {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        /* height: 100%; */

        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
      }

      :host slide-show-controls button {
        border: none;
        cursor: pointer;
        padding: 0;
      }

      :host slide-show-controls > button {
        position: absolute;
        border-radius: 50%;
        height: 3em;
        width: 3em;
        bottom: 50%;
        transform: translateY(50%);
        background-color: var(--slide-show-nav-button-bg);
      }

      :host slide-show-controls > button#previous-slide {
        left: 0;
      }

      :host slide-show-controls > button#next-slide {
        right: 0;
      }

      :host slide-show-controls > slide-selectors > button {
        background-color: var(--slide-show-select-button-bg);
      }

      :host slide-show-controls > slide-selectors > button:nth-child(n+2) {
        margin-left: 0.5em;
      }

      :host slide-show-controls > slide-selectors > button.active {
        background-color: var(--slide-show-active-button-bg);
      }

      :host .icon-previous,
      :host .icon-next {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
      }

      :host .icon-previous::before,
      :host .icon-next::before {
        content: "";

        position: absolute;
        left: 20%;
        top: 20%;
        right: 20%;
        bottom: 20%;

        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }

      :host .icon-previous::before {
        background-image: var(--slide-show-previous-icon);
      }

      :host .icon-next::before {
        background-image: var(--slide-show-next-icon);
      }

      :host .icon-selector {
        display: block;
        width: 1.5em;
        height: 0.3em;
      }

      :host .hidden-text {
        display: none;
      }

      :host .hidden-text:before {
        display: none;
      }
    `;
  }

  static get properties() {
    return {
      activeIndex: {
        type: Number,
        attribute: 'active',
        reflect: true
      },
      intervalTime: {
        type: Number,
        attribute: 'interval',
        reflect: true
      },
      images: {
        type: Array
      }
    };
  }

  constructor() {
    super();

    this.activeIndex = -1;
    this.intervalTime = -1;
    this.images = [];

    this._interval = null;
  }

  // MARK: Helper methods

  _gatherImages() {
    // Gather images from DOM
    let childImages = this.querySelectorAll('img');

    // Sort them according to 'index' attribute
    this.images = Array.from(childImages).sort((a, b) => {
      const ia = a.getAttribute('index') ?? 0;
      const ib = b.getAttribute('index') ?? 0;

      return ia - ib;
    });
  }

  _setImageState() {
    this.images.forEach((image, index) => {
      image.classList.remove('active');
    });

    this.images[this.activeIndex].classList.add('active');
  }

  _nextIndex(event) {
    this.activeIndex = mod(parseInt(this.activeIndex) + 1, this.images.length);
    this._startInterval();
  }

  _previousIndex(event) {
    this.activeIndex = mod(parseInt(this.activeIndex) + 1, this.images.length);
    this._startInterval();
  }

  _setIndex(event) {
    this.activeIndex = parseInt(event.currentTarget.getAttribute('index'));;
    this._startInterval();
  }

  _startInterval() {
    clearInterval(this._interval);
    if (this.intervalTime <= 0) { return }

    this._interval = setInterval(() => {
      this._nextIndex();
    }, this.intervalTime);
  }

  // MARK: Lifecycle methods

  connectedCallback() {
    super.connectedCallback();

    // Get images
    this._gatherImages();

    // If we have images, set initial index
    if (this.images.length > 0) {
      this.activeIndex = 0;
    }

    // Set initial image state
    this._setImageState();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._interval);
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // Start slideshow
    this._startInterval();
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has('height')) {
      this._adjustHeight();
    }

    if (changedProperties.has('activeIndex')) {
      this._setImageState();
    }
  }

  // MARK: Render methods

  _imagesTemplate(images) {
    return images.map(image => {
      let caption = html``;

      if (image.hasAttribute('show-caption')) {
        const captionText = image.getAttribute('caption') ?? image.getAttribute('alt') ?? '';
        caption = html`<figcaption>${captionText}</figcaption>`;
      }

      return html`
        <figure class="${image.classList}">
          ${image}
          ${caption}
        </figure>
    `});
  }

  _controlsTemplate(images) {
    return html`
      <slide-show-controls>
        <button id="previous-slide" @click=${this._previousIndex}>
          <span class="icon-previous" aria-hidden="true"></span>
          <span class="hidden-text">Previous Slide</span>
        </button>
        <slide-selectors>
          ${images.map(image => {
            const index = image.getAttribute('index') ?? 0;
            const active = index == this.activeIndex ? 'active' : '';
            return html`
              <button index="${index}" class="${active}" @click=${this._setIndex}>
                <span class="icon-selector" aria-hidden="true"></span>
                <span class="hidden-text">Show slide ${index+1}</span>
              </button>
            `
          })}
        </slide-selectors>
        <button id="next-slide" @click=${this._nextIndex}>
          <span class="icon-next" aria-hidden="true"></span>
          <span class="hidden-text">Next Slide</span>
        </button>
      </slide-show-controls>
    `;
  }

  render() {
    return html`
      ${this._imagesTemplate(this.images)}
      ${this._controlsTemplate(this.images)}
    `;
  }
}
