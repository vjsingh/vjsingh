define ["views/AppView", 'app'], (AppView, app) ->
  app.views.Projects = AppView.extend
    templateName: "projects",

    additionalInitialize: () ->
    events: {
    }
