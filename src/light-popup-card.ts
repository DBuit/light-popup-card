import { LitElement, html, css } from 'lit-element';
import tinycolor, { TinyColor } from '@ctrl/tinycolor';
import { closePopUp } from 'card-tools/src/popup';
import { provideHass } from 'card-tools/src/hass';
import { createCard } from 'card-tools/src/lovelace-element.js';
import { computeStateDisplay } from 'custom-card-helpers';

class LightPopupCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  actionRows: any = [];
  settings = false;
  settingsCustomCard = false;
  settingsPosition = 'bottom';

  brightness: number = 0; // 0-255
  get brightnessPerc(): number { return Math.round(this.brightness / 2.55); }
  position: number = 0; // 0-100

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {},
    };
  }

  render() {
    const entity = this.config.entity;
    const stateObj = this.hass.states[entity];
    const actionsInARow = this.config.actionsInARow ? this.config.actionsInARow : 4;
    const supportBrightness = stateObj.attributes.supported_features;
    const supportPosition = typeof stateObj.attributes.current_position === 'number';

    const icon = this.config.icon ? this.config.icon : stateObj.attributes.icon ? stateObj.attributes.icon : supportPosition ? 'mdi:window-shutter' : supportBrightness ? 'mdi:lightbulb' : 'mdi:light-switch';
    const borderRadius = this.config.borderRadius ? this.config.borderRadius : '12px';

    this.brightness = Math.round(stateObj.attributes.brightness);
    this.position = Math.round(stateObj.attributes.current_position);

    const onStates = this.config.onStates ? this.config.onStates : ['on'];
    const offStates = this.config.offStates ? this.config.offStates : ['off'];
    //Scenes
    const actionSize = 'actionSize' in this.config ? this.config.actionSize : '50px';
    const actions = this.config.actions;

    if (actions && actions.length > 0) {
      const numberOfRows = Math.ceil(actions.length / actionsInARow);

      for (let i = 0; i < numberOfRows; i++) {
        this.actionRows[i] = [];
          for (let j = 0; j < actionsInARow; j++) {
            if (actions[(i * actionsInARow) + j]) {
              this.actionRows[i][j] = actions[(i * actionsInARow) + j];
            }
          }
      }
    }

    const switchIsOn = onStates.includes(stateObj.state);
    const switchValue = switchIsOn ? 1 : 0;
    const switchIsOff = offStates.includes(stateObj.state);

    const fullscreen = 'fullscreen' in this.config ? this.config.fullscreen : true;
    const brightnessWidth = this.config.brightnessWidth || '150px';
    const brightnessHeight = this.config.brightnessHeight || '400px';
    const switchWidth = this.config.switchWidth || '150px';
    const switchHeight = this.config.switchHeight || '380px';

    const color = this._getColorForLightEntity(stateObj, this.config.useTemperature, this.config.useBrightness);
    const sliderColor = this.config.sliderColor || '#FFF';
    const sliderColoredByLight = 'sliderColoredByLight' in this.config ? this.config.sliderColoredByLight : false;
    const sliderThumbColor = this.config.sliderThumbColor || '#ddd';
    const sliderThumbBorderColor = this.config.sliderThumbBorderColor || sliderColor;
    const sliderTrackColor = this.config.sliderTrackColor || '#ddd';
    const sliderTrackStripeColor = this.config.sliderTrackStripeColor || sliderTrackColor;
    const switchColor = this.config.switchColor || '#FFF';
    const switchTrackColor = this.config.switchTrackColor || '#ddd';
    const displayType =  this.config.displayType || 'auto';

    let actionRowCount = 0;

    this.settings = 'settings' in this.config ? this.config.settings : false;
    this.settingsCustomCard = 'settingsCard' in this.config;
    this.settingsPosition = this.config.settingsPosition || 'bottom';

    if (this.settingsCustomCard && this.config.settingsCard.cardOptions) {
      if (this.config.settingsCard.cardOptions.entity === 'this') {
        this.config.settingsCard.cardOptions.entity = entity;
      } else if (this.config.settingsCard.cardOptions.entity_id == 'this') {
        this.config.settingsCard.cardOptions.entity_id = entity;
      } else if (this.config.settingsCard.cardOptions.entities) {
        for (let key in this.config.settingsCard.cardOptions.entities) {
          if (this.config.settingsCard.cardOptions.entities[key] == 'this') {
            this.config.settingsCard.cardOptions.entities[key] = entity;
          }
        }
      }
    }

    return html`
      <div class="${fullscreen ? 'popup-wrapper':''}">
            <div id="popup" class="popup-inner" @click="${e => this._close(e)}">
                <div class="icon${fullscreen ? ' fullscreen' : ''}${supportPosition && !switchIsOff ? ' on' : ''}">
                    <ha-icon style="${switchIsOn ? `color: ${color};` : ''}" icon="${icon}" />
                </div>
              
                ${(supportPosition && displayType === 'auto') || displayType === 'cover' ? html`
                    <h4 id="positionValue" class="${switchIsOff ? '' : 'position'}">${switchIsOff ? computeStateDisplay(this.hass.localize, stateObj, this.hass.language) : this._previewPositionText(this.position)}</h4>
                    <div class="range-holder" style="--slider-height: ${brightnessHeight};--slider-width: ${brightnessWidth};">
                        <input type="range" style="--slider-width: ${brightnessWidth};--slider-height: ${brightnessHeight}; --slider-border-radius: ${borderRadius}; --slider-color: ${sliderColor}; --slider-thumb-color:${sliderThumbColor}; --slider-thumb-border-color:${sliderThumbBorderColor}; --slider-track-color:${sliderTrackColor}; --slider-track-stripe-color:${sliderTrackStripeColor};" .value="${switchIsOff ? 0 : this.position}" @input=${e => this._previewPosition(e.target.value)} @change=${e => this._setPosition(stateObj, e.target.value)}>
                    </div>
                ` : (supportBrightness && displayType == 'auto') || displayType == 'slider' ? html`
                    <h4 id="brightnessValue">${offStates.includes(stateObj.state) ? this.hass.localize(`component.light.state._.off`) : this.brightnessPerc + '%'}</h4>
                    <div class="range-holder" style="--slider-height: ${brightnessHeight};--slider-width: ${brightnessWidth};">
                        <input type="range" style="--slider-width: ${brightnessWidth};--slider-height: ${brightnessHeight}; --slider-border-radius: ${borderRadius};${sliderColoredByLight ? '--slider-color:'+color+';':'--slider-color:'+sliderColor+';'} --slider-thumb-border-color:${sliderThumbBorderColor}; --slider-thumb-color:${sliderThumbColor}; --slider-track-color:${sliderTrackColor}; --slider-track-stripe-color:${sliderTrackStripeColor};" .value="${this.brightnessPerc}" @input=${e => this._previewBrightness(e.target.value)} @change=${e => this._setBrightness(stateObj, e.target.value)}>
                    </div>
                ` : html`
                    <h4 id="switchValue">${computeStateDisplay(this.hass.localize, stateObj, this.hass.language)}</h4>
                    <div class="switch-holder" style="--switch-height: ${switchHeight};--switch-width: ${switchWidth};">
                        <input type="range" style="--switch-width: ${switchWidth};--switch-height: ${switchHeight}; --slider-border-radius: ${borderRadius}; --switch-color: ${switchColor}; --switch-track-color: ${switchTrackColor};" value="0" min="0" max="1" .value="${switchValue}" @change=${() => this._switch(stateObj)}>
                    </div>
                `}

                ${actions && actions.length > 0 ? html`
                <div class="action-holder">

                    ${this.actionRows.map((actionRow) => {
                      actionRowCount++;
                      let actionCount = 0;
                      
                      return html`
                        <div class="action-row">
                        ${actionRow.map((action) => {
                          actionCount++;
                          return html`
                            <div class="action" style="--size:${actionSize};" @click="${e => this._activateAction(e)}" data-service="${actionRowCount}#${actionCount}">
                                <span class="color" style="background-color: ${action.color};border-color: ${action.color};--size:${actionSize};">${action.icon ? html`<ha-icon icon="${action.icon}" />`:html``}</span>
                                ${action.name ? html`<span class="name">${action.name}</span>`: html``}
                            </div>
                          `
                        })}
                        </div>
                      `
                    })}
                </div>` : html ``}
                ${this.settings ? html`<button class="settings-btn ${this.settingsPosition}${fullscreen ? ' fullscreen':''}" @click="${() => this._openSettings()}">${this.config.settings.openButton ? this.config.settings.openButton:'Settings'}</button>`:html``}
            </div>
            
            ${this.settings ? html`
              <div id="settings" class="settings-inner" @click="${e => this._close(e)}">
                ${this.settingsCustomCard ? html`
                  <div class="custom-card" data-card="${this.config.settingsCard.type}" data-options="${JSON.stringify(this.config.settingsCard.cardOptions)}" data-style="${this.config.settingsCard.cardStyle ? this.config.settingsCard.cardStyle : ''}">
                  </div>
                `:html`
                    <p style="color:#F00;">Set settingsCustomCard to render a lovelace card here!</p>
                `}
                <button class="settings-btn ${this.settingsPosition}${fullscreen ? ' fullscreen':''}" @click="${() => this._closeSettings()}">${this.config.settings.closeButton ? this.config.settings.closeButton:'Close'}</button>
              </div>
            `:html``}
        </div>
    `;
  }

  updated() { }

  firstUpdated() {
    if(this.settings && !this.settingsCustomCard) {
    const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
    mic.removeChild(mic.querySelector('app-toolbar'));
    } else if(this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll('.custom-card').forEach(customCard => {
        const card = Object.assign({}, {
          type: customCard.dataset.card
        }, JSON.parse(customCard.dataset.options));
        const cardElement = createCard(card);
        customCard.appendChild(cardElement);
        provideHass(cardElement);

        let style = '';
        if (customCard.dataset.style) {
          style = customCard.dataset.style;
        }
        if (style !== '') {
          let iterations = 0;
          let interval = setInterval(function() {
              if (cardElement && cardElement.shadowRoot) {
                  window.clearInterval(interval);
                  const styleElement = document.createElement('style');
                  styleElement.innerHTML = style;
                  cardElement.shadowRoot.appendChild(styleElement);
              } else if (++iterations === 10) {
                  window.clearInterval(interval);
              }
          }, 100);
        }
      });
    }
  }

  _close(event) {
    if (event && (event.target.className.includes('popup-inner') || event.target.className.includes('settings-inner'))) {
        closePopUp();
    }
  }

  _openSettings() {
    this.shadowRoot.getElementById('popup').classList.add('off');
    this.shadowRoot.getElementById('settings').classList.add('on');
  }
  _closeSettings() {
    this.shadowRoot.getElementById('settings').classList.remove('on');
    this.shadowRoot.getElementById('popup').classList.remove('off');
  }

  _createRange(amount) {
    const items: any = [];
    for (let i = 0; i < amount; i++) {
      items.push(i);
    }
    return items;
  }

  _previewBrightness(value) {
    const el = this.shadowRoot.getElementById('brightnessValue');
    if (el) {
      el.innerText = (value == 0) ? 'Off' : value + '%';
    }
  }

  _previewPositionText(position) {
    switch (parseInt(position, 10)) {
      case 0:
        return 'Closed';

      case 100:
        return 'Open';

      default:
        return `Open (${position}%)`;
    }
  }

  _previewPosition(value) {
    const el = this.shadowRoot.getElementById('positionValue');
    if (el) {
      el.innerText = this._previewPositionText(value);
    }
  }

  _setBrightness(state, value) {
    this.hass.callService('homeassistant', 'turn_on', {
        entity_id: state.entity_id,
        brightness: value * 2.55
    });
  }

  _setPosition(state, value) {
    const [domain, service] = this.config.sliderService.split('.', 2);
    if (service == 'set_cover_position') {
      this.hass.callService(domain, service, {
        entity_id: state.entity_id,
        position: value,
      });
    } else {
      this.hass.callService(domain, service, {
        entity_id: state.entity_id,
        tilt_position: value,
      });
    }
  }

  _switch(state) {
      this.hass.callService('homeassistant', 'toggle', {
        entity_id: state.entity_id
      });
  }

  _activateAction(e) {
    if (e.target.dataset && e.target.dataset.service) {
      const [row, item] = e.target.dataset.service.split('#', 2);
      const action = this.actionRows[row - 1][item - 1];
      const [domain, service] = action.service.split('.', 2);
      this.hass.callService(domain, service, action.service_data);
    }
  }

  _getColorForLightEntity(stateObj, useTemperature, useBrightness) {
    let color = this.config.default_color;

    if (stateObj) {
      if (stateObj.attributes.rgb_color) {
        color = `rgb(${stateObj.attributes.rgb_color.join(',')})`;

        if (stateObj.attributes.brightness) {
          color = this._applyBrightnessToColor(color, (stateObj.attributes.brightness + 245) / 5);
        }
      } else if (useTemperature && stateObj.attributes.color_temp && stateObj.attributes.min_mireds && stateObj.attributes.max_mireds) {
        color = this._getLightColorBasedOnTemperature(stateObj.attributes.color_temp, stateObj.attributes.min_mireds, stateObj.attributes.max_mireds);

        if (stateObj.attributes.brightness) {
          color = this._applyBrightnessToColor(color, (stateObj.attributes.brightness + 245) / 5);
        }
      } else if (useBrightness && stateObj.attributes.brightness) {
        color = this._applyBrightnessToColor(this._getDefaultColorForState(), (stateObj.attributes.brightness + 245) / 5);
      } else {
        color = this._getDefaultColorForState();
      }
    }
    return color;
  }

  _applyBrightnessToColor(color, brightness) {
      const colorObj = new TinyColor(this._getColorFromVariable(color));
      if (colorObj.isValid) {
        const validColor = colorObj.mix('black', 100 - brightness).toString();
        if (validColor) return validColor;
      }
      return color;
  }

  _getLightColorBasedOnTemperature(current, min, max) {
      const high = new TinyColor('rgb(255, 160, 0)'); // orange-ish
      const low = new TinyColor('rgb(166, 209, 255)'); // blue-ish
      const middle = new TinyColor('white');
      const mixAmount = (current - min) / (max - min) * 100;

      if (mixAmount < 50) {
        return tinycolor(low).mix(middle, mixAmount * 2).toRgbString();
      } else {
        return tinycolor(middle).mix(high, (mixAmount - 50) * 2).toRgbString();
      }
  }

  _getDefaultColorForState() {
    return this.config.color_on || '#f7d959';
  }

  _getColorFromVariable(color: string): string {
    if (typeof color !== 'undefined' && color.substring(0, 3) === 'var') {
      return window.getComputedStyle(document.documentElement).getPropertyValue(color.substring(4).slice(0, -1)).trim();
    }
    return color;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    if (config.displayType === 'cover' && !config.sliderService) {
      throw new Error('You need to define a sliderService');
    }
    if (config.displayType === 'cover' && config.sliderService !== 'cover.set_cover_position' && config.sliderService !== 'cover.set_cover_tilt_position') {
      throw new Error('"sliderService" should be equal to "cover.set_cover_position" or "cover.set_cover_tilt_position"');
    }

    this.config = config;
  }

  getCardSize() {
    return this.config.entities.length + 1;
  }

  static get styles() {
    return css`
        :host {
            background-color: #000 !important;
        }
      
        .popup-wrapper {
            margin-top: 64px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
      
        .popup-inner {
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .popup-inner.off {
          display: none;
        }
      
        #settings {
          display: none;
        }
      
        .settings-inner {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        #settings.on {
          display: flex;
        }
        .settings-btn {
          position: absolute;
          right: 30px;
          background-color: #7f8082;
          color: #FFF;
          border: 0;
          padding: 5px 20px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
        }
        .settings-btn.bottom {
          bottom: 15px;
        }
        .settings-btn.bottom.fullscreen {
          margin: 0;
        }
        .settings-btn.top {
          top: 25px;
        }
      
        .fullscreen {
          margin-top: -64px;
        }
      
        .icon {
            text-align: center;
            display: block;
            height: 40px;
            width: 40px;
            color: rgba(255, 255, 255, .3);
            font-size: 30px;
            --mdc-icon-size: 30px;
            padding-top: 5px;
        }
        .icon ha-icon {
            width: 30px;
            height: 30px;
        }
        .icon.on ha-icon {
            color: #f7d959;
        }
      
        h4 {
            color: #FFF;
            display: block;
            font-weight: 300;
            margin-bottom: 30px;
            text-align: center;
            font-size: 20px;
            margin-top: 0;
            text-transform: capitalize;
        }
        
        .range-holder {
            height: var(--slider-height);
            width: var(--slider-width);
            position: relative;
            display: block;
        }
        .range-holder input[type="range"] {
            outline: 0;
            border: 0;
            border-radius: var(--slider-border-radius, 12px);
            width: var(--slider-height);
            margin: 0;
            transition: box-shadow 0.2s ease-in-out;
            -webkit-transform: rotate(270deg);
            -moz-transform: rotate(270deg);
            -o-transform: rotate(270deg);
            -ms-transform: rotate(270deg);
            transform: rotate(270deg);
            overflow: hidden;
            height: var(--slider-width);
            -webkit-appearance: none;
            background-color: var(--slider-track-color);
            position: absolute;
            top: calc(50% - (var(--slider-width) / 2));
            right: calc(50% - (var(--slider-height) / 2));
        }
        .range-holder input[type="range"]::-webkit-slider-runnable-track {
            height: var(--slider-width);
            -webkit-appearance: none;
            /* background-image: linear-gradient(90deg, var(--slider-track-stripe-color) 10%, var(--slider-track-color) 10%, var(--slider-track-color) 50%, var(--slider-track-stripe-color) 50%, var(--slider-track-stripe-color) 60%, var(--slider-track-color) 60%, var(--slider-track-color) 100%); */
            background-color: var(--slider-track-color);
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .range-holder input[type="range"]::-webkit-slider-thumb {
            width: 25px;
            border-right: 10px solid var(--slider-thumb-border-color);
            border-left: 10px solid var(--slider-thumb-border-color);
            border-top: 20px solid var(--slider-thumb-border-color);
            border-bottom: 20px solid var(--slider-thumb-border-color);
            -webkit-appearance: none;
            height: 80px;
            cursor: ew-resize;
            background: var(--slider-color);
            box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
            border-radius: 0;
            transition: box-shadow 0.2s ease-in-out;
            position: relative;
            top: calc((var(--slider-width) - 80px) / 2);
        }
        .range-holder input[type="range"]::-moz-thumb-track {
            height: var(--slider-width);
            /* background-image: linear-gradient(90deg, var(--slider-track-stripe-color) 10%, var(--slider-track-color) 10%, var(--slider-track-color) 50%, var(--slider-track-stripe-color) 50%, var(--slider-track-stripe-color) 60%, var(--slider-track-color) 60%, var(--slider-track-color) 100%); */
            background-color: var(--slider-track-color);
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .range-holder input[type="range"]::-moz-range-thumb {
            width: 5px;
            border-right: 12px solid var(--slider-thumb-border-color);
            border-left: 12px solid var(--slider-thumb-border-color);
            border-top: 20px solid var(--slider-thumb-border-color);
            border-bottom: 20pxsolid var(--slider-thumb-border-color);
            height: calc(var(--slider-width) * .4);
            cursor: ew-resize;
            background: var(--slider-color);
            box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
            border-radius: 0;
            transition: box-shadow 0.2s ease-in-out;
            position: relative;
            top: calc((var(--slider-width) - 80px) / 2);
        }
      
        .switch-holder {
            height: var(--switch-height);
            width: var(--switch-width);
            position: relative;
            display: block;
        }
        .switch-holder input[type="range"] {
            outline: 0;
            border: 0;
            border-radius: var(--slider-border-radius, 12px);
            width: calc(var(--switch-height) - 20px);
            margin: 0;
            transition: box-shadow 0.2s ease-in-out;
            -webkit-transform: rotate(270deg);
            -moz-transform: rotate(270deg);
            -o-transform: rotate(270deg);
            -ms-transform: rotate(270deg);
            transform: rotate(270deg);
            overflow: hidden;
            height: calc(var(--switch-width) - 20px);
            -webkit-appearance: none;
            background-color: var(--switch-track-color);
            padding: 10px;
            position: absolute;
            top: calc(50% - (var(--switch-width) / 2));
            right: calc(50% - (var(--switch-height) / 2));
        }
        .switch-holder input[type="range"]::-webkit-slider-runnable-track {
            height: calc(var(--switch-width) - 20px);
            -webkit-appearance: none;
            color: var(--switch-track-color);
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .switch-holder input[type="range"]::-webkit-slider-thumb {
            width: calc(var(--switch-height) / 2);
            -webkit-appearance: none;
            height: calc(var(--switch-width) - 20px);
            cursor: ew-resize;
            background: var(--switch-color);
            transition: box-shadow 0.2s ease-in-out;
            border: none;
            box-shadow: -1px 1px 20px 0 rgba(0, 0, 0, .75);
            position: relative;
            top: 0;
            border-radius: var(--slider-border-radius, 12px);
        }
        
        .action-holder {
            display: flex;
            flex-direction: column;
            margin-top: 20px;
        }
        .action-row {
            display: block;
            padding-bottom: 10px;
        }
        .action-row:last-child {
            padding: 0;
        }
        .action-holder .action {
            display: inline-block;
            margin-right: 4px;
            margin-left: 4px;
            cursor: pointer;
        }
        .action-holder .action:nth-child(4n) {
            margin-right: 0;
        }
        .action-holder .action .color {
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            display: block;
            border: 1px solid #FFF;
            line-height: var(--size);
            text-align: center;
            pointer-events: none;
        }
        .action-holder .action .color ha-icon {
          pointer-events: none;
        }
        .action-holder .action .name {
            width: var(--size);
            display: block;
            color: #FFF;
            font-size: 9px;
            margin-top: 3px;
            text-align: center;
            pointer-events: none;
        }
    `;
  }
}

customElements.define('light-popup-card', LightPopupCard);
