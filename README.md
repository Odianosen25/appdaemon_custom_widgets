# appdaemon_custom_widgets
Custom widgets for AppDaemon


## Button Dashboard Example
```
volume_up:
    title: Volume Up
    widget_type: button
    entity: button.living_room_volume_up
    hold_time: 1.5 # disabled by default. WHen disabled, repeat_interval does nothing
    repeat_interval: 2 # defaults to 1
    set_button_state: 1 # enabled by default
    icon_on: mdi-volume-high
    icon_off: mdi-volume-high
    namespace: default
```
