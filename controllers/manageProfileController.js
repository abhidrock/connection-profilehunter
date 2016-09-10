/**
 * Created by suchandp on 6/23/2016.
 */
var myApp = angular.module("manageProfile", ['ngMessages']);

var manageProfileControl = function ($scope, $http){

    console.log("Manage Profile controller");

    $scope.update = function() {
        $http.put('http://connection-profilehunter.rhcloud.com/create' + $scope.expert._id, $scope.expert).success(function (response) {
            console.log("profile created");
            $scope.response = response;
            window.location.href = '/ExpertProfileProject/expert.htm';
        });
    };

    $scope.edit = function (id) {
        console.log(id);
        $http.get('http://connection-profilehunter.rhcloud.com/getProfile/' + id).success(function (response) {
            $scope.expert = response;
        });

    };
};

myApp.controller("manageProfileControl", manageProfileControl);
