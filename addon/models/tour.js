import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  nextLabel: DS.attr('string'),
  prevLabel: DS.attr('string'),
  skipLabel: DS.attr('string'),
  doneLabel: DS.attr('string'),
  tooltipPosition: DS.attr('string'),
  tooltipClass: DS.attr('string'),
  highlightClass: DS.attr('string'),
  overlayOpacity: DS.attr('number'),
  exitOnEsc: DS.attr('boolean', {defaultValue: true}),
  exitOnOverlayClick: DS.attr('boolean', {defaultValue: true}),
  showStepNumbers: DS.attr('boolean', {defaultValue: true}),
  keyboardNavigation: DS.attr('boolean', {defaultValue: true}),
  showButtons: DS.attr('boolean', {defaultValue: true}),
  showBullets: DS.attr('boolean', {defaultValue: true}),
  showProgress: DS.attr('boolean', {defaultValue: true}),
  scrollToElement: DS.attr('boolean', {defaultValue: true}),
  disableInteraction: DS.attr('boolean'),
  tourStops: DS.hasMany('tourStop')
});
