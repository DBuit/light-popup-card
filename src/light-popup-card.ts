import { LitElement, html, css } from 'lit-element';
import tinycolor, { TinyColor, isReadable } from '@ctrl/tinycolor';
import { closePopUp } from 'card-tools/src/popup';
import {
  computeStateDisplay
} from 'custom-card-helpers';
class LightPopupCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  actionRows:any = [];
  currentBrightness = 0;
  settings = false;
  settingsCustomCard = false;
  settingsPosition = "bottom";

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {}
    };
  }
  
  constructor() {
    super();
  }
  
  render() {
    
    var entity = this.config.entity;
    var stateObj = this.hass.states[entity];
    var actionsInARow = this.config.actionsInARow ? this.config.actionsInARow : 4;
    var brightness = 0;
    if(stateObj.attributes.brightness) {
        brightness = stateObj.attributes.brightness /2.55;
    }
    var icon = this.config.icon ? this.config.icon : stateObj.attributes.icon ? stateObj.attributes.icon: 'mdi:lightbulb';
    var borderRadius = this.config.borderRadius ? this.config.borderRadius : '12px';  
    var supportedFeaturesTreshold = this.config.supportedFeaturesTreshold ? this.config.supportedFeaturesTreshold : 9;
    var onStates = this.config.onStates ? this.config.onStates : ['on'];
    var offStates = this.config.offStates ? this.config.offStates : ['off'];
    //Scenes
    var actionSize = "actionSize" in this.config ? this.config.actionSize : "50px";
    var actions = this.config.actions;
    if(actions && actions.length > 0) {
        
        var numberOfRows = Math.ceil(actions.length / actionsInARow);
        for(var i=0;i<numberOfRows;i++) {
          this.actionRows[i] = [];
            for(var j=0;j<actionsInARow;j++) {
                if(actions[(i*actionsInARow)+j]) {
                  this.actionRows[i][j] = actions[(i*actionsInARow)+j];
                }
            }
        }
    }

    var switchValue = 0;

    if (onStates.includes(stateObj.state)) {
      switchValue = 1;
    }

    var fullscreen = "fullscreen" in this.config ? this.config.fullscreen : true;
    var brightnessWidth = this.config.brightnessWidth ? this.config.brightnessWidth : "150px";
    var brightnessHeight = this.config.brightnessHeight ? this.config.brightnessHeight : "400px";
    var switchWidth = this.config.switchWidth ? this.config.switchWidth : "380px";
    var switchHeight = this.config.switchHeight ? this.config.switchHeight : "150px";

    var color = this._getColorForLightEntity(stateObj, this.config.useTemperature, this.config.useBrightness);
    var sliderColor = "sliderColor" in this.config ? this.config.sliderColor : "#FFF";
    var sliderColoredByLight = "sliderColoredByLight" in this.config ? this.config.sliderColoredByLight : false;
    var sliderThumbColor = "sliderThumbColor" in this.config ? this.config.sliderThumbColor : "#ddd";
    var sliderTrackColor = "sliderTrackColor" in this.config ? this.config.sliderTrackColor : "#ddd";
    var actionRowCount = 0;
    this.currentBrightness = Math.round(stateObj.attributes.brightness/2.55);
    

    this.settings = "settings" in this.config ? true : false;
    this.settingsCustomCard = "settingsCard" in this.config ? true : false;
    this.settingsPosition = "settingsPosition" in this.config ? this.config.settingsPosition : "bottom";
    if(this.settingsCustomCard && this.config.settingsCard.cardOptions) {
      if(this.config.settingsCard.cardOptions.entity && this.config.settingsCard.cardOptions.entity == 'this') {
        this.config.settingsCard.cardOptions.entity = entity;
      } else if(this.config.settingsCard.cardOptions.entity_id && this.config.settingsCard.cardOptions.entity_id == 'this') {
        this.config.settingsCard.cardOptions.entity_id = entity;
      } else if(this.config.settingsCard.cardOptions.entities) {
        for(let key in this.config.settingsCard.cardOptions.entities) {
          if(this.config.settingsCard.cardOptions.entities[key] == 'this') {
            this.config.settingsCard.cardOptions.entities[key] = entity;
          }
        }
      }
    }

    return html`
      <div class="${fullscreen === true ? 'popup-wrapper':''}">
            <div id="popup" class="popup-inner" @click="${e => this._close(e)}">
                <div class="icon${fullscreen === true ? ' fullscreen':''}">
                    <ha-icon style="${onStates.includes(stateObj.state) ? 'color:'+color+';' : ''}" icon="${icon}" />
                </div>
                ${ stateObj.attributes.supported_features > supportedFeaturesTreshold ? html`
                    <h4 id="brightnessValue" class="${offStates.includes(stateObj.state) ? '' : 'brightness'}" data-value="${this.currentBrightness}%">${offStates.includes(stateObj.state) ? computeStateDisplay(this.hass.localize, stateObj, this.hass.language) : ''}</h4>
                    <div class="range-holder" style="--slider-height: ${brightnessHeight};--slider-width: ${brightnessWidth};">
                        <input type="range" style="--slider-width: ${brightnessWidth};--slider-height: ${brightnessHeight}; --slider-border-radius: ${borderRadius};${sliderColoredByLight ? '--slider-color:'+color+';':'--slider-color:'+sliderColor+';'}--slider-thumb-color:${sliderThumbColor};--slider-track-color:${sliderTrackColor};" .value="${offStates.includes(stateObj.state) ? 0 : Math.round(stateObj.attributes.brightness/2.55)}" @input=${e => this._previewBrightness(e.target.value)} @change=${e => this._setBrightness(stateObj, e.target.value)}>
                    </div>
                ` : html`
                    <h4>${computeStateDisplay(this.hass.localize, stateObj, this.hass.language)}</h4>
                    <div class="switch-holder" style="--switch-height: ${switchHeight};--switch-width: ${switchWidth};">
                        <input type="range" style="--switch-width: ${switchWidth};--switch-height: ${switchHeight}; --slider-border-radius: ${borderRadius}" value="0" min="0" max="1" .value="${switchValue}" @change=${() => this._switch(stateObj)}>
                    </div>
                `}

                ${actions && actions.length > 0 ? html`
                <div class="action-holder">

                    ${this.actionRows.map((actionRow) => {
                      actionRowCount++;
                      var actionCount = 0;
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
                ${this.settings ? html`<button class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen':''}" @click="${() => this._openSettings()}">${this.config.settings.openButton ? this.config.settings.openButton:'Settings'}</button>`:html``}
            </div>
            
            ${this.settings ? html`
              <div id="settings" class="settings-inner" @click="${e => this._close(e)}">
                ${this.settingsCustomCard ? html`
                  <card-maker nohass data-card="${this.config.settingsCard.type}" data-options="${JSON.stringify(this.config.settingsCard.cardOptions)}" data-style="${this.config.settingsCard.cardStyle ? this.config.settingsCard.cardStyle : ''}">
                  </card-maker>
                `:html`
                    <more-info-controls
                    .dialogElement=${null}
                    .canConfigure=${false}
                    .hass=${this.hass}
                    .stateObj=${stateObj}
                    style="--paper-slider-knob-color: white !important;
                    --paper-slider-knob-start-color: white !important;
                    --paper-slider-pin-color: white !important;
                    --paper-slider-active-color: white !important;
                    color: white !important;
                    --primary-text-color: white !important;"
                  ></more-info-controls>
                `}
                <button class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen':''}" @click="${() => this._closeSettings()}">${this.config.settings.closeButton ? this.config.settings.closeButton:'Close'}</button>
              </div>
            `:html``}
        </div>
    `;
  }

  updated() { }

  firstUpdated() {
    if(this.settings && !this.settingsCustomCard) {
    const mic = this.shadowRoot.querySelector("more-info-controls").shadowRoot;
    mic.removeChild(mic.querySelector("app-toolbar"));
    } else if(this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll("card-maker").forEach(customCard => {
        var card = {
          type: customCard.dataset.card
        };
        card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
        customCard.config = card;

        let style = "";
        if(customCard.dataset.style) {
          style = customCard.dataset.style;
        }

        if(style != "") {
          let itterations = 0;
          let interval = setInterval(function () {
            let el = customCard.children[0];
            if(el) {
              window.clearInterval(interval);

              var styleElement = document.createElement('style');
              styleElement.innerHTML = style;
              el.shadowRoot.appendChild(styleElement);

            } else if (++itterations === 10 ) {
              window.clearInterval(interval);
            }
          }, 100);
        }
    });
    }
  }

  _close(event) {
    if(event && (event.target.className.includes('popup-inner') || event.target.className.includes('settings-inner'))) {
        closePopUp();
    }
  }

  _openSettings() {
    this.shadowRoot.getElementById('popup').classList.add("off");
    this.shadowRoot.getElementById('settings').classList.add("on");
  }
  _closeSettings() {
    this.shadowRoot.getElementById('settings').classList.remove("on");
    this.shadowRoot.getElementById('popup').classList.remove("off");
  }

  _createRange(amount) {
    const items: any = [];
    for (let i = 0; i < amount; i++) {
      items.push(i);
    }
    return items;
  }

  _previewBrightness(value) {
    this.currentBrightness = value;
    const el = this.shadowRoot.getElementById("brightnessValue");
    if(el) {el.dataset.value = value+"%";}
  }

  _setBrightness(state, value) {
    this.hass.callService("homeassistant", "turn_on", {
        entity_id: state.entity_id,
        brightness: value * 2.55
    });
  }
  
  _switch(state) {
      this.hass.callService("homeassistant", "toggle", {
        entity_id: state.entity_id    
      });
  }
  
  _activateAction(e) {
    if(e.target.dataset && e.target.dataset.service) {
      const [row, item] = e.target.dataset.service.split("#", 2);
      const action = this.actionRows[row-1][item-1];
      const [domain, service] = action.service.split(".", 2);
      this.hass.callService(domain, service, action.service_data);
    }
  }

  _getColorForLightEntity(stateObj, useTemperature, useBrightness) {
      var color = this.config.default_color ? this.config.default_color : undefined;
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
      return this.config.color_on ? this.config.color_on: '#f7d959';
    }

    _getColorFromVariable(color: string): string {
      if (typeof color !== "undefined" && color.substring(0, 3) === 'var') {
        return window.getComputedStyle(document.documentElement).getPropertyValue(color.substring(4).slice(0, -1)).trim();
      }
      return color;
    }
  
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  getCardSize() {
    return this.config.entities.length + 1;
  }
  
  static get styles() {
    return css`
        :host {
            background-color:#000!important;
        }
        .popup-wrapper {
            margin-top:64px;
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
          display:none;
        }
        #settings {
          display:none;
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
          display:flex;
        }
        .settings-btn {
          position:absolute;
          right:30px;
          background-color: #7f8082;
          color: #FFF;
          border: 0;
          padding: 5px 20px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
        }
        .settings-btn.bottom {
          bottom:15px;
        }
        .settings-btn.bottom.fullscreen {
          margin:0;
        }
        .settings-btn.top {
          top: 25px;
        }
        .fullscreen {
          margin-top:-64px;
        }
        .icon {
            text-align:center;
            display:block;
            height: 40px;
            width: 40px;
            color: rgba(255,255,255,0.3);
            font-size: 30px;
            --mdc-icon-size: 30px;
            padding-top:5px;
        }
        .icon ha-icon {
            width:30px;
            height:30px;
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
            font-size:20px;
            margin-top:0;
            text-transform: capitalize;
        }
        h4.brightness:after {
            content: attr(data-value);
            padding-left: 1px;
        }
        
        .range-holder {
            height: var(--slider-height);
            width: var(--slider-width);
            position:relative;
            display: block;
        }
        .range-holder input[type="range"] {
            outline: 0;
            border: 0;
            border-radius: var(--slider-border-radius, 12px);
            width: var(--slider-height);
            margin: 0;
            transition: box-shadow 0.2s ease-in-out;
            -webkit-transform:rotate(270deg);
            -moz-transform:rotate(270deg);
            -o-transform:rotate(270deg);
            -ms-transform:rotate(270deg);
            transform:rotate(270deg);
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
            background-color: var(--slider-track-color);
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .range-holder input[type="range"]::-webkit-slider-thumb {
            width: 25px;
            border-right:10px solid var(--slider-color);
            border-left:10px solid var(--slider-color);
            border-top:20px solid var(--slider-color);
            border-bottom:20px solid var(--slider-color);
            -webkit-appearance: none;
            height: 80px;
            cursor: ew-resize;
            background: #fff;
            box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
            border-radius: 0;
            transition: box-shadow 0.2s ease-in-out;
            position: relative;
            top: calc((var(--slider-width) - 80px) / 2);
        }
        .range-holder input[type="range"]::-moz-thumb-track {
            height: var(--slider-width);
            background-color: var(--slider-track-color);
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .range-holder input[type="range"]::-moz-range-thumb {
            width: 5px;
            border-right:12px solid var(--slider-color);
            border-left:12px solid var(--slider-color);
            border-top:20px solid var(--slider-color);
            border-bottom:20px solid var(--slider-color);
            height: calc(var(--slider-width)*.4);
            cursor: ew-resize;
            background: #fff;
            box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
            border-radius: 0;
            transition: box-shadow 0.2s ease-in-out;
            position: relative;
            top: calc((var(--slider-width) - 80px) / 2);
        }
        .switch-holder {
            height: var(--switch-height);
            width: var(--switch-width);
            position:relative;
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
            background-color: #ddd;
            padding: 10px;
            position: absolute;
            top: calc(50% - (var(--switch-width) / 2));
            right: calc(50% - (var(--switch-height) / 2));
        }
        .switch-holder input[type="range"]::-webkit-slider-runnable-track {
            height: calc(var(--switch-width) - 20px);
            -webkit-appearance: none;
            color: #ddd;
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .switch-holder input[type="range"]::-webkit-slider-thumb {
            width: calc(var(--switch-height) / 2);
            -webkit-appearance: none;
            height: calc(var(--switch-width) - 20px);
            cursor: ew-resize;
            background: #fff;
            transition: box-shadow 0.2s ease-in-out;
            border: none;
            box-shadow: -1px 1px 20px 0px rgba(0,0,0,0.75);
            position: relative;
            top: 0;
            border-radius: var(--slider-border-radius, 12px);
        }
        
        .action-holder {
            display: flex;
            flex-direction: column;
            margin-top:20px;
        }
        .action-row {
            display:block;
            padding-bottom:10px;
        }
        .action-row:last-child {
            padding:0;
        }
        .action-holder .action {
            display:inline-block;
            margin-right:10px;
            cursor:pointer;
        }
        .action-holder .action:nth-child(4n) {
            margin-right:0;
        }
        .action-holder .action .color {
            width:var(--size);
            height:var(--size);
            border-radius:50%;
            display:block;
            border: 1px solid #FFF;
            line-height: var(--size);
            text-align: center;
            pointer-events: none;
        }
        .action-holder .action .color ha-icon {
          pointer-events: none;
        }
        .action-holder .action .name {
            width:var(--size);
            display:block;
            color: #FFF;
            font-size: 9px;
            margin-top:3px;
            text-align:center;
            pointer-events: none;
        }
    `;
  }  
  
}

customElements.define('light-popup-card', LightPopupCard);
