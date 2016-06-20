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
    var userID = location.href.match(/.*?stage\/(.*)/)[1];
    socket.emit('create stage', userID);
    $MIDIOBJ.on('MIDImsg', function(data) {
        if (data.message.midi_msg[0] == 144) {
            $('.deviceStatus').css('background-color', '#f44');
            setTimeout(function() { $('.deviceStatus').css('background-color', '#999') }, 100);
        }
        if (ready) {
            data.message.from = userID;
            var msg = JSON.stringify(data.message);

            if (data.message.midi_msg[0]!=254){//except active sensing
                console.log('sending');
                record.push([data.message.midi_msg[0],data.message.midi_msg[1],data.message.midi_msg[2],data.message.time]);
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
            socket.emit('req_MusixiserComment',content);
        }
    });
    $('#pickSongSection').click(function(e){
        // console.log($(e.target.attr('sd')));
        socket.emit('req_MusixiserPickSong','jj');
    });

    function updateAudienceAmount(num) {
        $('.currentAudienceAmount span').html(num);
    }

    // socket.on('new message', function(data) {
    //     console.log('received message from my own');
    // });

    // socket.on('dup stage', function(){
    //   alert(userID+" stage is on performance");
    // });
    socket.on('AudienceCome', function() {
        updateAudienceAmount(++currentAudienceAmount);
        console.log('AudienceCome');
    });
    socket.on('AudienceLeave', function() {
        if (currentAudienceAmount<=0) {
            currentAudienceAmount = 0;
        } else {
            updateAudienceAmount(--currentAudienceAmount);    
        }
        
        console.log('AudienceLeave');
    });
    socket.on('res_AudienceComment', function(data) {
        console.log(data);
        $('#audienceMessageSection ul').prepend('<li>' + data.username+':'+data.msg + '</li>')
    });
    socket.on('res_AudienceOrderSong', function(data) {
        console.log(data);
        $('#pickSongSection ul').prepend('<li>' + data.username+':'+data.songname + '<button>y</button><button>n</button></li>')
    });
    // socket.on('audienceTapFinger', function() {
    //     console.log('audienceTapFinger');
    // });
    // socket.on('audienceGiveGift', function() {
    //     console.log('audienceGiveGift');
    // });
});