import Ember from 'ember';

export default Ember.Component.extend({
  tourHelperLayerCss: '',
  started: false,

  startTour: (function(){
    if(this.get('started')){
      var currentStop = this.get('sortedTourStops').objectAt(this.get('currentStopStep'));
      this.setProperties({
        transitionStop: currentStop,
        currentStop: null
      });
    }
  }).observes('started'),

  moreForwardSteps: Ember.computed('currentStopStep', 'sortedTourStops',
    function(){
      return this.get('currentStopStep') + 1 <= this.get('sortedTourStops.length');
    }
  ),

  moreBackwardSteps: Ember.computed('currentStopStep',
    function(){
      return this.get('currentStopStep') > 0;
    }
  ),

  currentStopStep: 0,
  previousStopStep: null,
  previousStop: null,
  transitionStop: null,

  onBeforeChange: function(){},
  onChange: function(){},
  onComplete: function(){},
  onExit: function(){},
  onAfterChange: function(){},
  windowWidth: null,
  windowHeight: null,

  tourStops: Ember.computed.alias('model.tourStops'),

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
      previousStop = this.get('previousStop'),
      targetRoute = transitionStop.get('targetRoute'),
      route = this.container.lookup('route:' + targetRoute),
      renderedProperty = 'lastRenderedTemplate',
      targetElement = transitionStop.get('element');

    var routePresent = route && route.get(renderedProperty);
    var currentRouteDifferent = !previousStop || previousStop.get('targetRoute') !== targetRoute;

    if(route && (!routePresent || currentRouteDifferent)){
      route.transitionTo(targetRoute);
      if(targetElement){
        this.finishWhenElementInPage(targetElement);
      } else {
        this.finishTransition();
      }
    } else {
      this.finishTransition();
    }
  }).observes('transitionStop'),

  finishWhenElementInPage: function(element) {
    var component = this;
    if(!Ember.isBlank($(element))){
      this.finishTransition();
    } else {
      Ember.run.later(function () {
        component.finishWhenElementInPage(element);
      },20);
    }
  },

  viewInDom: function(route, property){
    if(route.get(property)){
      Ember.removeObserver(route, property, 'viewInDom');
      this.finishTransition();
    }
  },

  finishTransition: function() {
    var transitionStop = this.get('transitionStop'),
      currentStop = this.get('currentStop');

    transitionStop.set('active', true);
    if(currentStop){
      currentStop.set('active', false);
    }
    this.setProperties({
      currentStop: transitionStop,
      previousStop: currentStop
    });
  },

  currentProgress: Ember.computed('tourStops', 'currentStep', function(){
    return ((this.get('currentStep') + 1) / this.get('tourStops.length')) * 100;
  }),
  //
  //renderStop: (function(){
  //  var step = this.get('currentStopStep');
  //  var currentStop = this.get('sortedTourStops').objectAt(step);
  //
  //}).observes('currentStopStep'),

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

  keyDown: function(e) {
    if (e.keyCode === 27 && this.get('exitOnEsc') === true) {
      //escape key pressed, exit the intro
      this.send('exit');
    } else if (e.keyCode === 37) {
      //left arrow
      this.send('rewind');
    } else if (e.keyCode === 39) {
      //right arrow
      this.send('advance');
    } else if (e.keyCode === 13) {
      //default behavior for responding to enter
      this.send('advance');
      //prevent default behaviour on hitting Enter, to prevent steps being skipped in some browsers
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    }
  },

  actions: {
    exit: function(){
      this.set('started', false);
      this.sendAction('endTour');
    },

    advance: function(){
      this.incrementProperty('currentStopStep', 1);
    },

    reverse: function(){
      this.decrementProperty('currentStopStep', 1);
    },

    goToStep: function(number){
      this.set('currentStopStep', number);
    }
  }

});
