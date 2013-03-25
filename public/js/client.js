//(function() {
  window.MediaSource = window.MediaSource || window.WebKitMediaSource;
  var client = new BinaryClient('ws://'+window.location.hostname);
  var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  if( ! URL ){
    URL={};
  }
  if( ! URL.createObjectURL) {
    URL.createObjectURL=function(obj){return obj;}
  }

  $("#videoSource").change(function (e){
    var file = e.target.files[0];
    var fileURL = URL.createObjectURL(file);
    // Remove old stream video tag
    if(document.getElementById('streamSource')){
      document.getElementById('app').removeChild(document.getElementById('streamSource'));
    }
    var streamSource = document.createElement('video');
    streamSource.id = 'streamSource';
    streamSource.src = fileURL;
    streamSource.controls = true;
    streamSource.addEventListener('play', function(){
      client.send(file, {name: file.name, size: file.size});
    }, false);
    document.getElementById('app').appendChild(streamSource);
  });
  
  // Wait for client to connect to server
  client.on('open', function (stream){
    // Stream received from server
    client.on('stream', function (stream){
      console.log("new stream from server")
      // Remove old stream video tag
      if(document.getElementById('streamClient')){
        document.getElementById('app').removeChild(document.getElementById('streamClient'));
      }
      // Create media source
      var mediaSource = new MediaSource();
      var streamClient = document.createElement('video');
      streamClient.id = 'streamClient';
      streamClient.src = URL.createObjectURL(mediaSource);
      streamClient.controls = true;
      streamClient.autoplay = true;
      document.getElementById('app').appendChild(streamClient);
      // Wait for media source to be loaded before appending buffer
      mediaSource.addEventListener('webkitsourceopen', function(e) {
        // Append buffer
        mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');

        // Wait for streamed data from server
        stream.on('data', function (data){
          console.log("data coming")
          //console.log(mediaSource)
          // Append data to client buffer
          mediaSource.sourceBuffers[0].append(new Uint8Array(data));
        });
        stream.on('end', function (){
          console.log("stream 100% received on client")
          stream.destroy();
        });
      }, false);
    });
  });
  client.on('close', function (){
    console.log('client closed')
  });
//})();
