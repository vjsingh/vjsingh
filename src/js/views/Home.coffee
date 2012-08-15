define ["views/AppView", 'app', 'views/Projects'], (AppView, app) ->
  app.views.Home = AppView.extend
    templateName: "home",

    additionalInitialize: () ->
      $("projects").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", (e) ->
        console.log("transition end", e)
      )
      _.bindAll(this)

    events: {
      'click .main-page-squares'    : 'squareClicked',
      'click .name'                 : 'nameClicked'
    }

    squareClicked: (e) ->
      clickedDiv = $(e.target)
      if (clickedDiv.hasClass('text')) 
        clickedDiv = clickedDiv.parent()

      clickedDiv.addClass('selected')
      transitionCss = {
        width         : '100%'
        height        : '100%'
        'z-index'     : 50
        top           : 0
        left          : 0
      }
      ###
      if (clickedDiv.hasClass('projects'))
      else if (clickedDiv.hasClass('music'))

      else if (clickedDiv.hasClass('music'))
      ###
        
      clickedDiv.transition(transitionCss, this.squareTransitionFinished)

    squareTransitionFinished: () ->
      $('.selected .text').transition({top: '0', 'margin-top': 0})
      $('.name').transition({left: '10%'}, () ->
        $('.name').html('V<span>S</span>')
      )
      @selectedContentView = new app.views.Projects();
      $('.selected .square-content').html(@selectedContentView.render().el);

    nameClicked: ()->
      @goToHome()

    goToHome: () ->
      selectedSquare = $('.selected')
      $('.name').transition({left: '50%'}, () ->
        $('.name').html('Varun <span>Singh</span>')
      )
      @selectedContentView.destroy();

      transitionCss = {
        width         : '50%'
        height        : '50%'
        'z-index'     : 10
      }
      if (selectedSquare.hasClass('projects'))
        transitionCss.top = 0
        transitionCss.left = 0
      else if (selectedSquare.hasClass('music'))
        transitionCss.top = 0
        transitionCss.left = '50%'
      else if (selectedSquare.hasClass('about'))
        transitionCss.bottom = 0
        transitionCss.left = 0
      else if (selectedSquare.hasClass('contact'))
        transitionCss.bottom = 0
        transitionCss.left = '50%'
      $('.selected .text').transition({top:'50%'}, () ->
        selectedSquare.transition(transitionCss)
        selectedSquare.find('.text').transition({'margin-top': '-50px'})
        selectedSquare.removeClass('selected')
      )
      
      
