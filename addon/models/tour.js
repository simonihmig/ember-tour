import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  spotlight: DS.attr('boolean', {defaultValue: true}),
  showStepNumbers: DS.attr('boolean', {defaultValue: true}),
  showBullets: DS.attr('boolean', {defaultValue: true}),
  scrollToElement: DS.attr('boolean', {defaultValue: true}),
  tourStops: DS.hasMany('tourStop')
  //exitOnOverlayClick: DS.attr('boolean', {defaultValue: true}),
  //disableInteraction: DS.attr('boolean'),
});
