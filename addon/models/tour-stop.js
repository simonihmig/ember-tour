import DS from 'ember-data';

export default DS.Model.extend({
  intro: DS.attr('string'),
  step: DS.attr('number'),
  tooltipClass: DS.attr('string'),
  highlightClass: DS.attr('string'),
  position: DS.attr('string'),
  element: DS.attr('string'),
  targetRoute: DS.attr('string'),
  active: false
});
