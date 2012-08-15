# Define our own App view that all views should inherit from
define(['app'], (app) ->
  AppView = Backbone.View.extend(
    initialize: (options) ->
      this._addedEventBindings = []
      if (this.additionalInitialize) 
          this.additionalInitialize(options)

    ###
     * For Garbage collection
     * Format is [ [obj, event, cb], [this.model, 'change', this.render]]
     * 
     * Defined in the constructor since otherwise the array is static 
     * across all instances.
    ###
    _addedEventBindings: []

    ###
     * Abstraction for adding events on objects that aren't the dom
     * Currently, lets us garbage collect on this.destroy()
    ###
    doBind: (event, cb, context, obj) ->
      if (!obj)
          obj = app.Mediator
      obj.on(event, cb, context)
      this._addedEventBindings.push([obj, event, cb])

    ###
     * Removes all bindings from or on this view
    ###
    unbindFromAll: () ->
      _.each(this._addedEventBindings, (eventArr) ->
        obj = eventArr[0]
        event = eventArr[1]
        cb = eventArr[2]
        obj.off(event, cb)
      )
      this._addedEventBindings = []

    ###
     * Override in child views for individual garbage collecting
    ###
    cleanup: () ->

    ###
     * Entirely gets rid of this view, so JS will garbage collect hopefully
     * Removes from the DOM with this.remove()
     * Unbinds all backbone events with this.unbind()
     * Unbinds all other bindings (app.mediator) with this.unbindFromAll()
    ###
    destroy: () ->
      # We need this for protection against zombies.
      # (i.e. page transitions are wonked without this)
      # See http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
      
      this.remove();
      this.unbind(); # Unbinds all events in events hash and 'this.trigger's
      this.unbindFromAll();
      this.cleanup();

    render: () ->
      this.renderTemplate()
      if this.postRender
        return this.postRender()
      return this

    renderTemplate: (context, templateName) ->
      # Get default context and templateName if none is supplied
      if (!context) 
        context = this.context()
      if (!templateName) 
        templateName = this.templateName
      this.$el.html(app.getTemplate(this.templateName, context))
      return this


    # Default context for template is model attrs
    context: () ->
      if (this.model) 
        return this.model.attributes
      else if (this.options) 
        return this.options
      else 
        return {}

    slideUp: (cb) ->
      $('body').css({'margin-top': '0px', 'margin-bottom': '0px'});
      $('#animation-wrapper').css({'margin-top': '150%'}).transition({marginTop: '0'}, 250, 'linear', cb);

    slideDown: (cb) ->
      $('#animation-wrapper').css({'margin-top': '0'}).transition({marginTop: '175%'}, 250, 'linear', cb);

    slideLeft: (cb) ->
      $('#main-page-wrapper').css({'left': '20%'}).transition({left: '0%'}, 150, 'linear', cb);

    slideRight: (cb) ->
      $('#main-page-wrapper').css({'left': '0%'}).transition({left: '100%'}, 250, 'linear', cb);
  )
  return AppView;
)
