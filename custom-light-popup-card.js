import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";
class CustomLightPopupCard extends LitElement {
  
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
    var icon = this.config.icon;
    var entity = this.config.entity;
    var scenes = this.config.scenes;
    var stateObj = this.hass.states[entity];
    var brightness = 0;
    if(stateObj.attributes.brightness) {
        brightness = stateObj.attributes.brightness /2.55;
    }
    console.log(entity);
    console.log(scenes);
    console.log(icon);
    console.log(brightness);
    
    
    console.log(stateObj);
 
    return html`
        <div class="icon ${stateObj.state === "off" ? '': 'on'}">
            <ha-icon icon="${icon || 'mdi:lightbulb'}" />
        </div>
        <h4>${stateObj.state === "off" ? 0 : Math.round(stateObj.attributes.brightness/2.55)}</h4>
        <div class="range-holder">
            <input type="range" .value="${stateObj.state === "off" ? 0 : Math.round(stateObj.attributes.brightness/2.55)}" @change=${e => this._setBrightness(stateObj, e.target.value)}>
        </div>
        
        <div class="scene-holder" *ngIf="entity.scenes && entity.scenes.length > 0">
            <div *ngFor="let row of createRange(sceneRows)" class="scene-row">
                <div class="scene" *ngFor="let scene of entity.scenes.slice(row*4,(row*4)+4); let i = index;" (click)="activateScene(scene.scene)">
                    <span class="color" [ngStyle]="{'background-color': scene.color }"></span>
                    <span class="name" *ngIf="scene.name">scene.name</span>
                </div>
            </div>
        </div>
    `;
  }

  updated() { }
  
  _setBrightness(state, value) {
    this.hass.callService("homeassistant", "turn_on", {
        entity_id: state.entity_id,
        brightness: value * 2.55
    });
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
        .icon {
            margin: 0 auto;
            text-align:center;
            display:block;
            height: 40px;
            width: 40px;
            color: rgba(255,255,255,0.3);
            font-size: 30px;
            padding-top:5px;
        }
        .icon ha-icon {
            width:30px;
            height:30px;
        }
        .icon.on {
            color: #f7d959;
        }
        h4 {
            color: #FFF;
            display: block;
            font-weight: 300;
            margin-bottom: 20px;
            text-align: center;
            font-size:20px;
            margin-top:16px;
        }
        h4:after {
            content: "%";
            padding-left: 1px;
        }
        
        .range-holder {
            height: 402px;
            overflow: hidden;
            padding-top: 102px;
            display: block;
            text-align: center;
        }
        .range-holder input[type="range"] {
            outline: 0;
            border: 0;
            border-radius: 25px;
            width: 400px;
            max-width: 100%;
            margin: 24px 0;
            transition: box-shadow 0.2s ease-in-out;
            -webkit-transform:rotate(270deg);
            -moz-transform:rotate(270deg);
            -o-transform:rotate(270deg);
            -ms-transform:rotate(270deg);
            transform:rotate(270deg);
            overflow: hidden;
            height: 150px;
            -webkit-appearance: none;
            background-color: #ddd;
        }
        .range-holder input[type="range"]::-webkit-slider-runnable-track {
            height: 150px;
            -webkit-appearance: none;
            color: #ddd;
            margin-top: -1px;
            transition: box-shadow 0.2s ease-in-out;
        }
        .range-holder input[type="range"]::-webkit-slider-thumb {
            width: 25px;
            border-right:10px solid #FFF;
            border-left:10px solid #FFF;
            border-top:20px solid #FFF;
            border-bottom:20px solid #FFF;
            -webkit-appearance: none;
            height: 80px;
            cursor: ew-resize;
            background: #fff;
            box-shadow: -350px 0 0 350px #FFF, inset 0 0 0 80px #ddd;
            border-radius: 0;
            transition: box-shadow 0.2s ease-in-out;
            position: relative;
            top: 35px;
        }
    
        .scene-holder {
            display:block;
            margin-top:20px;
            .scene-row {
            display:block;
            text-align:center;
            padding-bottom:10px;
            &:last-child {
            padding:0;
        }
        .scene-holder .scene {
            display:inline-block;
            margin-right:10px;
            cursor:pointer;
        }
        .scene-holder .scene:nth-child(4n) {
            margin-right:0;
        }
        .scene-holder .scene .color {
            width:50px;
            height:50px;
            border-radius:50%;
            display:block;
        }
        .scene-holder .scene .name {
            width:50px;
            overflow:hidden;
            display:block;
            font-size:7px;
            margin-top:3px;
        }
    `;
  }  
  
}

customElements.define('custom-light-popup-card', CustomLightPopupCard);
