# Entry point into the application (when the application 'starts')
# Initialize stuff, including Backbone history and hijacking links
require [ 'app', 'router', 'backbone'], (app, Router, Backbone) ->
    # Make app globally available for debugging
    window.app = app;

    # Define your master router on the application namespace and trigger all
    # navigation from this instance.
    app.router = new Router()

    # Trigger the initial route and enable HTML5 History API support, set the
    # root folder to '/' by default.  Change in app.js.
    Backbone.history.start
        #pushState: true
        root: app.root

    # All navigation that is relative should be passed through the navigate
    # method, to be processed by the router. If the link has a `data-bypass`
    # attribute, bypass the delegation completely.
    $(document).on "click", "a:not([data-bypass])", (evt) ->
        #Get the absolute anchor href.
        href = $(this).attr("href")

        # If the href exists and is a hash route, run it through Backbone.
        if href && href.indexOf("#") == 0
          # Stop the default event to ensure the link will not cause a page 
          # refresh.
          evt.preventDefault()

          # `Backbone.history.navigate` is sufficient for all Routers and will
          # trigger the correct events. The Router's internal `navigate` method
          # calls this anyways.  The fragment is sliced from the root.
          Backbone.history.navigate(href, {trigger: true})


    app.router.navigate('#home', {trigger: true})
    ###
    if app.currentUser.authenticated()
        # redirect to user page
        app.router.navigate('#home', {trigger: true})
        # Initialize header and footer no matter what page we're on
        #app.AppView.setHeader(new app.views.Header())
        # app.setFooter()
    else
        # launch a login form
        app.router.navigate('#login', {trigger: true})
    ###




###
# TO FUCKING DO
# set access token expiration length in models/User
# handle errors in login
####
