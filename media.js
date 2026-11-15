/* ICgram media: persistent music player + reels feed */
(function(){
'use strict';
var M=window.MEDIA||{music:[],reels:[]};
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var MK='icgram-music';
var ctx={};
function priv(){try{return localStorage.getItem('icgram-privacy')==='on'}catch(e){return false}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(t){if(ctx.toast)ctx.toast(t)}
function fmt(s){s=Math.max(0,Math.floor(s||0));var m=Math.floor(s/60),x=s%60;return m+':'+(x<10?'0':'')+x}
function title(i){return priv()?('Track '+(i+1)):M.music[i].t}
function cover(i){return (priv()||!M.music[i]||!M.music[i].c)?'':'assets/covers/'+M.music[i].c}
function setLabel(el,i){if(!el)return;var c=cover(i);el.style.backgroundImage=c?'url('+c+')':'';el.classList.toggle('vl-priv',!c)}

/* ---------------- MUSIC ---------------- */
var st={i:0,t:0,shuffle:false,repeat:'all',vol:1,shown:false};
try{var o=JSON.parse(localStorage.getItem(MK));if(o&&typeof o==='object'){for(var k in st)if(o[k]!=null)st[k]=o[k]}}catch(e){}
if(!(st.i>=0&&st.i<M.music.length))st.i=0;
var A=document.createElement('audio');A.id='icAudio';A.preload='none';A.setAttribute('playsinline','');document.body.appendChild(A);
var loaded=-1,pendingSeek=null,pausedByReel=false,order=null;
function saveSt(){st.t=Math.floor(A.currentTime||st.t||0);try{localStorage.setItem(MK,JSON.stringify(st))}catch(e){}}
function load(i,seek){st.i=i;loaded=i;A.src='assets/music/'+M.music[i].f;pendingSeek=seek||0;A.load();updMeta();render()}
A.addEventListener('loadedmetadata',function(){if(pendingSeek){try{A.currentTime=pendingSeek}catch(e){}}pendingSeek=null;render()});
function play(){if(!M.music.length)return;if(loaded!==st.i)load(st.i,st.t);pausedByReel=false;st.shown=true;var p=A.play();if(p&&p.catch)p.catch(function(){});showMini();render()}
function pause(){A.pause();saveSt();render()}
function toggle(){if(A.paused)play();else pause()}
function nextIdx(d){var n=M.music.length;if(st.shuffle&&n>1){var j;do{j=Math.floor(Math.random()*n)}while(j===st.i);return j}return (st.i+d+n)%n}
function next(auto){if(auto&&st.repeat==='one'){A.currentTime=0;play();return}
  if(auto&&st.repeat==='off'&&!st.shuffle&&st.i===M.music.length-1){A.pause();st.t=0;load(0,0);saveSt();return}
  load(nextIdx(1),0);play();saveSt()}
function prev(){if(A.currentTime>3){A.currentTime=0;return}load(nextIdx(-1),0);play();saveSt()}
function seekTo(s){if(loaded!==st.i){load(st.i,s);return}try{A.currentTime=s}catch(e){}}
A.addEventListener('ended',function(){next(true)});
A.addEventListener('play',render);A.addEventListener('pause',render);
var lastSave=0;
A.addEventListener('timeupdate',function(){renderTime();var n=Date.now();if(n-lastSave>5000){lastSave=n;saveSt();posState()}});
window.addEventListener('pagehide',saveSt);
document.addEventListener('visibilitychange',function(){if(document.hidden)saveSt()});

function updMeta(){if(!('mediaSession' in navigator)||!M.music.length)return;
  try{var md={title:title(st.i),artist:'ICgram',album:priv()?'ICgram':'ICgram Playlist'};
    var cv=cover(st.i);if(cv)md.artwork=[{src:cv,sizes:'400x400',type:'image/jpeg'}];
    navigator.mediaSession.metadata=new MediaMetadata(md)}catch(e){}}
function posState(){if(!('mediaSession' in navigator)||!navigator.mediaSession.setPositionState)return;
  try{if(A.duration&&isFinite(A.duration))navigator.mediaSession.setPositionState({duration:A.duration,playbackRate:A.playbackRate||1,position:Math.min(A.currentTime,A.duration)})}catch(e){}}
if('mediaSession' in navigator){var ms=navigator.mediaSession,h=function(a,f){try{ms.setActionHandler(a,f)}catch(e){}};
  h('play',play);h('pause',pause);h('previoustrack',prev);h('nexttrack',function(){next(false)});
  h('seekto',function(d){if(d&&d.seekTime!=null)seekTo(d.seekTime);posState()});
  h('seekbackward',function(d){seekTo(Math.max(0,A.currentTime-((d&&d.seekOffset)||10)))});
  h('seekforward',function(d){seekTo(Math.min(A.duration||0,A.currentTime+((d&&d.seekOffset)||10)))});}

var ICO={play:'<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z"/></svg>',
 pause:'<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
 next:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M5 6v12l8.5-6zM15 6h2.5v12H15z"/></svg>',
 prev:'<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6v12l-8.5-6zM7 6h2.5v12H7z"/></svg>',
 close:'<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 note:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="16" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'};

/* mini bar */
var mini=document.createElement('div');mini.id='mini';mini.className='hidden';mini.setAttribute('role','region');mini.setAttribute('aria-label','เครื่องเล่นเพลง');
mini.innerHTML='<div class="mini-prog"><i></i></div><button type="button" class="mini-info" aria-label="เปิดเครื่องเล่นเพลง"><span class="mini-disc" aria-hidden="true"><i class="vlabel"></i></span><span class="mini-t"></span></button>'+
 '<button type="button" class="mini-b" data-a="prev" aria-label="เพลงก่อนหน้า">'+ICO.prev+'</button><button type="button" class="mini-b mini-pp" data-a="pp" aria-label="เล่น/หยุด">'+ICO.play+'</button><button type="button" class="mini-b" data-a="next" aria-label="เพลงถัดไป">'+ICO.next+'</button><button type="button" class="mini-b mini-x" data-a="close" aria-label="ปิดเครื่องเล่น">'+ICO.close+'</button>';
document.body.appendChild(mini);
$('.mini-info',mini).onclick=openSheet;
$$('.mini-b',mini).forEach(function(b){b.onclick=function(){var a=b.dataset.a;if(a==='pp')toggle();else if(a==='next')next(false);else if(a==='prev')prev();else if(a==='close'){pause();st.shown=false;saveSt();hideMini()}}});
function showMini(){if(!M.music.length)return;mini.classList.remove('hidden');document.body.classList.add('has-mini')}
function hideMini(){mini.classList.add('hidden');document.body.classList.remove('has-mini')}

/* full sheet */
var sh=document.createElement('div');sh.id='musicSheet';sh.className='hidden';
document.body.appendChild(sh);
sh.addEventListener('click',function(e){if(e.target===sh)closeSheet()});
function openSheet(){sh.classList.remove('hidden');document.body.classList.add('music-open');buildSheet()}
function closeSheet(){sh.classList.add('hidden');document.body.classList.remove('music-open')}
function buildSheet(){
  var rep={off:'วนเล่น: ปิด',all:'วนทั้งหมด',one:'วนเพลงนี้'}[st.repeat];
  sh.innerHTML='<div class="msheet" role="dialog" aria-label="เครื่องเล่นเพลง"><div class="mhead"><b>เพลงประกอบการอ่าน</b><button type="button" class="icon-btn" id="mClose" aria-label="ปิด">×</button></div>'+
  '<div class="vinyl-wrap" aria-hidden="true"><div class="vinyl"><div class="vgrooves"></div><div class="vlabel"></div><div class="vhole"></div></div><div class="tonearm"><i class="ta-base"></i><i class="ta-arm"></i><i class="ta-head"></i></div></div>'+
  '<div class="mnow"><div class="mnt"><div class="mtitle"></div><div class="msub">'+(M.music.length)+' เพลง · เล่นต่อได้ขณะอ่าน</div></div></div>'+
  '<input type="range" id="mSeek" min="0" max="1000" value="0" aria-label="ตำแหน่งเพลง"><div class="mtimes"><span id="mCur">0:00</span><span id="mDur">0:00</span></div>'+
  '<div class="mctl"><button type="button" class="mtog'+(st.shuffle?' on':'')+'" id="mShuf" aria-pressed="'+st.shuffle+'">สุ่ม</button><button type="button" class="mbig" id="mPrev" aria-label="ก่อนหน้า">'+ICO.prev+'</button><button type="button" class="mbig mpp" id="mPP" aria-label="เล่น/หยุด"></button><button type="button" class="mbig" id="mNext" aria-label="ถัดไป">'+ICO.next+'</button><button type="button" class="mtog'+(st.repeat!=='off'?' on':'')+'" id="mRep">'+rep+'</button></div>'+
  '<label class="mvol"><span>เสียง</span><input type="range" id="mVol" min="0" max="100" value="'+Math.round(st.vol*100)+'" aria-label="ระดับเสียง"></label>'+
  '<ol class="mlist">'+M.music.map(function(s,i){return '<li><button type="button" data-i="'+i+'"><span class="mn">'+(i+1)+'</span>'+(cover(i)?'<span class="mc" style="background-image:url('+cover(i)+')"></span>':'<span class="mc mc-priv"></span>')+'<span class="ml">'+esc(title(i))+'</span><span class="md">'+fmt(s.d)+'</span></button></li>'}).join('')+'</ol></div>';
  $('#mClose').onclick=closeSheet;$('#mPP').onclick=toggle;$('#mNext').onclick=function(){next(false)};$('#mPrev').onclick=prev;
  $('#mShuf').onclick=function(){st.shuffle=!st.shuffle;saveSt();buildSheet()};
  $('#mRep').onclick=function(){st.repeat={off:'all',all:'one',one:'off'}[st.repeat]||'all';saveSt();buildSheet()};
  var sk=$('#mSeek');sk.oninput=function(){var d=A.duration||M.music[st.i].d;$('#mCur').textContent=fmt(sk.value/1000*d);sk._drag=true};
  sk.onchange=function(){var d=A.duration||M.music[st.i].d;seekTo(sk.value/1000*d);sk._drag=false;if(A.paused)st.t=Math.floor(sk.value/1000*d),saveSt()};
  $('#mVol').oninput=function(){st.vol=this.value/100;A.volume=st.vol;saveSt()};
  $$('.mlist button',sh).forEach(function(b){b.onclick=function(){load(+b.dataset.i,0);play();saveSt()}});
  render();
}
function renderTime(){var d=A.duration&&isFinite(A.duration)?A.duration:(M.music[st.i]?M.music[st.i].d:0),c=loaded===st.i?A.currentTime:st.t;
  var p=d?Math.min(1,c/d):0;var bar=$('.mini-prog i',mini);if(bar)bar.style.width=(p*100)+'%';
  if(!sh.classList.contains('hidden')){var sk=$('#mSeek');if(sk&&!sk._drag)sk.value=Math.round(p*1000);var a=$('#mCur'),b=$('#mDur');if(a&&!(sk&&sk._drag))a.textContent=fmt(c);if(b)b.textContent=fmt(d)}}
function render(){if(!M.music.length)return;var playing=!A.paused;
  $('.mini-t',mini).textContent=title(st.i);$('.mini-pp',mini).innerHTML=playing?ICO.pause:ICO.play;mini.classList.toggle('playing',playing);sh.classList.toggle('playing',playing);setLabel($('.vlabel',mini),st.i);
  var tb=$('#btnMusic');if(tb)tb.classList.toggle('on',playing);
  if(!sh.classList.contains('hidden')){setLabel($('.vinyl .vlabel',sh),st.i);var t=$('.mtitle',sh);if(t)t.textContent=title(st.i);var pp=$('#mPP');if(pp)pp.innerHTML=playing?ICO.pause:ICO.play;
    $$('.mlist button',sh).forEach(function(b){b.classList.toggle('cur',+b.dataset.i===st.i)})}
  renderTime();var rb=$('#reelResume');if(rb)rb.classList.toggle('hidden',!(pausedByReel&&A.paused))}
A.volume=st.vol;

/* topbar button */
function addTopBtn(){var ta=$('.top-actions');if(!ta||$('#btnMusic')||!M.music.length)return;var b=document.createElement('button');b.className='icon-btn';b.id='btnMusic';b.title='เพลง';b.setAttribute('aria-label','เปิดเครื่องเล่นเพลง');b.innerHTML=ICO.note;b.onclick=openSheet;ta.insertBefore(b,ta.firstChild)}
addTopBtn();
if(st.shown)showMini();
render();

/* ---------------- REELS ---------------- */
var LK='icgram-reel-likes';
function likes(){try{var o=JSON.parse(localStorage.getItem(LK));return (o&&typeof o==='object'&&!Array.isArray(o))?o:{}}catch(e){return {}}}
function setLike(id,on){var o=likes();if(on)o[id]=o[id]||Date.now();else delete o[id];try{localStorage.setItem(LK,JSON.stringify(o))}catch(e){}return on}
function shuffled(n){var a=[];for(var k=0;k<n;k++)a.push(k);for(var x=n-1;x>0;x--){var y=Math.floor(Math.random()*(x+1)),t=a[x];a[x]=a[y];a[y]=t}return a}
var R={io:null,near:null,muted:true,box:null,order:null,filter:'all',v:null};
var HEART_O='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 20.3s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.8 2.6c0 5.7-7.8 10.3-7.8 10.3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>';
var HEART_F='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 20.3s-7.8-4.6-7.8-10.3A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.8 2.6c0 5.7-7.8 10.3-7.8 10.3z" fill="currentColor"/></svg>';
var REFRESH='<svg viewBox="0 0 24 24" width="18" height="18"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function reelsLeave(){if(R.io){R.io.disconnect();R.io=null}if(R.near){R.near.disconnect();R.near=null}
  if(R.box){$$('video',R.box).forEach(function(v){try{v.pause();v.removeAttribute('src');v.load()}catch(e){}})}
  R.box=null;document.body.classList.remove('in-reels');window.removeEventListener('resize',fit)}
function fit(){if(!R.box)return;var tb=$('#topbar'),nv=$('#bottomnav');var top=tb?tb.getBoundingClientRect().bottom:0,bot=nv?nv.getBoundingClientRect().height:0;
  R.box.style.top=Math.max(0,top)+'px';R.box.style.bottom=bot+'px';var bar=$('#reelBar');if(bar)bar.style.top=(Math.max(0,top)+8)+'px';var pl=$('#reelPull');if(pl)pl.style.top=(Math.max(0,top)+6)+'px';
  var rr=$('#reelResume');if(rr)rr.style.top=(Math.max(0,top)+52)+'px'}
function refreshReels(){R.order=shuffled(M.reels.length);if(R.v)reels(R.v);if(R.box)R.box.scrollTop=0;toast(R.filter==='liked'?'สุ่มลำดับรีลที่ชอบใหม่แล้ว':'สุ่มลำดับรีลใหม่แล้ว')}
function burst(sec){var b=document.createElement('div');b.className='heart-burst';b.innerHTML=HEART_F;sec.appendChild(b);setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b)},900)}
function paintLike(sec,on){var b=$('.reel-like',sec);if(!b)return;b.innerHTML=on?HEART_F:HEART_O;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'เลิกถูกใจ':'ถูกใจ');updCount()}
function updCount(){var n=Object.keys(likes()).length,c=$('#reelLikedN');if(c)c.textContent=n?String(n):''}
function reels(v){reelsLeave();R.v=v;document.body.classList.add('in-reels');
  if(!R.order||R.order.length!==M.reels.length){R.order=[];for(var k=0;k<M.reels.length;k++)R.order.push(k)}
  var p=priv(),lk=likes();
  var list=R.order.filter(function(ix){return R.filter!=='liked'||lk[M.reels[ix].f]});
  var h='<div id="reels" class="reels'+(p?' reels-priv':'')+'">';
  if(p){M.reels.forEach(function(r,i){h+='<section class="reel" data-i="'+i+'"><div class="ph-tile tone-'+(i%4)+' reel-tile"><span>Reel '+(i+1)+'</span></div><div class="reel-cap"><b>Reel '+(i+1)+' / '+M.reels.length+'</b><div>โหมดส่วนตัวเปิดอยู่ · ซ่อนวิดีโอแล้ว<br>ปิดโหมดส่วนตัว (ไอคอนตา) เพื่อดูรีล</div></div></section>'})}
  else if(!list.length){h+='<section class="reel reel-empty"><div><div class="re-h">'+HEART_O+'</div><b>ยังไม่มีรีลที่ถูกใจ</b><p>แตะหัวใจหรือแตะสองครั้งที่คลิปเพื่อเก็บไว้ดูที่นี่</p><button type="button" class="btn sm" id="reelAll">ดูรีลทั้งหมด</button></div></section>'}
  else list.forEach(function(ix,n){var r=M.reels[ix],on=!!lk[r.f];
    h+='<section class="reel" data-id="'+esc(r.f)+'"><video class="artist" playsinline webkit-playsinline muted loop preload="none" data-src="assets/reels/'+r.f+'" data-poster="assets/reels/'+r.p+'"></video>'+
      '<div class="reel-tap" aria-hidden="true"></div><div class="reel-paused hidden">'+ICO.play+'</div>'+
      '<div class="reel-side"><button type="button" class="reel-btn reel-like'+(on?' on':'')+'" aria-pressed="'+on+'" aria-label="'+(on?'เลิกถูกใจ':'ถูกใจ')+'">'+(on?HEART_F:HEART_O)+'</button><button type="button" class="reel-btn reel-mute" aria-label="เปิด/ปิดเสียง"></button></div>'+
      '<div class="reel-cap"><b>'+(n+1)+' / '+list.length+'</b>'+(r.c?'<div>'+esc(r.c)+'</div>':'')+'</div></section>'});
  h+='</div>';
  if(!p)h+='<div id="reelPull" class="reel-pull" aria-hidden="true">'+REFRESH+'</div><div id="reelBar" class="reel-bar"><button type="button" class="rb'+(R.filter==='all'?' on':'')+'" data-f="all">ทั้งหมด</button><button type="button" class="rb'+(R.filter==='liked'?' on':'')+'" data-f="liked">'+HEART_F+'<span>ที่ชอบ</span><span id="reelLikedN" class="rb-n"></span></button><button type="button" class="rb rb-ref" id="reelRefresh" aria-label="สุ่มลำดับใหม่">'+REFRESH+'<span>สุ่มใหม่</span></button></div>';
  h+='<button type="button" id="reelResume" class="reel-resume hidden">'+ICO.play+'<span>เล่นเพลงต่อ</span></button>';
  v.innerHTML=h;R.box=$('#reels',v);fit();window.addEventListener('resize',fit);updCount();
  $('#reelResume').onclick=function(){R.muted=true;if(R.box)$$('video',R.box).forEach(function(x){x.muted=true});updMute();play()};
  if(p)return;
  $('#reelRefresh').onclick=refreshReels;
  $$('#reelBar [data-f]').forEach(function(b){b.onclick=function(){if(R.filter===b.dataset.f)return;R.filter=b.dataset.f;reels(v)}});
  var ra=$('#reelAll');if(ra)ra.onclick=function(){R.filter='all';reels(v)};
  /* pull to refresh */
  var py=null,pd=0,pull=$('#reelPull');
  R.box.addEventListener('touchstart',function(e){py=(R.box.scrollTop<=0&&e.touches.length===1)?e.touches[0].clientY:null;pd=0},{passive:true});
  R.box.addEventListener('touchmove',function(e){if(py==null)return;pd=e.touches[0].clientY-py;if(pd>0&&R.box.scrollTop<=0){var t=Math.min(pd,110);pull.style.transform='translateX(-50%) translateY('+(t*0.6)+'px) rotate('+(t*3)+'deg)';pull.style.opacity=Math.min(1,t/70);pull.classList.toggle('ready',t>=80)}},{passive:true});
  R.box.addEventListener('touchend',function(){if(py==null)return;var go=pd>=80&&R.box.scrollTop<=0;py=null;pull.style.transform='';pull.style.opacity='';pull.classList.remove('ready');if(go)refreshReels()});
  var secs=$$('.reel[data-id]',R.box);
  secs.forEach(function(s){var vd=$('video',s),id=s.dataset.id,last=0,single=null;
    vd.addEventListener('loadedmetadata',function(){s.classList.toggle('land',vd.videoWidth/vd.videoHeight>0.75)});
    $('.reel-tap',s).onclick=function(){var t=Date.now();
      if(t-last<300){clearTimeout(single);single=null;last=0;if(!likes()[id]){setLike(id,true);paintLike(s,true)}burst(s);return}
      last=t;single=setTimeout(function(){single=null;if(vd.paused){playReel(vd)}else{vd.pause();$('.reel-paused',s).classList.remove('hidden')}},300)};
    $('.reel-like',s).onclick=function(e){e.stopPropagation();var on=setLike(id,!likes()[id]);paintLike(s,on);if(on)burst(s)};
    $('.reel-mute',s).onclick=function(e){e.stopPropagation();R.muted=!R.muted;secs.forEach(function(x){var y=$('video',x);y.muted=R.muted});updMute();if(!R.muted){if(vd.paused)playReel(vd);musicDuck()}};
  });
  updMute();
  R.near=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var vd=$('video',e.target);if(vd&&!vd.getAttribute('poster'))vd.setAttribute('poster',vd.dataset.poster)}})},{root:R.box,rootMargin:'100% 0px'});
  R.io=new IntersectionObserver(function(es){es.forEach(function(e){var vd=$('video',e.target);if(!vd)return;
    if(e.intersectionRatio>=0.6){playReel(vd);var nx=e.target.nextElementSibling;if(nx){var nv=$('video',nx);if(nv&&!nv.getAttribute('src')){nv.preload='metadata';nv.src=nv.dataset.src}}}
    else{if(!vd.paused)vd.pause()}})},{root:R.box,threshold:[0,0.6]});
  secs.forEach(function(s){R.near.observe(s);R.io.observe(s)});
}
function playReel(vd){if(!vd.getAttribute('src')){vd.src=vd.dataset.src}vd.preload='auto';vd.muted=R.muted;
  var s=vd.closest('.reel');if(s)$('.reel-paused',s).classList.add('hidden');
  var p=vd.play();if(!R.muted)musicDuck();
  if(p&&p.catch)p.catch(function(){if(!vd.muted){vd.muted=true;R.muted=true;updMute();vd.play().catch(function(){})}})}
function musicDuck(){if(!A.paused){A.pause();saveSt();pausedByReel=true;toast('พักเพลงไว้ระหว่างดูรีล')}render()}
function updMute(){if(!R.box)return;$$('.reel-mute',R.box).forEach(function(b){b.innerHTML=R.muted?'<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';b.setAttribute('aria-pressed',String(!R.muted))})}

function onPrivacy(){updMeta();render();if(!sh.classList.contains('hidden'))buildSheet()}
window.ICMedia={init:function(c){ctx=c||{}},reels:reels,refreshReels:refreshReels,likes:likes,LIKES_KEY:LK,R:R,leave:reelsLeave,onPrivacy:onPrivacy,
  play:play,pause:pause,next:function(){next(false)},prev:prev,open:openSheet,close:closeSheet,audio:A,state:function(){return st},KEY:MK};
})();
