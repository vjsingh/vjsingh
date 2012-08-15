define ["app", 'backbone', 'views/Home'], (app, Backbone) ->
  class Router extends Backbone.Router
    routes:
      "home": "index"

    index: ->
        app.AppView.setMainView(new app.views.Home())

  return Router
