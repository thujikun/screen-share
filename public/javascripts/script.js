!function($){
    var room_no,
        url = location.href,
        queries = location.search.slice(1).split("&"),
        ws,
        signalling,
        recvBuff = [],
        localVideo = document.getElementById('local'),
        remoteVideo = document.getElementById('remote'),
        localStream,
        remoteStream,
        debug = false;

    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;

    $("#room-url").html("<a href='"+url+"' target='_blank'>"+url+"</a>");

    queries.forEach(function(query) {
        if(query.indexOf("r=") === 0) {
            room_no = query.slice(2);
        }
    });

    ws = new WebSocket('wss://'+location.host + "/" + room_no);

    ws.onopen = function(e) {
        var self = this;
        this.isActive = function(){
            return self.readyState === window.WebSocket.prototype.OPEN;
        }
    };

    ws.onmessage = function(e) {
        var mesg = JSON.parse(e.data);
        
        if(!!mesg.type && typeof(signalling[mesg.type]) === "function") {
            signalling[mesg.type](mesg);
        } else {
        }
    }

    function sendDescription(desc) {
        if(ws.isActive()) {
            ws.send(JSON.stringify(desc));
        }
    }

    signalling = {
        'offer': onReceiveOffer,
        'answer': onReceiveAnswer,
        'candidate': onReceiveCandidate,
        'bye': onReceiveHangup
    };

    $("#send button").attr("disabled", "disabled");
    $("#send-offer").attr("disabled", "disabled");

    // WebRTC
    /////////////////////////////////////////

    $("#start").click(createConnection);
    $("#send-offer").click(startSendOffer);

    function trace(text) {
        // This function is used for logging.
        if (text[text.length - 1] == '\n') {
            text = text.substring(0, text.length - 1);
        }
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }

    function createConnection() {

        navigator.getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'screen'
                // maxWidth: 640,
                // maxHeight: 480
              }
            }
        }, function(stream) {
            localStream = stream;

            localVideo.src = webkitURL.createObjectURL(localStream);
            localVideo.play();

        });

        var servers = null;

        window.pc = new webkitRTCPeerConnection({
            'iceServers': [
            {
                url: 'stun:stun.l.google.com:19302'
            }
            ]
        });
        pc.onicecandidate = iceCallback1;

        pc.onaddstream = function(e) {
            remoteVideo.src = webkitURL.createObjectURL(e.stream);
            remoteVideo.play();
        }

        $("#start").attr("disabled", "disabled");
        $("#send-offer").attr("disabled", false);
    }

    function startSendOffer(){
        pc.addStream(localStream);

        pc.createOffer(function(description) {
            pc.setLocalDescription(description);
            sendDescription(description);
        });

    }

    function onReceiveOffer(desc) {
        pc.addStream(localStream);

        pc.setRemoteDescription(new RTCSessionDescription(desc), function(){
            pc.createAnswer(function(description) {
                pc.setLocalDescription(description);
                sendDescription(description);
            });
        });
    }

    function onReceiveAnswer(desc){
        trace("Receive Answer from peer.");
        pc.setRemoteDescription(new RTCSessionDescription(desc));
    }

    function onReceiveCandidate(desc){
        trace("Receive Candidate from peer.");
        var candidate = new RTCIceCandidate({sdpMLineIndex:desc.label, candidate:desc.candidate});
        pc.addIceCandidate(candidate);
    }

    function onReceiveHangup(desc){
        trace("Receive Hangup from peer.");
        pc.close();
        pc = null;
    }

    function iceCallback1(event) {
        if (event.candidate) {
            trace("Found candidate. Send it to peer.");
            sendDescription({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            trace("End of candidate");
        }
    }

    function onDataChannelStateChange() {
        var readyState = dataChannel.readyState;
        if(readyState === "open"){
            $("#send-offer").attr("disabled", "disabled");
            $("#send button").attr("disabled", false);
        }
        trace('Send channel state is: ' + readyState);
    }

    function onDataChannelReceiveMessage(ev){
        console.log(ev);
        var data = JSON.parse(ev.data);
        recvBuff[data.seq] = data.data

        if(data.seq === data.max)
            outputToReceive(recvBuff.join(""));

    }

}.call(window, jQuery);
