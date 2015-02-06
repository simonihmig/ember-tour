import Ember from 'ember';

export default Ember.Component.extend({
  spotlightCSS: '',
  started: false,
  firstTourStep: 0,
  currentStopStep: null,
  transitioning: false,

  startTour: (function(){
    if(this.get('started')){
      this.setProperties({
        transitionStop: null,
        currentStop: null
      });
      var startingStep = this.get('firstTourStep') || 0;

      this.set('currentStopStep', startingStep);
      this.notifyPropertyChange('currentStopStep');
    }
  }).observes('started'),

  moreForwardSteps: Ember.computed('currentStopStep', 'sortedTourStops',
    function(){
      return this.get('currentStopStep') + 1 < this.get('sortedTourStops.length');
    }
  ),

  moreBackwardSteps: Ember.computed('currentStopStep',
    function(){
      return this.get('currentStopStep') > 0;
    }
  ),

  currentStopNumber: Ember.computed('currentStopStep', function(){
    return this.get('currentStopNumber') + 1;
  }),

  previousStopStep: null,
  previousStop: null,
  transitionStop: null,
  windowWidth: null,
  windowHeight: null,

  tourStops: Ember.computed.alias('model.tourStops'),
  currentPath: Ember.computed.alias('parentView.controller.currentPath'),

  routeChange: (function(){
    if(this.get('currentStop') && this.get('started')) {
      Ember.run.scheduleOnce('afterRender', this, this.checkForUserInitiatedTransition);
    }
  }).observes('currentPath'),

  checkForUserInitiatedTransition: (function(){
    var transitioning = this.get('transitioning');
    var element = this.get('currentStop.element');
    var elementOnPage = $(element);
    if (!transitioning && Ember.isBlank(elementOnPage)) {
      this.exitTour();
    }
  }),

  sortedTourStops: Ember.computed('model',
    function(){
      var model = this.get('model');
      if(model && model.get('tourStops')){
        return model.get('tourStops').sortBy('step');
      }
    }
  ),

  setTransitionStop: (function(){
    var step = this.get('currentStopStep');
    var transitionStop = this.get('sortedTourStops').objectAt(step);
    this.set('transitionStop', transitionStop);
  }
  ).observes('currentStopStep'),

  startTourStopTransition: (function(){
    var transitionStop = this.get('transitionStop'),
      currentStop = this.get('currentStop');

    if(currentStop){
      currentStop.set('active', false);
    }

    if(transitionStop) {
      this.set('transitioning', true);

      var previousStop = this.get('previousStop'),
        targetRoute = transitionStop.get('targetRoute'),
        router = this.container.lookup('router:main').router,
        renderedProperty = 'lastRenderedTemplate',
        targetElement = transitionStop.get('element'),
        route;

      var allRoutes = Ember.keys(router.recognizer.names);
      var routeExists = allRoutes.indexOf(targetRoute) !== -1;

      if (routeExists) {
        route = this.container.lookup('route:' + targetRoute);
      }

      var currentRouteDifferent = !previousStop || previousStop.get('targetRoute') !== targetRoute;
      var routePresent = routeExists && route.get(renderedProperty);

      if (routeExists && (!routePresent || currentRouteDifferent)) {
        route.transitionTo(targetRoute);
        if (targetElement) {
          this.finishWhenElementInPage(targetElement);
        } else {
          this.finishTransition();
        }
      } else {
        this.finishTransition();
      }
    }
  }).observes('transitionStop'),

  finishWhenElementInPage: function(element, waitTime) {
    var component = this;
    if(!(typeof waitTime === "number")){
      waitTime = 5000
    }
    if(!Ember.isBlank($(element))){
      this.finishTransition();
    } else if(waitTime > 0) {
      Ember.run.later(function () {
        component.finishWhenElementInPage(element, waitTime - 20);
      },20);
    } else {
      this.incrementProperty('currentStopStep');
    }
  },

  finishTransition: function() {
    var transitionStop = this.get('transitionStop'),
      currentStop = this.get('currentStop');

    transitionStop.set('active', true);
    this.setProperties({
      currentStop: transitionStop,
      previousStop: currentStop
    });

    Ember.run.scheduleOnce('afterRender', this, function(){this.set('transitioning', false)});
  },

  currentProgress: Ember.computed('tourStops', 'currentStep', function(){
    return ((this.get('currentStep') + 1) / this.get('tourStops.length')) * 100;
  }),

  /**
   * Initializes a listener to set window height and width;
   *
   * @api private
   * @method _getWinSize
   */

  _windowSize: (function(){
    var component = this;

    component.setProperties({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });

    if(this.get('started')){
      Ember.$(window).on('resize.tour', function(){
        Ember.run(function() {

          component.setProperties({
            windowWidth: $(window).width(),
            windowHeight: $(window).height()
          });
        });
      });
      Ember.$(window).on('scroll.tour', function(){
        component.set('scrollTop', $(window).scrollTop());
      });
    } else {
      Ember.$(window).off('resize.tour');
      Ember.$(window).off('scroll.tour');
    }
  }).observes('started').on('init'),

  exitTour: function(){
    this.set('started', false);
    this.set('transitionStop.active', false);
    this.set('currentStop.active', false);
    this.set('previousStop', null);
    this.sendAction('endTour');
  },

  actions: {
    exitTour: function(){
      this.exitTour();
    },

    advance: function(){
      this.incrementProperty('currentStopStep', 1);
    },

    reverse: function(){
      this.decrementProperty('currentStopStep', 1);
    },

    goToStep: function(number){
      this.set('currentStopStep', number);
    },

    goToStop: function(id){
      var sortedTourStops = this.get('sortedTourStops');
      var tourStop = sortedTourStops.findBy('id', id);
      var position = sortedTourStops.indexOf(tourStop);
      this.set('currentStopStep', position);
    }
  }

});
