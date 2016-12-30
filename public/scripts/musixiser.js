$(function() {
    var $window = $(window);
    var $MIDIOBJ = $(MIDIOBJ);
    var ready = false; //need to assure the midi instrument has connected, here, we ask the musician to play from C to C.
    var matchPattern = [0, 2, 4, 5, 7, 9, 11, 12];
    var testMatch = [0, 0, 0, 0, 0, 0, 0, 0];
    var record = [];
    var recordMode = 0;
    var recordStartTime = 0;
    var socket = io('http://io.musixise.com');
    var currentAudienceAmount = 0;
    //www.musixise.com/stage/fzw  => fzw (as stage name for socket)
    var uid = location.href.match(/.*?stage\/(.*)/)[1];

    var userInfo = {
        name: '',
        realname: '',
        uid: '',
        userAvatar: '',
        stageTitle: '',
        audienceNum: 0 //此处可造假数据...
    }

    var access_token = getCookie('access_token');

    var saveWorkDialogEverShowed = false;

    //Mask 隐藏
    function bindHideMask() {
        document.querySelector('.mask').addEventListener('click', function(e) {
            if (e.target.className == 'mask') {
                document.querySelector('.mask').style.display = 'none';
                [].forEach.call(document.querySelectorAll('.popup'), function(ele) {
                    ele.style.display = 'none'
                });
            }
        });
    }
    bindHideMask();


    $.ajax({
        url: "//api.musixise.com/api/user/getInfo",
        type: 'POST',
        // contentType:'application/json',
        data: {},
        // dataType:"jsonp",
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
            // xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkYXNoaWtlbGFuZyIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjE0Njg0OTU0NTB9.SOtceQou2I92qIU4jTVixi74Tu2wjssqdDtBmzuStmgLTSxW58xUecFdxbI7otzbn2oLG9zYB4k4o0whY75zCg");
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function(data, status) {
            console.log(data);
            console.log(uid);
            if (uid == data.data.userId) {
                userInfo.uid = uid;
                userInfo.name = data.data.username; //这个是用户登录名（英文字母数字）
                userInfo.realname = data.data.realname; //展示的名字
                userInfo.userAvatar = data.data.largeAvatar;
                rocknroll();
            } else {
                alert('错误账号');
                location.replace('//' + location.host);
            }
            // userInfo = data;
        },
        error: function() {
            alert('账号信息有误，请重新登录');
            deleteCookie('dotcom_user');
            deleteCookie('access_token');
            location.replace('//' + location.host);
        }
    });

    // rocknroll(); //测试时用这行，否则应该放在身份校验成功后

    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.musixise.com;path=/';
    }

    function saveWorkToLocal() {
        var currentStamp = +new Date();
        localStorage.setItem('' + currentStamp, JSON.stringify(record));
    }

    function showSaveWorkDialog() {
        if (record.length == 0) {
            alert('请先录点啥吧');
            return;
        }
        if (!saveWorkDialogEverShowed) {

            document.querySelector('.upload-work-dialog button').addEventListener('click', function() {
                saveWorkToServer();
            })
            saveWorkDialogEverShowed = true;
        }
        $('.mask').show();
        $('.upload-work-dialog').show();
    }

    function saveWorkToServer() {
        var work = {
            content: JSON.stringify(record)
        };

        //test
        // console.log(work);
        // return;


        //把midi串本地弄成文件，然后传到cdn
        // var form = new FormData();
        // var blob = new Blob([JSON.stringify(record)],{type:'text/plain'});
        // var request = new XMLHttpRequest();

        // form.append("blob", blob);
        // request.open(
        //     "POST",
        //     "//api.musixise.com/api/picture/uploadPic",
        //     true
        // );
        // request.send(form);
        // return;

        //jquery把midi串本地弄成文件，然后传到cdn
        // var fd = new FormData();
        // var blob = new Blob([JSON.stringify(record)], { type: 'text/plain' });
        // fd.append('fname', 'hh.txt');
        // fd.append('data', blob);
        // console.log(fd);
        // $.ajax({
        //     type: 'POST',
        //     url: '//api.musixise.com/api/picture/uploadPic',
        //     data: fd,
        //     processData: false,
        //     contentType: false
        // }).done(function(data) {
        //     console.log(data);
        // });
        // return;


        //
        var blob = new Blob([JSON.stringify(record)]);
        var reader = new FileReader();
        reader.onload = function(event) {
            var fd = new FormData();
            fd.append('fname', 'test.txt');
            fd.append('data', event.target.result);
            console.log(atob(event.target.result.split(',')[1])); //base64转一下
            $.ajax({
                type: 'POST',
                url: '//api.musixise.com/api/uploadAudio',
                data: fd,
                contentType: 'multipart/form-data',
                processData: false,
                contentType: false
            }).done(function(data) {
                var workURL = ('http://oaeyej2ty.bkt.clouddn.com/' + data.data);

                $.ajax({
                    url: "//api.musixise.com/api/work/create",
                    type: 'POST',
                    data: JSON.stringify({content:workURL}),
                    beforeSend: function(xhr, settings) {
                        xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
                        xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                        xhr.setRequestHeader("Accept", "application/json");
                        xhr.setRequestHeader("Content-Type", "application/json");
                    },
                    success: function(data, status) {
                        console.log(data);
                        alert('上传成功，请登录APP查看');
                        record = [];
                        $('.publishBtn').prop("disabled", true);
                    },
                    error: function() {}
                });
            });
        };
        // trigger the read from the reader...
        reader.readAsDataURL(blob);



    }

    function rocknroll() {
        $('.recordBtn').click(function() {
            if (recordMode == 0) {
                recordStartTime = performance.now(); //!!!!!!!!!! may be big bug...hahaha
                recordMode = 1;
                record = [];
                //publish invalid
                $('.publishBtn').prop("disabled", true);
            } else {
                recordMode = 0;
                //publish valid
                if (record.length) {
                    $('.publishBtn').prop("disabled", false);
                }
            }
            $('.recordBtn').toggleClass('active');
        });
        $('.publishBtn').click(function() {
            // if (record.length) {
            showSaveWorkDialog();
            // } else {
            // alert('record something first.');
            // }
        });
        $MIDIOBJ.on('MIDImsg', function(data) {
            if (data.message.midi_msg[0] == 144) {
                $('.deviceStatus').css('background-color', '#f44');
                setTimeout(function() { $('.deviceStatus').css('background-color', '#999') }, 100);
            }
            if (ready) {
                data.message.from = uid;

                var msg = JSON.stringify(data.message);
                if (data.message.midi_msg[0] != 254) { //except active sensing
                    // console.log('sending');
                    if (recordMode) {
                        record.push([data.message.midi_msg[0], data.message.midi_msg[1], data.message.midi_msg[2], (data.message.time - recordStartTime).toFixed(4)]);
                    }

                    socket.emit('mmsg', msg);
                }

            } else { //test 大调音阶 ，视为ready，相当于是个验证码吧~  弹了大调音阶才能给听众传
                if (data.message.midi_msg[0] == 144) {
                    testMatch.push(data.message.midi_msg[1]);
                    testMatch.shift(0);
                    var diff = testMatch[0] - matchPattern[0];
                    ready = true;
                    for (var i = 1; i <= 7; i++) {
                        if (testMatch[i] - matchPattern[i] != diff) {
                            ready = false;
                            break;
                        }
                    }
                }
                if (ready) {
                    //!!!!!!!!!!!!!!!!!!!!!!!!!
                    userInfo.stageTitle = $('#stagetitle').val();
                    console.log(userInfo);
                    socket.emit('create stage', userInfo);
                    //!!!!!!!!!!!!!!!!!!!!!!!@#$%^&*
                    $('.prestage .hint').html('开始直播');
                    setTimeout(function() {
                        $('.prestage').hide();
                        $('.onstage').show();
                    }, 1000);
                }
            }
        });

        $('input').keydown(function(e) {
            var content = $(this).val();
            if (e.keyCode == 13 && content) {
                $('#audienceMessageSection ul').prepend('<li>' + content + '</li>');
                $(this).val('');
                socket.emit('req_MusixiserComment', content);
            }
        });
        $('#pickSongSection').click(function(e) {
            var res;
            if ($(e.target).html() == 'y') {
                res = { type: 1, audienceName: $(e.target).parent().attr('data-user'), songName: $(e.target).parent().attr('data-songname') };
                $(e.target).parent().css('background-color', '#161');
            } else if ($(e.target).html() == 'n') {
                res = { type: 0, audienceName: $(e.target).parent().attr('data-user'), songName: $(e.target).parent().attr('data-songname') };
                $(e.target).parent().css('background-color', '#611');
            } else {
                return;
            }
            socket.emit('req_MusixiserPickSong', res);
        });

        function updateAudienceAmount(num) {
            $('.currentAudienceAmount span').html(num);
        }

        // socket.on('new message', function(data) {
        //     console.log('received message from my own');
        // });

        // socket.on('dup stage', function(){
        //   alert(uid+" stage is on performance");
        // });
        socket.on('AudienceCome', function() {
            updateAudienceAmount(++currentAudienceAmount);
            console.log('AudienceCome');
        });
        socket.on('AudienceLeave', function() {
            if (currentAudienceAmount <= 0) {
                currentAudienceAmount = 0;
            } else {
                updateAudienceAmount(--currentAudienceAmount);
            }
            console.log('AudienceLeave');
        });
        socket.on('res_AudienceComment', function(data) {
            // console.log(data);
            $('#audienceMessageSection ul').prepend('<li>' + data.username + ':' + data.msg + '</li>')
        });
        socket.on('res_AudienceOrderSong', function(data) {
            // console.log(data);
            $('#pickSongSection ul').prepend('<li data-user="' + data.username + '" data-songname="' + data.songname + '">' + data.username + ':' + data.songname + '<button>y</button><button>n</button></li>');
        });
        // socket.on('audienceTapFinger', function() {
        //     console.log('audienceTapFinger');
        // });
        // socket.on('audienceGiveGift', function() {
        //     console.log('audienceGiveGift');
        // });

    }




});