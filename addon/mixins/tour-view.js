import Ember from 'ember';
import {startTour} from 'ember-tour/utils/intro';

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
