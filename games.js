/* ICgram games: formula match, quiz rush, quick calc, IC wordle */
(function(){
'use strict';
var GK='icgram-games',C={},T={timers:[]},$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){try{var o=JSON.parse(localStorage.getItem(GK));return (o&&typeof o==='object')?o:{}}catch(e){return {}}}
function save(o){try{localStorage.setItem(GK,JSON.stringify(o))}catch(e){}}
function G(){var o=load();o.best=o.best||{};o.word=o.word||{played:0,won:0,streak:0,maxStreak:0,last:''};return o}
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function tex(s,disp){try{return window.katex?katex.renderToString(s,{throwOnError:false,displayMode:!!disp,output:'html'}):esc(s)}catch(e){return esc(s)}}
function clearT(){T.timers.forEach(function(t){clearInterval(t);clearTimeout(t)});T.timers=[]}
function every(f,ms){var t=setInterval(f,ms);T.timers.push(t);return t}
function after(f,ms){var t=setTimeout(f,ms);T.timers.push(t);return t}
function priv(){return C.getPrivacy?C.getPrivacy():false}
function fmt(n,d){d=d==null?2:d;return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
function today(){var d=new Date(),z=function(n){return (n<10?'0':'')+n};return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
function dayNum(){var d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
function art(seed,cls){if(priv()||!C.photo)return (C.tileHTML?C.tileHTML(cls||'',  'IC',seed):'<div class="'+(cls||'')+' ph-tile"></div>');return '<img class="artist '+(cls||'')+'" loading="lazy" src="'+C.thumb(seed)+'"'+(C.pos?C.pos(seed):'')+' alt="">'}
function winCard(title,lines,seed,again){var cheer=C.cheer?C.cheer(true):'เก่งมาก!';
  return '<div class="g-win"><div class="g-win-art">'+art(seed,'g-win-img')+'</div><div class="g-win-tx"><b>'+esc(title)+'</b>'+lines.map(function(l){return '<div>'+l+'</div>'}).join('')+'<div class="g-cheer">'+esc(cheer)+'</div></div></div>'+
  '<div class="g-actions"><button type="button" class="btn pri sm" id="gAgain">'+(again||'เล่นอีกรอบ')+'</button><button type="button" class="btn sm" id="gMenu">กลับหน้าเกม</button></div>'}
function wireEnd(v,again){var a=$('#gAgain',v);if(a)a.onclick=again;var m=$('#gMenu',v);if(m)m.onclick=function(){C.go('games')}}
function head(v,title,sub){return '<div class="page g-page"><div class="g-head"><button type="button" class="icon-btn g-back" id="gBack" aria-label="กลับ">‹</button><div><h1>'+esc(title)+'</h1>'+(sub?'<div class="muted">'+sub+'</div>':'')+'</div></div>'}
function wireBack(v){var b=$('#gBack',v);if(b)b.onclick=function(){C.go('games')}}

/* ---------- menu ---------- */
var GAMES=[['match','จับคู่สูตร','เปิดการ์ดจับคู่สูตรกับชื่อ'],['rush','ตอบไวแข่งเวลา','60 วินาที ตอบให้ได้มากที่สุด'],['calc','คิดเลขเร็ว','โจทย์คำนวณสุ่มตัวเลข พร้อมวิธีทำ'],['word','ทายศัพท์','ทายศัพท์การเงินภาษาอังกฤษ 6 ครั้ง']];
function bestText(k,g){var b=g.best;if(k==='match')return b.matchTime!=null?('ดีที่สุด '+b.matchTime+' วิ · '+b.matchMoves+' ครั้ง'):'ยังไม่เคยเล่น';
  if(k==='rush')return b.rush!=null?'ดีที่สุด '+b.rush+' คะแนน':'ยังไม่เคยเล่น';
  if(k==='calc')return b.calc!=null?'ดีที่สุด '+b.calc+' ข้อ':'ยังไม่เคยเล่น';
  var w=g.word;return w.played?('ชนะ '+w.won+'/'+w.played+' · ติดกัน '+w.streak):'ยังไม่เคยเล่น'}
function menu(v){var g=G();
  var h='<div class="page g-page"><h1>เกม</h1><p class="muted">ฝึกสูตรและข้อสอบ IC P1 แบบสนุกขึ้น · คะแนนสูงสุดรวมอยู่ในรหัสสำรองด้วย</p><div class="g-grid">';
  GAMES.forEach(function(x,i){h+='<button type="button" class="g-card" data-g="'+x[0]+'"><span class="g-art">'+art([31,48,24,82][i],'g-art-img')+'<span class="g-ico">'+['⇄','⚡','∑','Aa'][i]+'</span></span><span class="g-tx"><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small><em>'+esc(bestText(x[0],g))+'</em></span></button>'});
  v.innerHTML=h+'</div></div>';
  $$('[data-g]',v).forEach(function(b){b.onclick=function(){C.go('games',b.dataset.g)}})}

/* ---------- 1. match ---------- */
var PAIRS=[
 ['PV(1+r)^n','มูลค่าในอนาคต (FV)'],
 ['\\dfrac{FV}{(1+r)^n}','มูลค่าปัจจุบัน (PV)'],
 ['\\left(1+\\tfrac{r}{m}\\right)^m-1','EAR (ผลตอบแทนที่แท้จริงต่อปี)'],
 ['\\dfrac{C}{r}','PV ของ Perpetuity'],
 ['\\dfrac{72}{r(\\%)}','กฎ 72 (ปีที่เงินเพิ่ม 2 เท่า)'],
 ['\\dfrac{P_1-P_0+D}{P_0}','HPR (ผลตอบแทนช่วงถือครอง)'],
 ['\\dfrac{1+R_{nom}}{1+\\text{Inf}}-1','ผลตอบแทนที่แท้จริง (Real return)'],
 ['\\dfrac{\\sigma}{E(R)}','สัมประสิทธิ์ความแปรปรวน (CV)'],
 ['R_f+\\beta[E(R_m)-R_f]','CAPM'],
 ['\\dfrac{R_p-R_f}{\\sigma_p}','Sharpe ratio'],
 ['\\dfrac{R_p-R_f}{\\beta_p}','Treynor ratio'],
 ['R_p-[R_f+\\beta_p(R_m-R_f)]',"Jensen's alpha"],
 ['\\dfrac{\\text{Coupon}}{\\text{Price}}','Current yield'],
 ['\\dfrac{D_{Mac}}{1+y}','Modified duration'],
 ['\\dfrac{P}{EPS}','P/E ratio'],
 ['\\dfrac{P}{BVPS}','P/BV ratio'],
 ['\\dfrac{DPS}{P}','Dividend yield'],
 ['\\dfrac{DPS}{EPS}','Payout ratio'],
 ['\\dfrac{D_1}{k-g}','DDM แบบเติบโตคงที่ (Gordon)'],
 ['\\dfrac{\\text{Assets}-\\text{Liabilities}}{\\text{Units}}','NAV ต่อหน่วย']];
function match(v){var N=6,sel=shuffle(PAIRS.map(function(p,i){return i})).slice(0,N),cards=[];
  sel.forEach(function(pi){cards.push({p:pi,k:'f'});cards.push({p:pi,k:'n'})});cards=shuffle(cards);
  var st={open:[],done:0,moves:0,t0:0,lock:false,sec:0};
  v.innerHTML=head(v,'จับคู่สูตร','แตะการ์ด 2 ใบ จับคู่สูตรกับชื่อให้ครบ '+N+' คู่')+'<div class="g-stat"><span id="mT">0 วิ</span><span id="mM">0 ครั้ง</span><span id="mP">0/'+N+' คู่</span></div><div class="g-cards">'+
   cards.map(function(c,i){return '<button type="button" class="g-mc" data-i="'+i+'" aria-label="การ์ด '+(i+1)+'"><span class="g-mc-in"><span class="g-mc-back">'+(priv()?'<span class="g-mono">IC</span>':art(c.p*7+i,'g-mc-img'))+'</span><span class="g-mc-front '+(c.k==='f'?'is-f':'is-n')+'">'+(c.k==='f'?tex(PAIRS[c.p][0]):esc(PAIRS[c.p][1]))+'</span></span></button>'}).join('')+'</div><div id="mEnd"></div></div>';
  wireBack(v);
  function tick(){st.sec=Math.floor((Date.now()-st.t0)/1000);var e=$('#mT');if(e)e.textContent=st.sec+' วิ'}
  $$('.g-mc',v).forEach(function(b){b.onclick=function(){var i=+b.dataset.i;if(st.lock||b.classList.contains('up'))return;
    if(!st.t0){st.t0=Date.now();every(tick,250)}
    b.classList.add('up');st.open.push(i);
    if(st.open.length===2){st.moves++;$('#mM').textContent=st.moves+' ครั้ง';var a=cards[st.open[0]],c=cards[st.open[1]],ba=$$('.g-mc',v)[st.open[0]];
      if(a.p===c.p&&a.k!==c.k){ba.classList.add('ok');b.classList.add('ok');st.open=[];st.done++;$('#mP').textContent=st.done+'/'+N+' คู่';if(st.done===N)end()}
      else{st.lock=true;ba.classList.add('bad');b.classList.add('bad');after(function(){ba.classList.remove('up','bad');b.classList.remove('up','bad');st.open=[];st.lock=false},850)}}}});
  function end(){clearT();tick();var g=G(),b=g.best,rec=false;
    if(b.matchTime==null||st.sec<b.matchTime||(st.sec===b.matchTime&&st.moves<b.matchMoves)){b.matchTime=st.sec;b.matchMoves=st.moves;rec=true}
    save(g);
    $('#mEnd').innerHTML=winCard('จับคู่ครบแล้ว!',[st.sec+' วินาที · '+st.moves+' ครั้ง',rec?'สถิติใหม่!':('สถิติดีที่สุด '+b.matchTime+' วิ · '+b.matchMoves+' ครั้ง')],st.moves*3+st.sec);
    wireEnd(v,function(){C.go('games','match')});$('#mEnd').scrollIntoView({behavior:'smooth',block:'center'})}
}

/* ---------- 2. rush ---------- */
function rush(v){var Q=shuffle(C.questions||[]),qi=0,score=0,streak=0,right=0,wrong=0,left=60,on=false,lock=false;
  v.innerHTML=head(v,'ตอบไวแข่งเวลา','60 วินาที · ถูกติดกันทุก 3 ข้อ ตัวคูณ +1 (สูงสุด x4)')+'<div id="rBody"><div class="card g-intro"><p>ข้อสอบจากคลังข้อสอบในแอป ตอบถูกได้ 10 × ตัวคูณ ตอบผิดตัวคูณกลับเป็น x1</p><button type="button" class="btn pri" id="rGo">เริ่ม 60 วินาที</button></div></div></div>';
  wireBack(v);$('#rGo').onclick=start;
  function mult(){return Math.min(4,1+Math.floor(streak/3))}
  function start(){on=true;var b=$('#rBody');b.innerHTML='<div class="g-stat"><span id="rT" class="g-time">60</span><span id="rS">0 คะแนน</span><span id="rX">x1</span></div><div class="g-bar"><i id="rBar"></i></div><div id="rQ"></div>';
    var t0=Date.now();every(function(){left=Math.max(0,60-Math.floor((Date.now()-t0)/1000));var e=$('#rT');if(e)e.textContent=left;var br=$('#rBar');if(br)br.style.width=(left/60*100)+'%';if(left<=0)end()},200);show()}
  function show(){if(!on)return;if(qi>=Q.length){Q=shuffle(Q);qi=0}var q=Q[qi];lock=false;
    $('#rQ').innerHTML='<div class="card g-q"><div class="g-qs">'+esc(q.stem)+'</div>'+q.choices.map(function(c,j){return '<button type="button" class="choice" data-j="'+j+'"><span class="n">'+(j+1)+'</span><span>'+esc(c)+'</span></button>'}).join('')+'</div>';
    $$('#rQ .choice').forEach(function(b){b.onclick=function(){if(lock||!on)return;lock=true;var j=+b.dataset.j,ok=j===q.ans;
      if(ok){score+=10*mult();streak++;right++;b.classList.add('ok')}else{streak=0;wrong++;b.classList.add('bad');$$('#rQ .choice')[q.ans].classList.add('ok')}
      $('#rS').textContent=score+' คะแนน';$('#rX').textContent='x'+mult();qi++;after(show,ok?350:1100)}})}
  function end(){if(!on)return;on=false;clearT();var g=G(),rec=g.best.rush==null||score>g.best.rush;if(rec)g.best.rush=score;save(g);
    $('#rBody').innerHTML=winCard('หมดเวลา!',['ได้ '+score+' คะแนน · ถูก '+right+' ผิด '+wrong,rec?'สถิติใหม่!':'สถิติดีที่สุด '+g.best.rush+' คะแนน'],score+right);
    wireEnd(v,function(){C.go('games','rush')})}
}

/* ---------- 3. quick calc ---------- */
function r2(x){return Math.round(x*100)/100}
var GEN=[
 function(){var pv=pick([10000,20000,50000,100000]),r=pick([3,4,5,6,8]),n=pick([2,3,4,5,6]),a=pv*Math.pow(1+r/100,n);
  return {t:'มูลค่าในอนาคต (FV)',q:'ฝากเงิน '+fmt(pv,0)+' บาท ดอกเบี้ยทบต้น '+r+'% ต่อปี นาน '+n+' ปี จะได้เงินรวมเท่าไร (บาท)',a:a,u:'บาท',f:'FV = PV(1+r)^n',w:'FV = '+fmt(pv,0)+'(1+'+(r/100)+')^{'+n+'} = '+fmt(a)}},
 function(){var fv=pick([100000,200000,500000,1000000]),r=pick([4,5,6,8,10]),n=pick([3,4,5,8,10]),a=fv/Math.pow(1+r/100,n);
  return {t:'มูลค่าปัจจุบัน (PV)',q:'ต้องการเงิน '+fmt(fv,0)+' บาท ในอีก '+n+' ปี ผลตอบแทน '+r+'% ต่อปี ต้องลงทุนวันนี้เท่าไร (บาท)',a:a,u:'บาท',f:'PV = \\dfrac{FV}{(1+r)^n}',w:'PV = \\dfrac{'+fmt(fv,0)+'}{(1+'+(r/100)+')^{'+n+'}} = '+fmt(a)}},
 function(){var p0=pick([20,25,40,50,80]),p1=p0+pick([-5,-3,3,4,6,10]),d=pick([0.5,1,1.5,2]),a=(p1-p0+d)/p0*100;
  return {t:'HPR',q:'ซื้อหุ้นราคา '+p0+' บาท ขายได้ '+p1+' บาท ระหว่างถือได้เงินปันผล '+d+' บาท HPR เท่ากับกี่ %',a:a,u:'%',pct:1,f:'HPR = \\dfrac{P_1-P_0+D}{P_0}',w:'HPR = \\dfrac{'+p1+'-'+p0+'+'+d+'}{'+p0+'} = '+fmt(a)+'\\%'}},
 function(){var eps=pick([2,2.5,4,5,8]),pe=pick([8,10,12,15,20]),p=eps*pe;
  return {t:'P/E ratio',q:'หุ้นราคา '+p+' บาท กำไรต่อหุ้น (EPS) '+eps+' บาท P/E เท่ากับกี่เท่า',a:pe,u:'เท่า',f:'P/E = \\dfrac{P}{EPS}',w:'P/E = \\dfrac{'+p+'}{'+eps+'} = '+fmt(pe)}},
 function(){var bv=pick([10,20,25,40]),x=pick([0.8,1.2,1.5,2,2.5]),p=r2(bv*x);
  return {t:'P/BV ratio',q:'หุ้นราคา '+p+' บาท มูลค่าตามบัญชีต่อหุ้น '+bv+' บาท P/BV เท่ากับกี่เท่า',a:p/bv,u:'เท่า',f:'P/BV = \\dfrac{P}{BVPS}',w:'P/BV = \\dfrac{'+p+'}{'+bv+'} = '+fmt(p/bv)}},
 function(){var p=pick([20,25,40,50,80]),d=pick([0.6,1,1.2,2,2.4]),a=d/p*100;
  return {t:'Dividend yield',q:'หุ้นราคา '+p+' บาท จ่ายเงินปันผลปีละ '+d+' บาทต่อหุ้น Dividend yield กี่ %',a:a,u:'%',pct:1,f:'DY = \\dfrac{DPS}{P}',w:'DY = \\dfrac{'+d+'}{'+p+'} = '+fmt(a)+'\\%'}},
 function(){var c=pick([3,4,5,6]),pr=pick([950,980,1000,1020,1050]),a=c*10/pr*100;
  return {t:'Current yield',q:'หุ้นกู้มูลค่าที่ตราไว้ 1,000 บาท อัตราดอกเบี้ยหน้าตั๋ว '+c+'% ต่อปี ราคาตลาด '+fmt(pr,0)+' บาท Current yield กี่ %',a:a,u:'%',pct:1,f:'CY = \\dfrac{\\text{Coupon}}{\\text{Price}}',w:'CY = \\dfrac{'+(c*10)+'}{'+pr+'} = '+fmt(a)+'\\%'}},
 function(){var rf=pick([2,2.5,3]),rm=pick([8,9,10]),b=pick([0.8,1.2,1.5]),a=rf+b*(rm-rf);
  return {t:'CAPM',q:'Rf = '+rf+'%, E(Rm) = '+rm+'%, เบต้าของหุ้น = '+b+' ผลตอบแทนที่ควรได้ตาม CAPM กี่ %',a:a,u:'%',pct:1,f:'E(R_i) = R_f+\\beta_i[E(R_m)-R_f]',w:'E(R) = '+rf+'+'+b+'('+rm+'-'+rf+') = '+fmt(a)+'\\%'}},
 function(){var rp=pick([8,10,12,14]),rf=pick([2,3]),sd=pick([10,12,15,20]),a=(rp-rf)/sd;
  return {t:'Sharpe ratio',q:'กองทุนให้ผลตอบแทน '+rp+'% SD '+sd+'% อัตราผลตอบแทนไม่มีความเสี่ยง '+rf+'% Sharpe ratio เท่ากับเท่าไร',a:a,u:'',tolAbs:0.01,f:'Sharpe = \\dfrac{R_p-R_f}{\\sigma_p}',w:'Sharpe = \\dfrac{'+rp+'-'+rf+'}{'+sd+'} = '+fmt(a)}},
 function(){var rp=pick([8,10,12,14]),rf=pick([2,3]),b=pick([0.8,1.2,1.5]),a=(rp-rf)/b;
  return {t:'Treynor ratio',q:'กองทุนให้ผลตอบแทน '+rp+'% เบต้า '+b+' อัตราผลตอบแทนไม่มีความเสี่ยง '+rf+'% Treynor ratio เท่ากับเท่าไร (หน่วย %)',a:a,u:'',f:'Treynor = \\dfrac{R_p-R_f}{\\beta_p}',w:'Treynor = \\dfrac{'+rp+'-'+rf+'}{'+b+'} = '+fmt(a)}},
 function(){var d1=pick([2,2.5,3,4]),k=pick([10,12]),g=pick([3,4,5]),a=d1/((k-g)/100);
  return {t:'DDM (Gordon)',q:'คาดว่าปีหน้าจ่ายปันผล (D₁) '+d1+' บาท ผลตอบแทนที่ต้องการ '+k+'% ปันผลเติบโต '+g+'% ต่อปี มูลค่าหุ้นเท่าไร (บาท)',a:a,u:'บาท',f:'P_0 = \\dfrac{D_1}{k-g}',w:'P_0 = \\dfrac{'+d1+'}{'+(k/100)+'-'+(g/100)+'} = '+fmt(a)}}
];
var KEYS=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','^','+','(',')','⌫','C'];
function calc(v){var DUR=120,left=DUR,run=false,cur=null,ok=0,n=0,paused=false,used=0,last=-1;
  v.innerHTML=head(v,'คิดเลขเร็ว','2 นาที · พิมพ์ตัวเลขหรือนิพจน์ เช่น 50000*1.05^3 · ยอมให้คลาดเคลื่อน 0.5%')+'<div id="cBody"><div class="card g-intro"><p>สุ่มโจทย์ FV, PV, HPR, P/E, P/BV, Dividend yield, Current yield, CAPM, Sharpe, Treynor และ DDM ตอบแล้วดูสูตรกับวิธีทำทันที (เวลาหยุดระหว่างดูเฉลย)</p><button type="button" class="btn pri" id="cGo">เริ่ม 2 นาที</button></div></div></div>';
  wireBack(v);$('#cGo').onclick=start;
  function start(){run=true;var b=$('#cBody');
    b.innerHTML='<div class="g-stat"><span id="cT" class="g-time">'+DUR+'</span><span id="cS">0/0 ถูก</span></div><div class="g-bar"><i id="cBar"></i></div><div id="cQ"></div>';
    var lt=Date.now();every(function(){var now=Date.now();if(!paused)used+=(now-lt)/1000;lt=now;left=Math.max(0,Math.ceil(DUR-used));var e=$('#cT');if(e)e.textContent=left;var br=$('#cBar');if(br)br.style.width=(left/DUR*100)+'%';if(left<=0&&!paused)end()},200);next()}
  function next(){if(!run)return;paused=false;var gi;do{gi=rnd(GEN.length)}while(gi===last&&GEN.length>1);last=gi;cur=GEN[gi]();
    $('#cQ').innerHTML='<div class="card g-q"><div class="g-tag">'+esc(cur.t)+'</div><div class="g-qs">'+esc(cur.q)+'</div><div class="g-in"><input id="cIn" inputmode="none" autocomplete="off" placeholder="คำตอบ'+(cur.u?' ('+cur.u+')':'')+'"><button type="button" class="btn pri sm" id="cOk">ส่ง</button></div><div class="g-pad">'+KEYS.map(function(k){return '<button type="button" data-k="'+k+'">'+k+'</button>'}).join('')+'</div></div>';
    var inp=$('#cIn');
    $$('.g-pad [data-k]').forEach(function(b){b.onclick=function(){var k=b.dataset.k;if(k==='⌫')inp.value=inp.value.slice(0,-1);else if(k==='C')inp.value='';else inp.value+=k}});
    inp.onkeydown=function(e){if(e.key==='Enter')check()};$('#cOk').onclick=check}
  function check(){if(!run||paused)return;var raw=$('#cIn').value.replace(/,/g,'').trim();if(!raw)return;if(cur.pct)raw=raw.replace(/%\s*$/,'');
    var x;try{x=C.evalExpr(raw)}catch(e){C.toast('อ่านคำตอบไม่ได้ ลองพิมพ์ใหม่');return}
    var tol=cur.tolAbs!=null?cur.tolAbs:Math.max(Math.abs(cur.a)*0.005,0.01),good=Math.abs(x-cur.a)<=tol;n++;if(good)ok++;paused=true;
    $('#cS').textContent=ok+'/'+n+' ถูก';
    $('#cQ').innerHTML='<div class="card g-q"><div class="g-tag">'+esc(cur.t)+'</div><div class="g-qs">'+esc(cur.q)+'</div><div class="verdict '+(good?'ok':'bad')+'">'+(good?'✓ ถูกต้อง':'✗ ยังไม่ถูก')+' · คุณตอบ '+esc(C.fmtNum?C.fmtNum(x):x)+' · คำตอบ '+fmt(cur.a)+(cur.u&&cur.u!=='%'?' '+cur.u:cur.u)+'</div><div class="g-sol"><div class="muted">สูตร</div>'+tex(cur.f,true)+'<div class="muted">แทนค่า</div>'+tex(cur.w.replace(/(\d),(\d)/g,'$1{,}$2'),true)+'</div><button type="button" class="btn pri sm" id="cNext">'+(left>0?'ข้อต่อไป':'ดูผล')+'</button></div>';
    $('#cNext').onclick=function(){if(left<=0)end();else next()}}
  function end(){if(!run)return;run=false;clearT();var g=G(),rec=g.best.calc==null||ok>g.best.calc;if(rec)g.best.calc=ok;save(g);
    $('#cBody').innerHTML=winCard('หมดเวลา!',['ถูก '+ok+' จาก '+n+' ข้อ',rec?'สถิติใหม่!':'สถิติดีที่สุด '+g.best.calc+' ข้อ'],ok*5+n);
    wireEnd(v,function(){C.go('games','calc')})}
}

/* ---------- 4. wordle ---------- */
var WORDS=[['BOND','พันธบัตร / หุ้นกู้ ตราสารหนี้ที่จ่ายดอกเบี้ยและคืนเงินต้น'],['BETA','ค่าเบต้า วัดความเสี่ยงที่เป็นระบบเทียบกับตลาด'],['RISK','ความเสี่ยง'],['DEBT','หนี้ / ตราสารหนี้'],['SWAP','สัญญาแลกเปลี่ยน (เช่น แลกกระแสดอกเบี้ย)'],['FUND','กองทุน'],['CASH','เงินสด'],['LOAN','เงินกู้'],['RATE','อัตรา (เช่น อัตราดอกเบี้ย)'],['BULL','ตลาดขาขึ้น'],['BEAR','ตลาดขาลง'],['CALL','Call option สิทธิในการซื้อ'],['GAIN','กำไรจากการลงทุน'],['LOSS','ขาดทุน'],['LONG','สถานะซื้อ (Long position)'],
 ['YIELD','อัตราผลตอบแทน'],['ALPHA','ผลตอบแทนส่วนเกินเทียบกับที่ควรได้ตามความเสี่ยง'],['STOCK','หุ้น'],['SHARE','หุ้น / ส่วนแบ่งความเป็นเจ้าของ'],['ASSET','สินทรัพย์'],['INDEX','ดัชนี (เช่น SET Index)'],['HEDGE','ป้องกันความเสี่ยง'],['PRICE','ราคา'],['VALUE','มูลค่า'],['SHORT','ขายชอร์ต / สถานะขาย'],['TREND','แนวโน้มราคา'],['AUDIT','การสอบบัญชี'],['ISSUE','ออกตราสาร / ออกหลักทรัพย์'],
 ['EQUITY','ตราสารทุน / ส่วนของผู้ถือหุ้น'],['COUPON','ดอกเบี้ยหน้าตั๋วของพันธบัตร'],['RETURN','ผลตอบแทน'],['OPTION','ออปชัน สิทธิซื้อหรือขายตามราคาที่กำหนด'],['MARGIN','เงินประกัน / มาร์จิน'],['BROKER','นายหน้าซื้อขายหลักทรัพย์'],['DEALER','ผู้ค้าหลักทรัพย์'],['MARKET','ตลาด'],['CREDIT','สินเชื่อ / เครดิต'],['RATING','อันดับความน่าเชื่อถือ'],['SPREAD','ส่วนต่าง (เช่น ส่วนต่างราคาเสนอซื้อ-ขาย)'],['ISSUER','ผู้ออกตราสาร'],['PROFIT','กำไร'],['INCOME','รายได้ / ผลตอบแทนในรูปรายได้']];
function word(v,mode){var g=G(),daily=mode!=='practice',W,meaning;
  if(daily){var w=WORDS[(dayNum()*7)%WORDS.length];W=w[0];meaning=w[1]}else{var p=pick(WORDS);W=p[0];meaning=p[1]}
  var L=W.length,MAXG=6,guesses=[],cur='',done=false,ds=g.daily;
  if(daily&&ds&&ds.d===today()&&ds.w===W){guesses=ds.g||[];done=!!ds.done}
  v.innerHTML=head(v,'ทายศัพท์',daily?'คำประจำวัน · '+L+' ตัวอักษร':'โหมดฝึก · '+L+' ตัวอักษร')+
   '<div class="seg g-seg"><button type="button" data-m="daily" class="'+(daily?'on':'')+'">คำประจำวัน</button><button type="button" data-m="practice" class="'+(daily?'':'on')+'">โหมดฝึก</button></div>'+
   '<div class="g-legend muted"><span class="wl ok">A</span> ถูกตำแหน่ง <span class="wl in">A</span> มีในคำแต่ผิดที่ <span class="wl no">A</span> ไม่มีในคำ</div>'+
   '<div class="w-grid" id="wGrid" style="--L:'+L+'"></div><div id="wEnd"></div><div class="w-kb" id="wKb"></div></div>';
  wireBack(v);$$('.g-seg [data-m]',v).forEach(function(b){b.onclick=function(){C.go('games',b.dataset.m==='practice'?'word-practice':'word')}});
  function score(gs){var res=Array(L).fill('no'),cnt={};for(var i=0;i<L;i++){if(gs[i]===W[i])res[i]='ok';else cnt[W[i]]=(cnt[W[i]]||0)+1}
    for(i=0;i<L;i++){if(res[i]!=='ok'&&cnt[gs[i]]){res[i]='in';cnt[gs[i]]--}}return res}
  function draw(){var h='';for(var r=0;r<MAXG;r++){var gs=guesses[r],sc=gs?score(gs):null;for(var c=0;c<L;c++){var ch=gs?gs[c]:(r===guesses.length?(cur[c]||''):'');h+='<div class="wl '+(sc?sc[c]:(ch?'typed':''))+'">'+ch+'</div>'}}
    $('#wGrid').innerHTML=h;
    var st={};guesses.forEach(function(gs){var sc=score(gs);for(var i=0;i<L;i++){var k=gs[i],s=sc[i];if(s==='ok'||(s==='in'&&st[k]!=='ok')||(s==='no'&&!st[k]))st[k]=s}});
    var rows=['QWERTYUIOP','ASDFGHJKL','⏎ZXCVBNM⌫'];
    $('#wKb').innerHTML=done?'':rows.map(function(r){return '<div class="w-row">'+r.split('').map(function(k){return '<button type="button" data-k="'+k+'" class="'+(st[k]||'')+(k==='⏎'||k==='⌫'?' wide':'')+'">'+(k==='⏎'?'ส่ง':k)+'</button>'}).join('')+'</div>'}).join('');
    $$('#wKb [data-k]').forEach(function(b){b.onclick=function(){key(b.dataset.k)}})}
  function persist(){if(!daily)return;var gg=G();gg.daily={d:today(),w:W,g:guesses,done:done?1:0};save(gg)}
  function key(k){if(done)return;if(k==='⌫'){cur=cur.slice(0,-1)}else if(k==='⏎'){if(cur.length<L){C.toast('ต้องครบ '+L+' ตัวอักษร');return}guesses.push(cur);cur='';
      var win=guesses[guesses.length-1]===W;if(win||guesses.length>=MAXG){done=true;stats(win)}persist()}
    else if(/^[A-Z]$/.test(k)&&cur.length<L)cur+=k;draw();if(done)showEnd()}
  function stats(win){var gg=G(),w=gg.word,t=today();w.played++;if(win){w.won++;w.streak++;if(w.streak>w.maxStreak)w.maxStreak=w.streak}else w.streak=0;w.last=new Date().toISOString();save(gg)}
  function showEnd(){var win=guesses[guesses.length-1]===W,w=G().word;
    $('#wEnd').innerHTML=(win?winCard('ทายถูก! '+W,['ความหมาย: '+esc(meaning),'ใช้ '+guesses.length+'/'+MAXG+' ครั้ง · ชนะติดกัน '+w.streak],guesses.length*11,daily?'เล่นโหมดฝึก':'คำต่อไป'):
      '<div class="card g-lose"><b>เฉลย: '+W+'</b><div>ความหมาย: '+esc(meaning)+'</div></div><div class="g-actions"><button type="button" class="btn pri sm" id="gAgain">'+(daily?'เล่นโหมดฝึก':'คำต่อไป')+'</button><button type="button" class="btn sm" id="gMenu">กลับหน้าเกม</button></div>');
    wireEnd(v,function(){C.go('games','word-practice')})}
  T.key=function(e){if(e.metaKey||e.ctrlKey||e.altKey)return;var k=e.key;if(k==='Enter')key('⏎');else if(k==='Backspace')key('⌫');else if(/^[a-zA-Z]$/.test(k))key(k.toUpperCase())};
  document.addEventListener('keydown',T.key);
  draw();if(done)showEnd()}

function leave(){clearT();if(T.key){document.removeEventListener('keydown',T.key);T.key=null}}
function render(v,arg,ctx){leave();C=ctx||C;T.cur=arg;if(arg==='match')match(v);else if(arg==='rush')rush(v);else if(arg==='calc')calc(v);else if(arg==='word')word(v,'daily');else if(arg==='word-practice')word(v,'practice');else menu(v)}
function merge(a,b){a=(a&&typeof a==='object')?a:{};b=(b&&typeof b==='object')?b:{};var o={best:{},word:{}},ab=a.best||{},bb=b.best||{};
  ['rush','calc'].forEach(function(k){var x=ab[k],y=bb[k];if(x!=null||y!=null)o.best[k]=Math.max(x==null?-1:x,y==null?-1:y)});
  var ta=ab.matchTime,tb=bb.matchTime;if(ta!=null||tb!=null){var useA=tb==null||(ta!=null&&(ta<tb||(ta===tb&&ab.matchMoves<=bb.matchMoves)));o.best.matchTime=useA?ta:tb;o.best.matchMoves=useA?ab.matchMoves:bb.matchMoves}
  var wa=a.word||{},wb=b.word||{};['played','won','maxStreak'].forEach(function(k){o.word[k]=Math.max(wa[k]||0,wb[k]||0)});
  var la=wa.last||'',lb=wb.last||'';if(la>=lb){o.word.streak=wa.streak||0;o.word.last=la}else{o.word.streak=wb.streak||0;o.word.last=lb}
  var da=a.daily,db=b.daily;o.daily=(!da)?db:(!db?da:(db.d>da.d||(db.d===da.d&&(db.g||[]).length>(da.g||[]).length)?db:da));if(!o.daily)delete o.daily;
  return o}
window.ICGames={cur:function(){return T.cur},render:render,leave:leave,merge:merge,KEY:GK,PAIRS:PAIRS,GEN:GEN,WORDS:WORDS};
})();
