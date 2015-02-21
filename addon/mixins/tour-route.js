import Ember from 'ember';

export default Ember.Mixin.create({
  _actions: {
    startTour: function(name, startingStep) {
      var route = this;
      var controller = this.controllerFor("application");
      var firstTourStep = startingStep || 0;
      var tourName = name || controller.get('activeContextTour') || 'first_tour';

      this.store.find('tour').then(function(tours) {
        var tour;
        if (tourName) {
          tour = tours.findBy('name', tourName);
        } else {
          tour = route.findRouteTourInTours(tours) || tours.findBy('name', 'first_tour');
        }
        if (!Ember.isBlank(tour)) {
          return controller.setProperties({
            tour: tour,
            tourStarted: true,
            firstTourStep: firstTourStep
          });
        }
      });
    }
  }
});
