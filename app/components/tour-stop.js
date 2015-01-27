import Ember from 'ember';

export default Ember.Component.extend({

  active: Ember.computed.alias('model.active'),
  targetElement: Ember.computed('model.element', 'active',
    function(){
      var elementName = this.get('model.element') || 'body';
      return $(elementName)[0];
    }
  ),

  setActive: (function () {
    if (this.get('active')) {
      this.set('tourHelperLayerCss', this.get('helperLayerCss'));
      this.get('targetElement').focus();
    }
  }
  ).observes('active','helperLayerCss', 'targetElement'),

  /**
   * The target element's position on the page
   *
   * @property targetOffset
   */
  targetOffset: Ember.computed('targetElement', 'windowHeight', 'windowWidth', 'scrollTop',
    function () {
      var element = this.get('targetElement'),
        position;
      if(element){
        position = element.getBoundingClientRect();

        position.width = element.offsetWidth;
        position.height = element.offsetHeight;
      }
      return position || 0;
    }
  ),

  calculateTooltipOffset: (function(){
    Ember.run.scheduleOnce('afterRender', this, function(){
      var tooltip = this.$('.introjs-tooltip')[0];
      if(tooltip){
        var offset = tooltip.getBoundingClientRect();
        offset.width = tooltip.offsetWidth;
        offset.height = tooltip.offsetHeight;
        this.set('tooltipOffset', offset);
      }
    });
  }
  ).observes('windowHeight', 'windowWidth', 'scrollTop', 'active'),

  tooltipOffset: null,

  /**
   * Render tooltip box in the page
   *
   * @api private
   * @method _placeTooltip
   * @param {Object} targetElement
   * @param {Object} tooltipLayer
   * @param {Object} arrowLayer
   */

  tooltipCss: Ember.computed('calculatedPosition', 'targetOffset', 'tooltipLayer', 'active', 'tooltipOffset', 'scrollTop',
    function () {
      var css="";

      var tooltipPosition = this.get('calculatedPosition');
      var targetOffset = this.get('targetOffset');
      var windowHeight = this.get('windowHeight');
      var tooltipOffset = this.get('tooltipOffset');

      if(tooltipOffset) {
        var tooltipHeight = tooltipOffset.height;
        switch (tooltipPosition) {
          case 'top':
            css = 'left:' + '15px;' + 'top:-' + (tooltipHeight + 10) + 'px;';
            break;
          case 'right':
            var left = 'left:' + (targetOffset.width + 20) + 'px;';
            if (targetOffset.top + tooltipHeight > windowHeight) {
              // In this case, right would have fallen below the bottom of the screen.
              // Modify so that the bottom of the tooltip connects with the target
              css = left + 'top:-' + (tooltipHeight - targetOffset.height - 20) + "px;";
            } else {
              css = left;
            }
            break;
          case 'left':
            var right = 'right:' + (targetOffset.width + 20) + 'px;';
            if (targetOffset.top + tooltipHeight > windowHeight) {
              // In this case, left would have fallen below the bottom of the screen.
              // Modify so that the bottom of the tooltip connects with the target
              css = "top:-" + (tooltipHeight - targetOffset.height - 20) + "px;";
            } else if (this.get('showStepNumbers') === true) {
              css = right + 'top:15px;';
            } else {
              css = right;
            }

            break;
          case 'floating':

            //we have to adjust the top and left of layer manually for intro items without element
            css = 'left:50%;top:50%;margin-left:-' + (tooltipOffset.width / 2) + 'px;margin-top:-' + (tooltipOffset.height / 2) + 'px;';
            break;
          // Bottom going to follow the default behavior
          default:
            css = 'bottom:-' + (tooltipOffset.height + 10) + 'px;left:' + (targetOffset.width / 2 - tooltipOffset.width / 2) + 'px;';
            break;
        }
      }
      return css;
    }
  ),

  right: Ember.computed.equal('calculatedPosition','right'),
  left: Ember.computed.equal('calculatedPosition','left'),
  bottom: Ember.computed.equal('calculatedPosition','bottom'),
  top: Ember.computed.equal('calculatedPosition','top'),


  /**
   * Determines the position of the tooltip based on the position precedence and availability
   * of screen space.
   *
   * @param {Object} targetElement
   * @param {Object} tooltipLayer
   * @param {Object} desiredTooltipPosition
   *
   */
  calculatedPosition: Ember.computed('tooltipOffset', 'targetOffset', 'windowWidth', 'windowHeight', 'scrollTop',
    function () {

      var tooltipOffset = this.get('tooltipOffset');

      // Take a clone of position precedence. These will be the available
      var possiblePositions = ["bottom", "top", "right", "left"];
      var windowHeight = this.get('windowHeight');
      var windowWidth = this.get('windowWidth');
      var targetOffset = this.get('targetOffset');
      var desiredTooltipPosition = this.get('model.position');
      var tooltipHeight, tooltipWidth;

      if(tooltipOffset){
        tooltipHeight = tooltipOffset.height;
        tooltipWidth = tooltipOffset.width;
      } else {
        tooltipHeight = windowHeight + 10;
        tooltipWidth = windowWidth + 20;
      }

      // If we check all the possible areas, and there are no valid places for the tooltip, the element
      // must take up most of the screen real estate. Show the tooltip floating in the middle of the screen.
      var calculatedPosition = "floating";

      // Check if the width of the tooltip + the starting point would spill off the right side of the screen
      // If no, neither bottom or top are valid

      if (targetOffset.left + tooltipWidth > windowWidth || ((targetOffset.left + (targetOffset.width / 2)) - tooltipWidth) < 0) {
        possiblePositions.removeObjects(['bottom', 'top']);
      } else {
        // Check for space below
        if ((targetOffset.height + targetOffset.top + tooltipHeight) > windowHeight) {
          possiblePositions.removeObject("bottom");
        }

        // Check for space above
        if (targetOffset.top - tooltipHeight < 0) {
          possiblePositions.removeObject('top');
        }
      }

      // Check for space to the right
      if (targetOffset.width + targetOffset.left + tooltipWidth > windowWidth) {
        possiblePositions.removeObject("right");
      }

      // Check for space to the left
      if (targetOffset.left - tooltipWidth < 0) {
        possiblePositions.removeObject("left");
      }

      // At this point, our array only has positions that are valid. Pick the first one, as it remains in order
      if (possiblePositions.length > 0) {
        calculatedPosition = possiblePositions[0];
      }

      // If the requested position is in the list, replace our calculated choice with that
      if (desiredTooltipPosition && desiredTooltipPosition !== "auto") {
        if (possiblePositions.indexOf(desiredTooltipPosition) > -1) {
          calculatedPosition = desiredTooltipPosition;
        }
      }

      return calculatedPosition;
    }
  ),

  scrollToElement: (function () {
    var offset = this.get('targetOffset');

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
  }).observes('active', 'targetOffset'),

  /**
   * @method inViewport
   * @param {Object} el
   */

  inViewport: Ember.computed('active',
    function() {
      var offset = this.get('targetOffset');

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
  helperLayerCss: Ember.computed('targetOffset', 'active',
    function(){
      var elementPosition = this.get('targetOffset'),
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
  )

});
