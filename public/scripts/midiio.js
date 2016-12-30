$(function() {
    var midiAccess = null;
    var GLOBAL_MIDIOBJ = null;
    var activeInputID = [];
    var currentActiveNum = 0;
    var performState = 0; //0,1,2: before, during, after
    var haveAtLeastOneDevice = false;
    var $midiobj; //just to cache jquery object
    function MIDIObj() {
        this.init.apply(this, arguments);
    }

    MIDIObj.prototype = {
        //选择乐器前，可随意插拔midi乐器且状态实时更改
        //选择乐器后，不可中途插拔midi乐器，只能改变音色
        init: function() {
            console.log('in midi io');
            var self = this;
            GLOBAL_MIDIOBJ = this;
            if (navigator.requestMIDIAccess)
                navigator.requestMIDIAccess().then(self.onMIDIInit, self.onMIDIReject);
        },
        onMIDIInit: function(midi) {
            $midiobj = $(GLOBAL_MIDIOBJ);
            midiAccess = midi;
            var inputs = midiAccess.inputs.values();
            //inputs is type of Iterator{}
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                //需要有个字典或数组管理这些input
                currentActiveNum += 1;
                activeInputID.push(input.value.id);
                // console.log('bind');
                input.value.onmidimessage = function(event) {

                    var MIDI_msg = event.data;
                    // console.log(MIDI_msg, 'by ' + event.currentTarget.id + 'with timre ' + 0);
                    //instant 入键
                    $midiobj.trigger({
                        type: "MIDImsg",
                        message: {
                            midi_msg: MIDI_msg,
                            time: event.receivedTime.toFixed(4), // event.receivedTime is same as: performance.now()
                            timbre: 'sine'
                        },

                    });
                };
                haveAtLeastOneDevice = true;
            }
            if (!haveAtLeastOneDevice) {
                alert("No MIDI input devices present.  You're gonna have a bad time.");
            }
            midiAccess.onstatechange = function(e) {
                // console.log(e.port.id);
                if (e.port.type == 'input' && e.port.state == 'connected') {
                    if (activeInputID.indexOf(e.port.id) == -1) { //a new input device!
                        // console.log('bind');
                        activeInputID.push(e.port.id);
                        console.log(activeInputID);
                        e.port.onmidimessage = function(event) {
                            var MIDI_msg = event.data;
                            // console.log(event);
                            console.log(MIDI_msg, 'by ' + e.port.id + 'with timre ' + 0);
                            //instant 入键
                            $midiobj.trigger({
                                type: "MIDImsg",
                                message: {
                                    midi_msg: MIDI_msg,
                                    time: event.receivedTime.toFixed(4), // event.receivedTime is same as: performance.now()
                                    timbre: 'sine'
                                }
                            });
                        };
                    }
                } else if (e.port.type == 'input' && e.port.state == 'disconnected') {
                    activeInputID.splice(activeInputID.indexOf(e.port.id), 1);
                    console.log(activeInputID);
                    currentActiveNum -= 1;
                    // console.log(e.port.type);
                    // e.port.onmidimessage = function(event) {};
                }
            }
        },
        onMIDIReject: function(err) {
            alert("The MIDI system failed to start.  You're gonna have a bad time.");
        },
        setInputIdAsInstrument: function(id, timbre) {
            var found = 0;
            if (timbre == undefined) timbre = 'sine';
            midiAccess.inputs.forEach(function(key, port) {
                if (port == id) {
                    found = 1;
                    key.onmidimessage = function(event) {
                        var MIDI_msg = event.data;
                        console.log(MIDI_msg, 'by ' + event.currentTarget.id + 'with timre ' + timbre);
                        //instant 入键
                        $midiobj.trigger({
                            type: "MIDImsg",
                            message: {
                                midi_msg: MIDI_msg,
                                time: event.receivedTime, // event.receivedTime is same as: performance.now()
                                timbre: timbre
                            }
                        });
                    };
                }

            });
            if (found) {
                console.log('选定音色成功');
            } else {
                console.log('您绑定的midi乐器不存在');
            }
        }
    }

    window.MIDIOBJ = new MIDIObj();
})