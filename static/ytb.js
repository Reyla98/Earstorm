var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var ids = getvidID();
var i = 0;
var rows = document.getElementById('songTable').getElementsByTagName('tr');
rows[1].style.fontWeight = "bold";
rows[1].style.fontSize = "1.15em";
for(j=0; j<ids.length; j++){
    let button = document.getElementById(ids[j]);
    button.addEventListener("click", function(){
    for(let i=1; i<rows.length; i++){
        rows[i].style.fontWeight = "normal";
        rows[i].style.fontSize = "1em";
    }
    i = ids.indexOf(button.id);
    player.loadVideoById(ids[i]);
    player.playVideo();
    rows[i+1].style.fontWeight = "bold";
    rows[i+1].style.fontSize = "1.15em";
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
    rows[prev].style.fontWeight = "normal";
    rows[prev].style.fontSize = "1em";
    rows[i+1].style.fontWeight = "bold";
    rows[i+1].style.fontSize = "1.15em";
    }
}
function stopVideo() {
    player.stopVideo();
}

function getvidID(){
    var as = document.getElementsByTagName('a');
    var ids = []
    for(i=3;i<as.length; i++){
    ids.push(as[i].id);
    }
    return ids;
}