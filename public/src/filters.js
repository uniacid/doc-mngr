angular.module('UltiDocMngApp')
    .filter('labelCase', function() {
        return function (input) {
            input = input.replace(/([A-Z])/g, ' $1');
            return input[0].toUpperCase() + input.slice(1);
        };
    })
    .filter('keyFilter', function() {
    	return function (obj, query) {
    		var result = {};
    		angular.forEach(obj, function(val, key) {
    			if (key !== query) {
    				result[key] = val;
    			}
    		});

    		return result;
    	};
    })
    .filter('camelCase', function() {
        return function (input) {
            return input.toLowerCase().replace(/ (\w)/g, function (match, letter) {
                return letter.toUpperCase();
            });
        };
    })
    .filter('showDate', function() {
    	return function (input) {
    		return Date.parse(input);
    	};
    })
    .filter('currentdDate',['$filter', function($filter) {
        return function () {
            return $filter('date')(new Date(), 'yyyy-MM-dd HH::mm::ss');
        };
    }])
    .filter('formatDate',['$filter', function($filter) {
        return function (input) {
            return $filter('date')(new Date(), 'yyyy-MM-dd HH::mm::ss');
        };
    }]);