# Light popup card (homekit style)
Popup lovelace card with brightness slider and optional scene selection or a light switch for lights without brightness.
Can be used in combination with thomas loven browser_mod or custom pop-up card or in combination with my homekit style card: https://github.com/DBuit/Homekit-panel-card


## Configuration

### Installation instructions

**HACS installation:**
Go to the hacs store and use the repo url `https://github.com/DBuit/light-popup-card` and add this as a custom repository under settings.

Add the following to your ui-lovelace.yaml:
```yaml
resources:
  url: /community_plugin/light-popup-card/light-popup-card.js
  type: module
```

**Manual installation:**
Copy the .js file from the dist directory to your www directory and add the following to your ui-lovelace.yaml file:

```yaml
resources:
  url: /local/light-popup-card.js
  type: module
```

### Main Options

| Name | Type | Default | Supported options | Description |
| -------------- | ----------- | ------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity` | string | **Required** | `light.kitchen` | Entity of the light |
| `icon` | string | optional | `mdi:lightbulb` | It will use customize entity icon or from the config as a fallback it used lightbulb icon |
| `fullscreen` | boolean | optional | true | If false it will remove the pop-up wrapper which makes it fullscreen |
| `supportedFeaturesTreshold` | number | optional | 9 | When the supported features of the light is larger than the treshold than the brightness slider is rendered if it is equal or lower a switch is rendered |
| `actions` | object | optional | `actions:`  | define actions that you can activate from the pop-up. |
| `scenesInARow` | number | optional | 3 | number of scenes that will be placed in a row under the brightness slider |
| `brightnessWidth` | string | optional | 150px | The width of the brightness slider |
| `brightnessHeight` | string | optional | 400px | The height of the brightness slider |
| `switchWidth` | string | optional | 150px | The width of the switch |
| `switchHeight` | string | optional | 400px | The height of the switch |
' `borderRadius` | string | optional | 12px | The border radius of the slider and switch |

To show actions in the pop-up you add `actions:` in the config of the card follow bij multiple actions.
These actions are calling a service with specific service data. For people that used the `scenes:` before can still activate scenes look at the first example below.
```
actions:
  - service: scene.turn_on
    service_data:
      entity_id: scene.energie
    color: "#8BCBDD"
    name: energie
  - service: homeassistant.toggle
    service_data:
      entity_id: light.voordeurlicht
    name: voordeur
    icon: mdi:lightbulb
```
The name option within a scene is **optional**


Example configuration in lovelace-ui.yaml
```
popup_cards:
  light.beganegrond:
    title: ""
    style:
      position: fixed
      z-index: 999
      top: 0
      left: 0
      height: 100%
      width: 100%
      display: block
      align-items: center
      justify-content: center
      background: rgba(0, 0, 0, 0.8)
      flex-direction: column
      margin: 0
      "--iron-icon-fill-color": "#FFF"
    card:
      type: custom:light-popup-card
      entity: light.beganegrond
      icon: mdi:led-strip
      scenesInARow: 2
      brightnessWidth: 150px
      brightnessHeight: 400px
      switchWidth: 150px
      switchHeight: 400px
      scenes:
        - scene: scene.ontspannen
          color: "#FDCA64"
          name: ontspannen
        - scene: scene.helder
          color: "#FFE7C0"
          name: helder
        - scene: scene.concentreren
          color: "#BBEEF3"
        - scene: scene.energie
          color: "#8BCBDD"
```

![Screenshot of card](https://github.com/DBuit/hass-custom-light-popup-card/blob/development/screenshot.png)
![Screenshot of card with switch](https://github.com/DBuit/hass-custom-light-popup-card/blob/development/screenshot-switch.png)

