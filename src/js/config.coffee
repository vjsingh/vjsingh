# Configure requirejs
# First thing that is loaded
require.config({
    # All js is in /static/js
    baseUrl: "/js"
    # First thing to load is main.js
    deps: [ "main" ]

    # Define paths to common folders/libs
    paths:
        # JavaScript folders.
        libs: "libs"
        #plugins: "plugins"
        views: "views"

        # Libraries.
        jquery: "libs/jquery"
        underscore: "libs/underscore"
        backbone: "libs/backbone"
        #backboneValidation: "libs/backbone.validation"
        jqueryCookie: "libs/jquery.cookie"
        #jqueryUniqueElementId: "libs/jquery.unique-element-id"
        handlebars: "libs/handlebars-1.0.0.beta.6"
        transit:    "libs/jquery.transit"

    # Use this for 3rd party libs that aren't AMD (requirejs) compatible
    shim:
        underscore:
          deps: []
          exports: "_"
        jqueryCookie:
          deps: [ "jquery" ]
        jqueryUniqueElementId:
          deps: [ "jquery" ]

        # Backbone library depends on underscore and jQuery.
        backbone:
          deps: [ "underscore", "jquery" ]
          exports: "Backbone"

        transit:
          deps: [ "jquery" ]

        #backboneValidation:
          #deps: [ "underscore", "backbone" ]
})

