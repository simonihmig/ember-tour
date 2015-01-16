import Ember from 'ember';

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

export function startTour(steps, options, afterTour) {
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


