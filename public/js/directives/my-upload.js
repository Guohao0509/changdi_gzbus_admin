angular.module('app.directives').directive('myUpload', function (FileUploader) {
    var helper = {
        getType: function (name) {
            return '|' + name.slice(name.lastIndexOf('.') + 1) + '|';
        },
        /*
            type 类型
            closeMsg  true 关闭提示
        */
        isImage: function (type, closeMsg) {
            if ('|jpg|png|jpeg|bmp|gif|'.indexOf(type.toLowerCase()) !== -1) {
                return true;
            } else {
                if (!closeMsg) {
                    layer.alert("请确定文件格式为|jpg|png|jpeg|bmp|gif|", { icon: 7 });
                    return false;
                }
            }
        },
        isDoc: function (type, closeMsg) {
            if ('|doc|docx|txt|'.indexOf(type.toLowerCase()) !== -1) {
                return true;
            } else {
                if (!closeMsg) {
                    layer.alert("请确定文件格式为|doc|docx|txt|", { icon: 7 });
                    return false;
                }
            }
        },
        isVideo: function (type, closeMsg) {
            if ('|rm|rmvb|avi|mp4|3gp|'.indexOf(type.toLowerCase()) !== -1) {
                return true;
            } else {
                if (!closeMsg) {
                    layer.alert("请确定文件格式为|rm|rmvb|avi|mp4|3gp|", { icon: 7 });
                    return false;
                }
            }
        },
        isMp3: function (type, closeMsg) {
            if ('|mp3|'.indexOf(type.toLowerCase()) !== -1) {
                return true;
            } else {
                if (!closeMsg) {
                    layer.alert("请确定文件格式为|mp3|", { icon: 7 });
                    return false;
                }
            }
        },
        isZip: function (type, closeMsg) {
            if ('|zip|rar|'.indexOf(type.toLowerCase()) !== -1) {
                return true;
            } else {
                if (!closeMsg) {
                    layer.alert("请确定文件格式为|zip|rar|", { icon: 7 });
                    return false;
                }
            }
        },
        //检查尺寸是否符合规范
        uploadImgCheckedPx: function (f, w, h, msg, callback) {
            if (w && h) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    //判断图片尺寸
                    var img = null;
                    img = document.createElement("img");
                    document.body.appendChild(img);
                    img.style.visibility = "hidden";
                    img.src = this.result;
                    var imgwidth = img.naturalWidth;
                    var imgheight = img.naturalHeight;
                    if (imgwidth != w || imgheight != h) {
                        document.body.removeChild(img);
                        if (msg) {
                            msg += ">";
                        } else {
                            msg = "";
                        }
                        //询问框
                        layer.confirm(msg + "尺寸建议" + w + "x" + h + "，确定上传吗？", {
                            btn: ['确定', '取消'],
                            cancel: function () {
                                callback && callback(false);
                            }
                        }, function (index) {
                            layer.close(index);
                            callback && callback(true);
                        }, function () {
                            callback && callback(false);
                        });
                    } else {
                        callback && callback(true);
                    }
                }
                if (f)
                    reader.readAsDataURL(f);
            } else {
                callback && callback(true);
            }
        }
    };
    return {
        restrict: 'E',
        replace: true,
        scope: {
            filters: '@filters',
            response: '=response',
            size: '=size',
            callback: '@callback',
            width: '@width',
            height: '@height',
            msg: '@msg'
        },
        template: '<input type="file"  nv-file-select="" uploader="uploader" filters="{{filters}}" />',
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.selectedFile = changeEvent.target.files[0];
                    var type = helper.getType(scope.selectedFile.name);
                    if (helper.isImage(type, true)) {
                        helper.uploadImgCheckedPx(scope.selectedFile, scope.width, scope.height, scope.msg, function (state) {
                            if (state)
                                scope.uploader.uploadAll();
                            else
                                scope.uploader.clearQueue();
                        });
                    } else {
                        scope.uploader.uploadAll();
                    }
                });
            });
        },
        controller: function ($scope) {
            var uploader = $scope.uploader = new FileUploader({
                url: '/Handler/Upload.ashx',
                autoUpload: false,//自动上传
                removeAfterUpload: true,//文件上传成功之后从队列移除，默认是false
                queueLimit: 1// 最大上传文件数量
            });
            //文件限制提示语
            var showMsg = function (itemSize, maxSize) {
                if (itemSize / 1024 >= maxSize) {
                    layer.alert("文件大小必须小于" + (maxSize).toFixed(0) + "KB", { icon: 7 });
                    return false;
                }
                $scope.size = itemSize;
                return true;
            }
            // FILTERS
            uploader.filters.push({
                name: 'imageFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    if (!showMsg(item.size, 4096)) {
                        return false;
                    }
                    var type = helper.getType(item.name);
                    return helper.isImage(type) && this.queue.length < 5;
                }
            },
            {
                name: 'docFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    if (!showMsg(item.size, 3072)) {
                        return false;
                    }
                    var type = helper.getType(item.name);
                    return helper.isDoc(type);
                }
            },
            {
                name: 'videoFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    if (!showMsg(item.size, 204800)) {
                        return false;
                    }
                    var type = helper.getType(item.name);
                    return helper.isVideo(type);
                }
            },
            {
                name: 'mp3Filter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    if (!showMsg(item.size, 20480)) {
                        return false;
                    }
                    var type = helper.getType(item.name);
                    return helper.isMp3(type);
                }
            },
            {
                name: 'zipFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    if (!showMsg(item.size, 20480)) {
                        return false;
                    }
                    var type = helper.getType(item.name);
                    return helper.isZip(type);
                }
            });
            // CALLBACKS

            uploader.onWhenAddingFileFailed = function (item, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function (fileItem) {
                console.info('onAfterAddingFile', fileItem);
            };
            uploader.onAfterAddingAll = function (addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);
            };
            uploader.onBeforeUploadItem = function (item) {
                console.info('onBeforeUploadItem', item);
            };
            uploader.onProgressItem = function (fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function (progress) {
                console.info('onProgressAll', progress);
            };
            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
                if (response.indexOf("error") == -1) {
                    $scope.response = response;
                    if ($scope.callback) {
                        $scope.$emit($scope.callback, response);
                    }
                }
                else {
                    layer.alert(response, { icon: 2 });
                }
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                console.info('onCompleteItem', fileItem, response, status, headers);
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };
        }
    };
});