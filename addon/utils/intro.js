import Ember from 'ember';

export function tour(steps, options, callbacks) {
  var tour = window.introJs();
  var tourObject = Ember.Object.create({tour: tour});
  if(typeof options == 'object') {
    var optionData = options.get('data') || options;
  }
  var stepData = steps.map(function(tourStop){
    return tourStop.get('data') || tourStop;
  });
  tour.setOptions(options);
  tour.setOptions({steps: stepData});
  tour.onexit(function() {
    tourObject.set('finished', true)
  });
  return tourObject;
}
