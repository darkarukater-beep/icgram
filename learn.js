/* ICgram · เข้าใจโจทย์ — engine + UI */
(function(){
'use strict';
var L=window.LEARN;if(!L)return;
var TOP=L.topics,F=L.F;
var LKEY='icgram_learn';
var STAGES=['เข้าใจแนวคิด','เข้าใจตัวแปร','ดูตัวอย่าง','ทำโจทย์ด้วยกัน','ทำโจทย์เอง','ทบทวน'];
var SHORT=['แนวคิด','ตัวแปร','ตัวอย่าง','ทำด้วยกัน','ทำเอง','ทบทวน'];
var PASS_N=2, NQ=3;

/* ---------- rng + problem builder (also used by the verifier) ---------- */
function mk(seed){var a=(seed>>>0)||1;function r(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
  return {r:r,pick:function(x){return x[Math.floor(r()*x.length)]},shuffle:function(x){x=x.slice();for(var i=x.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=x[i];x[i]=x[j];x[j]=t}return x}}}
function build(ti,gi,seed){var t=TOP[ti],G=t.gens[gi];
  for(var at=0;at<60;at++){var R=mk(seed*31+gi*7919+at*104729+ti*613);var res=G.g(R);if(!res)continue;
    var P={k:G.k,ti:ti,gi:gi,q:res.q,x:res.x,p:res.p||{},ans:res.ans};
    if(res.o){var o=R.shuffle(res.o);if(o.filter(function(z){return z.ok}).length!==1)continue;P.kind='mc';P.opts=o;return P}
    var f=res.f,cs=f(res.a),seen={},ds=[];seen[cs]=1;
    res.d.forEach(function(d){if(!isFinite(d.v))return;var s=f(d.v);if(seen[s])return;seen[s]=1;ds.push({t:s,v:d.v,m:d.m,b:d.b})});
    P.a=res.a;P.fmt=f;P.dis=ds;
    if(G.num){P.kind='num';P.num=G.num;var N=G.num,sc=N.s||1,tl=function(v){return N.rel?N.t*Math.abs(v*sc):N.t},kept=[];
      ds.forEach(function(d){if(Math.abs(d.v-res.a)*sc<=2*Math.max(tl(d.v),tl(res.a)))return;if(kept.some(function(k){return Math.abs(k.v-d.v)*sc<=2*Math.max(tl(d.v),tl(k.v))}))return;kept.push(d)});
      P.dis=kept;if(kept.length<2)continue;return P}
    if(ds.length<3)continue;
    P.kind='mc';P.opts=R.shuffle([{t:cs,ok:1,v:res.a}].concat(ds.slice(0,3)));return P}
  throw new Error('gen failed '+t.id+' '+gi)}
function parseNum(s){s=String(s||'').replace(/[,\s%บาทปี]/g,'').replace(/−/g,'-');if(!/^-?\d*\.?\d+$/.test(s))return NaN;return parseFloat(s)}
function checkNum(P,raw){var x=parseNum(raw);if(!isFinite(x))return {bad:1};var N=P.num,s=N.s||1,tg=P.a*s,tol=N.rel?N.t*Math.abs(tg):N.t;
  if(Math.abs(x-tg)<=tol)return {ok:1,x:x};
  if(s===100&&Math.abs(x*100-tg)<=tol)return {ok:1,x:x,note:'ตอบเป็นทศนิยม ครั้งหน้าตอบเป็น % ได้เลย'};
  for(var i=0;i<P.dis.length;i++){var d=P.dis[i],dv=d.v*s,dt=N.rel?N.t*Math.abs(dv):N.t;if(Math.abs(x-dv)<=Math.max(dt,1e-9))return {ok:0,x:x,m:d.m,b:d.b}}
  return {ok:0,x:x,m:'ตัวเลขไม่ตรงกับจุดพลาดที่พบบ่อย ลองไล่ทีละขั้นตามวิธีทำ แล้วเทียบกับตัวอย่างที่ทำด้วยกัน',b:'w1'}}
L.mk=mk;L.build=build;L.checkNum=checkNum;L.parseNum=parseNum;L.PASS_N=PASS_N;L.NQ=NQ;L.KEY=LKEY;

/* ---------- storage ---------- */
function lload(){var o;try{o=JSON.parse(localStorage.getItem(LKEY))||{}}catch(e){o={}}if(!o.t||typeof o.t!=='object')o.t={};return o}
var ST=null;function st(){if(!ST)ST=lload();return ST}
function lsave(){try{localStorage.setItem(LKEY,JSON.stringify(ST))}catch(e){}}
function rec(id){var s=st();if(!s.t[id])s.t[id]={s:0,p:0,b:0,n:0};return s.t[id]}
function passedCount(){var s=st(),c=0;TOP.forEach(function(t){if(s.t[t.id]&&s.t[t.id].p)c++});return c}
function unlocked(i){return i===0||!!(st().t[TOP[i-1].id]&&st().t[TOP[i-1].id].p)}
function merge(cur,inc){var out={t:{}};cur=cur||{};inc=inc||{};
  [cur.t,inc.t].forEach(function(src){if(!src||typeof src!=='object')return;Object.keys(src).forEach(function(id){var a=out.t[id]||{s:0,p:0,b:0,n:0},b=src[id]||{};
    a.s=Math.max(a.s,+b.s||0);a.p=Math.max(a.p,b.p?1:0);a.b=Math.max(a.b,+b.b||0);a.n=Math.max(a.n,+b.n||0);out.t[id]=a})});
  out.cur=cur.cur||inc.cur;return out}
L.merge=merge;L.reload=function(){ST=null};L.passedCount=passedCount;L.total=TOP.length;

/* ---------- rendering helpers ---------- */
var C={};/* ctx from app.js: esc,toast,cheer */
function esc(s){return C.esc?C.esc(s):String(s)}
function tex(h){if(!window.katex)return h;return String(h).replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g,function(m,d,i){try{return katex.renderToString(d!=null?d:i,{displayMode:d!=null,throwOnError:false,output:'html'})}catch(e){return m}})}
function sym(s){if(/[^\x00-\x7f]/.test(s)||(/ /.test(s)&&!/\\/.test(s)))return '<b>'+esc(s)+'</b>';return tex('\\('+s+'\\)')}
function backLabel(b){if(!b)return '';if(b[0]==='w')return 'ขั้นที่ 4 · ทำโจทย์ด้วยกัน ขั้น '+b.slice(1);return {c:'ขั้นที่ 1 · เข้าใจแนวคิด',v:'ขั้นที่ 2 · เข้าใจตัวแปร',e:'ขั้นที่ 3 · ดูตัวอย่าง'}[b]||''}

/* ---------- view state ---------- */
var V={i:null,stage:0,ws:0,hl:-1,from:null,run:null};
var host=null;
function rerender(){if(host)draw(host)}
function openTopic(i,stage){var r=rec(TOP[i].id);V.i=i;V.hl=-1;V.from=null;
  if(stage==null)stage=r.p?0:Math.min(r.s,5);
  V.stage=stage;V.ws=(stage===3&&r.s>3)?TOP[i].worked.steps.length:0;
  if(!V.run||V.run.ti!==i)V.run=null;
  st().cur=TOP[i].id;lsave();rerender();scrollTop()}
function scrollTop(){try{window.scrollTo(0,0)}catch(e){}}
function goStage(k){var r=rec(TOP[V.i].id);if(k>r.s)return;V.stage=k;V.hl=-1;if(k!==3)V.from=null;if(k===3&&r.s>3)V.ws=TOP[V.i].worked.steps.length;rerender();scrollTop()}
function advance(){var t=TOP[V.i],r=rec(t.id);var k=V.stage+1;if(k>4)return;r.s=Math.max(r.s,k);lsave();V.stage=k;V.hl=-1;V.from=null;if(k===3)V.ws=(r.s>3)?t.worked.steps.length:0;rerender();scrollTop()}
function newRun(){var ti=V.i,seed=Math.floor(Math.random()*1e9);var items=[];for(var g=0;g<NQ;g++)items.push(build(ti,g%TOP[ti].gens.length,seed+g));
  V.run={ti:ti,seed:seed,items:items,ans:[],res:[],i:0,done:false}}

/* ---------- views ---------- */
function draw(v){host=v;if(V.i==null){listView(v);return}topicView(v)}
function listView(v){var pc=passedCount(),N=TOP.length,s=st();
  var h='<div class="lrn"><div class="card lrn-hero"><b>เข้าใจโจทย์ทีละสูตร</b><p class="muted">เรียนทีละเรื่องตามลำดับ 6 ขั้น: แนวคิด → ตัวแปร → ตัวอย่าง → ทำด้วยกัน → ทำเอง → ทบทวน · สูตรถัดไปจะเปิดเมื่อทำโจทย์เองถูกอย่างน้อย '+PASS_N+' ใน '+NQ+' ข้อ ไม่ต้องรีบ</p>'+
  '<div class="bar2"><span class="lbl">ผ่านแล้ว</span><div class="prog"><i style="width:'+Math.round(100*pc/N)+'%"></i></div><span class="pc">'+pc+'/'+N+'</span></div></div><div class="lrn-list">';
  TOP.forEach(function(t,i){var r=s.t[t.id]||{s:0,p:0,b:0,n:0},un=unlocked(i),cls=r.p?'done':(un?'now':'lock');
    var sub=r.p?('ผ่านแล้ว · ดีที่สุด '+r.b+'/'+NQ):(un?((r.s||r.n)?('ถึงขั้น '+(Math.min(r.s,5)+1)+'/6 · '+STAGES[Math.min(r.s,5)]):'พร้อมเริ่ม'):'ล็อกอยู่ · ผ่านสูตรก่อนหน้าก่อน');
    h+='<button type="button" class="lrow '+cls+'" data-i="'+i+'"><span class="lnum">'+(r.p?'✓':(un?(i+1):'🔒'))+'</span><span class="ltx"><b>'+(i+1)+'. '+esc(t.title)+'</b><small>'+esc(sub)+'</small></span><span class="lgo">›</span></button>'});
  h+='</div></div>';v.innerHTML=h;
  Array.prototype.forEach.call(v.querySelectorAll('.lrow'),function(b){b.onclick=function(){var i=+b.dataset.i;if(!unlocked(i)){C.toast&&C.toast('ผ่าน "ทำโจทย์เอง" ของสูตรก่อนหน้าก่อน (ถูก '+PASS_N+' ใน '+NQ+')');return}openTopic(i)}})}

function dotsHTML(r){var h='<div class="lrn-dots" role="tablist">';for(var k=0;k<6;k++){var cls=k===V.stage?'cur':(k<=r.s?'done':'lock');
  h+='<button type="button" class="ldot '+cls+'" data-st="'+k+'"'+(k>r.s?' disabled':'')+' aria-label="'+STAGES[k]+'"><i>'+(k+1)+'</i><span>'+SHORT[k]+'</span></button>'}return h+'</div>'}
function topicView(v){var t=TOP[V.i],r=rec(t.id);
  var h='<div class="lrn"><div class="lrn-top"><button type="button" class="btn sm" id="lList">← รายการสูตร</button><span class="lrn-count">สูตร '+(V.i+1)+'/'+TOP.length+(r.p?' · ผ่านแล้ว':'')+'</span></div>'+
  '<h2 class="lrn-title">'+esc(t.title)+'</h2>'+dotsHTML(r)+'<div class="lrn-stage-h">ขั้นที่ '+(V.stage+1)+' · '+STAGES[V.stage]+'</div>';
  if(V.from&&V.stage<4)h+='<div class="lrn-back">ย้อนมาดูจุดที่ติด แล้วค่อยกลับไปลองชุดใหม่ <button type="button" class="btn sm" id="lBackRev">กลับไปหน้าทบทวน</button></div>';
  h+='<div class="card lrn-body" id="lBody">'+stageHTML(t,r)+'</div>'+navHTML(t,r)+'</div>';
  v.innerHTML=h;wireTopic(v,t,r);
  if(V.hl>=0){var el=v.querySelector('.lstep.hl');if(el)setTimeout(function(){el.scrollIntoView({block:'center'})},30)}}
function navHTML(t,r){var prev=V.stage>0?'<button type="button" class="btn" id="lPrev">← ย้อน</button>':'<span></span>';var next='';
  if(V.stage<3)next='<button type="button" class="btn pri" id="lNext">ขั้นต่อไป →</button>';
  else if(V.stage===3){var all=V.ws>=t.worked.steps.length;next='<button type="button" class="btn pri" id="lNext"'+(all?'':' disabled')+'>'+(all?'ไปทำโจทย์เอง →':'ดูให้ครบก่อน')+'</button>'}
  return '<div class="lrn-nav">'+prev+next+'</div>'}
function stageHTML(t,r){switch(V.stage){
  case 0:return tex(t.concept)+'<p class="muted lrn-src">ดูสูตรเต็มได้ที่แท็บสรุปสูตร หัวข้อ '+esc(t.fid)+'</p>';
  case 1:return '<p class="muted">อ่านทีละตัว ถ้ารู้ว่าแต่ละตัวคืออะไร สูตรจะจำได้เอง</p><div class="lvars">'+t.vars.map(function(x){return '<div class="lvar"><div class="lsym">'+sym(x[0])+'</div><div><b>'+esc(x[1])+'</b><div class="muted">'+esc(x[2])+'</div></div></div>'}).join('')+'</div>';
  case 2:return tex(t.example);
  case 3:return workedHTML(t);
  case 4:return practiceHTML(t);
  case 5:return reviewHTML(t,r)}}
function workedHTML(t){var S=t.worked.steps,h='<div class="lq"><b>โจทย์</b><div>'+esc(t.worked.q)+'</div></div><p class="muted">ลองคิดแต่ละขั้นเองก่อน (ใช้เครื่องคิดเลขมุมขวาล่างได้) แล้วค่อยกดดูเฉลยของขั้นนั้น</p>';
  for(var k=0;k<S.length;k++){if(k>V.ws)break;var shown=k<V.ws;
    h+='<div class="lstep'+(k===V.hl?' hl':'')+(shown?'':' pending')+'"><div class="lstep-q"><span class="lsn">'+(k+1)+'</span>'+esc(S[k].q)+'</div>'+
      (shown?'<div class="lstep-a">'+tex(S[k].a)+'</div>':'<div class="lstep-try">ลองคิดก่อน แล้วกดดูเฉลยขั้นนี้</div><button type="button" class="btn pri sm" id="lReveal">ขั้นต่อไป: ดูเฉลยขั้น '+(k+1)+'</button>')+'</div>'}
  if(V.ws>=S.length)h+='<div class="lok">ครบทุกขั้นแล้ว ถ้าเข้าใจแล้วไปลองทำเองได้เลย</div>';
  return h}
function practiceHTML(t){if(!V.run||V.run.ti!==V.i)newRun();var R=V.run,P=R.items[R.i],a=R.res[R.i];
  var h='<div class="lpills">'+R.items.map(function(_,k){var x=R.res[k];return '<span class="lpill'+(k===R.i?' cur':'')+(x?(x.ok?' ok':' bad'):'')+'">'+(k+1)+'</span>'}).join('')+'</div>'+
  '<p class="muted">ข้อ '+(R.i+1)+'/'+NQ+' · โจทย์ไม่บอกสูตร ลองนึกจากแนวคิดที่เรียนมา</p><div class="lq">'+esc(P.q)+'</div>';
  if(P.kind==='mc'){h+=P.opts.map(function(o,j){var cls='choice';if(a){if(o.ok)cls+=' correct';else if(a.j===j)cls+=' wrong'}return '<button type="button" class="'+cls+'" data-j="'+j+'"'+(a?' disabled':'')+'><span class="cl">'+(j+1)+'</span>'+esc(o.t)+'</button>'}).join('')}
  else{var u=P.num.u;h+='<div class="lnum-in"><input id="lAns" inputmode="decimal" autocomplete="off" placeholder="พิมพ์ตัวเลข"'+(a?' disabled value="'+esc(a.raw)+'"':'')+'><span>'+esc(u)+'</span>'+(a?'':'<button type="button" class="btn pri sm" id="lCheck">ตรวจคำตอบ</button>')+'</div>'}
  if(a){h+='<div class="verdict '+(a.ok?'ok':'bad')+'">'+(a.ok?'✓ ถูกต้อง':'✗ ยังไม่ถูก · คำตอบคือ '+esc(correctText(P)))+'</div>';
    if(a.note)h+='<div class="muted">'+esc(a.note)+'</div>';
    if(!a.ok&&a.m)h+='<div class="ldiag"><b>อาจติดตรงนี้:</b> '+esc(a.m)+'</div>';
    h+='<div style="margin-top:10px"><button type="button" class="btn pri" id="lNextQ">'+(R.i<NQ-1?'ข้อต่อไป →':'ดูผลและทบทวน →')+'</button></div>'}
  return h}
function correctText(P){if(P.kind==='mc'){for(var j=0;j<P.opts.length;j++)if(P.opts[j].ok)return P.opts[j].t}return P.fmt(P.a)}
function reviewHTML(t,r){var R=V.run,h='';
  if(!R||R.ti!==V.i||!R.done){h+='<p>ผลดีที่สุดของสูตรนี้: <b>'+r.b+'/'+NQ+'</b>'+(r.p?' · ผ่านแล้ว':' · ยังไม่ผ่าน')+'</p><p class="muted">ลองทำชุดใหม่ได้เสมอ ตัวเลขจะเปลี่ยนทุกครั้ง</p>';}
  else{var sc=R.res.filter(function(x){return x.ok}).length,pass=sc>=PASS_N;
    h+='<div class="lscore '+(pass?'ok':'bad')+'"><b>'+sc+'/'+NQ+'</b> '+(pass?'ผ่านแล้ว · '+esc(C.cheer?C.cheer(true):'เก่งมาก')+(V.i<TOP.length-1?' สูตรถัดไปเปิดแล้ว':' ครบทุกสูตรแล้ว'):'ยังไม่ผ่าน (ต้องถูกอย่างน้อย '+PASS_N+' ข้อ) ไม่ต้องรีบ ย้อนดูจุดที่ติดก่อน แล้วลองชุดใหม่')+'</div>';
    R.items.forEach(function(P,k){var a=R.res[k];h+='<div class="lrev '+(a.ok?'ok':'bad')+'"><div class="lrev-h">'+(a.ok?'✓':'✗')+' ข้อ '+(k+1)+'</div><div class="lrev-q">'+esc(P.q)+'</div>'+
      '<div class="lrev-a">คำตอบของคุณ: <b>'+esc(a.txt)+'</b>'+(a.ok?'':' · ที่ถูก: <b>'+esc(correctText(P))+'</b>')+'</div>'+
      (a.ok?'':'<div class="ldiag"><b>ติดตรงไหน:</b> '+esc(a.m||'ลองไล่ทีละขั้นตามวิธีทำ')+(a.b?'<div><button type="button" class="btn sm lback" data-b="'+a.b+'">ย้อนดู: '+esc(backLabel(a.b))+'</button></div>':'')+'</div>')+
      '<details class="lsol"><summary>ดูวิธีทำ</summary><div>'+P.x+'</div></details></div>'})}
  h+='<div class="lrn-acts"><button type="button" class="btn'+(r.p?'':' pri')+'" id="lRetry">ลองชุดใหม่ (ตัวเลขใหม่)</button>'+
    (r.p&&V.i<TOP.length-1?'<button type="button" class="btn pri" id="lNextTopic">ไปสูตรถัดไป →</button>':'')+'</div>';
  return h}

function wireTopic(v,t,r){function on(id,fn){var e=v.querySelector('#'+id);if(e)e.onclick=fn}
  on('lList',function(){V.i=null;V.from=null;rerender();scrollTop()});
  Array.prototype.forEach.call(v.querySelectorAll('.ldot'),function(b){b.onclick=function(){goStage(+b.dataset.st)}});
  on('lPrev',function(){goStage(V.stage-1)});
  on('lNext',function(){advance()});
  on('lReveal',function(){V.ws++;rerender();var s=v.querySelectorAll('.lstep');if(s.length)s[s.length-1].scrollIntoView({block:'nearest'})});
  on('lBackRev',function(){V.from=null;V.stage=5;V.hl=-1;rerender();scrollTop()});
  on('lRetry',function(){newRun();var rr=rec(t.id);rr.s=Math.max(rr.s,4);lsave();V.stage=4;rerender();scrollTop()});
  on('lNextTopic',function(){openTopic(V.i+1,0)});
  Array.prototype.forEach.call(v.querySelectorAll('.lback'),function(b){b.onclick=function(){var x=b.dataset.b;V.from=5;
    if(x[0]==='w'){V.stage=3;V.ws=t.worked.steps.length;V.hl=Math.min(t.worked.steps.length,+x.slice(1))-1}else{V.stage={c:0,v:1,e:2}[x]||0;V.hl=-1}
    rerender();if(V.hl<0)scrollTop()}});
  if(V.stage===4){var R=V.run,P=R.items[R.i];
    Array.prototype.forEach.call(v.querySelectorAll('.choice[data-j]'),function(b){b.onclick=function(){if(R.res[R.i])return;var j=+b.dataset.j,o=P.opts[j];
      R.res[R.i]={ok:!!o.ok,j:j,txt:o.t,m:o.m,b:o.b};rerender()}});
    on('lCheck',function(){var raw=v.querySelector('#lAns').value,c=checkNum(P,raw);if(c.bad){C.toast&&C.toast('พิมพ์เป็นตัวเลข เช่น 12.34');return}
      R.res[R.i]={ok:!!c.ok,raw:raw,txt:raw+' '+P.num.u,m:c.m,b:c.b,note:c.note};rerender()});
    var inp=v.querySelector('#lAns');if(inp&&!inp.disabled)inp.onkeydown=function(e){if(e.key==='Enter'){var b=v.querySelector('#lCheck');if(b)b.click()}};
    on('lNextQ',function(){if(R.i<NQ-1){R.i++;rerender();return}
      R.done=true;var sc=R.res.filter(function(x){return x.ok}).length,rr=rec(t.id);rr.n=(rr.n||0)+1;rr.b=Math.max(rr.b||0,sc);if(sc>=PASS_N)rr.p=1;rr.s=5;lsave();
      V.stage=5;rerender();scrollTop()})}}

window.ICLearn={
  render:function(v,ctx){C=ctx||C;ST=null;draw(v)},
  reset:function(){V={i:null,stage:0,ws:0,hl:-1,from:null,run:null}},
  isOpen:function(){return V.i!=null},
  _state:function(){return V}
};
})();
