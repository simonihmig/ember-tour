import Ember from 'ember';

export default Ember.Mixin.create({
  _actions: {
    startTour: function(id, callbacks) {
      var controller = this.controllerFor("application");
      this.store.find('tour', id).then(function(tour){
        controller.setProperties({
          tour: tour,
          tourCallbacks: callbacks
        });
      });
    }
  }
});
