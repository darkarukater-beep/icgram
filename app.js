(function(){
'use strict';
var D=window.DATA, $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var L=['1','2','3','4'];
var NAMES=(typeof CHEER_NAMES!=='undefined'&&CHEER_NAMES.length)?CHEER_NAMES:[];
var ART=(typeof ARTIST_NAME!=='undefined'&&ARTIST_NAME)?ARTIST_NAME:'';
var PASS=(typeof PASS_PCT!=='undefined')?PASS_PCT:70;
var ME=(typeof STUDENT_NAME!=='undefined'&&STUDENT_NAME)?STUDENT_NAME:'คุณ';
var QBY={};D.questions.forEach(function(q){QBY[q.id]=q});
var CHBY={};D.chapters.forEach(function(c){CHBY[c.id]=c});
/* ---------- storage ---------- */
var KEY='icgram_v1', S;
function load(){try{S=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){S={}}
  S.attempts=S.attempts||[];S.best=S.best||{};S.stats=S.stats||{};S.wrong=S.wrong||{};S.liked=S.liked||{};S.seen=S.seen||{};S.answered=S.answered||{};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
load();

function icgStore(){var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('icgram')===0){var v=localStorage.getItem(k);try{o[k]=JSON.parse(v)}catch(e){o[k]=v}}}return o}
function b64e(s){return btoa(unescape(encodeURIComponent(s)))}
function b64d(s){return decodeURIComponent(escape(atob(s)))}
function backupCode(){return 'ICG1.'+b64e(JSON.stringify({v:1,t:Date.now(),d:icgStore()}))}
function parseBackup(raw){raw=String(raw||'').replace(/\s+/g,'');if(!raw)throw new Error('empty');
  var json;if(raw.indexOf('ICG1.')===0){json=b64d(raw.slice(5))}else{try{json=b64d(raw)}catch(e){json=raw}}
  var p=JSON.parse(json);var d=p&&(p.d||p.data);if(!d||typeof d!=='object')throw new Error('shape');
  var keys=Object.keys(d).filter(function(k){return k.indexOf('icgram')===0});if(!keys.length)throw new Error('keys');
  return {d:d,keys:keys}}
function mergeVal(k,inc){if(k!==KEY||!inc||typeof inc!=='object'||Array.isArray(inc))return inc;
  var cur=S||{}, out={};
  var att=(cur.attempts||[]).concat(inc.attempts||[]), seen={}, uniq=[];
  for(var i=0;i<att.length;i++){var a=att[i]||{}, id=[a.date,a.key,a.score,a.total,a.pct].join('|');if(seen[id])continue;seen[id]=1;uniq.push(a)}
  out.attempts=uniq;
  out.best={};[cur.best,inc.best].forEach(function(b){if(!b)return;Object.keys(b).forEach(function(x){if(out.best[x]==null||b[x]>out.best[x])out.best[x]=b[x]})});
  out.stats={};[cur.stats,inc.stats].forEach(function(st){if(!st)return;Object.keys(st).forEach(function(x){var a=out.stats[x]||{c:0,w:0},b=st[x]||{};a.c+=(b.c||0);a.w+=(b.w||0);out.stats[x]=a})});
  function unionTime(a,b){var o={};[a,b].forEach(function(src){if(!src)return;Object.keys(src).forEach(function(x){if(o[x]==null||src[x]>o[x])o[x]=src[x]})});return o}
  out.wrong=unionTime(cur.wrong,inc.wrong);out.liked=unionTime(cur.liked,inc.liked);out.seen=unionTime(cur.seen,inc.seen);
  out.answered={};[cur.answered,inc.answered].forEach(function(src){if(!src)return;Object.keys(src).forEach(function(x){out.answered[x]=src[x]})});
  out.timer=(inc.timer!=null)?inc.timer:cur.timer;return out}
function applyBackup(d){Object.keys(d).forEach(function(k){if(k.indexOf('icgram')!==0)return;var val=mergeVal(k,d[k]);localStorage.setItem(k,typeof val==='string'?val:JSON.stringify(val))});load()}
function copyText(s,okMsg){function done(){toast(okMsg||'คัดลอกแล้ว')}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(done).catch(fallback)}else fallback();
  function fallback(){var t=$('#bakOut');if(t){t.focus();t.select();try{document.execCommand('copy');done()}catch(e){toast('คัดลอกไม่สำเร็จ ลองเลือกข้อความเอง')}}}}
/* ---------- helpers ---------- */
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function photo(i){return 'assets/photos/'+D.photos[((i%D.photos.length)+D.photos.length)%D.photos.length].f}
function thumb(i){return photo(i).replace(/\/p(\d+)\.jpg$/,'/t$1.jpg')}
function rphoto(){return photo(rnd(D.photos.length))}
function hash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function cheerName(){return NAMES.length?pick(NAMES):''}
var CHEERS_OK=['เก่งมาก! {n} ภูมิใจในตัว'+ME+'สุดๆ ✨','ผ่านฉลุย! {n} ปรบมือให้เลย 👏','สวยงาม! {n} บอกว่าวันสอบจริงก็ทำได้แน่','ปังมาก! {n} ขอเป็นกำลังใจให้ต่อไป ✨'];
var CHEERS_TRY=['ไม่เป็นไรนะ {n} เป็นกำลังใจให้ ลองทบทวนข้อที่ผิดอีกนิด 💪','ใกล้แล้ว! {n} เชื่อว่ารอบหน้าผ่านแน่','ทุกข้อที่ผิดคือข้อที่จะจำได้ในวันสอบ — {n} สู้ไปด้วยกัน','พักหายใจแป๊บ แล้วลุยต่อ {n} รออยู่ ✨'];
function cheer(ok){var n=cheerName();var t=pick(ok?CHEERS_OK:CHEERS_TRY);return n?t.replace('{n}',n):(ok?'เก่งมาก! สู้ๆ นะ!':'สู้ๆ นะ! ลองอีกรอบ')}
function toast(t){var e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){e.classList.remove('show')},1600)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function chTitle(id){var c=CHBY[id];return c?c.id+' '+c.title:''}
function setName(s){return D.sets[s]?D.sets[s].short:s}
function brandName(){return ART?ART:'สู้ๆ นะ!'}
/* ---------- stats ---------- */
function record(q,ok){var st=S.stats[q.id]||{c:0,w:0};if(ok)st.c++;else st.w++;S.stats[q.id]=st;
  if(ok){if(S.wrong[q.id])delete S.wrong[q.id]}else S.wrong[q.id]=Date.now();S.answered[q.id]=1;save()}
function chapterAcc(){var r={};D.questions.forEach(function(q){var st=S.stats[q.id];if(!st)return;var a=r[q.ch]||(r[q.ch]={c:0,w:0});a.c+=st.c;a.w+=st.w});return r}
function weakTopics(){var a=chapterAcc(),out=[];for(var k in a){var t=a[k].c+a[k].w;if(t>=2)out.push({ch:k,pct:Math.round(100*a[k].c/t),t:t})}
  out.sort(function(x,y){return x.pct-y.pct});return out.filter(function(x){return x.pct<PASS}).slice(0,5)}
/* ---------- router ---------- */
var cur='home';
function go(tab,arg){cur=tab;$$('#bottomnav button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===tab)});
  stopHero();window.scrollTo(0,0);var v=$('#view');v.innerHTML='';
  ({home:home,read:readList,chapter:chapter,formula:formulaPage,quiz:quizHome,run:runQuiz,review:review,profile:profile,liked:likedPage})[tab](v,arg);}
$$('#bottomnav button').forEach(function(b){b.onclick=function(){go(b.dataset.tab)}});
$('#logo').onclick=function(){go('home')};
$('#btnFormula').onclick=function(){go('formula')};
$('#btnLiked').onclick=function(){go('liked')};
$('#navAvatar').src=thumb(0);
function updLiked(){var n=Object.keys(S.liked).length;$('#likedCount').textContent=n?n:''}
updLiked();
/* ---------- HOME / FEED ---------- */
var heroT=null;function stopHero(){if(heroT){clearInterval(heroT);heroT=null}}
function home(v){
  // notes
  var notes='<div class="notes">'+D.notes.map(function(n,i){return '<div class="note" data-i="'+i+'">'+n.short+'</div>'}).join('')+'</div>';
  // stories: chapters + formula decks
  var st='<div class="stories">'+D.stories.map(function(s,i){return '<button class="st" data-s="'+i+'"><div class="ring'+(S.seen[s.id]?' seen':'')+'"><img loading="lazy" src="'+thumb(s.photo)+'" alt=""></div><span class="sl">'+esc(s.label)+'</span></button>'}).join('')+'</div>';
  var tot=S.attempts.length, ans=Object.keys(S.answered).length, best=Math.max.apply(null,[0].concat(Object.keys(S.best).map(function(k){return S.best[k]})));
  var wk=weakTopics();
  var dash='<section class="dash"><div class="hero"><img id="h1" src="'+photo(0)+'" alt=""><img id="h2" src="'+photo(1)+'" style="opacity:0" alt=""><div class="shade"></div><div class="htxt"><h2>'+'สู้ๆ นะ '+esc(ME)+'! 🤍'+'</h2><p>ICgram'+(ART?' · ธีม '+esc(ART):'')+' · เป้าหมาย: สอบ IC Plain (P1) ผ่าน ≥ '+PASS+'% · วันนี้อ่านนิด ทำข้อสอบหน่อยก็พอ</p></div></div>'+
   '<div class="stats"><div><b>'+tot+'</b><span>ชุดที่ทำแล้ว</span></div><div><b>'+ans+'/'+D.questions.length+'</b><span>ข้อที่เคยตอบ</span></div><div><b>'+(tot?best+'%':'–')+'</b><span>คะแนนสูงสุด</span></div></div>'+
   '<div class="weak">'+(wk.length?'<b>หัวข้อที่ควรทวน:</b><br>'+wk.map(function(w){return '<button class="chip" data-ch="'+w.ch+'">'+esc(chTitle(w.ch))+' · '+w.pct+'%</button>'}).join(''):'<span class="muted">ทำข้อสอบสักชุด แล้วระบบจะบอกหัวข้อที่ควรทวนให้ตรงนี้</span>')+
   '<div style="margin-top:8px"><button class="btn pri sm" id="goQuiz">เริ่มทำข้อสอบ</button><button class="btn sm" id="goRead">อ่านเนื้อหา</button><button class="btn sm" id="goF">ชีตสูตร</button></div></div></section>';
  v.innerHTML=notes+st+dash+'<div id="feed"></div><button class="morebtn" id="more">โหลดโพสต์เพิ่ม</button>';
  $$('.note',v).forEach(function(e){e.onclick=function(){openNote(+e.dataset.i)}});
  $$('.st',v).forEach(function(e){e.onclick=function(){openStory(+e.dataset.s)}});
  $$('.chip[data-ch]',v).forEach(function(e){e.onclick=function(){go('chapter',e.dataset.ch)}});
  $('#goQuiz').onclick=function(){go('quiz')};$('#goRead').onclick=function(){go('read')};$('#goF').onclick=function(){go('formula')};
  var k=1;heroT=setInterval(function(){var a=$('#h1'),b=$('#h2');if(!a){stopHero();return}k++;var top=(k%2)?a:b,bot=(k%2)?b:a;bot.src=photo(rnd(D.photos.length));setTimeout(function(){bot.style.opacity=1;top.style.opacity=0},300)},5000);
  buildFeed();renderFeed(12);$('#more').onclick=function(){renderFeed(10)};
}
var FEED=[],fpos=0;
function buildFeed(){
  if(FEED.length) return;
  var lessons=[],forms=[],qs=[];
  D.chapters.forEach(function(c){c.kp.forEach(function(k,i){lessons.push({type:'lesson',id:'L'+c.id+'_'+i,ch:c.id,html:k})})});
  D.formulas.forEach(function(f){forms.push({type:'formula',id:'F'+f.id,f:f})});
  D.questions.forEach(function(q){qs.push({type:'quiz',id:'Q'+q.id,q:q})});
  lessons=shuffle(lessons);forms=shuffle(forms);qs=shuffle(qs);
  var pat=['quiz','lesson','formula','quiz','lesson','quiz','formula','lesson'],i=0;
  while(lessons.length||forms.length||qs.length){var t=pat[i%pat.length];i++;var src=t==='quiz'?qs:t==='lesson'?lessons:forms;if(!src.length){src=qs.length?qs:lessons.length?lessons:forms}FEED.push(src.shift());}
}
function postHTML(p,idx){
  var pi=hash(p.id)%D.photos.length, liked=!!S.liked[p.id];
  var who='icgram.mill', sub, body, cap='';
  if(p.type==='lesson'){sub='สรุปบท '+chTitle(p.ch);body='<div class="tag">LESSON · บท '+p.ch+'</div><h3>'+esc(CHBY[p.ch].title)+'</h3><div>'+p.html+'</div>';cap='<b>'+esc(who)+'</b> อ่านแค่โพสต์เดียวก็ได้ 1 คะแนนความรู้ 📚';}
  else if(p.type==='formula'){sub='สูตรเด็ด';body='<div class="tag">FORMULA</div><h3>'+p.f.title+'</h3>'+p.f.html+(p.f.vars?'<div class="muted" style="font-size:12.5px">'+p.f.vars+'</div>':'');cap='<b>'+esc(who)+'</b> สูตรนี้จำให้ขึ้นใจ แล้วไปลองทำโจทย์กัน ✨';}
  else {var q=p.q;sub=setName(q.set)+' ข้อ '+q.n;body='<div class="tag">QUIZ · '+esc(setName(q.set))+' ข้อ '+q.n+'</div><div class="qstem">'+q.stem+'</div>'+q.choices.map(function(c,j){return '<button class="choice" data-j="'+j+'"><span class="cl">'+L[j]+'</span>'+c+'</button>'}).join('');cap='<b>'+esc(who)+'</b> ตอบในโพสต์ได้เลย แล้วดูเฉลยในคอมเมนต์ 👇';}
  return '<article class="post" data-id="'+p.id+'"><div class="ph"><span class="av">IC</span><div class="who">'+esc(who)+'<small>'+esc(sub)+'</small></div></div>'+
   '<div class="pmedia"><img loading="lazy" src="'+photo(pi)+'" alt=""><div class="overlay">'+body+'</div></div>'+
   '<div class="pbar"><button class="like'+(liked?' liked':'')+'">'+(liked?'♥\uFE0E':'♡\uFE0E')+'</button><button class="cm" title="เฉลย/คอมเมนต์">💬</button><button class="save" title="บันทึกไว้ทบทวน">'+(liked?'🔖':'📑')+'</button></div>'+
   '<div class="pcap">'+cap+'</div><div class="comments"></div></article>';
}
function renderFeed(n){var f=$('#feed');if(!f)return;var h='';for(var i=0;i<n&&fpos<FEED.length;i++,fpos++)h+=postHTML(FEED[fpos],fpos);
  var tmp=document.createElement('div');tmp.innerHTML=h;Array.prototype.slice.call(tmp.children).forEach(function(el){f.appendChild(el);wirePost(el)});
  if(fpos>=FEED.length){fpos=0;FEED=[];buildFeed()}}
function wirePost(el){var id=el.dataset.id,p=FEED.filter(function(x){return x.id===id})[0]||findPost(id);
  var tl=function(){toggleLike(id,el)};
  $('.like',el).onclick=tl;$('.save',el).onclick=tl;
  var lastTap=0;$('.pmedia',el).addEventListener('click',function(e){if(e.target.closest('.choice'))return;var t=Date.now();if(t-lastTap<350){if(!S.liked[id])toggleLike(id,el)}lastTap=t});
  if(p&&p.type==='quiz'){$$('.choice',el).forEach(function(b){b.onclick=function(){answerInline(p.q,+b.dataset.j,el)}});
    $('.cm',el).onclick=function(){showExp(p.q,null,el)};}
  else $('.cm',el).onclick=function(){var c=$('.comments',el);c.innerHTML='<div class="cmt"><span class="av">IC</span><div class="bub"><b>'+esc('ทีม '+(cheerName()||'ICgram'))+'</b> กดหัวใจเก็บโพสต์นี้ไว้ทบทวนในโปรไฟล์ได้นะ 🤍</div></div>'};
}
function findPost(id){if(id[0]==='Q')return{type:'quiz',id:id,q:QBY[id.slice(1)]};return null}
function toggleLike(id,el){if(S.liked[id])delete S.liked[id];else S.liked[id]=Date.now();save();updLiked();
  if(el){var b=$('.like',el),on=!!S.liked[id];b.textContent=on?'♥\uFE0E':'♡\uFE0E';b.classList.toggle('liked',on);$('.save',el).textContent=on?'🔖':'📑'}
  toast(S.liked[id]?'บันทึกไว้ทบทวนแล้ว ♥':'เอาออกจากรายการแล้ว')}
function answerInline(q,j,el){var bs=$$('.choice',el);if(bs[0].disabled)return;var ok=j===q.ans;record(q,ok);
  bs.forEach(function(b,k){b.disabled=true;if(k===q.ans)b.classList.add('correct');else if(k===j)b.classList.add('wrong')});showExp(q,ok,el)}
function expHTML(q){return '<div>'+q.exp+'</div>'+(q.traps&&q.traps.some(Boolean)?'<div style="margin-top:6px"><b>ตัวลวงมาจากไหน:</b><ul style="margin:4px 0;padding-left:18px">'+q.traps.map(function(t,k){return t?'<li>ข้อ '+L[k]+': '+t+'</li>':''}).join('')+'</ul></div>':'')+(q.tip?'<span class="tnote">💡 '+q.tip+'</span>':'')+(q.note?'<span class="tnote">📝 '+q.note+'</span>':'')+'<span class="src">ที่มา: '+esc(q.src)+'</span>'}
function showExp(q,ok,el){var c=$('.comments',el);var n=cheerName()||'ICgram';
  c.innerHTML=(ok===null?'':'<div class="cmt"><span class="av">IC</span><div class="bub"><b>'+esc('ทีม '+n)+'</b> '+(ok?'ถูกต้อง! เก่งมาก ✨':'ยังไม่ใช่ ไม่เป็นไรนะ ข้อนี้เก็บไว้ในหน้า “ทบทวน” แล้ว')+'</div></div>')+
  '<div class="cmt"><span class="av">✓</span><div class="bub"><b>เฉลย</b> ข้อ '+L[q.ans]+'<br>'+expHTML(q)+'</div></div>'}
/* ---------- notes & stories ---------- */
function openNote(i){var n=D.notes[i];modal('<h3 style="margin:0 0 6px">📝 โน้ตย่อ</h3><div>'+n.full+'</div><div style="margin-top:12px"><button class="btn pri" id="mclose">ปิด</button></div>')}
function modal(h){var m=$('#modal');m.innerHTML='<div class="sheet">'+h+'</div>';m.classList.remove('hidden');m.onclick=function(e){if(e.target===m)closeModal()};var c=$('#mclose');if(c)c.onclick=closeModal}
function closeModal(){$('#modal').classList.add('hidden')}
var SV=null;
function openStory(si){var s=D.stories[si];S.seen[s.id]=1;save();var el=$('#story');el.classList.remove('hidden');document.body.style.overflow='hidden';
  SV={si:si,i:0,t:null,start:0,paused:false,dur:7000};
  el.innerHTML='<div class="sv"><div class="bg"></div><div class="bars">'+s.slides.map(function(){return '<span><i></i></span>'}).join('')+'</div><div class="shead"><img src="'+thumb(s.photo)+'"><span>'+esc(s.label)+'</span><button class="x">×</button></div><div class="tapL"></div><div class="tapR"></div><div class="sbody"></div></div>';
  $('.x',el).onclick=closeStory;$('.tapL',el).onclick=function(){storyGo(SV.i-1)};$('.tapR',el).onclick=function(){storyGo(SV.i+1)};
  var hold=function(on){SV.paused=on};$('.sbody',el).addEventListener('touchstart',function(){hold(true)},{passive:true});$('.sbody',el).addEventListener('touchend',function(){hold(false)});
  $('.sbody',el).addEventListener('mousedown',function(){hold(true)});$('.sbody',el).addEventListener('mouseup',function(){hold(false)});
  storyGo(0);}
function storyGo(i){var s=D.stories[SV.si];if(i<0)i=0;if(i>=s.slides.length){var n=SV.si+1;if(n<D.stories.length){openStory(n)}else closeStory();return}
  SV.i=i;var el=$('#story');$$('.bars i',el).forEach(function(b,k){b.style.width=k<i?'100%':'0'});
  $('.bg',el).style.backgroundImage='url('+photo(s.photo+i*7)+')';
  var sl=s.slides[i];$('.sbody',el).innerHTML='<div class="scard">'+sl.html+'</div>';
  var fb=$('.flip',el);if(fb)fb.onclick=function(e){e.stopPropagation();var a=$('.ans',el);a.classList.toggle('hidden');SV.paused=!a.classList.contains('hidden')};
  SV.start=Date.now();SV.acc=0;cancelAnimationFrame(SV.t);var bar=$$('.bars i',el)[i];
  var last=Date.now();(function tick(){var now=Date.now();if(!SV.paused)SV.acc+=now-last;last=now;var p=Math.min(1,SV.acc/SV.dur);if(bar)bar.style.width=(p*100)+'%';if(p>=1){storyGo(SV.i+1);return}SV.t=requestAnimationFrame(tick)})();}
function closeStory(){if(SV)cancelAnimationFrame(SV.t);SV=null;$('#story').classList.add('hidden');$('#story').innerHTML='';document.body.style.overflow='';if(cur==='home')$$('.st .ring').forEach(function(r,i){if(S.seen[D.stories[i].id])r.classList.add('seen')})}
document.addEventListener('keydown',function(e){if(!SV)return;if(e.key==='ArrowRight')storyGo(SV.i+1);if(e.key==='ArrowLeft')storyGo(SV.i-1);if(e.key==='Escape')closeStory()});
/* ---------- READ ---------- */
function readList(v){var acc=chapterAcc();
  var h='<div class="page"><h1>📖 อ่านเนื้อหา</h1><p class="muted">เรียงตามโครงสร้างข้อสอบ (หมวด 1 พื้นฐาน → หมวด 2 กฎ/จรรยาบรรณ → หมวด 3 ผลิตภัณฑ์) ข้างในแต่ละบทเรียงจากง่ายไปยาก: สรุปสั้น → สไลด์ติว → ใบสรุป → ข้อสอบ</p>'+
  '<div class="card tap" id="toF"><div class="row"><div class="thumb ico-sum">∑</div><div><b>ชีตสรุปสูตร IC P1</b><div class="muted">สูตรทั้งหมดพร้อมความหมายตัวแปรและตัวอย่าง (จุดอ่อนของเรา → อ่านบ่อยๆ)</div></div></div></div>'+
  '<div class="card tap" id="toInfo"><div class="row"><img class="thumb" src="'+thumb(5)+'"><div><b>โครงสร้างข้อสอบ</b><div class="muted">'+D.examInfo.short+'</div></div></div></div>';
  D.parts.forEach(function(p){h+='<div class="part-h"><span class="pill">หมวด '+p.id+'</span>'+esc(p.title)+' <span class="muted">('+p.count+' ข้อ)</span></div>';
    D.chapters.filter(function(c){return c.part===p.id}).forEach(function(c,i){var a=acc[c.id],pct=a?Math.round(100*a.c/(a.c+a.w)):null;
      h+='<div class="card tap" data-ch="'+c.id+'"><div class="row"><img class="thumb" loading="lazy" src="'+thumb(hash(c.id))+'"><div style="flex:1;min-width:0"><b>บท '+c.id+' '+esc(c.title)+'</b><div class="muted">ออกสอบ ~'+c.n+' ข้อ · ข้อสอบฝึกในเว็บ '+c.qcount+' ข้อ'+(pct!==null?' · ตอบถูก '+pct+'%':'')+'</div>'+(pct!==null?'<div class="prog"><i style="width:'+pct+'%"></i></div>':'')+'</div></div></div>'})});
  v.innerHTML=h+'</div>';
  $('#toF').onclick=function(){go('formula')};$('#toInfo').onclick=function(){modal(D.examInfo.full+'<div style="margin-top:10px"><button class="btn pri" id="mclose">ปิด</button></div>')};
  $$('.card[data-ch]',v).forEach(function(e){e.onclick=function(){go('chapter',e.dataset.ch)}});}
function chapter(v,id){var c=CHBY[id];var tabs=[['kp','สรุปสั้น']];if(c.slides.length)tabs.push(['sl','สไลด์ติว ('+c.slides.length+')']);tabs.push(['sh','ใบสรุป อ.ยีน']);if(c.book.length)tabs.push(['bk','หนังสือสรุป ('+c.book.length+' หน้า)']);tabs.push(['qz','ข้อสอบบทนี้ ('+c.qcount+')']);
  v.innerHTML='<div class="page"><button class="btn sm" id="back">← กลับ</button><h1>บท '+c.id+' '+esc(c.title)+'</h1><div class="muted">หมวด '+c.part+' · ออกสอบประมาณ '+c.n+' ข้อ</div><div class="seg">'+tabs.map(function(t,i){return '<button data-t="'+t[0]+'"'+(i?'':' class="on"')+'>'+t[1]+'</button>'}).join('')+'</div><div id="chbody"></div></div>';
  $('#back').onclick=function(){go('read')};
  function show(t){$$('.seg button',v).forEach(function(b){b.classList.toggle('on',b.dataset.t===t)});var b=$('#chbody');
    if(t==='kp')b.innerHTML='<div class="card"><ul class="kp">'+c.kp.map(function(k){return '<li>'+k+'</li>'}).join('')+'</ul><div class="muted" style="margin-top:8px">ที่มา: '+esc(c.kpsrc)+'</div></div>'+(c.formulas.length?'<h2>สูตรที่เกี่ยวข้อง</h2>'+c.formulas.map(function(fid){var f=D.formulas.filter(function(x){return x.id===fid})[0];return f?'<div class="card">'+'<b>'+f.title+'</b>'+f.html+(f.vars?'<div class="muted">'+f.vars+'</div>':'')+'</div>':''}).join(''):'')+'<button class="btn pri" id="qz2">ทำข้อสอบบทนี้</button>';
    else if(t==='sl')b.innerHTML='<p class="muted">สไลด์จาก “เอกสารติวสอบ IC” · หน้าที่เขียนว่า “ตัวอย่างข้อสอบ” ในเอกสารไม่มีเฉลย ลองคิดเองก่อนนะ</p><div class="imgs">'+c.slides.map(function(s){return '<img loading="lazy" src="assets/slides/'+s+'" alt="">'}).join('')+'</div>';
    else if(t==='sh')b.innerHTML='<p class="muted">ใบสรุปลายมือ อ.ยีน (บทละ 1 หน้า) · แตะรูปเพื่อเปิดเต็มจอแล้วซูมได้</p><div class="imgs"><a href="assets/sheets/'+c.sheet+'" target="_blank"><img loading="lazy" src="assets/sheets/'+c.sheet+'" alt=""></a></div>';
    else if(t==='bk')b.innerHTML='<p class="muted">หน้าหนังสือ “หนังสือสรุปเนื้อหาพร้อมสอบ IC PLAIN (P1)” ที่ตรงกับบทนี้ (อาจมีบทข้างเคียงติดมาในหน้าเดียวกัน) · แตะเพื่อซูม</p><div class="imgs">'+c.book.map(function(s){return '<a href="assets/book/'+s+'" target="_blank"><img loading="lazy" src="assets/book/'+s+'" alt=""></a>'}).join('')+'</div>';
    else {startQuiz({mode:'ch',ch:c.id});return}
    var q2=$('#qz2');if(q2)q2.onclick=function(){startQuiz({mode:'ch',ch:c.id})};}
  $$('.seg button',v).forEach(function(b){b.onclick=function(){show(b.dataset.t)}});show('kp');}
function formulaPage(v){v.innerHTML='<div class="page fsheet"><button class="btn sm" id="back">← กลับ</button>'+D.formulaSheet+'</div>';$('#back').onclick=function(){go('read')}}
/* ---------- QUIZ ---------- */
var QZ=null;
function quizHome(v){var b=function(k){return S.best[k]!=null?' · ดีที่สุด '+S.best[k]+'%':''};
  var h='<div class="page"><h1>＋ ข้อสอบ</h1><p class="muted">ตอบแล้วรู้ผลทันทีพร้อมเฉลย · เกณฑ์ผ่าน '+PASS+'% · ข้อที่ตอบผิดจะไปอยู่ในหน้า “ทบทวน” อัตโนมัติ</p>'+
  '<label class="muted" style="display:flex;align-items:center;gap:6px;margin:6px 0"><input type="checkbox" id="tmr"'+(S.timer?' checked':'')+'> จับเวลา (1.5 นาที/ข้อ ตามเวลาสอบจริง 150 นาที/100 ข้อ)</label>';
  Object.keys(D.sets).forEach(function(k){var s=D.sets[k];h+='<div class="card"><div class="row"><img class="thumb" src="'+thumb(hash(k)+2)+'"><div style="flex:1"><b>'+esc(s.title)+'</b><div class="muted">'+esc(s.desc)+b(k)+'</div></div></div><button class="btn pri sm" data-set="'+k+'">เริ่ม ('+s.count+' ข้อ)</button><button class="btn sm" data-set="'+k+'" data-sh="1">สุ่มลำดับ</button></div>'});
  h+='<div class="card"><div class="row"><img class="thumb" src="'+thumb(9)+'"><div><b>โหมดสุ่มรวม (Mixed)</b><div class="muted">สุ่มจากทุกชุด'+b('mix')+'</div></div></div><button class="btn pri sm" data-mix="10">10 ข้อ</button><button class="btn sm" data-mix="20">20 ข้อ</button><button class="btn sm" data-mix="40">40 ข้อ</button></div>';
  h+='<div class="card"><b>ตามบท</b><div class="muted">เลือกบทที่อยากฝึก</div><div style="margin-top:6px">'+D.chapters.filter(function(c){return c.qcount}).map(function(c){return '<button class="chip lav" data-ch="'+c.id+'">'+c.id+' ('+c.qcount+')</button>'}).join('')+'</div></div>';
  var nw=Object.keys(S.wrong).length;h+='<div class="card"><b>ทำข้อที่เคยผิดอีกรอบ</b><div class="muted">'+nw+' ข้อในรายการทบทวน</div><button class="btn pri sm" id="redo"'+(nw?'':' disabled')+'>เริ่ม</button></div>';
  h+='<h2>ประวัติ</h2>'+(S.attempts.length?S.attempts.slice(-8).reverse().map(function(a){return '<div class="bar2"><span class="lbl">'+esc(a.title)+'</span><div class="prog"><i style="width:'+a.pct+'%"></i></div><span class="pc">'+a.pct+'%</span></div>'}).join(''):'<p class="muted">ยังไม่มี — เริ่มชุดแรกกันเลย!</p>');
  v.innerHTML=h+'</div>';
  $('#tmr').onchange=function(e){S.timer=e.target.checked;save()};
  $$('[data-set]',v).forEach(function(e){e.onclick=function(){startQuiz({mode:'set',set:e.dataset.set,shuffle:!!e.dataset.sh})}});
  $$('[data-mix]',v).forEach(function(e){e.onclick=function(){startQuiz({mode:'mix',n:+e.dataset.mix})}});
  $$('[data-ch]',v).forEach(function(e){e.onclick=function(){startQuiz({mode:'ch',ch:e.dataset.ch})}});
  $('#redo').onclick=function(){startQuiz({mode:'wrong'})};}
function startQuiz(o){var qs,title,key;
  if(o.mode==='set'){qs=D.questions.filter(function(q){return q.set===o.set});if(o.shuffle)qs=shuffle(qs);title=D.sets[o.set].title;key=o.set}
  else if(o.mode==='mix'){qs=shuffle(D.questions).slice(0,o.n);title='สุ่มรวม '+o.n+' ข้อ';key='mix'}
  else if(o.mode==='ch'){qs=D.questions.filter(function(q){return q.ch===o.ch});title='บท '+chTitle(o.ch);key='ch'+o.ch}
  else {qs=D.questions.filter(function(q){return S.wrong[q.id]});title='ทวนข้อที่เคยผิด';key='wrong'}
  if(!qs.length){toast('ยังไม่มีข้อสอบในโหมดนี้');return}
  QZ={qs:qs,i:0,ans:{},title:title,key:key,t0:Date.now(),limit:S.timer?Math.round(qs.length*90):0};go('run');}
function runQuiz(v){if(!QZ){go('quiz');return}var q=QZ.qs[QZ.i],a=QZ.ans[QZ.i];
  var done=Object.keys(QZ.ans).length;
  v.innerHTML='<div class="page"><div class="qtop"><span>'+esc(QZ.title)+'</span><span id="clock"></span></div><div class="qtop"><span>ข้อ '+(QZ.i+1)+'/'+QZ.qs.length+' · '+esc(setName(q.set))+' ข้อ '+q.n+'</span><span>บท '+q.ch+'</span></div><div class="qbar"><i style="width:'+(100*done/QZ.qs.length)+'%"></i></div>'+
  '<div class="card"><div class="qstem">'+q.stem+'</div>'+q.choices.map(function(c,j){var cls='';if(a!=null){if(j===q.ans)cls=' correct';else if(j===a)cls=' wrong'}return '<button class="choice'+cls+'" data-j="'+j+'"'+(a!=null?' disabled':'')+'><span class="cl">'+L[j]+'</span>'+c+'</button>'}).join('')+
  '<div id="fb">'+(a!=null?fbHTML(q,a):'')+'</div></div>'+
  '<div class="qnav"><button class="btn" id="prev"'+(QZ.i?'':' disabled')+'>← ก่อนหน้า</button><button class="btn pri" id="next">'+(QZ.i===QZ.qs.length-1?'ดูผล':'ถัดไป →')+'</button></div><div style="text-align:center;margin-top:10px"><button class="btn sm" id="quit">ส่งเลย / ดูผล</button><button class="btn sm" id="likeQ">'+(S.liked['Q'+q.id]?'♥ บันทึกแล้ว':'♡ บันทึกข้อนี้')+'</button></div></div>';
  $$('.choice',v).forEach(function(b){b.onclick=function(){var j=+b.dataset.j;QZ.ans[QZ.i]=j;record(q,j===q.ans);runQuiz(v)}});
  $('#prev').onclick=function(){QZ.i--;runQuiz(v)};$('#next').onclick=function(){if(QZ.i<QZ.qs.length-1){QZ.i++;runQuiz(v);window.scrollTo(0,0)}else finish()};
  $('#quit').onclick=finish;$('#likeQ').onclick=function(){toggleLike('Q'+q.id,null);runQuiz(v)};
  tickClock();}
function fbHTML(q,a){var ok=a===q.ans;return '<div class="verdict '+(ok?'ok':'bad')+'">'+(ok?'✓ ถูกต้อง!':'✗ ยังไม่ถูก — คำตอบคือข้อ '+L[q.ans])+'</div><div class="exp">'+expHTML(q)+'</div>'}
var clockT=null;function tickClock(){clearInterval(clockT);var c=$('#clock');if(!c||!QZ)return;var f=function(){if(!QZ||!$('#clock')){clearInterval(clockT);return}var s=Math.floor((Date.now()-QZ.t0)/1000);var t=QZ.limit?QZ.limit-s:s;if(QZ.limit&&t<=0){clearInterval(clockT);toast('หมดเวลา!');finish();return}var m=Math.floor(Math.abs(t)/60),ss=Math.abs(t)%60;$('#clock').textContent=(QZ.limit?'⏳ ':'⏱ ')+m+':'+(ss<10?'0':'')+ss};f();clockT=setInterval(f,1000)}
function finish(){clearInterval(clockT);if(!QZ)return;var tot=QZ.qs.length,c=0,ansd=0;QZ.qs.forEach(function(q,i){if(QZ.ans[i]!=null){ansd++;if(QZ.ans[i]===q.ans)c++}});
  var pct=Math.round(100*c/tot),ok=pct>=PASS;S.attempts.push({key:QZ.key,title:QZ.title,score:c,total:tot,pct:pct,date:Date.now()});if(S.best[QZ.key]==null||pct>S.best[QZ.key])S.best[QZ.key]=pct;save();
  var wrongs=QZ.qs.filter(function(q,i){return QZ.ans[i]!=null&&QZ.ans[i]!==q.ans});
  var byCh={};QZ.qs.forEach(function(q,i){var b=byCh[q.ch]||(byCh[q.ch]={c:0,t:0});b.t++;if(QZ.ans[i]===q.ans)b.c++});
  var v=$('#view');cur='result';window.scrollTo(0,0);
  v.innerHTML='<div class="page result"><img class="rphoto" src="'+rphoto()+'" alt=""><div class="score">'+c+'/'+tot+' · '+pct+'%</div><div class="'+(ok?'verdict ok':'verdict bad')+'">'+(ok?'ผ่านเกณฑ์ '+PASS+'% 🎉':'ยังไม่ถึง '+PASS+'% (ต้องได้ '+Math.ceil(tot*PASS/100)+' ข้อ)')+'</div><div class="cheer">'+esc(cheer(ok))+'</div>'+
  (ok?'<video src="assets/cheer.mp4" autoplay muted loop playsinline></video>':'')+
  (ansd<tot?'<p class="muted">ตอบไป '+ansd+' จาก '+tot+' ข้อ (ข้อที่ไม่ได้ตอบนับว่าผิด)</p>':'')+
  '<div class="card" style="text-align:left"><b>คะแนนรายบท</b>'+Object.keys(byCh).sort().map(function(k){var b=byCh[k],p=Math.round(100*b.c/b.t);return '<div class="bar2"><span class="lbl">'+esc(chTitle(k))+'</span><div class="prog"><i style="width:'+p+'%"></i></div><span class="pc">'+b.c+'/'+b.t+'</span></div>'}).join('')+'</div>'+
  (wrongs.length?'<div class="card" style="text-align:left"><b>ข้อที่ตอบผิด ('+wrongs.length+')</b> <span class="muted">เก็บไว้ในหน้า “ทบทวน” แล้ว</span>'+wrongs.map(function(q){return '<div style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px"><div class="muted">'+esc(setName(q.set))+' ข้อ '+q.n+'</div><div class="qstem">'+q.stem+'</div><div class="verdict ok">คำตอบ: ข้อ '+L[q.ans]+' '+q.choices[q.ans]+'</div></div>'}).join('')+'</div>':'')+
  '<button class="btn pri" id="again">ทำอีกรอบ</button><button class="btn" id="toRev">ไปหน้าทบทวน</button><button class="btn" id="toHome">กลับฟีด</button></div>';
  $('#again').onclick=function(){QZ.i=0;QZ.ans={};QZ.t0=Date.now();go('run')};$('#toRev').onclick=function(){go('review')};$('#toHome').onclick=function(){go('home')};}
/* ---------- REVIEW ---------- */
function review(v){var ids=Object.keys(S.wrong).sort(function(a,b){return S.wrong[b]-S.wrong[a]});
  var h='<div class="page"><h1>↻ ทบทวนข้อที่ผิด</h1><p class="muted">ตอบถูกเมื่อไหร่ ข้อนั้นจะหายจากรายการเอง · '+ids.length+' ข้อ</p>'+(ids.length?'<button class="btn pri" id="redo">ทำข้อที่ผิดทั้งหมดอีกรอบ</button>':'<div class="card">ยังไม่มีข้อที่ผิด เก่งมาก! หรือยังไม่ได้เริ่มทำ ลองไปที่แท็บ “ข้อสอบ” นะ 🤍</div>');
  ids.forEach(function(id){var q=QBY[id];if(!q)return;h+='<div class="card"><div class="muted">'+esc(setName(q.set))+' ข้อ '+q.n+' · บท '+esc(chTitle(q.ch))+'</div><div class="qstem">'+q.stem+'</div>'+q.choices.map(function(c,j){return '<div class="choice'+(j===q.ans?' correct':'')+'"><span class="cl">'+L[j]+'</span>'+c+'</div>'}).join('')+'<details><summary>ดูเฉลย</summary><div class="exp">'+expHTML(q)+'</div></details></div>'});
  v.innerHTML=h+'</div>';var r=$('#redo');if(r)r.onclick=function(){startQuiz({mode:'wrong'})};}
/* ---------- PROFILE / LIKED ---------- */
function likedItems(){return Object.keys(S.liked).sort(function(a,b){return S.liked[b]-S.liked[a]}).map(function(id){
  if(id[0]==='Q'){var q=QBY[id.slice(1)];return q?{id:id,label:setName(q.set)+' ข้อ '+q.n,html:'<div class="qstem">'+q.stem+'</div>'+q.choices.map(function(c,j){return '<div class="choice'+(j===q.ans?' correct':'')+'"><span class="cl">'+L[j]+'</span>'+c+'</div>'}).join('')+'<div class="exp">'+expHTML(q)+'</div>'}:null}
  if(id[0]==='F'){var f=D.formulas.filter(function(x){return 'F'+x.id===id})[0];return f?{id:id,label:'สูตร: '+f.title.replace(/<[^>]+>/g,''),html:'<b>'+f.title+'</b>'+f.html+(f.vars?'<div class="muted">'+f.vars+'</div>':'')}:null}
  if(id[0]==='L'){var m=id.slice(1).split('_'),c=CHBY[m[0]];return c?{id:id,label:'บท '+c.id+' สรุป',html:'<b>บท '+c.id+' '+esc(c.title)+'</b><p>'+c.kp[+m[1]]+'</p>'}:null}
  return null}).filter(Boolean)}
function gridHTML(items){return '<div class="grid3">'+items.map(function(it,i){return '<div class="gi" data-i="'+i+'"><img loading="lazy" src="'+thumb(hash(it.id))+'"><span>'+esc(it.label)+'</span></div>'}).join('')+'</div>'}
function wireGrid(v,items){$$('.gi',v).forEach(function(g){g.onclick=function(){var it=items[+g.dataset.i];modal(it.html+'<div style="margin-top:12px"><button class="btn pri" id="mclose">ปิด</button><button class="btn" id="unlike">♡ เอาออก</button></div>');$('#unlike').onclick=function(){toggleLike(it.id,null);closeModal();go(cur)}}})}
function likedPage(v){var it=likedItems();v.innerHTML='<div class="page"><h1>♥ ที่บันทึกไว้</h1><p class="muted">กดหัวใจในฟีดหรือในข้อสอบเพื่อเก็บไว้ที่นี่</p></div>'+(it.length?gridHTML(it):'<div class="page"><div class="card">ยังไม่มีโพสต์ที่บันทึกไว้</div></div>');wireGrid(v,it)}
function profile(v){var it=likedItems(),acc=chapterAcc(),tot=S.attempts.length;var nC=0,nW=0;for(var k in S.stats){nC+=S.stats[k].c;nW+=S.stats[k].w}
  var h='<div class="prof"><div class="ring"><img src="'+thumb(0)+'"></div><div class="pst"><div><b>'+tot+'</b><span>ชุดข้อสอบ</span></div><div><b>'+(nC+nW?Math.round(100*nC/(nC+nW))+'%':'–')+'</b><span>ตอบถูกรวม</span></div><div><b>'+it.length+'</b><span>บันทึก</span></div></div></div>'+
  '<div class="page" style="padding-top:0"><b>'+esc(ME)+'</b> · ติวสอบ IC Plain (P1)'+(ART?' · ทีม '+esc(NAMES.join(' / ')||ART):'')+'<div class="muted">เป้าหมาย ≥ '+PASS+'% · อ่านวันอาทิตย์ทีละนิดก็ถึงได้</div>'+
  '<h2>คะแนนสูงสุด</h2>'+Object.keys(D.sets).concat(['mix']).map(function(k){var p=S.best[k];return '<div class="bar2"><span class="lbl">'+esc(k==='mix'?'สุ่มรวม':D.sets[k].title)+'</span><div class="prog"><i style="width:'+(p||0)+'%"></i></div><span class="pc">'+(p!=null?p+'%':'–')+'</span></div>'}).join('')+
  '<h2>ความแม่นรายบท</h2>'+(Object.keys(acc).length?D.chapters.filter(function(c){return acc[c.id]}).map(function(c){var a=acc[c.id],p=Math.round(100*a.c/(a.c+a.w));return '<div class="bar2"><span class="lbl">'+esc(c.id+' '+c.title)+'</span><div class="prog"><i style="width:'+p+'%;'+(p<PASS?'background:var(--bad)':'')+'"></i></div><span class="pc">'+p+'%</span></div>'}).join(''):'<p class="muted">ยังไม่มีข้อมูล</p>')+
  '<h2>ข้อที่ผิดค้างอยู่</h2><button class="btn" id="toRev">ดู '+Object.keys(S.wrong).length+' ข้อในหน้าทบทวน</button>'+
  '<h2>โพสต์ที่บันทึก</h2></div>'+(it.length?gridHTML(it):'<div class="page"><p class="muted">ยังไม่มี กดหัวใจในฟีดได้เลย</p></div>')+
  '<div class="page bak"><h2>สำรองความคืบหน้า</h2><p class="muted">คัดลอกรหัสนี้ไปวางในหน้าโปรไฟล์ของเครื่องอื่น เช่น จาก iPhone ไป iPad ไม่ต้องสมัครบัญชี</p><textarea class="bak-code" id="bakOut" readonly rows="4"></textarea><div class="bak-actions"><button class="btn pri sm" id="bakCopy">คัดลอก</button><button class="btn sm" id="bakShare" hidden>แชร์</button></div>'+
  '<h2>โหลดความคืบหน้า</h2><p class="muted">วางรหัสที่สำรองไว้ แล้วกดโหลด ระบบจะรวมกับข้อมูลในเครื่องนี้</p><textarea class="bak-code" id="bakIn" rows="4" placeholder="วางรหัสที่นี่"></textarea><button class="btn pri sm" id="bakLoad">โหลดความคืบหน้า</button>'+
  '<div style="margin-top:18px"><button class="btn sm" id="reset">ล้างข้อมูลความคืบหน้าทั้งหมด</button></div></div>';
  v.innerHTML=h;wireGrid(v,it);$('#toRev').onclick=function(){go('review')};
  var code=backupCode();$('#bakOut').value=code;
  $('#bakCopy').onclick=function(){copyText(code,'คัดลอกแล้ว')};
  if(navigator.share){var sh=$('#bakShare');sh.hidden=false;sh.onclick=function(){navigator.share({title:'ICgram สำรองความคืบหน้า',text:code}).then(function(){toast('แชร์แล้ว')}).catch(function(){})}};
  $('#bakLoad').onclick=function(){var raw=$('#bakIn').value;var parsed;try{parsed=parseBackup(raw)}catch(e){toast('รหัสไม่ถูกต้อง');return}
    if(!confirm('รวมความคืบหน้าจากรหัสนี้เข้าเครื่องนี้? คะแนนสูงสุดจะเก็บค่าที่ดีกว่า และประวัติข้อสอบจะถูกรวมกัน'))return;
    try{applyBackup(parsed.d);toast('โหลดแล้ว');location.reload()}catch(e){toast('โหลดไม่สำเร็จ')}};
  $('#reset').onclick=function(){if(confirm('ล้างคะแนน ประวัติ และรายการบันทึกทั้งหมด?')){localStorage.removeItem(KEY);load();updLiked();go('profile')}};}
window.ICG={go:go,startQuiz:startQuiz,qz:function(){return QZ},backupCode:backupCode,parseBackup:parseBackup,applyBackup:applyBackup,KEY:KEY};
go('home');
})();
