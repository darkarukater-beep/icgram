/* ICgram: "สอบ IC ผ่าน" photo — stored locally in IndexedDB (not in the text backup) */
(function(){
'use strict';
var DBN='icgram-pass',ST='pass',KEYID='main',dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise(function(res,rej){if(!window.indexedDB){rej(new Error('noidb'));return}
  var r=indexedDB.open(DBN,1);r.onupgradeneeded=function(){r.result.createObjectStore(ST)};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});return dbp}
function tx(mode,fn){return db().then(function(d){return new Promise(function(res,rej){var t=d.transaction(ST,mode),s=t.objectStore(ST),out;var q=fn(s);if(q)q.onsuccess=function(){out=q.result};t.oncomplete=function(){res(out)};t.onerror=function(){rej(t.error)};t.onabort=function(){rej(t.error)}})})}
function get(){return tx('readonly',function(s){return s.get(KEYID)})}
function put(rec){return tx('readwrite',function(s){return s.put(rec,KEYID)})}
function del(){return tx('readwrite',function(s){return s.delete(KEYID)})}
function today(){var d=new Date(),z=function(n){return (n<10?'0':'')+n};return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
var TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function thDate(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');if(!m)return '';return (+m[3])+' '+TH[+m[2]-1]+' '+(+m[1]+543)}
function resize(file,max,q){return new Promise(function(res,rej){var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){var w=img.naturalWidth,h=img.naturalHeight,k=Math.min(1,max/Math.max(w,h));var c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
    var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    c.toBlob(function(b){b?res({blob:b,w:c.width,h:c.height}):rej(new Error('toBlob'))},'image/jpeg',q)};
  img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('decode'))};img.src=url})}
var curURL=null;
function render(box,ctx){if(!box)return;var esc=ctx.esc,toast=ctx.toast;
  get().then(function(rec){draw(rec)},function(){draw(null,true)});
  function pickFile(cb){var i=document.createElement('input');i.type='file';i.accept='image/*';i.style.display='none';document.body.appendChild(i);
    i.onchange=function(){var f=i.files&&i.files[0];document.body.removeChild(i);if(f)cb(f)};i.click()}
  function upload(prev){pickFile(function(f){toast('กำลังย่อรูป…');resize(f,1080,0.8).then(function(r){
      var rec={blob:r.blob,w:r.w,h:r.h,date:(prev&&prev.date)||today(),caption:(prev&&prev.caption)||'',t:Date.now()};
      return put(rec).then(function(){toast('บันทึกรูปแล้ว');draw(rec)})}).catch(function(){toast('อ่านรูปนี้ไม่ได้ ลองรูปอื่น')})})}
  function draw(rec,noidb){if(curURL){URL.revokeObjectURL(curURL);curURL=null}
    if(noidb){box.innerHTML='<div class="pass-card pass-empty"><b>สอบ IC ผ่าน</b><p class="muted">เบราว์เซอร์นี้เก็บรูปในเครื่องไม่ได้</p></div>';return}
    if(!rec){box.innerHTML='<div class="pass-card pass-empty"><div class="pass-badge">สอบ IC ผ่าน</div><p>วันที่สอบผ่าน อัพโหลดรูปผลสอบหรือรูปฉลองไว้ตรงนี้</p><button type="button" class="btn pri sm" id="passUp">อัพโหลดรูป</button><p class="muted pass-note">รูปเก็บไว้ในเครื่องนี้เท่านั้น ไม่รวมในรหัสสำรอง</p></div>';
      box.querySelector('#passUp').onclick=function(){upload(null)};return}
    curURL=URL.createObjectURL(rec.blob);
    box.innerHTML='<div class="pass-card pass-has"><div class="pass-top"><span class="pass-badge">สอบ IC ผ่านแล้ว</span><span class="pass-date">'+esc(thDate(rec.date))+'</span></div>'+
      '<div class="pass-img"><img id="passImg" alt="รูปสอบ IC ผ่าน" src="'+curURL+'"></div>'+(rec.caption?'<div class="pass-cap">'+esc(rec.caption)+'</div>':'')+
      '<div class="pass-edit hidden" id="passEdit"><label>วันที่สอบผ่าน<input type="date" id="passDate" value="'+esc(rec.date||'')+'"></label><label>คำบรรยาย<input type="text" id="passCap" maxlength="140" placeholder="เช่น ผ่านแล้ว! P1 รอบแรก" value="'+esc(rec.caption||'')+'"></label><button type="button" class="btn pri sm" id="passSave">บันทึก</button></div>'+
      '<div class="pass-actions"><button type="button" class="btn sm" id="passEditBtn">แก้วันที่/คำบรรยาย</button><button type="button" class="btn sm" id="passRep">เปลี่ยนรูป</button><button type="button" class="btn sm" id="passDel">ลบ</button></div></div>';
    box.querySelector('#passEditBtn').onclick=function(){box.querySelector('#passEdit').classList.toggle('hidden')};
    box.querySelector('#passSave').onclick=function(){rec.date=box.querySelector('#passDate').value||rec.date;rec.caption=box.querySelector('#passCap').value.trim();put(rec).then(function(){toast('บันทึกแล้ว');draw(rec)})};
    box.querySelector('#passRep').onclick=function(){upload(rec)};
    box.querySelector('#passDel').onclick=function(){if(confirm('ลบรูปสอบผ่านออกจากเครื่องนี้?'))del().then(function(){toast('ลบแล้ว');draw(null)})};
  }
}
window.ICPass={render:render,get:get,put:put,del:del,resize:resize};
})();
