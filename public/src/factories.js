angular.module('UltiDocMngApp')
    .factory('Document', function ($resource) {
        return $resource('/api/document/:id', { id: '@id' }, {
            'update': { method: 'PUT' }
        });
    })
    .factory('Fields', function ($q, $http, Document) {
    	var url = '/options/displayed_fields',
    		ignore = ['fileName', 'realFileName', 'id', 'userId'],
    		allFields = [],
    		deferred = $q.defer(),

    		documents = Document.query(function () {
    			documents.forEach(function (c) {
    				Object.keys(c).forEach(function (k) {
    					if (allFields.indexOf(k) < 0 && ignore.indexOf(k) < 0) allFields.push(k);
    				});
    			});
    			deferred.resolve(allFields);
    		});

		return {
			get: function () {
				return $http.get(url);
			},
			set: function (newFields) {
				return $http.post(url, { fields: newFields });
			},
			headers: function () {
				return deferred.promise;
			}
		};
    });
