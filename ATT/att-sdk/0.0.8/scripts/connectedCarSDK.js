angular.module('connectedCarSDK', ['connectedCarSDK.attAlert','connectedCarSDK.attBadge','connectedCarSDK.attButtons','connectedCarSDK.attCarousel','connectedCarSDK.attCheckbox','connectedCarSDK.attContent','connectedCarSDK.attDrawer','connectedCarSDK.attDropdown','connectedCarSDK.attFooter','connectedCarSDK.attHeader','connectedCarSDK.attInput','connectedCarSDK.attListView','connectedCarSDK.attLoader','connectedCarSDK.attMediaPlayer','connectedCarSDK.attMenu','connectedCarSDK.attModal','connectedCarSDK.attPinPad','connectedCarSDK.attProgressBar','connectedCarSDK.attRadio','connectedCarSDK.attSimError','connectedCarSDK.attSlider','connectedCarSDK.attTab','connectedCarSDK.attTabset','connectedCarSDK.attToggleSwitch','connectedCarSDK.attVehicleInMotion','connectedCarSDK.transition']);'use strict';

angular.module('connectedCarSDK.transition', [])
  /**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function ($q, $timeout, $rootScope) {

    var $transition = function (element, trigger, options) {
        options = options || {};
        var deferred = $q.defer();
        var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

        var transitionEndHandler = function () {
            $rootScope.$apply(function () {
                element.unbind(endEventName, transitionEndHandler);
                deferred.resolve(element);
            });
        };

        if (endEventName) {
            element.bind(endEventName, transitionEndHandler);
        }

        // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
        $timeout(function () {
            if (angular.isString(trigger)) {
                element.addClass(trigger);
            } else if (angular.isFunction(trigger)) {
                trigger(element);
            } else if (angular.isObject(trigger)) {
                element.css(trigger);
            }
            //If browser does not support transitions, instantly resolve
            if (!endEventName) {
                deferred.resolve(element);
            }
        });

        // Add our custom cancel function to the promise that is returned
        // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
        // i.e. it will therefore never raise a transitionEnd event for that transition
        deferred.promise.cancel = function () {
            if (endEventName) {
                element.unbind(endEventName, transitionEndHandler);
            }
            deferred.reject('Transition cancelled');
        };

        return deferred.promise;
    };

    // Work out the name of the transitionEnd event
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
    };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
    };
    function findEndEventName(endEventNames) {
        for (var name in endEventNames) {
            if (transElement.style[name] !== undefined) {
                return endEventNames[name];
            }
        }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
}]);
'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdk.alert.directive:attAlert
 * @description
 * # attAlert
 */
angular.module('connectedCarSDK.attAlert', [])
     .constant('alertConfig', {
         type: 'info',
         max: 100,
         min: 0
     })
    .factory('alertProvider', ['$timeout', 'alertConfig', function ($timeout, alertConfig) {
        return {
            alerts: [],
            timeoutPromise: null,

            addAlert: function (scope) {

                scope.alert = {
                    type: angular.isDefined(scope.type) ? scope.type : alertConfig.type,
                    onClose: angular.isDefined(scope.onClose) ? scope.onClose : null,
                    onClick: angular.isDefined(scope.onClick) ? scope.onClick : null,
                    showIcon: angular.isDefined(scope.showIcon) ? scope.showIcon : false,
                    showConfirmationBtn: angular.isDefined(scope.showConfirmationBtn) ? scope.showConfirmationBtn : false,
                    buttonText: angular.isDefined(scope.buttonText) ? scope.buttonText : '',
                    autoCloseInterval: angular.isDefined(scope.autoCloseInterval) ? scope.autoCloseInterval : null,
                    title: angular.isDefined(scope.title) ? scope.title : ''
                };

                if (this.alerts.length === 0)
                    scope.alert.isActive = true;

                this.alerts.push(scope.alert);
            },

            removeActiveAlert: function () {

                this.alerts[0].isActive = false;
                this.alerts.splice(0, 1);

                if (this.alerts.length > 0)
                    this.alerts[0].isActive = true;
            },

            closeAlert: function() {
                
                    if (this.timeoutPromise)
                        $timeout.cancel(this.timeoutPromise);

                    this.alerts[0].onClose();
                    this.removeActiveAlert();
                

                this.handleAutoClose();
            },

            handleAutoClose: function() {
                if (this.alerts[0] && this.alerts[0].autoCloseInterval && parseInt(this.alerts[0].autoCloseInterval) > 0) {
                    var that = this;
                    this.timeoutPromise = $timeout(function() {
                        that.closeAlert();
                    }, this.alerts[0].autoCloseInterval);
                }
            }
        };
    }])
    .factory('$alert', ['$rootScope', '$compile', '$document', function ($rootScope, $compile, $document) {

        return {
            
            show: function(options) {
                var angularDomEl = angular.element('<att-alert on-close="onClose()" on-click="onClick()">' + options.text + '</att-alert>');
                angularDomEl.attr({
                    'type': options.type,
                    'title': options.title,
                    'show-icon': options.showIcon,
                    'show-confirmation-btn': options.showConfirmationBtn,
                    'button-text': options.buttonText,
                    'auto-close-interval': options.autoCloseInterval ? options.autoCloseInterval : null
                });

                var alertScope = $rootScope.$new(false);
                alertScope.onClose = options.onClose ? options.onClose : null;
                alertScope.onClick = options.onClick ? options.onClick : null;
                
                var alertDomEl = $compile(angularDomEl)(alertScope);
                $document.find('body').eq(0).append(alertDomEl);
            },

            info: function(options) {
                options.type = 'info';
                this.show(options);
            },

            success: function(options) {
                options.type = 'success';
                this.show(options);
            },

            danger: function(options) {
                options.type = 'danger';
                this.show(options);
            }

        };
    }])
    .directive('attAlert', [
         'alertProvider', '$animate', function (alertProvider, $animate) {
             return {
                 restrict: 'AE',
                 templateUrl: 'templates/attAlert.html',
                 replace: true,
                 transclude: true,
                 scope: {
                     type: '@',
                     showIcon: '=',
                     showConfirmationBtn: '=',
                     buttonText: '@',
                     onClick: '&',  // click on confirmation button
                     onClose: '&',
                     autoCloseInterval: '=',
                     title: '@',
                     text: '@'
                 },
                 link: function (scope, element) {
                     $animate.enabled(element, false);

                     alertProvider.addAlert(scope);


                     if (scope.alert.isActive)
                         alertProvider.handleAutoClose();

                     scope.close = function () {
                         // if there is no confirmation button
                         // tapping anywhere on the alert will close the alert
                         // otherwise, you must dismiss the alert by clicking
                         // on the confirmation button
                         if (!scope.showConfirmationBtn) {
                             alertProvider.closeAlert();
                         }
                     };

                     scope.btnClick = function() {
                         scope.onClick();
                         alertProvider.closeAlert();
                     };

                     scope.$on('$destroy', function () {
                         if (scope.alert.isActive)
                             alertProvider.closeAlert();
                     });

                 }
             };

         }
    ]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.badge.directive:attbadge
 * @description
 * # attBadge
 */
angular.module('connectedCarSDK.attBadge', [])
  .directive('attBadge', function () {
      return {
          templateUrl: 'templates/attBadge.html',
          restrict: 'E',
          replace: true,
          scope: {
              value: '@',
              badgeType: '@'
          },
          link: function () {
              // Implement logic here..
          }
      };
  });

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.buttons.directive:attBtnRadio, attBtnCheckbox
 * @description
 * # attButtons
 */
angular.module('connectedCarSDK.attButtons', [])
  .constant('buttonConfig', {
      activeClass: 'active',
      toggleEvent: 'click'
  })

.controller('ButtonsController', ['buttonConfig', function (buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('attBtnRadio', function () {
    return {
        require: ['attBtnRadio', 'ngModel'],
        controller: 'ButtonsController',
        link: function (scope, element, attrs, ctrls) {
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

            //model -> UI
            ngModelCtrl.$render = function () {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.attBtnRadio)));
            };

            //ui->model
            element.bind(buttonsCtrl.toggleEvent, function () {
                var isActive = element.hasClass(buttonsCtrl.activeClass);

                if (!isActive || angular.isDefined(attrs.uncheckable)) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.attBtnRadio));
                        ngModelCtrl.$render();
                    });
                }
            });
        }
    };
})

.directive('attBtnCheckbox', function () {
    return {
        require: ['attBtnCheckbox', 'ngModel'],
        controller: 'ButtonsController',
        link: function (scope, element, attrs, ctrls) {
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

            function getTrueValue() {
                return getCheckboxValue(attrs.attBtnCheckboxTrue, true);
            }

            function getFalseValue() {
                return getCheckboxValue(attrs.attBtnCheckboxFalse, false);
            }

            function getCheckboxValue(attributeValue, defaultValue) {
                var val = scope.$eval(attributeValue);
                return angular.isDefined(val) ? val : defaultValue;
            }

            //model -> UI
            ngModelCtrl.$render = function () {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
            };

            //ui->model
            element.bind(buttonsCtrl.toggleEvent, function () {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                    ngModelCtrl.$render();
                });
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.carousel.directive:attCarousel
 * @description
 * # attcarousel
 */
angular.module('connectedCarSDK.attCarousel', ['connectedCarSDK.transition'])
.controller('CarouselController', ['$scope', '$timeout', '$transition', '$animate', function ($scope, $timeout, $transition, $animate) {
      $animate.enabled(false);
      var self = this,
        slides = self.slides = $scope.slides = [],
        currentIndex = -1,
        currentTimeout, isPlaying;
      self.currentSlide = null;

      var destroyed = false;
      /* direction: "prev" or "next" */
      self.select = $scope.select = function (nextSlide, direction) {
          var nextIndex = slides.indexOf(nextSlide);
          //Decide direction if it's not given
          if (direction === undefined) {
              direction = nextIndex > currentIndex ? 'next' : 'prev';
          }
          if (nextSlide && nextSlide !== self.currentSlide) {
              if ($scope.$currentTransition) {
                  $scope.$currentTransition.cancel();
                  //Timeout so ng-class in template has time to fix classes for finished slide
                  $timeout(goNext);
              } else {
                  goNext();
              }
          }
          function goNext() {
              // Scope has been destroyed, stop here.
              if (destroyed) { return; }
              //If we have a slide to transition from and we have a transition type and we're allowed, go
              if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
                  //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
                  nextSlide.$element.addClass(direction);
                 // nextSlide.$element[0].offsetWidth = nextSlide.$element[0].offsetWidth; //force reflow hack
                  nextSlide.$element[0].offsetWidth; //force reflow hack that doesn't break in firefox

                  //Set all other slides to stop doing their stuff for the new transition
                  angular.forEach(slides, function (slide) {
                      angular.extend(slide, { direction: '', entering: false, leaving: false, active: false });
                  });
                  angular.extend(nextSlide, { direction: direction, active: true, entering: true });
                  angular.extend(self.currentSlide || {}, { direction: direction, leaving: true });

                  $scope.$currentTransition = $transition(nextSlide.$element, {});
                  //We have to create new pointers inside a closure since next & current will change
                  (function (next, current) {
                      $scope.$currentTransition.then(
                        function () { transitionDone(next, current); },
                        function () { transitionDone(next, current); }
                      );
                  }(nextSlide, self.currentSlide));
              } else {
                  transitionDone(nextSlide, self.currentSlide);
              }
              self.currentSlide = nextSlide;
              currentIndex = nextIndex;
              //every time you change slides, reset the timer
              restartTimer();
          }
          function transitionDone(next, current) {
              angular.extend(next, { direction: '', active: true, leaving: false, entering: false });
              angular.extend(current || {}, { direction: '', active: false, leaving: false, entering: false });
              $scope.$currentTransition = null;
          }
      };
      $scope.$on('$destroy', function () {
          destroyed = true;
      });

      /* Allow outside people to call indexOf on slides array */
      self.indexOfSlide = function (slide) {
          return slides.indexOf(slide);
      };

      $scope.next = function () {
          var newIndex = (currentIndex + 1) % slides.length;

          //Prevent this user-triggered transition from occurring if there is already one in progress
          if (!$scope.$currentTransition) {
              return self.select(slides[newIndex], 'next');
          }
      };

      $scope.prev = function () {
          var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

          //Prevent this user-triggered transition from occurring if there is already one in progress
          if (!$scope.$currentTransition) {
              return self.select(slides[newIndex], 'prev');
          }
      };

      $scope.isActive = function (slide) {
          return self.currentSlide === slide;
      };

      $scope.$watch('interval', restartTimer);
      $scope.$on('$destroy', resetTimer);

      function restartTimer() {
          resetTimer();
          var interval = +$scope.interval;
          if (!isNaN(interval) && interval >= 0) {
              currentTimeout = $timeout(timerFn, interval);
          }
      }

      function resetTimer() {
          if (currentTimeout) {
              $timeout.cancel(currentTimeout);
              currentTimeout = null;
          }
      }

      function timerFn() {
          if (isPlaying) {
              $scope.next();
              restartTimer();
          } else {
              $scope.pause();
          }
      }

      $scope.play = function () {
          if (!isPlaying) {
              isPlaying = true;
              restartTimer();
          }
      };
      $scope.pause = function () {
          if (!$scope.noPause) {
              isPlaying = false;
              resetTimer();
          }
      };

      self.addSlide = function (slide, element) {
          slide.$element = element;
          slides.push(slide);
          //if this is the first slide or the slide is set to active, select it
          if (slides.length === 1 || slide.active) {
              self.select(slides[slides.length - 1]);
              if (slides.length === 1) {
                  $scope.play();
              }
          } else {
              slide.active = false;
          }
      };

      self.removeSlide = function (slide) {
          //get the index of the slide inside the carousel
          var index = slides.indexOf(slide);
          slides.splice(index, 1);
          if (slides.length > 0 && slide.active) {
              if (index >= slides.length) {
                  self.select(slides[index - 1]);
              } else {
                  self.select(slides[index]);
              }
          } else if (currentIndex > index) {
              currentIndex--;
          }
      };

  }])
.directive('attCarousel', [function () {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        controller: 'CarouselController',
        require: 'carousel',
        templateUrl: 'templates/carousel/carousel.html',
        scope: {
            interval: '=',
            noTransition: '=',
            noPause: '='
        }
    };
}])
.directive('attSlide', function () {
    return {
        require: '^attCarousel',
        restrict: 'EA',
        transclude: true,
        replace: true,
        templateUrl: 'templates/carousel/slide.html',
        scope: {
            active: '=?'
        },
        link: function (scope, element, attrs, carouselCtrl) {
            carouselCtrl.addSlide(scope, element);
            //when the scope is destroyed then remove the slide from the current slides array
            scope.$on('$destroy', function () {
                carouselCtrl.removeSlide(scope);
            });

            scope.$watch('active', function (active) {
                if (active) {
                    carouselCtrl.select(scope);
                }
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attlistview
 * @description
 * # attlistview
 */
angular.module('connectedCarSDK.attCheckbox', [])
    .directive('attCheckbox', ['$animate', function($animate) {
        return {
            restrict: 'AC',
            require: '?ngModel',
            replace: true,
            link: function (scope, elm, attrs, ngModelCtrl) {

                elm.wrap('<label class="att-checkbox-wrapper"></label>');

                var checkboxIcon = angular.element('<i class="att-checkbox-animation"></i>');

                if(ngModelCtrl.$modelValue){
                    checkboxIcon.addClass('icon-checkbox-checked');
                }
                else{
                    checkboxIcon.addClass('icon-checkbox-unchecked');
                }


                scope.$watch(
                    function(){
                        return ngModelCtrl.$modelValue;
                    }, 
                    function(modelValue){
                        if(modelValue){
                            $animate.removeClass(checkboxIcon, 'icon-checkbox-unchecked');
                            $animate.addClass(checkboxIcon, 'icon-checkbox-checked');
                        }
                        else{                
                            $animate.removeClass(checkboxIcon, 'icon-checkbox-checked');
                            $animate.addClass(checkboxIcon, 'icon-checkbox-unchecked');
                        }     
                    }
                );

                elm.after(checkboxIcon);
                
                
            }
        };
    }])
    .animation('.att-checkbox-animation', ['$animateCss', function($animateCss){
        return {
            addClass: function(element, className){
                var animationRunner = $animateCss(element, {
                  from: {
                    background: 'white'
                  },
                  to: {
                    background: 'transparent'
                  },
                  easing: 'ease-out',
                  duration: .35
                })


                animationRunner
                    .start()
                    .done(function(){
                        element[0].style.removeProperty('background');
                    });
            }
        }
    }]);

'use strict';

angular.module('connectedCarSDK.attContent', [])
  .directive('attContent', [function(){
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: false,
    templateUrl: 'templates/attContent.html',
    link: function(scope, element, attrs){
      attrs.$observe('hasHeader', function(value){
        if(scope.$eval(value)){
          element.addClass('has-header');
        }
        else{
          element.removeClass('has-header');

        }
      });
      attrs.$observe('hasFooter', function(value){
        if(scope.$eval(value)){
          element.addClass('has-footer');
        }
        else{
          element.removeClass('has-footer');
        }
      });

      var backgroundHolder = angular.element('<div id="content-background-image"></div>');

      element.append(backgroundHolder);


      attrs.$observe('backgroundImg', function(value){
        backgroundHolder.css('background', 'url(' + value +') no-repeat center center fixed');
        backgroundHolder.css('-webkit-background-size', 'cover');
        backgroundHolder.css('-moz-background-size', 'cover');
        backgroundHolder.css('-o-background-size', 'cover');
        backgroundHolder.css('background-size', 'cover');

        
      });

      attrs.$observe('blurBackground', function(value){
        if(scope.$eval(value)){
          backgroundHolder.css('-webkit-filter', 'blur(40px)');
          backgroundHolder.css('filter', 'blur(40px)');
          backgroundHolder.css('transition', 'filter 0.2s ease');
          backgroundHolder.css('-webkit-transition', '-webkit-filter 0.2s ease');
        }
        else{
          backgroundHolder.css('-webkit-filter', 'none');
          backgroundHolder.css('filter', 'none');
        }
      });


    }

  };
}]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attdrawer
 * @description
 * # attdrawer
 */
angular.module('connectedCarSDK.attDrawer', [])
    .directive('attDrawer', [
        '$rootScope', function ($rootScope) {
          return {
            restrict: 'E',
            templateUrl: 'templates/attDrawer.html',
            transclude: true,
            scope: {},
            link: function(scope) {

              scope.showDrawer = false;

              scope.closeDrawer = function() {
                scope.showDrawer = false;
              };

              $rootScope.$on('changeDrawer', function(event, args) {
                scope.showDrawer = args[0];
              });
            }
          };
        }
    ]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.dropdown.directive:attDropdown
 * @description
 * # attDropdown
 */
angular.module('connectedCarSDK.attDropdown', [])
    .directive('attDropdown', [
        '$timeout', function($timeout) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: function(tElement, tAttrs) {
                  return tAttrs.templateUrl || 'templates/attDropdown.html';
                },
                require: '^ngModel',
                scope: {
                    ngModel: '=',
                    defaultOption: '@',
                    items: '=',
                    closeButton: '@'
                },
                link: function(scope) {

                    scope.show = false;

                    if (scope.ngModel !== null && scope.ngModel !== undefined) {
                        $timeout(function() {
                            scope.defaultOption = scope.ngModel.text;
                        });
                    }

                    scope.selectItem = function(item) {
                        scope.ngModel = item;
                        scope.defaultOption = scope.ngModel.text;
                        scope.show = false;
                    };
                }
            };
        }
    ]);

'use strict';

angular.module('connectedCarSDK.attFooter', [])
  .directive('attFooter',  function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      templateUrl: 'templates/attFooter.html',
      link: function(scope, element, attrs){

        attrs.$observe('verticalAlignment', function(value){
          if(value){
            scope.alignment = value;
          }
          else{
            scope.alignment = 'center';
          }
        });

        attrs.$observe('isFixed', function(value){

          value = typeof value !== 'undefined' ? value : 'true';
          if(value === 'true'){
            scope.isFixed = 'footer-fixed';
          }
          else{
            scope.isFixed = null;
          }
        });

      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.attHeader.directive:attHeader
 * @description
 * # attHeader
 */
angular.module('connectedCarSDK.attHeader', [])
    .factory('$header', ['$rootScope', '$interval', function($rootScope, $interval) {
        return {
            showBackButton: function(show, callback) {
                var that = this;
                this.backButtonInterval = $interval(function() {
                    $rootScope.$broadcast('showBackButton', [show, callback, function() {
                        $interval.cancel(that.backButtonInterval);
                    }]);
                }, 100);
            }
        };
    }])
    .directive('attHeader', [
        '$rootScope', 'attHeader.viewTypes', '$animate',
        function($rootScope, viewTypes, $animate) {
            return {
                restrict: 'E',
                templateUrl: 'templates/attHeader.html',
                replace: true,
                scope: {
                    appName: '=',
                    appLogo: '@',
                    viewName: '=',
                    viewType: '=',
                    backButtonCallback: '&'
                },
                link: function(scope, element) {
                    $animate.enter(element, element.parent());
                    var tempViewTypeHolder;

                    var type = scope.viewType ? scope.viewType : viewTypes.home;
                    scope.backCallback = scope.backButtonCallback ? scope.backButtonCallback : null;

                    scope.drawerVisible = false;

                    scope.$watch('viewType', function(newValue){
                      type = newValue;
                    });



                    scope.toggleDrawer = function() {
                        scope.drawerVisible = !scope.drawerVisible;

                        $rootScope.drawerVisible = scope.drawerVisible;
                        //We want the app branding to be visible while the drawer is open
                        if (scope.drawerVisible) {
                            tempViewTypeHolder = angular.copy(type);
                            type = viewTypes.home;
                        } else {
                            type = tempViewTypeHolder;
                        }
                        $rootScope.$broadcast('changeDrawer', [scope.drawerVisible]);
                    };

                    //explicitly close the drawer before switching to another view (important)
                    $rootScope.$on('$routeChangeStart', function() {
                        if (scope.drawerVisible) {
                            scope.toggleDrawer();
                        };
                    });

                    scope.isHomeScreen = function() {
                        return type === viewTypes.home;
                    };

                    scope.isPrimaryScreen = function() {
                        return type === viewTypes.primary;
                    };

                    scope.isSecondaryScreen = function() {
                        return type === viewTypes.secondary;
                    };


                    $rootScope.$on('showBackButton', function(event, args) {
                        scope.backButton = args[0];
                        scope.backCallback = args[1];
                        args[2]();
                    });

                }
            };
        }
    ])
    .constant('attHeader.viewTypes', {
        home: 0,
        primary: 1,
        secondary: 2
    })
    .animation('.att-header-animation', ['$animateCss', function($animateCss) {
        return {
            enter: function(element, doneCallback) {
                console.log('enter');
                var runner = $animateCss(element, {
                    from: {
                        '-webkit-transform': 'translate3d(0, -4em, 0)',
                        '-ms-transform': 'translate3d(0, -4em, 0)',
                        'transform': 'translate3d(0, -4em, 0)',
                        opacity: '0'
                    },
                    to: {
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        '-ms-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)',
                        opacity: '1'
                    },
                    duration: .5,
                    easing: 'cubic-bezier(0.010, 0.875, 0.490, 0.990)'

                });

                runner.start().then(function() {
                    element.removeAttr('style');
                    doneCallback();
                });;
            }
        }
    }])
    .animation('.att-header-app-name-animation', ['$animateCss', function($animateCss) {
        return {
            removeClass: function(element, className, doneCallback) {
                var runner = $animateCss(element, {
                    from: {
                        '-webkit-transform': 'translate3d(80%, 0, 0)',
                        '-ms-transform': 'translate3d(80%, 0, 0)',
                        'transform': 'translate3d(80%, 0, 0)',
                        opacity: '0'
                    },
                    to: {
                        '-webkit-transform': 'translate3d(0, 0, 0)',
                        '-ms-transform': 'translate3d(0, 0, 0)',
                        'transform': 'translate3d(0, 0, 0)',
                        opacity: '1'
                    },
                    duration: .4,
                    easing: 'cubic-bezier(0.010, 0.875, 0.490, 0.990)'

                });

                runner.start().then(function() {
                    element.removeAttr('style');
                    doneCallback();
                });;

            }
        }
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attlistview
 * @description
 * # attlistview
 */
angular.module('connectedCarSDK.attInput', [])
    .directive('attInput', ['$timeout', function($timeout) {
        return {
            restrict: 'AC',
            require: '?ngModel',
            replace: true,
            link: function (scope, elm, attrs, ngModelCtrl) {


                elm.wrap('<div class="att-input-field"></div>');
                if(attrs['iconClass']) elm.parent().prepend('<i class="'+ attrs['iconClass'] + '"></i>')

                var aElement;
                aElement = angular.element('<i class="icon-close"></i>');
                var added = false;
                var remove = function(e) {
                    if (added) {
                        aElement.remove();
                        added = false;
                    }
                };
                var add = function(e) {                    
                    if ((!added && (elm.val().length > 0)) || !ngModelCtrl.$valid) {
                        elm.after(aElement);
                        aElement.bind('mousedown', click);
                        added = true;
                    }
                    if (added && elm.val().length === 0 && ngModelCtrl.$valid) {
                        remove();
                    }
                };

                var click = function(e) {
                    e.preventDefault();
                    scope.$apply(function() {  
                        ngModelCtrl.$setViewValue('');                        
                        ngModelCtrl.$render();
                    });
                    elm[0].focus();
                };
                elm.bind('focus input', add);
                elm.bind('blur', remove);
            }
        };
    }]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attlistview
 * @description
 * # attlistview
 */
angular.module('connectedCarSDK.attListView', [])
    .directive('attListView', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/attListView.html',
            replace: true,
            
            scope: {
                items: '=',         // list of objects to bind {text, desc, selected}
                title: '=',         // string
                multiSelect: '='    // true/false
            },
            link: function (scope) {

                scope.onItemClick = function(item) {

                    console.log('Selected item ', item);

                    if (item.selected) {
                        item.selected = false;
                    } else {
                        if (scope.items) {
                            scope.items.forEach(function(i) {
                                if (i === item) {
                                    i.selected = true;
                                } else {
                                    if (scope.multiSelect !== true) {
                                        i.selected = false;
                                    }
                                }
                            });
                        }
                    }
                };

            }
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.loader.directive:attLoader
 * @description
 * # attLoader
 */
angular.module('connectedCarSDK.attLoader', [])
    .factory('$loader', ['$rootScope', '$compile', '$document', '$timeout', function ($rootScope, $compile, $document, $timeout) {

        var getLoaderReference = function (parentElementId) {

            var parent;

            // if a parent DOM element is specified and exist, attach the loader to it; otherwise attach the loader to body
            if(parentElementId) {
                parent = document.getElementById(parentElementId) ? document.getElementById(parentElementId) : $document.find('body')[0] ;
            }
            else{
                parent = $document.find('body')[0];
            }


            //check whether the parent already has a loader attached to it
            var loaderEl = (parent.getElementsByClassName('att-loader'))[0];

            if(loaderEl) {
                //if yes, return that loader
                return loaderEl;
            }
            else{
                //otherwise, compile a new one and return it
                var angularDomEl = angular.element('<att-loader></att-loader>');
                var loaderScope = $rootScope.$new(false);
                loaderEl = $compile(angularDomEl)(loaderScope);
                angular.element(parent).append(loaderEl);
            }

            return loaderEl;
        };

        return {

            show: function (parentElementId) {

                var loader = getLoaderReference(parentElementId);

                // show the loader
                if (loader) {
                    $timeout(function () {
                        var scope = angular.element(loader).scope();
                        scope.forceshow = true;
                    }, 0);
                }
            },

            hide: function() {

                var loader = getLoaderReference();

                // show the loader
                if (loader) {
                    $timeout(function () {
                        var scope = angular.element(loader).scope();
                        scope.forceshow = false;
                    }, 0);
                }
            }

        };
    }])
  .directive('attLoader', ['$http', function ($http) {
      return {
          restrict: 'E',
          replace: true,
          templateUrl: 'templates/attLoader.html',
          link: function (scope) {

              scope.isLoading = function () {
                  return ($http.pendingRequests.length > 0) || scope.forceshow;
              };

              scope.isVisible = false;

              scope.$watch(scope.isLoading, function (v) {
                  if (v) {
                      scope.isVisible = true;
                  } else {
                      scope.isVisible = false;
                  }
              });

          }
      };
  }]);

(function (angular, drive) {
    'use strict';

    /**
     * @ngdoc directive
     * @name connectedCarSDK.directive:attMediaPlayer
     * @description
     * # attMediaPlayer
     */
    angular.module('connectedCarSDK.attMediaPlayer', [])
     .constant('mediaPlayerConfig', {
         type: 'info',
         max: 100,
         min: 0,
         playerCommands: {
             play: 'play',
             stop: 'stop',
             pause: 'pause',
             seek: 'seek',
         }
     })
    .factory('$mediaPlayer', ['$timeout', '$log', 'mediaPlayerConfig', function ($timeout, $log, mediaPlayerConfig) {

        var playerCommands = mediaPlayerConfig.playerCommands;
        var playlist;

        var nowPlaying = {
            track: null,
            progress: {
                min: 0,
                max: 0,
                val: 0,
                elapsedTime: 0,
                remainingTime: 0,
                timeSettingInProgress: false
            },
            trackIndex: null,
            status: null
        };

        var playerOptions = {
            repeat: false,
            shuffle: false,
        };

        activate();

        function activate() {
            subscribeToPlayerChanges();
            subscribeToMetaData();

            currentPlayerStatus(updatePositionIfPlayerIsActive);

            function updatePositionIfPlayerIsActive(player) {
                if (player && (player.status === 'Playing' || player.status === 'Paused')) {
                    getCurrentMedia();
                }
                if (player && player.position) {
                    updateAudioPosition(player.position);
                }
            }
        }

        function setPlaylist(plist) {
            playlist = plist;
        }

        function isPlaylistAvailable() {
            return playlist && playlist.length > 0;
        }

        function play() {
            if (!isPlaylistAvailable()) {
                $log.warn("Playlist is not available, play action ignored");
                return;
            }

            if (nowPlaying.trackIndex == null) {
                nowPlaying.trackIndex = 0;
                var songPath = playlist[nowPlaying.trackIndex].src;

                setCurrentMedia(songPath, callback);
                setPlayerAction(playerCommands.play, null, getCurrentMedia);
            } else {
                setPlayerAction(playerCommands.play, null, getCurrentMedia);
            }


            function callback() {
                $timeout(function () {
                    setPlayerAction(playerCommands.play, null, getCurrentMedia);
                }, 1000);
            }
        }
        function pause(callback) {
            //Passed callback JUST to initiate $timeout, to trigger digest phase to propagate player status up to directive
            setPlayerAction(playerCommands.pause, null, callback);
        }
        function stop() {
            //setPlayerAction(playerCommands.pause, null, seekToTheBeginning);

            //function seekToTheBeginning() {
            //    setPlayerAction(playerCommands.seek, 0);
            //}
            //nowPlaying.progress.val = 0;
            //nowPlaying.progress.elapsedTime = formatTime(0);
            setPlayerAction(playerCommands.stop);
        }
        function next() {
            if (!isPlaylistAvailable()) {
                $log.warn("Playlist is not available, next action ignored");
                return;
            }
            calculateNextSongIndex(false);
            skipTrack();
        }
        function previous() {
            if (!isPlaylistAvailable()) {
                $log.warn("Playlist is not available, previous action ignored");
                return;
            }
            calculateNextSongIndex(true);
            skipTrack();
        }
        function seekToTime(time, callback) {
            setPlayerAction(playerCommands.seek, time, callback);
        }
        function skipTime(time) {
            if (!angular.isNumber(time)) {
                $log.warn("Provided time is not a number - skip time action ignored");
            }

            var seekTime = nowPlaying.progress.val + time;
            if (seekTime < 0) {
                seekTime = 0;
            } else if (seekTime > nowPlaying.progress.max) {
                seekTime = nowPlaying.progress.max;
            }

            setPlayerAction(playerCommands.seek, seekTime);
        }
        function skipTrack() {
            currentPlayerStatus(function (player) {
                var songPath = playlist[nowPlaying.trackIndex].src;
                setCurrentMedia(songPath);

                nowPlaying.progress.val = 0;
                nowPlaying.progress.elapsedTime = formatTime(0);

                console.info("skipTrack status:", player);
                if (player && (player.status === 'Playing' || player.status === 'Playing')) {
                    play();
                }
                else {
                    $timeout(function () {
                        getCurrentMedia();
                    }, 500);
                }
            });
        }

        function calculateNextSongIndex(previousSong) {
            if (!playlist || playlist.length <= 1) {
                // If playlist has <= 1 track, do nothing
                return;
            }

            if (playerOptions.shuffle) {
                var randomIndex = nowPlaying.trackIndex;

                // make sure that random index is different from current index
                while (randomIndex === nowPlaying.trackIndex) {
                    randomIndex = Math.floor((Math.random() * playlist.length) + 0);
                }
                nowPlaying.trackIndex = randomIndex;
            } else {
                if (previousSong) {
                    nowPlaying.trackIndex = (nowPlaying.trackIndex === null || nowPlaying.trackIndex - 1 < 0) ? playlist.length - 1 : nowPlaying.trackIndex - 1;
                } else {
                    nowPlaying.trackIndex = (nowPlaying.trackIndex === null || nowPlaying.trackIndex + 1 >= playlist.length) ? 0 : nowPlaying.trackIndex + 1;
                }
            }
        }

        function updateProgress() {
            nowPlaying.progress.max = nowPlaying.track.duration / 1000;
        }

        //#region DEC methods
        function setPlayerAction(action, position, callback) {
            var player = { "action": action };
            if (action === playerCommands.seek) {
                player.position = position;
            }
            $log.info('player settings: ', player);
            drive.media.player.set(player).then(onSuccessSetAction, onErrorSetAction);

            function onSuccessSetAction(res) {
                $log.info(' drive.media.player.set ' + action + ' success: ', res);
                if (callback) {
                    // There is a delay between setting a source and getting its information. Arbitrarily set to 500ms for now
                    $timeout(function () {
                        callback();
                    }, 500);
                }
            }

            function onErrorSetAction(res) {
                $log.info(' drive.media.player.set ' + action + ' error: ', res);
            }
        }

        function setCurrentMedia(songPath, callback) {
            var currentMedia = { "source": songPath };
            drive.media.currentMedia.set(currentMedia).then(onSuccessSetCurrentMedia, onErrorSetCurrentMedia);

            function onSuccessSetCurrentMedia(res) {
                $log.warn(' drive.media.currentMedia.set success: ', res);
                if (callback) callback();
            }

            function onErrorSetCurrentMedia(res) {
                $log.warn(' drive.media.currentMedia.set error: ', res);
            }
        }

        function getCurrentMedia() {
            /**
            * Returns: 	
                {
                "artist":"Lewis Carroll",
                "duration":"385750",
                "genre":"Books & Spoken",
                "source":"http://etc.usf.edu/lit2go/audio/mp3/alices-adventures-in-wonderland-001-chapter-i-down-the-rabbit-hole.1.mp3",
                "title":"Alice's Adventures in Wonderland ",
                "type":"audio/mpeg","
                art":"http://etc.usf.edu/lit2go/static/thumbnails/books/1.png"
                }
            */
            function logMedia(currentMedia) {
                $log.warn('getCurrentMedia', currentMedia);
                $timeout(function () {
                    setNowPlayingAttributes(currentMedia);
                    updateProgress();
                }, 0);
            }

            function logError(error) {
                $log.warn('getCurrentMedia', error);
            }

            drive.media.currentMedia.get().then(logMedia, logError);
        };

        function subscribeToPlayerChanges() {
            /**
            * Returns: 	{position: 35}
            * or
            * {action: "play"}/ {status: "Loading"}/ {status: "Canplay"}/ {status: "Playing"}
            */
            function onPlayerChange(player) {
                if (!player) return;

                if (player.position != null) {
                    $timeout(function () {
                        updateAudioPosition(player.position);
                    });
                }

                if (player.status != null) {
                    onAudioState(player.status);
                }
            }

            drive.media.player.subscribe(onPlayerChange);
        }

        function subscribeToMetaData() {
            /**
            * Returns: 	{artist: "Prague Ska Conspiracy", duration: 245394, source: "http://freedownloads.last.fm/download/145187271/Sound%2BOf%2BMusic.mp3", title: "Sound Of Music", type: "audio/mpeg"}
            * or just
            * {source: "http://freedownloads.last.fm/download/145187271/Sound%2BOf%2BMusic.mp3"}
            */
            function onMetadata(data) {
                $log.info('onMetadata', data);
                if (data && typeof data === 'object' && data.hasOwnProperty('duration')) {
                    setNowPlayingAttributes(data);
                    updateProgress();
                }
            }

            drive.media.currentMedia.subscribe(onMetadata);
        }

        function currentPlayerStatus(callback) {
            /**
            * Returns: 	{action: "play", position: "241", status: "Playing"}
            */
            function resolve(res) {
                $log.warn('currentPlayerStatus success', res);
                if (callback) callback(res);
            }
            function reject(error) {
                $log.error('currentPlayerStatus error', error);
            }
            drive.media.player.get().then(resolve, reject);
        }
        //#endregion

        function setNowPlayingAttributes(currentMedia) {
            nowPlaying.track = currentMedia;


            var providedAttributes = nowPlaying && angular.isDefined(nowPlaying.trackIndex) && playlist && playlist[nowPlaying.trackIndex];
            if (providedAttributes) {
                var keys = Object.keys(providedAttributes);
                keys.forEach(function (attributeName) {
                    nowPlaying.track[attributeName] = providedAttributes[attributeName] || nowPlaying.track[attributeName];
                });
                //nowPlaying.track.artist = providedAttributes.artist || nowPlaying.track.artist || 'Unknown Artist';
                //nowPlaying.track.title = providedAttributes.title || nowPlaying.track.title || 'Unknown Title';
                //nowPlaying.track.type = providedAttributes.type || nowPlaying.track.type || 'Unknown Media Type';
                //nowPlaying.track.genre = providedAttributes.genre || nowPlaying.track.genre || 'Unknown Genre';
                //nowPlaying.track.art = providedAttributes.art || nowPlaying.track.art || null;
            }
        }

        function updateAudioPosition(position) {
            if (!nowPlaying.progress.timeSettingInProgress) {
                nowPlaying.progress.val = position;
                nowPlaying.progress.elapsedTime = formatTime(position);

                var remainingTime = nowPlaying.progress.max - nowPlaying.progress.val;
                if (remainingTime < 0) remainingTime = 0;
                nowPlaying.progress.remainingTime = '-' + formatTime(remainingTime);
            }
        }

        function formatTime(seconds) {
            var min, sec;
            min = parseInt(seconds / 60);
            sec = parseInt(seconds % 60);

            if (min.toString().length === 1)
                min = '0' + min;
            if (sec.toString().length === 1)
                sec = '0' + sec;

            return min + ':' + sec;
        }

        function onAudioState(playerStatus) {
            nowPlaying.status = playerStatus;

            if (playerStatus === 'Done') {
                // If last track in the playlist is finished, and both shuffle and repeat are set to OFF, do not move onto next track.
                if (playlist && playlist.length && playlist.length - 1 === nowPlaying.trackIndex && !playerOptions.shuffle && !playerOptions.repeat) {
                    stop();
                    return;
                }

                // Move to next track.. Allow some time for MEdia Controller to load track before sending "play" command
                next();
                $timeout(function () {
                    play();
                }, 500);
            }
        }

        function toggleRepeat() {
            playerOptions.repeat = !playerOptions.repeat;
        }

        function toggleShuffle() {
            playerOptions.shuffle = !playerOptions.shuffle;
        }

        function getPlayerOption() {
            return playerOptions;
        }

        return {
            play: play,
            pause: pause,
            seekToTime: seekToTime,
            skipTime: skipTime,
            stop: stop,
            next: next,
            previous: previous,

            setPlaylist: setPlaylist,

            toggleRepeat: toggleRepeat,
            toggleShuffle: toggleShuffle,
            getPlayerOption: getPlayerOption,

            getNowPlaying: getNowPlaying,
            getStatus: currentPlayerStatus,

            getCurrentMedia: getCurrentMedia
        };

        function getNowPlaying() {
            return nowPlaying;
        }
    }])
    .directive('attMediaPlayer', ['$mediaPlayer', '$timeout', '$log', function ($mediaPlayer, $timeout, $log) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: function (tElement, tAttrs) {
                if (tAttrs.templateUrl === undefined) {
                    return 'templates/attMediaPlayer.html';
                } else {
                    return tAttrs.templateUrl;
                }
            },
            scope: {
                playlist: '=',
                autoplay: '='
            },
            link: function (scope) {
                scope.isPlayerPaused = true;

                scope.play = function () {
                    $mediaPlayer.play();
                    scope.isPlayerPaused = false;
                };
                scope.pause = function () {
                    $mediaPlayer.pause(function () { angular.noop(); });
                    scope.isPlayerPaused = true;
                };
                scope.stop = function () { $mediaPlayer.stop(); };
                scope.next = function () { $mediaPlayer.next(); };
                scope.previous = function () { $mediaPlayer.previous(); };
                scope.skipTime = function (time) { $mediaPlayer.skipTime(time); };

                scope.toggleRepeat = function () { $mediaPlayer.toggleRepeat(); };
                scope.toggleShuffle = function () { $mediaPlayer.toggleShuffle(); };

                scope.playerOption = $mediaPlayer.getPlayerOption();

                scope.nowPlaying = $mediaPlayer.getNowPlaying();

                scope.getCurrentMedia = $mediaPlayer.getCurrentMedia;

                scope.albumArtAction = function () {
                    scope.$emit('albumArtActivated');
                };

                scope.$watch('nowPlaying', function (nowPlaying) {
                    scope.currentTrackIndex = nowPlaying.trackIndex;

                    //if (nowPlaying.status === 'PlaybackEnd') {
                    //    $mediaPlayer.stop();
                    //    return;
                    //} 

                    if (nowPlaying.progress.val >= Math.floor(nowPlaying.progress.max)) {
                        // Force digest loop to get player's last valid state
                        $timeout(function () {
                            angular.noop();
                        }, 2000);
                    }
                }, true);

                scope.$watch('nowPlaying.status', function (status) {
                    scope.isPlayerPaused = status === 'Playing' ? false : true;
                });

                scope.$watch('nowPlaying.track.art', function (trackArt) {
                    scope.$emit('trackArtChanged', trackArt);
                });

                scope.$on('sliderMoving', function (event, data) {
                    if (data === 'time') {
                        scope.nowPlaying.progress.timeSettingInProgress = true;
                    }
                });

                scope.$on('sliderMoved', function (event, data) {
                    if (data === 'time') {

                        var timeToSeek = scope.nowPlaying && scope.nowPlaying.progress && scope.nowPlaying.progress.val;
                        if (timeToSeek && angular.isNumber(+timeToSeek)) {
                            $mediaPlayer.seekToTime(timeToSeek, function () { scope.nowPlaying.progress.timeSettingInProgress = false; });
                        }
                    }
                });

                scope.$watch("playlist", function () {
                    activate();
                });

                scope.getNextTrack = function () {
                    if (!angular.isNumber(scope.currentTrackIndex) || scope.playerOption.shuffle || !scope.playlist) {
                        return null;
                    }

                    var next = scope.currentTrackIndex + 1;

                    if (next > scope.playlist.length - 1) {
                        next = 0;
                    }
                    return scope.playlist[next];
                };

                function activate() {
                    $mediaPlayer.setPlaylist(scope.playlist);

                    $mediaPlayer.getStatus(function (current) {
                        if (current && current.status === 'Playing') {
                            scope.isPlayerPaused = false;
                        }
                    });

                    if (scope.autoplay) scope.play();
                }
            }
        };
    }
    ]);
})(window.angular, window.drive);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.attMenu.directive:attMenu
 * @description
 * # attMenu
 */
angular.module('connectedCarSDK.attMenu', [])
  .directive('attMenu', function ($timeout, $rootScope) {
      return {
        templateUrl: 'templates/attMenu.html',
        restrict: 'E',
        replace: true,
        scope: {
          items: '=',         // list of objects to bind {text, desc, selected}
          title: '='          // string
        },
        link: function (scope, element) {

          scope.activeTemp = false; // used to fix menu scrolling issue in Chrome

          scope.onItemClick = function (item) {
            if (scope.items) {
              scope.items.forEach(function (i) {
                if (i === item)
                  i.selected = true;
                else i.selected = false;
              });
            }
          };

          $rootScope.$on('setMenuItem', function (event, args) {
            scope.onItemClick(args[0]);
          });

          $rootScope.$on('changeDrawer', function () {
            $timeout(function () {
              scope.activeTemp = true;

              //scroll the menu to the top every time it reopens
              angular.element(element)[0].scrollTop = 0;
            });
          });

        }
      };
  });

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.modal.directive:attModal
 * @description
 * # attModal
 */
angular.module('connectedCarSDK.attModal', ['connectedCarSDK.transition'])
  /**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
      return {
          createNew: function () {
              var stack = [];

              return {
                  add: function (key, value) {
                      stack.push({
                          key: key,
                          value: value
                      });
                  },
                  get: function (key) {
                      for (var i = 0; i < stack.length; i++) {
                          if (key === stack[i].key) {
                              return stack[i];
                          }
                      }
                  },
                  keys: function () {
                      var keys = [];
                      for (var i = 0; i < stack.length; i++) {
                          keys.push(stack[i].key);
                      }
                      return keys;
                  },
                  top: function () {
                      return stack[stack.length - 1];
                  },
                  remove: function (key) {
                      var idx = -1;
                      for (var i = 0; i < stack.length; i++) {
                          if (key === stack[i].key) {
                              idx = i;
                              break;
                          }
                      }
                      return stack.splice(idx, 1)[0];
                  },
                  removeTop: function () {
                      return stack.splice(stack.length - 1, 1)[0];
                  },
                  length: function () {
                      return stack.length;
                  }
              };
          }
      };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
      return {
          restrict: 'EA',
          replace: true,
          templateUrl: 'templates/modal/backdrop.html',
          link: function (scope, element, attrs) {
              scope.backdropClass = attrs.backdropClass || '';

              scope.animate = false;

              //trigger CSS transitions
              $timeout(function () {
                  scope.animate = true;
              });
          }
      };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
      return {
          restrict: 'EA',
          scope: {
              index: '@',
              animate: '='
          },
          replace: true,
          transclude: true,
          templateUrl: function (tElement, tAttrs) {
              return tAttrs.templateUrl || 'templates/modal/window.html';
          },
          link: function (scope, element, attrs) {
              element.addClass(attrs.windowClass || '');
              scope.size = attrs.size;

              $timeout(function () {
                  // trigger CSS transitions
                  scope.animate = true;

                  /**
                   * Auto-focusing of a freshly-opened modal element causes any child elements
                   * with the autofocus attribute to loose focus. This is an issue on touch
                   * based devices which will show and then hide the onscreen keyboard.
                   * Attempts to refocus the autofocus element via JavaScript will not reopen
                   * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
                   * the modal element if the modal does not contain an autofocus element.
                   */
                  if (!element[0].querySelectorAll('[autofocus]').length) {
                      element[0].focus();
                  }
              });

              scope.close = function (evt) {
                  var modal = $modalStack.getTop();
                  if (modal && modal.value.backdrop && modal.value.backdrop !== 'static' && (evt.target === evt.currentTarget)) {
                      evt.preventDefault();
                      evt.stopPropagation();
                      $modalStack.dismiss(modal.key, 'backdrop click');
                  }
              };
          }
      };
  }])

  .directive('modalTransclude', function () {
      return {
          link: function ($scope, $element, $attrs, controller, $transclude) {
              $transclude($scope.$parent, function (clone) {
                  $element.empty();
                  $element.append(clone);
              });
          }
      };
  })

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

        var OPENED_MODAL_CLASS = 'modal-open';

        var backdropDomEl, backdropScope;
        var openedWindows = $$stackedMap.createNew();
        var $modalStack = {};

        function backdropIndex() {
            var topBackdropIndex = -1;
            var opened = openedWindows.keys();
            for (var i = 0; i < opened.length; i++) {
                if (openedWindows.get(opened[i]).value.backdrop) {
                    topBackdropIndex = i;
                }
            }
            return topBackdropIndex;
        }

        $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
            if (backdropScope) {
                backdropScope.index = newBackdropIndex;
            }
        });

        function removeModalWindow(modalInstance) {

            var body = $document.find('body').eq(0);
            var modalWindow = openedWindows.get(modalInstance).value;

            //clean up the stack
            openedWindows.remove(modalInstance);

            //remove window DOM element
            removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function () {
                modalWindow.modalScope.$destroy();
                body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                checkRemoveBackdrop();
            });
        }

        function checkRemoveBackdrop() {
            //remove backdrop if no longer needed
            if (backdropDomEl && backdropIndex() === -1) {
                var backdropScopeRef = backdropScope;
                removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
                    backdropScopeRef.$destroy();
                    backdropScopeRef = null;
                });
                backdropDomEl = undefined;
                backdropScope = undefined;
            }
        }

        function removeAfterAnimate(domEl, scope, emulateTime, done) {
            // Closing animation
            scope.animate = false;

            var transitionEndEventName = $transition.transitionEndEventName;
            if (transitionEndEventName) {
                // transition out
                var timeout = $timeout(afterAnimating, emulateTime);

                domEl.bind(transitionEndEventName, function () {
                    $timeout.cancel(timeout);
                    afterAnimating();
                    scope.$apply();
                });
            } else {
                // Ensure this call is async
                $timeout(afterAnimating);
            }

            function afterAnimating() {
                if (afterAnimating.done) {
                    return;
                }
                afterAnimating.done = true;

                domEl.remove();
                if (done) {
                    done();
                }
            }
        }

        $document.bind('keydown', function (evt) {
            var modal;

            if (evt.which === 27) {
                modal = openedWindows.top();
                if (modal && modal.value.keyboard) {
                    evt.preventDefault();
                    $rootScope.$apply(function () {
                        $modalStack.dismiss(modal.key, 'escape key press');
                    });
                }
            }
        });

        $modalStack.open = function (modalInstance, modal) {

            openedWindows.add(modalInstance, {
                deferred: modal.deferred,
                modalScope: modal.scope,
                backdrop: modal.backdrop,
                keyboard: modal.keyboard
            });

            var body = $document.find('body').eq(0),
                currBackdropIndex = backdropIndex();

            if (currBackdropIndex >= 0 && !backdropDomEl) {
                backdropScope = $rootScope.$new(true);
                backdropScope.index = currBackdropIndex;
                var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
                angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
                backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
                body.append(backdropDomEl);
            }

            var angularDomEl = angular.element('<div modal-window></div>');
            angularDomEl.attr({
                'template-url': modal.windowTemplateUrl,
                'window-class': modal.windowClass,
                'size': modal.size,
                'index': openedWindows.length() - 1,
                'animate': 'animate'
            }).html(modal.content);

            var modalDomEl = $compile(angularDomEl)(modal.scope);
            openedWindows.top().value.modalDomEl = modalDomEl;
            body.append(modalDomEl);
            body.addClass(OPENED_MODAL_CLASS);
        };

        $modalStack.close = function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                modalWindow.value.deferred.resolve(result);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismiss = function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                modalWindow.value.deferred.reject(reason);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismissAll = function (reason) {
            var topModal = this.getTop();
            while (topModal) {
                this.dismiss(topModal.key, reason);
                topModal = this.getTop();
            }
        };

        $modalStack.getTop = function () {
            return openedWindows.top();
        };

        return $modalStack;
    }])

  .provider('$modal', function () {

      var $modalProvider = {
          options: {
              backdrop: false, //can be also false or 'static'
              keyboard: true
          },
          $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
            function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

                var $modal = {};

                function getTemplatePromise(options) {
                    return options.template ? $q.when(options.template) :
                      $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
                        { cache: $templateCache }).then(function (result) {
                            return result.data;
                        });
                }

                function getResolvePromises(resolves) {
                    var promisesArr = [];
                    angular.forEach(resolves, function (value) {
                        if (angular.isFunction(value) || angular.isArray(value)) {
                            promisesArr.push($q.when($injector.invoke(value)));
                        }
                    });
                    return promisesArr;
                }

                $modal.open = function (modalOptions) {

                    var modalResultDeferred = $q.defer();
                    var modalOpenedDeferred = $q.defer();

                    //prepare an instance of a modal to be injected into controllers and returned to a caller
                    var modalInstance = {
                        result: modalResultDeferred.promise,
                        opened: modalOpenedDeferred.promise,
                        close: function (result) {
                            $modalStack.close(modalInstance, result);
                        },
                        dismiss: function (reason) {
                            $modalStack.dismiss(modalInstance, reason);
                        }
                    };

                    //merge and clean up options
                    modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                    modalOptions.resolve = modalOptions.resolve || {};

                    //verify options
                    if (!modalOptions.template && !modalOptions.templateUrl) {
                        throw new Error('One of template or templateUrl options is required.');
                    }

                    var templateAndResolvePromise =
                      $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                    templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                        var modalScope = (modalOptions.scope || $rootScope).$new();
                        modalScope.$close = modalInstance.close;
                        modalScope.$dismiss = modalInstance.dismiss;

                        var ctrlInstance, ctrlLocals = {};
                        var resolveIter = 1;

                        //controllers
                        if (modalOptions.controller) {
                            ctrlLocals.$scope = modalScope;
                            ctrlLocals.$modalInstance = modalInstance;
                            angular.forEach(modalOptions.resolve, function (value, key) {
                                ctrlLocals[key] = tplAndVars[resolveIter++];
                            });

                            ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                            if (modalOptions.controllerAs) {
                                modalScope[modalOptions.controllerAs] = ctrlInstance;
                            }
                        }

                        $modalStack.open(modalInstance, {
                            scope: modalScope,
                            deferred: modalResultDeferred,
                            content: tplAndVars[0],
                            backdrop: modalOptions.backdrop,
                            keyboard: modalOptions.keyboard,
                            backdropClass: modalOptions.backdropClass,
                            windowClass: modalOptions.windowClass,
                            windowTemplateUrl: modalOptions.windowTemplateUrl,
                            size: modalOptions.size
                        });

                    }, function resolveError(reason) {
                        modalResultDeferred.reject(reason);
                    });

                    templateAndResolvePromise.then(function () {
                        modalOpenedDeferred.resolve(true);
                    }, function () {
                        modalOpenedDeferred.reject(false);
                    });

                    return modalInstance;
                };

                return $modal;
            }]
      };

      return $modalProvider;
  });

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attpinpad
 * @description
 * # attpinpad
 */
angular.module('connectedCarSDK.attPinPad', [])
    .factory('$pinPad', ['$rootScope', '$compile', '$document', function ($rootScope, $compile, $document) {

        return {

            show: function (options) {

                // first remove any existing pinPad elements from DOM
                var pinPadDomEl = $document.find('body').find('att-pin-pad');
                if (pinPadDomEl)
                    pinPadDomEl.remove();

                var angularDomEl = angular.element('<att-pin-pad ng-model="ngModel" on-confirm="onConfirm(ngModel)"></att-pin-pad>');
                angularDomEl.attr({
                  'num-digits': options.numDigits
                });
                angularDomEl.attr({
                  'template-url': options.templateUrl
                });

                var pinPadScope = $rootScope.$new(false);
                pinPadScope.ngModel = options.ngModel || '';
                pinPadScope.onConfirm = options.onConfirm ? options.onConfirm : null;

                pinPadDomEl = $compile(angularDomEl)(pinPadScope);

                $document.find('body').eq(0).append(pinPadDomEl);
            },

            close: function() {
                var pinPadDomEl = $document.find('body').find('att-pin-pad');
                if (pinPadDomEl)
                    pinPadDomEl.remove();
            }

        };
    }])
    .directive('attPinPad', function() {
        return {
            templateUrl: function(tElement, tAttrs) {
              return tAttrs.templateUrl || 'templates/attPinPad.html';
            },
            restrict: 'EA',
            scope: {
                numDigits: '@',
                ngModel: '=',
                onConfirm: '&'
            },
            link: function(scope) {

                // if model is undefined, set to empty string
                if (!scope.ngModel) {
                    scope.ngModel = '';
                }

                // if number of digits is undefined, default is 4 digits for pin number
                var numberOfDigits = 4;
                if (scope.numDigits) {
                    numberOfDigits = scope.numDigits;
                }

                scope.backspace = function () {
                    if (scope.ngModel && scope.ngModel.length > 0) {
                        scope.ngModel = scope.ngModel.slice(0, -1);
                    }
                };

                scope.appendToPin = function (val) {
                    if (val>=0 && scope.ngModel.length < numberOfDigits)
                        scope.ngModel += val.toString();
                };

                scope.isDisabled = function() {
                    if (scope.ngModel.length < numberOfDigits)
                        return true;
                    else return false;
                };
            }
        };
    });

(function (angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name connectedCarSDK.progressbar.directive:attProgressbar
     * @description
     * # attprogressbar
     */
    angular.module('connectedCarSDK.attProgressBar', [])
     .constant('progressConfig', {
         animate: true,
         max: 100,
         min: 0
     })

    .controller('ProgressController', ['$scope', '$attrs', '$parse', 'progressConfig', function ($scope, $attrs, $parse, progressConfig) {
        var self = this,
            animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

        this.bars = [];
        $scope.max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max;
        $scope.min = angular.isDefined($attrs.min) ? $scope.$parent.$eval($attrs.min) : progressConfig.min;
        $scope.textLeft = angular.isDefined($attrs.textLeft) ? $scope.$parent.$eval($attrs.textLeft) : progressConfig.textLeft;
        $scope.textRight = angular.isDefined($attrs.textRight) ? $scope.$parent.$eval($attrs.textRight) : progressConfig.textRight;

        $attrs.$observe('max', function (value) {
            $scope.max = $parse(value)($scope);
        });
        $attrs.$observe('min', function (value) {
            $scope.min = $parse(value)($scope);
        });
        $attrs.$observe('textLeft', function (value) {
            $scope.textLeft = $parse(value)($scope);
        });
        $attrs.$observe('textRight', function (value) {
            $scope.textRight = $parse(value)($scope);
        });

        this.addBar = function (bar, element) {
            if (!animate) {
                element.css({ 'transition': 'none' });
            }

            this.bars.push(bar);

            bar.$watch('value', function (value) {
                if (value > $scope.max) value = $scope.max;

                bar.percent = +(100 * value / $scope.max).toFixed(2);
            });

            bar.$on('$destroy', function () {
                element = null;
                self.removeBar(bar);
            });
        };

        this.removeBar = function (bar) {
            this.bars.splice(this.bars.indexOf(bar), 1);
        };
    }])

    .directive('attProgressBar', function () {
        return {
            restrict: 'EA',
            replace: true,
            controller: 'ProgressController',
            scope: {
                value: '=',
                type: '='
            },
            templateUrl: 'templates/attProgressBar.html',
            link: function (scope, element, attrs, progressCtrl) {

                if (attrs.max && scope.value > scope.$parent.$eval(attrs.max))
                    scope.value = attrs.max;

                progressCtrl.addBar(scope, angular.element(element.children()[0]));
            }
        };
    });
})(window.angular);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attlistview
 * @description
 * # attlistview
 */
angular.module('connectedCarSDK.attRadio', [])
    .directive('attRadio', ['$timeout', function($timeout) {
        return {
            restrict: 'AC',
            require: '?ngModel',
            replace: true,
            link: function (scope, elm, attrs, ngModelCtrl) {

                elm.wrap('<label class="att-radio-wrapper"></label>');

                var checkboxIcon = angular.element('<i></i>');
                if(ngModelCtrl.$modelValue){
                    checkboxIcon.addClass('icon-radio-checked');
                }
                else{
                    checkboxIcon.addClass('icon-radio-unchecked');
                }


                scope.$watch(
                    function(){
                        return ngModelCtrl.$modelValue;
                    }, 
                    function(modelValue){
                        if(modelValue === attrs.value){
                            checkboxIcon.removeClass('icon-radio-unchecked');
                            checkboxIcon.addClass('icon-radio-checked');                            
                        }
                        else{                
                            checkboxIcon.removeClass('icon-radio-checked');
                            checkboxIcon.addClass('icon-radio-unchecked');
                        }     
                    }
                );


                elm.after(checkboxIcon);
                
                
            }
        };
    }]);

'use strict';

angular.module('connectedCarSDK.attSimError', [])
  .directive('attSimError', [function(){
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/attSimError.html',
      link: function(scope, iElm, iAttrs, controller) {
          console.log('Params: ', scope, iElm, iAttrs, controller);
      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSdkApp.directive:attSlider
 * @description
 * # attSlider
 */
angular.module('connectedCarSDK.attSlider', [])
    .directive('attSlider', ['$timeout', function ($timeout) {
        return {
            restrict: 'EA',
            templateUrl: 'templates/attSlider.html',
            scope: {
                type: '@',
                ngModel: '=',
                min: '@',
                max: '@',
                textLeft: '@',
                textRight: '@',
                parentControl: '@'
            },
            link: function (scope, element) {

                // set default values
                scope.min = scope.min || 0;
                scope.max = scope.max || 100;
                scope.ngModel = scope.ngModel || 0;
                
                var input = element.find('input');

                scope.sliderMovingTime = 200;
                scope.sliderMoved = false;

                scope.sliderMoved = function () {
                    scope.$emit('sliderMoved', scope.parentControl);
                };               

                scope.sliderMoving = function () {
                    scope.$emit('sliderMoving', scope.parentControl);
                    console.log(scope.ngModel);
                };

                // Add touch events to control slider on mobile devices
                var slider = element.find('input');

                slider.bind('touchstart', function () {
                    scope.$emit('sliderMoving', scope.parentControl);
                    this.focus();
                });

                slider.bind('touchend', function () {
                    scope.$emit('sliderMoved', scope.parentControl);
                    this.focus();
                });

                scope.sliderClick = function (event) {
                    if (!input || input.length <= 0) return;

                    var positionIndicatorWidth = 20;
                    var position = (event.clientX - positionIndicatorWidth) / input[0].clientWidth * 100;
                    scope.$emit('sliderMoving', scope.parentControl);
                    var positionTime = position / 100 * scope.max;
                    scope.ngModel = positionTime < 0 ? 0 : Math.floor(positionTime);
                    $timeout(function () {
                        scope.$emit('sliderMoved', scope.parentControl);
                    }, 0);
                };
            }
        };
    }]);

'use strict';

angular.module('connectedCarSDK.attTab', ['connectedCarSDK.attTabset'])
.directive('attTab', ['$parse', function ($parse) {
      return {
          require: '^attTabset',
          restrict: 'EA',
          replace: true,
          templateUrl: 'templates/tabs/attTab.html',
          transclude: true,
          scope: {
              active: '=?',
              heading: '@',
              onSelect: '&select', //This callback is called in contentHeadingTransclude
              //once it inserts the tab's content into the dom
              onDeselect: '&deselect',
              tabIcon: '@'
          },
          controller: function () {
              //Empty controller so other directives can require being 'under' a tab
          },
          compile: function (elm, attrs, transclude) {
              return function postLink(scope, elm, attrs, tabsetCtrl) {
                  scope.$watch('active', function (active) {
                      if (active) {
                          tabsetCtrl.select(scope);
                      }
                  });

                  scope.disabled = false;
                  if (attrs.disabled) {
                      scope.$parent.$watch($parse(attrs.disabled), function (value) {
                          scope.disabled = !!value;
                      });
                  }

                  scope.select = function () {
                      if (!scope.disabled) {
                          scope.active = true;
                      }
                  };

                  tabsetCtrl.addTab(scope);
                  scope.$on('$destroy', function () {
                      tabsetCtrl.removeTab(scope);
                  });

                  //We need to transclude later, once the content container is ready.
                  //when this link happens, we're inside a tab heading.
                  scope.$transcludeFn = transclude;
              };
          }
      };
  }])
.directive('tabHeadingTransclude', [function () {
    return {
        restrict: 'A',
        require: '^attTab',
        link: function (scope, elm) {
            scope.$watch('headingElement', function updateHeadingElement(heading) {
                if (heading) {
                    elm.html('');
                    elm.append(heading);
                }
            });
        }
    };
}])
.directive('tabContentTransclude', function () {
    function isTabHeading(node) {
        return node.tagName && (
          node.hasAttribute('tab-heading') ||
          node.hasAttribute('data-tab-heading') ||
          node.tagName.toLowerCase() === 'tab-heading' ||
          node.tagName.toLowerCase() === 'data-tab-heading'
        );
    }

    return {
        restrict: 'A',
        require: '^attTabset',
        link: function (scope, elm, attrs) {
            var tab = scope.$eval(attrs.tabContentTransclude);

            //Now our tab is ready to be transcluded: both the tab heading area
            //and the tab content area are loaded.  Transclude 'em both.
            tab.$transcludeFn(tab.$parent, function (contents) {
                angular.forEach(contents, function (node) {
                    if (isTabHeading(node)) {
                        //Let tabHeadingTransclude know.
                        tab.headingElement = node;
                    } else {
                        elm.append(node);
                    }
                });
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.tabset.directive:attTabset
 * @description
 * # attTabset
 */
angular.module('connectedCarSDK.attTabset', [])
.controller('TabsetController', [
    '$scope', function($scope) {
        var ctrl = this,
            tabs = ctrl.tabs = $scope.tabs = [];

        ctrl.select = function(selectedTab) {
            angular.forEach(tabs, function(tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                    tab.onDeselect();
                }
            });
            selectedTab.active = true;
            selectedTab.onSelect();
        };

        ctrl.addTab = function addTab(tab) {
            tabs.push(tab);
            // we can't run the select function on the first tab
            // since that would select it twice
            if (tabs.length === 1) {
                tab.active = true;
            } else if (tab.active) {
                ctrl.select(tab);
            }
        };

        ctrl.removeTab = function removeTab(tab) {
            var index = tabs.indexOf(tab);
            //Select a new tab if the tab to be removed is selected
            if (tab.active && tabs.length > 1) {
                //If this is the last tab, select the previous tab. else, the next tab.
                var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
                ctrl.select(tabs[newActiveIndex]);
            }
            tabs.splice(index, 1);
        };
    }
])
.directive('attTabset', function() {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            type: '@'
        },
        controller: 'TabsetController',
        templateUrl: 'templates/tabs/attTabset.html',
        link: function(scope, element, attrs) {
            scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
            scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            scope.topPosition = angular.isDefined(attrs.topPosition) ? scope.$parent.$eval(attrs.topPosition) : false;
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name connectedCarSDK.toggleSwitch.directive:attToggleSwitch
 * @description
 * # attToggleSwitch
 */
angular.module('connectedCarSDK.attToggleSwitch', [])
  .directive('attToggleSwitch', ['$parse', function ($parse) {
      return {
          restrict: 'AC',
          scope: false,
          require: 'ngModel',
          link: function (scope, element, attrs, ngModel) {
              var hideLabels = $parse(attrs.hideLabels)(scope);
              var onStateLabel = hideLabels ? '' : attrs.onLabel || 'ON';
              var offStateLabel = hideLabels ? '' : attrs.offLabel || 'OFF';

              var baseElement = ['<label class="att-toggle-switch">',
              '<span class="on-state">' + onStateLabel + '</span>',
              '<span class="off-state">' + offStateLabel + '</span>',
              '</label>'];

              element.wrap(baseElement.join(""));
              element.after('<div id="toggle-switch-circle"></div>');
              
              var parent = element.parent();

              //toggle the switch on click
              parent.bind('click', function(){
                if(attrs['disabled']) return; //disabled state guard
                toggle();
                
              });

              //toggle the switch on model value
              scope.$watch(attrs['ngModel'], function(newValue) {
                    toggle();
              });

              
              //gray out the component if it's disabled
              setDisabledStyles(attrs['disabled']);
              //handle the disabled state change
              if(attrs['ngDisabled']) scope.$watch(attrs['ngDisabled'], setDisabledStyles);
              

              function toggle(){
                if(ngModel.$modelValue){
                  parent.addClass('toggle-switch-on');
                }
                else{
                  parent.removeClass('toggle-switch-on');
                }
              }

              function setDisabledStyles(isDisabled){
                if(isDisabled){
                  parent.addClass('toggle-switch-disabled');
                }
                else{
                  parent.removeClass('toggle-switch-disabled');
                }
              }
          }
      };
  }]);

'use strict';

angular.module('connectedCarSDK.attVehicleInMotion', [])
  .directive('attVehicleInMotion', [function(){
    return {
      restrict: 'E',
      replace: 'true',
      templateUrl: 'templates/attVehicleInMotion.html',
      link: function (scope, iElm, iAttrs, controller) {

          console.log('Properties: ', scope, iElm, iAttrs, controller);
      }
    };
  }]);
