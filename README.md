# Ember Tour

Ember tour is an addon for site tours. You can set default tours, trigger tours from controllers, move between routes 
without leaving the tour, and load tours from a server.

## Getting started

* `npm install ember-tour --save-dev`
* `bower install`

This will include two components and two models in your application.
* Components: `ember-tour` and `tour-stop`
* Models: `tour` and `tour-stop`

## Structuring your tour

Tours are comprised of a `tour`, which has many `tour-stops`. You can load them from a database with your default
adapter, or from json by using fixtures.

`tours`
* `name` : Required. The name of the tour
* `spotlight` : If set to true, the background will be greyed out with a spotlight effect over the target element.
Default true
* showStepNumbers: If set to true, the number of the current stop will be shown in the top corner. Default true
showBullets: If set to true, navigation bullets will appear below the tour text. Default true
scrollToElement: If set to true, tour will scroll to target elements that are outside the viewport

`tourStop`
* `intro` The explanatory text for the stop
* `step` The sorting property for the tour (where it falls in the tour). Does not need to be incremental.  
* `position` Position of the explanatory popover relative to the target element. Options are 'top', 'bottom', 'left',
'right', and 'floating'
* `element` The selector of the target element
* `targetRoute` The Ember route that the target element appears in

## Include the tour components

```
// application.hbs

...

{{ember-tour started=tourStarted model=tour}}

...
```

You can also include the application route mixin to facilitate loading of tours

```
// routes/application.js
...
import TourRouteMixin from 'app/mixins/tour-route'
 
export default Ember.Route.extend(TourRouteMixin, function(){} 
...
```

## Starting a tour
The tour will start by setting a `model` on the `ember-tour` component, and `started` to `true`. This is handled for 
you if you are using the mixin.

The mixin includes an action `startTour` which will contextually select a tour or take one as an argument. Without an
argument, it will search up the route tree for a tour, defaulting to `application`

For example, if you are on `/users/:user/posts/:post/comments.index` and call `startTour`, it will look for a tour named

`/users/user/posts/post/comments.index`
then
`/users/user/posts/post/comments`
then
`/users/user/posts/post`

and so on up the tree. The default tour name is `application`.

## To do
* Take out bootstrap and fontawesome dependencies
* Make a json adapter well suited for tours
* Add more functionality for dismissing via overlay etc.

## Acknowledgements

Ember Tour started life as a fork of [intro.js](http://usablica.github.io/intro.js/)
