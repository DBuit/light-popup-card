# hass-custom-light-popup-card
Popup lovelace card with brightness slider and optional scene selection.
Can be used in combination with thomas loven browser_mod or custom pop-up card.

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
      type: custom:custom-light-popup-card
      entity: light.beganegrond
      scenes:
        - scene: scene.ontspannen
          color: "#FDCA64"
          name: ontspannen
        - scene: scene.helder
          color: "#FFE7C0"
          name: helder
        - scene: scene.concentreren
          color: "#BBEEF3"
          name: concentreren
        - scene: scene.energie
          color: "#8BCBDD"
          name: energie
```

![Screenshot of card](https://github.com/DBuit/hass-custom-light-popup-card/blob/master/screenshot.png)
