function basebutton(widget_id, url, skin, parameters)
{
    self = this

    // Initialization

    self.widget_id = widget_id;
    var monitored_entities = [];
    self.parameters = parameters;
    self.entity = self.parameters.entity;

    self.OnEvent = OnEvent;
    self.OnStateUpdate = OnStateUpdate;
    self.OnStateAvailable = OnStateAvailable;

    if (self.entity != undefined && "enable" in self.parameters && self.parameters.enable === 1)
    {
        // register for the mouse events
        var callbacks = [
            {"selector": '#' + widget_id + ' > span', "action": "mouseup mousedown", "DOMEventData" : true, "callback": OnEvent},
        ];

        // register for entity state change
        monitored_entities =
        [
            {"entity": self.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
        ];
    }


    // Call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);


    function OnEvent(event)
    {

        const mouse_event = event.type;
        var action = "idle";

        if (mouse_event === "mousedown") {

            action = "pressed";

        } else if (mouse_event === "mouseup") {

            action = "released";
        }

        var args = {};
        args["service"] = "state/set";
        args["entity_id"] = self.entity;
        args["state"] = action;

        self.call_service(self, args);
        console.log(args);

    }

    function OnStateAvailable(self, state)
    {
        self.state = state.state;
        set_view(self, self.state)
    }
    
    function OnStateUpdate(self, state)
    {
        if (!("ignore_state" in self.parameters) || self.parameters.ignore_state === 0)
        {
            self.state = state.state;
            set_view(self, self.state)
        }
    }

    // Set view is a helper function to set all aspects of the widget to its
    // current state - it is called by widget code when an update occurs
    // or some other event that requires a an update of the view

    function set_view(self, state, level)
    {
        if (state === self.parameters.state_active || ("active_map" in self.parameters && self.parameters.active_map.includes(state)))
        {
            self.set_icon(self, "icon", self.icons.icon_on);
            self.set_field(self, "icon_style", self.css.icon_style_active)
        }
        else
        {
            self.set_icon(self, "icon", self.icons.icon_off);
            self.set_field(self, "icon_style", self.css.icon_style_inactive)
        }
        if ("state_text" in self.parameters && self.parameters.state_text === 1)
        {
            self.set_field(self, "state_text", self.map_state(self, state))
        }
    }

    
}