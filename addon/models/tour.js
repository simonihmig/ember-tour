import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  overlayOpacity: DS.attr('number'),
  exitOnEsc: DS.attr('boolean', {defaultValue: true}),
  spotlight: DS.attr('boolean', {defaultValue: true}),
  exitOnOverlayClick: DS.attr('boolean', {defaultValue: true}),
  showStepNumbers: DS.attr('boolean', {defaultValue: true}),
  keyboardNavigation: DS.attr('boolean', {defaultValue: true}),
  showButtons: DS.attr('boolean', {defaultValue: true}),
  showNumber: DS.attr('boolean', {defaultValue: true}),
  showBullets: DS.attr('boolean', {defaultValue: true}),
  showProgress: DS.attr('boolean', {defaultValue: true}),
  scrollToElement: DS.attr('boolean', {defaultValue: true}),
  disableInteraction: DS.attr('boolean'),
  tourStops: DS.hasMany('tourStop')
});
