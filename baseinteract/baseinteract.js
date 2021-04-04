function baseinteract(widget_id, url, skin, parameters)
{
    self = this

     // Initialization

    var widget_name = widget_id.slice(widget_id.indexOf("-") + 1);
    var monitored_entities = [];
    self.parameters = parameters;

    self.OnEvent = OnEvent;
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    if ("entity" in parameters && parameters.entity != "")
    {
        // Make sure that we monitor the entity, not an attribute of it
        split_entity = parameters.entity.split(".");
        self.entity = split_entity[0] + "." + split_entity[1];
        if (split_entity.length > 2)
        {
            self.entity_attribute = split_entity[2];
        }
    }

    if ("mouse_events" in parameters){
        var actions = parameters.mouse_events.join(" ");
        
    }

    else {
        var actions = "click";
    }

    // get the mouse entity

    var callbacks = [
        {"selector": "img", "action": actions, "event" : true, "callback": OnEvent},
    ];

    // First check there is an entity, and if there is setup callback

    if ("entity" in self) {
        var monitored_entities =
        [
            {"entity": self.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
        ];

    }

    // Call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Set the url

    self.index = 0;
    refresh_frame(self)
    self.timeout = undefined
    var oldx = 0;
    var oldy = 0;
    var minimum_pixel = parameters.minimum_pixel || 30;


    function OnEvent(event)
    {
        console.log(event);
        
        var x_pos = event.offsetX;
        var y_pos = event.offsetY;

        //if (x_margin > 0) {
        //    var y_dim = y_margin - (x_margin * 2);
        //    var y_pos = event.offsetY - (parseInt(event.offsetY/y_dim) * x_margin);
        //
            //var x_dim = 
        //    var x_pos = event.pageX - ((y_margin - 120) * x_margin);
        //}

        //else {
        //    var y_pos = event.offsetY;
        //    var x_pos = event.offsetX;
        //}

        var mouse_event = event.type;

        // now decide if to process the event depending on if its a mousemove
        // and if the mouse if over the minimum threshold

        if (mouse_event == "mousemove" && 
            (((x_pos + y_pos) - (oldx + oldy) < minimum_pixel) && 
            ((x_pos + y_pos) - (oldx + oldy) > minimum_pixel))) {
                
            return
        }

        oldx = x_pos;
        oldy = y_pos;
        var baseURI = event.target.baseURI;
        var dash_name = baseURI.slice(baseURI.lastIndexOf("/") + 1);
        var d = new Date();

        var args = {};
        args["service"] = "event/fire";
        args["event"] = mouse_event;
        args["x_pos"] = x_pos;
        args["y_pos"] = y_pos;
        args["key_press"] = event.which;
        args["timestamp"] = d.getTime();
        args["widget"] = widget_name;
        args["dashboard"] = dash_name;

        self.call_service(self, args);
        console.log(args);

        //console.log(event);

    }

    function refresh_frame(self, url)
    {
        if (url === undefined){

            if ("base_url" in self.parameters && "access_token" in self) {
                var endpoint = '/api/camera_proxy/'
                if ('stream' in self.parameters && self.parameters.stream) {
                    endpoint = '/api/camera_proxy_stream/'
                }

                url = self.parameters.base_url + endpoint + self.parameters.entity + '?token=' + self.access_token
            }

            else if ("url" in self.parameters){

                url = self.parameters.url;
            }

            else
            {
                url = ""
            }
        
        }

        if (url == "") url = '/images/Blank.gif';

        if (url.indexOf('?') > -1)
        {
            url = url + "&time=" + Math.floor((new Date).getTime()/1000);
        }
        else
        {
            url = url + "?time=" + Math.floor((new Date).getTime()/1000);
        }

        self.set_field(self, "img_src", url);
        self.index = 0

        var refresh = 0
         if ('stream' in self.parameters && self.parameters.stream == "on") {
            refresh = 0
        }
        if ("refresh" in self.parameters)
        {
            refresh = self.parameters.refresh
        }

        if (refresh > 0)
        {
            clearTimeout(self.timeout)
            self.timeout = setTimeout(function(url) {refresh_frame(self, url)}, refresh * 1000, url);
        }

     }

     // Function Definitions

     // The StateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

     function OnStateAvailable(self, state)
    {
        self.state = state.state;

        if ("base_url" in self.parameters && "access_token" in self){
            self.access_token = state.attributes.access_token
            refresh_frame(self)
        }

        else { // mostlikely the url is in the state

            if ("entity_attribute" in self) {
                var url = state.attributes[self.entity_attribute];
            } else var url = state.state;

            refresh_frame(self, url)
        }
        
    }

     // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter

     function OnStateUpdate(self, state)
    {
        self.state = state.state;

        if ("base_url" in self.parameters && "access_token" in self){
            self.access_token = state.attributes.access_token
            refresh_frame(self)
        }

        else { // mostlikely the url is in the state

            if ("entity_attribute" in self) {
                var url = state.attributes[self.entity_attribute];
            } else var url = state.state;

            refresh_frame(self, url)
        }
    }

 }
