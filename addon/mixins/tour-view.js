import Ember from 'ember';
import {tour} from 'ember-tour/utils/intro';

var withoutNullValues = function(hash){
  var keys = Ember.keys(hash);
  var kompact = {};
  keys.forEach(function(key){
    var value = hash[key];
    if(!(value === undefined || value === null)){
      kompact[key] = value;
    }
  });
  return kompact;
};

var startTour = function(steps, options, afterTour) {
  var tour = window.introJs(),
    tourObject = Ember.Object.create({finished: false});

  if(typeof options === 'object') {
    var rawOptions = options.get('data') || options,
      optionData = withoutNullValues(rawOptions);
      tour.setOptions(optionData);
  }

  var stepData = steps.map(function(tourStop){
    var data = tourStop.get('data') || tourStop;
    return withoutNullValues(data);
  });

  tour.setOptions({steps: stepData});

  tour.onexit(function() {
    tourObject.set('finished', true);
    if(afterTour){
      afterTour()
    }
  });

  tour.start();
  return tourObject;
};

export default Ember.Mixin.create({
  beginTour: (function(){
    var afterTour = this.get('controller.callbacks'),
      model = this.get('controller.tour');

    if(model){
      var tourStops = model.get('tourStops'),
        tour = startTour(tourStops, model, afterTour);
      this.set('activeTour', tour);
    }
  }).observes('controller.tour'),
  exitTour: (function(){
    if(this.get('activeTour.finished')){
      this.set('controller.tour', null);
      this.set('activeTour', null);
    }
  }).observes('activeTour.finished')

});
