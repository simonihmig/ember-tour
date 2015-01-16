/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-tour',
  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/intro.js/intro.js');
  }
};
