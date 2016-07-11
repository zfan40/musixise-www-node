$(function() {
    var $window = $(window);
    var $MIDIOBJ = $(MIDIOBJ);
    var ready = false; //need to assure the midi instrument has connected, here, we ask the musician to play from C to C.
    var matchPattern = [0, 2, 4, 5, 7, 9, 11, 12];
    var testMatch = [0, 0, 0, 0, 0, 0, 0, 0];
    record = [];
    var socket = io('http://io.musixise.com');
    var currentAudienceAmount = 0;
    //www.musixise.com/stage/fzw  => fzw (as stage name for socket)
    var nickName = location.href.match(/.*?stage\/(.*)/)[1];
    var userInfo = {
            name: nickName,
            userId:'',
            userAvatar: '',
            stageTitle: '',
            audienceNum: 0
        }


    var access_token = getCookie('access_token');

    //simulate userInfo
    var avatarlinks = ['https://gw.alicdn.com/tps/TB1rdVKLVXXXXXGXFXXXXXXXXXX-440-440.jpg',
    'https://gw.alicdn.com/tps/TB1pwJLLVXXXXXWXFXXXXXXXXXX-100-100.jpg',
    'https://gw.alicdn.com/tps/TB1xfBTLVXXXXcjXXXXXXXXXXXX-340-340.jpg',
    'https://gw.alicdn.com/tps/TB10_9NLVXXXXaKXXXXXXXXXXXX-753-756.png',
    'https://gw.alicdn.com/tps/TB1y4gELVXXXXXyXpXXXXXXXXXX-300-300.jpg',
    'https://gw.alicdn.com/tps/TB1PepxJXXXXXabXXXXXXXXXXXX-274-274.png',
    'https://gw.alicdn.com/tps/TB1RIrIJVXXXXaRXFXXXXXXXXXX-500-500.jpg',
    ];
    userInfo.userAvatar = avatarlinks[parseInt(Math.random()*7)];
    getCookie('access_token');
    $.ajax({
        // url: "//api.musixise.com/api/musixisers/getInfo",
        url: "//api.musixise.com/api/musixisers/getInfo",
        type: 'GET',
        // contentType:'application/json',
        data:{},
        // dataType:"jsonp",
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoZWhlaGUiLCJhdXRoIjoiUk9MRV9VU0VSIiwiZXhwIjoxNDcwMTMxMjI1fQ.1qvcg0c7gCcLfQ9VIzPNz1scaVv4WLKOr4DC7YLd4059kTU5Th6RTvSVJdXY8it8MbrLWhAsXwN77QYFD6Uraw");
            // xhr.setRequestHeader("Authorization", "Bearer "+access_token);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function(data, status) {
            alert(data);
            if (nickName == data.username) {
                // checkReady();
            } else {
                alert('错误账号');
                location.replace(location.host);
            }
            // userInfo = data;
        },
        error: function() { console.log('failed'); }
    });


    checkReady();

    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    }

    function checkReady() {
        $MIDIOBJ.on('MIDImsg', function(data) {
            if (data.message.midi_msg[0] == 144) {
                $('.deviceStatus').css('background-color', '#f44');
                setTimeout(function() { $('.deviceStatus').css('background-color', '#999') }, 100);
            }
            if (ready) {
                data.message.from = nickName;
                var msg = JSON.stringify(data.message);

                if (data.message.midi_msg[0] != 254) { //except active sensing
                    console.log('sending');
                    record.push([data.message.midi_msg[0], data.message.midi_msg[1], data.message.midi_msg[2], data.message.time]);
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
            var sendOutStr;
            if ($(e.target).html() == 'y') {
                sendOutStr = '即将演奏' + $(e.target).parent().attr('data-user') + '点播的' + $(e.target).parent().attr('data-songname');
                $(e.target).parent().css('background-color', '#161');
            } else if ($(e.target).html() == 'n') {
                sendOutStr = 'uh，咱不会' + $(e.target).parent().attr('data-user') + '点播的' + $(e.target).parent().attr('data-songname');
                $(e.target).parent().css('background-color', '#611');
            } else {
                return;
            }
            socket.emit('req_MusixiserPickSong', sendOutStr);
        });

        function updateAudienceAmount(num) {
            $('.currentAudienceAmount span').html(num);
        }

        // socket.on('new message', function(data) {
        //     console.log('received message from my own');
        // });

        // socket.on('dup stage', function(){
        //   alert(nickName+" stage is on performance");
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