###
define((require) ->
  $           = require('jquery')
  _           = require('underscore')
  Backbone    = require('backbone')
  dummy       = require('handlebars')
  dummy       = require('plugins/backbone.layoutmanager')
  dummy       = require('templates')
  asdf
###

define(['jquery', 'underscore', 'backbone', 'handlebars', 'transit'], 
  ($, _, Backbone, views) ->
    # Global location for config settings and module creation
    # Mix Backbone.Events, modules, and view management into the app object.
    # Mediator is a global pub/sub object
    Mediator = {}
    _.extend(Mediator, Backbone.Events)

    app =
      root: "/"
      views: {}
      models: {}
      collections: {}
      Templates: window.Templating
      getTemplate: (templateName, context) ->
        return app.Templates.tpl(templateName + '.us', context)
      Mediator: Mediator

      module: (additionalProps) ->
        return _.extend({
          Views: {},
          additionalProps
        })

      #Manages anything global related to views
      AppView:
        setView: (viewName, elSelector, view, doPrepend) ->
          # If already using this view, then dont do anything
          if (this[viewName] && this[viewName] == view)
            this[viewName].render()
            this[viewName].$el.show() #In case it was hidden
            return this[viewName]

          if doPrepend
            $(elSelector).prepend(view.el)
          else
            $(elSelector).append(view.el)

          view.render()

          # If a layout already exists, remove it from the DOM.
          # TODO: Try putting above render
          if this[viewName]
            this[viewName].destroy()
          this[viewName] = view

        destroyView: (viewName) ->
          if this[viewName]
            this[viewName].destroy()
            this[viewName] = null

        hideView: (viewName) ->
          if (this[viewName]) 
              this[viewName].$el.hide()

        setOverlay: (overlay) ->
          return app.AppView.setView('overlay', 'body', overlay, true)

        # Sets the main view in the page (not the header/footer)
        setMainView: (view) ->
          ###
            * To adapt for animations
            * $("#main").empty().html(view.el);
            * The corresponding div is #[the template name of the view]
            * Can specify something different with view.containerName
          ###
          containerName;
          if view.containerName
              containerName = view.containerName
          else if view.templateName
              containerName = view.templateName
          console.log('Error in app.js: no templateName or containerName specified')

          app.AppView.setView('mainView', '#main-page-wrapper', view)

          # Set ID of div to template name
          view.$el.attr('id', containerName)

          # Reset stuff that might have been moved by animations
          $('#animation-wrapper').css({'margin-top': '0'})
          $('#animation-wrapper').css({'left': '0px'})
          $('#main-page-wrapper').css({'left': '0px'})

          $('#main-page-wrapper').append(view.el)
          # Set ID of div to template name
          view.$el.attr('id', containerName)

          # this.animateIn(view.containerName);
          # Animate view in if specified
          if (view.animateIn != undefined) 
              view.animateIn()

          #  If on iPhone with fixed header/footer, need to temporarily set
          #  header to relative to include in views w/ slideUp animation, then switch back
          #  This kind of sucks; consider just creating a different #transactionHeader
          #  That's always relative. Manually setting these views here is really blegh.

          if (view.templateName == 'transaction' || view.templateName == 'notifications' || view.templateName == 'bankAccounts' || view.templateName == 'pendingTransactions') 
              $('#header').css({'position': 'relative'});
          else 
            $('body').removeAttr('style');
            $('#header').removeAttr('style');

          return view

        setHeader: (header) ->
          return app.AppView.setView('header', '#header', header);

          ###
          // Sets a view one layer "in" from its parent with a back button
              setSubView: function(view, parent) {
                  app.AppView.setView('mainView', '#main-page-wrapper', view);
                  if (view.dont_show_tabs === undefined) {
                      // Show tabs, but don't show anything highlighted
                      app.AppView.setTabs('');
                      $('#header').removeClass('rounded-bottoms');
                  } else {
                      // Clear tabs
                      this.tabs = null;
                      $('#tabs').html("");
                      $('#tabs').hide();

                      if ($('body').hasClass('static-top-tabs')) {
                          // Round header corners
                          $('#header').addClass('rounded-bottoms');
                      }
                  }
                  // TODO: Keep track of parent, stack
                  // TODO: Standard animateIn
                  view.slideLeft();
              },


          showModal: function(options) {
              var modal = new app.views.ModalView(options);
              $('body').append(modal.$el);
              modal.render();
              modal.animateIn();
              modal.setFocus();
              return modal;
          },
          ###

        goBack: () ->
          window.history.back()

    # Watch for changes in less files
    less.env = 'development'; # Forces refresh on @import changes
    less.watch()
    return app
)


### If we ever want to go back to fetching templates asynchronously
fetch: (path) ->
  path = path + ".html"
  unless JST[path]
    $.ajax({
      url: app.root + path
      async: false
    }).then (contents) ->
      JST[path] = _.template(contents)
  return JST[path]
###

