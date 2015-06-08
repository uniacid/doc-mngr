angular.module('UltiDocMngApp')
    .controller('ListController', function($scope, $rootScope, Document, $location, options) {
        $rootScope.PAGE = "all";
        $scope.documents = Document.query();
        $scope.fields = ['fileName', 'realFileName', 'sharedWith', 'modified', 'created'].concat(options.displayed_fields);

        $scope.sort = function (field) {
            $scope.sort.field = field;
            $scope.sort.order = !$scope.sort.order;
        };

        $scope.sort.field = 'fileName';
        $scope.sort.order = false;

        $scope.show = function(id) {
            $location.url('/document/' + id);
        }
    })
    .controller('NewController', function($scope, $rootScope, Document, $location) {
        $rootScope.PAGE = "new";
        $scope.document = new Document({
            fileName: ['', 'text'],
            realFileName: ['', 'text'],
            sharedWith: ['', 'text'],
            file: ['', 'file'],
            modified: [new Date(), 'datetime'],
            created: [new Date(), 'datetime']
        });

        $scope.upload = function(){
          var f = document.getElementById('file').files[0],
            r = new FileReader();
            r.onloadend = function(e){
                $scope.document.file = e.target.result;
            }
            r.readAsBinaryString(f);
        }

        $scope.save = function() {
            if ($scope.newDocument.$invalid) {
                $scope.$broadcast('record:invalid');
            } else {
                $scope.document.$save();
                $location.url('/documents');
            }
        };
    })
    .controller('SingleController', function($scope, $rootScope, $location, Document, $routeParams) {
        $rootScope.PAGE = "single";
        $scope.document = Document.get({ id: parseInt($routeParams.id, 10) });
        // $scope.blurUpdate = function() {
        //     $scope.document.modified = [new Date(), 'datetime'];
        // };
        $scope.delete = function() {
            $scope.document.$delete();
            $location.url('/documents');
        };
    })
    .controller('UploadController', function($scope, $http, $timeout, $upload) {

        $scope.fileReaderSupported = window.FileReader != null;
        $scope.uploadRightAway = true;
        
        $scope.changeAngularVersion = function() {
            window.location.hash = $scope.angularVersion;
            window.location.reload(true);
        }

        $scope.hasUploader = function(index) {
            return $scope.upload[index] != null;
        };

        $scope.abort = function(index) {
            $scope.upload[index].abort(); 
            $scope.upload[index] = null;
        };
        
        $scope.onFileSelect = function($files) {
            $scope.selectedFiles = [];
            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] != null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];
            $scope.selectedFiles = $files;
            $scope.dataUrls = [];
            for ( var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                if (window.FileReader && $file.type.indexOf('image') > -1) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL($files[i]);
                    var loadFile = function(fileReader, index) {
                        fileReader.onload = function(e) {
                            $timeout(function() {
                                $scope.dataUrls[index] = e.target.result;
                            });
                        }
                    }(fileReader, i);
                }
                $scope.progress[i] = -1;
                if ($scope.uploadRightAway) {
                    $scope.start(i);
                }
            }
        }
        
        $scope.start = function(index) {
            $scope.progress[index] = 0;
            if ($scope.howToSend == 1) {
                $scope.upload[index] = $upload.upload({
                    url : 'upload',
                    method: $scope.httpMethod,
                    headers: {'my-header': 'my-header-value'},
                    data : {
                        myModel : $scope.myModel
                    },
                    /* formDataAppender: function(fd, key, val) {
                        if (angular.isArray(val)) {
                            angular.forEach(val, function(v) {
                              fd.append(key, v);
                            });
                          } else {
                            fd.append(key, val);
                          }
                    }, */
                    /* transformRequest: [function(val, h) {
                        console.log(val, h('my-header')); return val + 'aaaaa';
                    }], */
                    file: $scope.selectedFiles[index],
                    fileFormDataName: 'myFile'
                })

                //================================================================== 
                /* CALLBACK FUNCTIONS*/ 
                //Success with POST - file uploaded ok 
                .success(function(data, status, headers,config) {
                    $scope.cbStatus = status;
                    $scope.cbData = data;
                    $scope.cbHeaders = header;
                    $scope.cbConfig = config;

                })
                //Error with POST
                .error(function(data, status, headers,config) {
                    $scope.data = cbData || "Request failed";
                    $scope.status = cbStatus;
                })
                //==================================================================



                .then(function(response) {
                    $scope.uploadResult.push(response.data);
                }, 

                null, function(evt) {
                    $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
                })

                .xhr(function(xhr){
                    xhr.upload.addEventListener('abort', function(){console.log('aborted complete')}, false);
                });
            } 
            else {
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    
                    $scope.upload[index] = $upload.http({
                        url: 'upload',
                        headers: {'Content-Type': $scope.selectedFiles[index].type},
                        data: e.target.result
                    })

                    //================================================================== 
                    /* CALLBACK FUNCTIONS*/ 
                    //Success with PUT - file uploaded ok 
                    .success(function(data, status, headers,config) {
                        $scope.cbStatus = status;
                        $scope.cbData = data;
                        $scope.cbHeaders = headers;
                        $scope.cbConfig = config;

                        alert("Success cb: status"+ cbStatus);
                        console.log("Success cb: status"+ cbStatus);
                    })
                    //Error with PUT
                    .error(function(data, status, headers,config) {
                        $scope.data = cbData || "Request failed";
                        $scope.status = cbStatus;
                    })
                    //==================================================================


                    .then(function(response) {
                        $scope.uploadResult.push(response.data);
                    }, 

                    null, function(evt) {
                        // Math.min is to fix IE which reports 200% sometimes
                        $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                }
                fileReader.readAsArrayBuffer($scope.selectedFiles[index]);

            }
        }
    })
    .controller('SettingsController', function ($scope, $rootScope, options, Fields) {
        $rootScope.PAGE = 'settings';

        $scope.allFields = [];
        $scope.fields = options.displayed_fields;

        Fields.headers().then(function (data) {
            $scope.allFields = data;
        });

        $scope.toggle = function (field) {
            var i = options.displayed_fields.indexOf(field);

            if (i > -1) {
                options.displayed_fields.splice(i, 1);
            } else {
                options.displayed_fields.push(field);
            }

            Fields.set(options.displayed_fields);
        }
    });
