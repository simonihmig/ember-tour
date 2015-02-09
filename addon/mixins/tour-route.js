import Ember from 'ember';

export default Ember.Mixin.create({
  _actions: {
    startTour: function(id, startingStep, callbacks) {
      var controller = this.controllerFor("application");
      this.store.find('tour', id).then(function(tour){
        var firstTourStep = startingStep || 0;
        controller.setProperties({
          tour: tour,
          tourCallbacks: callbacks,
          tourStarted: true,
          firstTourStep: firstTourStep
        });
      });
    }
  }
});
