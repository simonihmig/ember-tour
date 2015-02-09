import Ember from 'ember';

export default Ember.Component.extend({

  active: Ember.computed.alias('model.active'),
  targetElement: Ember.computed('model.element', 'active',
    function(){
      var elementName = this.get('model.element');
      return $(elementName)[0] || $('body')[0];
    }
  ),

  setActive: (function () {
    if (this.get('active')) {
      this.set('spotlightCSS', this.get('helperLayerCss'));
      this.get('targetElement').focus();
    }
  }
  ).observes('active','helperLayerCss', 'targetElement'),

  /**
   * The target element's position on the page
   *
   * @property targetElementPosition
   */
  targetElementPosition: Ember.computed('targetElement', 'windowHeight', 'windowWidth', 'scrollTop',
    function () {
      var elt = this.get('targetElement');
      var position = elt.getBoundingClientRect();

      if(!(position.bottom + position.height + position.left + position.right + position.top + position.width > 0)){
        position = $('body')[0].getBoundingClientRect();
      }

      return position;
    }
  ),

  /**
   * Sets the tooltip position in relation to the target element.
   *
   * @function calculateTooltipOffset
   */

  calculateTooltipOffset: (function(){
    Ember.run.scheduleOnce('afterRender', this, function(){
      var tooltip = this.$('.tour-tooltip')[0],
        offset;
      if(tooltip){
        offset = tooltip.getBoundingClientRect();
      } else {
        offset = {
          height: this.get('windowHeight') + 10,
          width: this.get('windowWidth') + 20
        }
      }
      this.set('tooltipOffset', offset);
    });
  }
  ).observes('windowHeight', 'windowWidth', 'scrollTop', 'active').on('didInsertElement'),

  tooltipOffset: {},

  tooltipCSS: Ember.computed('calculatedPosition',
    function(){
      var position = this.get('calculatedPosition');
      return this.get(position + 'CSS')
    }
  ),

  calculatedPosition: Ember.computed('model.position', 'topAvailable', 'bottomAvailable', 'leftAvailable', 'rightAvailable',
    function(){
      var desiredPosition = this.get('model.position');
      var position;
      var availablePositions = [
        {position: 'top', available: this.get('topAvailable')},
        {position: 'bottom', available: this.get('bottomAvailable')},
        {position: 'left', available: this.get('leftAvailable')},
        {position: 'right', available: this.get('rightAvailable')}
      ];
      if(this.get(desiredPosition + 'Available')){
        position = desiredPosition;
      } else if(availablePositions.findBy('available')) {
        var availablePosition = availablePositions.findBy('available');
        position = availablePosition['position'];
      } else {
        position = 'floating';
      }
      return position;
    }
  ),

  right: Ember.computed.equal('calculatedPosition','right'),
  left: Ember.computed.equal('calculatedPosition','left'),
  bottom: Ember.computed.equal('calculatedPosition','bottom'),
  top: Ember.computed.equal('calculatedPosition','top'),

  centeredCSS: Ember.computed('targetElementPosition', 'tooltipOffset',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipOffset = this.get('tooltipOffset');
      return 'left:' + (targetElementPosition.width / 2 - tooltipOffset.width / 2) + 'px;';
    }
  ),


  floatingCSS: Ember.computed('tooltipOffset',
    function(){
      var tooltipOffset = this.get('tooltipOffset');
      if(!tooltipOffset){return ''}
      return 'left:50%;top:50%;margin-left:-' + (tooltipOffset.width / 2) + 'px;margin-top:-' + (tooltipOffset.height / 2) + 'px;';
    }
  ),

  bottomCSS: Ember.computed('tooltipOffset', function(){
    var tooltipHeight = this.get('tooltipOffset.height');
    return this.get('centeredCSS') + 'bottom:-' + (tooltipHeight + 10) + 'px;'
  }),

  topCSS: Ember.computed('tooltipOffset', function(){
    var tooltipHeight = this.get('tooltipOffset.height');
    return this.get('centeredCSS') + 'top:-' + (tooltipHeight + 10) + 'px;';
  }),

  rightCSS: Ember.computed('targetElementPosition', 'tooltipOffset', 'windowHeight',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipHeight = this.get('tooltipOffset.height');
      var windowHeight = this.get('windowHeight');
      var left = 'left:' + (targetElementPosition.width + 20) + 'px;';

      if (targetElementPosition.top + tooltipHeight > windowHeight) {
        // In this case, right would have fallen below the bottom of the screen.
        return left + 'top:' + this.get('respondingTop') + "px;";
      } else {
        return left;
      }
    }
  ),

  leftCSS: Ember.computed('targetElementPosition', 'tooltipOffset', 'windowHeight',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipHeight = this.get('tooltipOffset.height');
      var windowHeight = this.get('windowHeight');

      var right = 'right:' + (targetElementPosition.width + 20) + 'px;';
      if (targetElementPosition.top + tooltipHeight > windowHeight) {
        // In this case, left would have fallen below the bottom of the screen.

        return right + "top:" + this.get('respondingTop') + "px;";
      } else {
        return right;
      }
    }
  ),

  respondingTop: Ember.computed('targetElementPosition', 'tootipOffset', 'windowHeight',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipHeight = this.get('tooltipOffset.height');
      var windowHeight = this.get('windowHeight');
      // Modify so that the tooltip stays in view until the element is off screen
      var alignedWithWindow = windowHeight - (targetElementPosition.top + tooltipHeight);
      var alignedWithEltBottom = (targetElementPosition.height - tooltipHeight);

      // align with window as long as element is still on screen, else align with bottom of element
      return Math.max(alignedWithWindow, alignedWithEltBottom);
    }
  ),

  positionAvailaible: function(position){
    return this.get(position + 'Available');
  },

  topAvailable: Ember.computed('tooltipOffset', 'targetElementPosition',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipOffset = this.get('tooltipOffset');
      return targetElementPosition.top > tooltipOffset.height;
    }
  ),

  bottomAvailable: Ember.computed('tooltipOffset', 'targetElementPosition', 'windowHeight',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipOffset = this.get('tooltipOffset');
      var windowHeight = this.get('windowHeight');
      return (targetElementPosition.height + targetElementPosition.top + tooltipOffset.height) < windowHeight;
    }
  ),

  leftAvailable: Ember.computed('tooltipOffset', 'targetElementPosition',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipOffset = this.get('tooltipOffset');
      return targetElementPosition.left > tooltipOffset.width;
    }
  ),

  rightAvailable: Ember.computed('tooltipOffset', 'targetElementPosition', 'windowWidth',
    function(){
      var targetElementPosition = this.get('targetElementPosition');
      var tooltipOffset = this.get('tooltipOffset');
      var windowWidth = this.get('windowWidth');
      return targetElementPosition.width + targetElementPosition.left + tooltipOffset.width < windowWidth;
    }
  ),

  scrollToElement: (function () {
    var offset = this.get('targetElementPosition');

    if (offset && this.get('active') && !this.get('inViewport') && this.get('options.scrollToElement') === true) {
      var winHeight = Ember.$(window).height(),
        top = offset.bottom - (offset.bottom - offset.top),
        bottom = offset.bottom - winHeight;

      //Scroll up
      if (top < 0 || offset.height > winHeight) {
        window.scrollBy(0, top - 30); // 30px padding from edge to look nice

        //Scroll down
      } else {
        window.scrollBy(0, bottom + 100); // 70px + 30px padding from edge to look nice
      }
    }
  }).observes('active').on('init'),

  /**
   * @method inViewport
   * @param {Object} el
   */

  inViewport: Ember.computed('active',
    function() {
      var offset = this.get('targetElementPosition');

      return (
      offset.top >= 0 &&
      offset.left >= 0 &&
      (offset.bottom + 80) <= window.innerHeight && // add 80 to get the text right
      offset.right <= window.innerWidth
      );
    }
  ),

  /**
   * Update the position of the helper layer on the screen
   *
   * @api private
   * @method _setHelperLayerPosition
   * @param {Object} helperLayer
   */
  helperLayerCss: Ember.computed('targetElementPosition', 'active',
    function(){
      var elementPosition = this.get('targetElementPosition'),
        widthHeightPadding = 10;

      if (this.get('model.position') === 'floating') {
        widthHeightPadding = 0;
      }

      //set new position to helper layer
      if(elementPosition) {
        return 'width: ' + (elementPosition.width + widthHeightPadding) + 'px; ' +
          'height:' + (elementPosition.height + widthHeightPadding) + 'px; ' +
          'top:' + (elementPosition.top - 5) + 'px;' +
          'left: ' + (elementPosition.left - 5) + 'px;';
      } else {
        return 'top:50%;left:50%';
      }
    }
  ),

  actions: {
    exitTour: function(){
      this.get('parentView').exitTour();
    }
  }

});
