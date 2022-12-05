angular.module('skippr')
    .controller('PremiumConfirmController', function($http, $scope, $window, $rootScope) {

        $rootScope.init();

        $scope.goBack = function() {
            $window.location.href = "/"
        }
    })