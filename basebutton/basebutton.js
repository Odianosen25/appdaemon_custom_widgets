function basebutton(widget_id, url, skin, parameters)
{
    self = this

    // Initialization

    self.widget_id = widget_id;
    var monitored_entities = [];
    self.parameters = parameters;
    self.entity = self.parameters.entity;
    self.state = undefined;
    self.action = undefined;
    self.timer = undefined;

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
        var button_state = "off";
        var action = "idle";

        if (mouse_event === "mousedown") {

            button_state = "on"
            action = "pressed";

            self.timer = setTimeout(run_timer, 1500, true, Date.now()); // ran if button not released after 1.5 seconds

        } else if (mouse_event === "mouseup") {

            button_state = "off"

            if (self.timer != undefined){
                if (self.action === "pressed") {
                    // means its the first time, so timeout is running
                    clearTimeout(self.timer);

                } else {
                    // means its not the first time, so timeinterval is running
                    clearInterval(self.timer);
                }

                self.timer = undefined;
            }

            if (self.action != "pressed-hold") {
                action = "released";

            } else {
                action = "released-hold";
            }
        }

        // first we setup entity state
        var args = {};
        args["service"] = "state/set";
        args["entity_id"] = self.entity;
        args["state"] = button_state;
        args["action"] = action;
        args["duration"] = 0;

        self.call_service(self, args);
        self.action = action;

        // next we fire an event
        fire_event(action, 0)

    }

    function run_timer(first_time, start_time)
    {
        var action = "press-hold";
        var duration = parseInt((Date.now() - start_time)/1000);

        if (first_time === true) {
            // means its the first time, so we setup timer
            self.timer = setInterval(run_timer, 1000, false, Date.now())

        } else {
            // means its a continous run, so we keep firing events
            console.log(duration);
            
        }

        var args = {};
        args["service"] = "state/set";
        args["entity_id"] = self.entity;
        args["action"] = action;
        args["duration"] = duration

        self.call_service(self, args);        
        fire_event(action, duration);
        self.action = action;

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

    function fire_event(event, duration) {
        args["service"] = "event/fire";
        args["event"] = event;
        args["entity_id"] = self.entity;
        args["duration"] = duration;

        self.call_service(self, args);

    }
    
}
