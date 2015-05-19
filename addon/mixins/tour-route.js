import Ember from 'ember';

export default Ember.Mixin.create({
  findRouteTourInTours: function(tours, route) {
    var controller = this.controllerFor("application");
    var searchedRoute = route || controller.get('currentRouteName');
    var tour = tours.findBy('name', searchedRoute);
    if (Ember.isBlank(tour)) {
      var nextRoute = searchedRoute.split('.').slice(0, -1).join('.');
      if (Ember.isBlank(nextRoute)) {
        return null;
      } else {
        return this.findRouteTourInTours(tours, nextRoute);
      }
    } else {
      return tour;
    }
  },

  _actions: {
    startTour: function(name, startingStep) {
      var route = this;
      var controller = this.get('controller');
      var firstTourStep = startingStep || 0;
      var tourName = name || controller.get('activeContextTour') || 'application';

      this.store.find('tour').then(function(tours) {
        var tour;
        if (tourName) {
          tour = tours.findBy('name', tourName);
        } else {
          tour = route.findRouteTourInTours(tours) || tours.findBy('name', 'application');
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
