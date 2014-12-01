'use strict';

/**
 * Source: https://github.com/DmitryEfimenko/ngAutocomplete
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Simple Usage:
 * <input type="text" ng-model="details.formattedAddress" ng-autocomplete details="details" />
 *
 * creates the autocomplete text box
 *   `ng-autocomplete`: specifies the directive, $scope.details will hold the address object that'll look like that:
 * 
 *       details = {
 *           streetNumber: val,
 *           streetName: val,
 *           city: val,
 *           state: val,
 *           postalCode: val,
 *           country: val,
 *           formattedAddress: val,
 *           lat: val,
 *           lng: val,
 *       }
 *
 *
 * Optional parameter options:
 * <input type="text" ng-model="details.formattedAddress" ng-autocomplete details="details" options="options"/>
 *
 *   `options="options"`: options provided by the user that filter the autocomplete results
 *
 *       options = {
 *           types: type,        string, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *           bounds: bounds,     google maps LatLngBounds Object
 *           country: country    string, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       }
 *
 *
 * Optional parameter validate-fn:
 * <input type="text" ng-model="details.formattedAddress" ng-autocomplete details="details" validate-fn="customValidate()"/>
 *
 * allows to add any custom validation logic to run upon an address is selected from the list of suggestions
 *
 */

angular.module("ngAutocomplete", [])
    .directive('ngAutocomplete', [
        function () {
            function convertPlaceToFriendlyObject(place) {
                var result = undefined;
                if (place) {
                    result = {};
                    for (var i = 0, l = place.address_components.length; i < l; i++) {
                        switch (place.address_components[i].types[0]) {
                        case 'street_number':
                            if (i == 0) result.searchedBy = 'streetNumber';
                            result.streetNumber = place.address_components[i].long_name;
                            break;
                        case 'route':
                            if (i == 0) result.searchedBy = 'streetName';
                            result.streetName = place.address_components[i].long_name;
                            break;
                        case 'locality':
                            if (i == 0) result.searchedBy = 'city';
                            result.city = place.address_components[i].long_name;
                            break;
                        case 'administrative_area_level_1':
                            if (i == 0) result.searchedBy = 'state';
                            result.state = place.address_components[i].short_name;
                            break;
                        case 'postal_code':
                            if (i == 0) result.searchedBy = 'postalCode';
                            result.postalCode = place.address_components[i].long_name;
                            break;
                        case 'country':
                            if (i == 0) result.searchedBy = 'country';
                            result.country = place.address_components[i].long_name;
                            break;
                        }
                    }
                    result.formattedAddress = place.formatted_address;
                    result.lat = place.geometry.location.lat();
                    result.lng = place.geometry.location.lng();
                }
                return result;
            }

            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    details: '=',
                    options: '=',
                    validateFn: '&'
                },
                link: function($scope, $element, $attrs, $ctrl) {
                    //options for autocomplete
                    var opts;

                    //convert options provided to opts
                    var initOpts = function() {
                        opts = {};
                        if ($scope.options) {
                            if ($scope.options.types) {
                                opts.types = [];
                                opts.types.push($scope.options.types);
                            }
                            if ($scope.options.bounds) {
                                opts.bounds = $scope.options.bounds;
                            }
                            if ($scope.options.country) {
                                opts.componentRestrictions = {
                                    country: $scope.options.country
                                };
                            }
                        }
                    };

                    //create new autocomplete
                    //reinitializes on every change of the options provided
                    var newAutocomplete = function() {
                        $scope.gPlace = new google.maps.places.Autocomplete($element[0], opts);
                        google.maps.event.addListener($scope.gPlace, 'place_changed', function () {
                            $scope.$apply(function () {
                                var place = $scope.gPlace.getPlace();
                                $scope.details = convertPlaceToFriendlyObject(place);
                                $ctrl.$validate();
                            });
                            if ($ctrl.$valid && $scope.validateFn) {
                                $scope.$apply(function () {
                                    $scope.validateFn();
                                });
                            }
                        });
                    };

                    $ctrl.$validators.parse = function (value) {
                        var valid = ($attrs.required == true && $scope.details != undefined && $scope.details.lat != undefined) ||
                            (!$attrs.required && ($scope.details == undefined || $scope.details.lat == undefined) && $element.val() != '');
                        return valid;
                    };

                    $element.on('keypress', function (e) {
                        // prevent form submission on pressing Enter as there could be more inputs to fill out
                        if (e.which == 13) {
                            e.preventDefault();
                        }
                    });
                    
                    //watch options provided to directive
                    $scope.watchOptions = function() {
                        return $scope.options;
                    };
                    $scope.$watch($scope.watchOptions, function () {
                        initOpts();
                        newAutocomplete();
                        $element[0].value = '';
                    }, true);

                    // user typed something in the input - means an intention to change address, which is why
                    // we need to null out all fields for fresh validation
                    $element.on('keyup', function() {
                        if ($scope.details) {
                            $scope.details.streetNumber = '';
                            $scope.details.streetName = '';
                            $scope.details.city = '';
                            $scope.details.state = '';
                            $scope.details.postalCode = '';
                            $scope.details.country = '';
                            $scope.details.lat = undefined;
                            $scope.details.lng = undefined;
                        }
                        if ($ctrl.$valid) {
                            $scope.$apply(function() {
                                $ctrl.$setValidity('parse', false);
                            });
                        }
                    });
                }
            };
        }
    ]);
