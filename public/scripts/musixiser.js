$(function() {
    var $window = $(window);
    var $MIDIOBJ = $(MIDIOBJ);
    var ready = false; //need to assure the midi instrument has connected, here, we ask the musician to play from C to C.
    var matchPattern = [0, 2, 4, 5, 7, 9, 11, 12];
    var testMatch = [0, 0, 0, 0, 0, 0, 0, 0];
    var record = '';
    var socket = io('http://io.musixise.com:3002');
    //www.musixise.com/stage/fzw  => fzw (as stage name for socket)
    var myname = location.href.match(/.*?stage\/(.*)/)[1];
    socket.emit('create stage', myname);
    $MIDIOBJ.on('MIDImsg', function(data) {
        if (data.message.midi_msg[0] == 144) {
            $('body').css('background-color', '#999');
            setTimeout(function() { $('body').css('background-color', '#fff') }, 100);
        }
        if (ready) {
            data.message.from = myname;
            var msg = JSON.stringify(data.message);
            // console.log(msg); // it's a string
            record += msg;
            socket.emit('mmsg', msg);
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
            if (ready) { alert('nb'); }
        }
    });


    // socket.on('new message', function(data) {
    //     console.log('received message from my own');
    // });

    // socket.on('dup stage', function(){
    //   alert(myname+" stage is on performance");
    // });
});