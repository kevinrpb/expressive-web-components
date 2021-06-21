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
        left: 0;
        bottom: 0;
        width: 100%;
        height: 40px;

        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
      }

      :host slide-show-controls > * {
        height: 100%;
      }

      :host slide-show-controls > slide-selectors {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;

        align-items: center;
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
    this.activeIndex = mod(this.activeIndex + 1, this.images.length);
    this._startInterval();
  }

  _previousIndex(event) {
    this.activeIndex = mod(this.activeIndex - 1, this.images.length);
    this._startInterval();
  }

  _setIndex(event) {
    const index = event.target.getAttribute('index');

    this.activeIndex = index;
    this._startInterval();
  }

  _startInterval() {
    clearInterval(this._interval);

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
        <button id="previous-slide" @click=${this._previousIndex}>Prev</button>
        <slide-selectors>
          ${images.map(image => {
            const index = image.getAttribute('index') ?? 0;
            return html`
              <button @click=${this._setIndex} index="${index}">${index}</button>
            `
          })}
        </slide-selectors>
        <button id="next-slide" @click=${this._nextIndex}>Next</button>
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
