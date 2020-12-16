var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var ids = getvidID();
var sources = getSources();
var i = 0;
var onlyYtb = true;
for(i=0;i<sources.length;i++){
    if (sources[i]!="youtube"){
        onlyYtb = false;
    }
}
if(onlyYtb){
    var iframe = document.getElementById('song_player');
    iframe.style.width = 0;
    iframe.style.height = 0;
    for(j=0; j<ids.length; j++){
        let button = document.getElementById(ids[j]);
        button.addEventListener("click", function(){
            console.log('button')
            i = ids.indexOf(button.id);
            player.loadVideoById(ids[i]);
            player.playVideo();
        });
    }

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
        height: '250',
        width: '320',
        videoId : ids[0],
        events: {
            'onReady' : onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
        });
    }
    function onPlayerReady(event){
    }
    function onPlayerStateChange(event) {
        if (event.data == 0){
        i++;
        let prev = i
        if(i>=ids.length){
            i = 0;
            prev = ids.length;
        }
        player.loadVideoById(ids[i]);
        player.playVideo();
        }
    }
    function stopVideo() {
        player.stopVideo();
    }
}

function getvidID(){
    var as = document.getElementsByTagName('button');
    var ids = []
    for(i=3;i<as.length; i++){
        ids.push(as[i].id);
    }
    return ids;
}

function getSources(){
    var as = document.getElementsByTagName('button')
    var sources = []
    for(i=3;i<as.length;i++){
        sources.push(as[i].name);
    }
    return sources;
}