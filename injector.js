;(function(){
  try{
    if(window.__zcodeRunningHL==='v22') return; window.__zcodeRunningHL='v22';
    var HL='zcode-running-hl',GN='zcode-done-hl',LSKEY='zcode-done-map-v1';
    var CODEX_ROW='[data-app-action-sidebar-thread-row]',CODEX_TITLE='[data-app-action-sidebar-thread-title]';
    var LEGACY_ROW='[data-grouped-task-key],li,[role="button"],article,button';
    var css='.'+HL+'{background-color:rgba(59,130,246,.22)!important;box-shadow:inset 3px 0 0 0 #3b82f6!important}'+
      '.'+HL+' .animate-spin{color:#3b82f6!important}'+
      '.'+GN+'{background-color:rgba(34,197,94,.18)!important;box-shadow:inset 3px 0 0 0 #22c559!important}';
    var ANIM = location.href.indexOf('/out/renderer/') !== -1; /* ZCode 渲染页才开流水灯 */
    if (ANIM) {
      css += '.'+HL+'{background-color:rgba(59,130,246,.10)!important;background-image:linear-gradient(100deg,transparent 25%,rgba(59,130,246,.32) 50%,transparent 75%)!important;background-size:200% 100%!important;background-repeat:no-repeat!important;animation:zcode-th-flow 1.8s linear infinite!important;box-shadow:inset 3px 0 0 0 #3b82f6!important}';
      css += '@keyframes zcode-th-flow{0%{background-position:200% 0}100%{background-position:-200% 0}}';
      css += '@media (prefers-reduced-motion:reduce){.'+HL+'{animation:none!important;background-image:none!important;background-color:rgba(59,130,246,.22)!important}}';
    }
        var SEL='zcode-sel-hl';
    css += '.'+SEL+'{background-color:rgba(245,158,11,.24)!important;box-shadow:inset 3px 0 0 0 #f59e0b!important}';
    css += '.'+HL+'.'+SEL+'{background-color:rgba(59,130,246,.10)!important;background-image:linear-gradient(100deg,transparent 25%,rgba(59,130,246,.32) 50%,transparent 75%)!important;background-size:200% 100%!important;background-repeat:no-repeat!important;animation:zcode-th-flow 1.8s linear infinite, zcode-sel-bar-blink 1s ease-in-out infinite!important;box-shadow:inset 3px 0 0 0 #f59e0b!important}';
    css += '@keyframes zcode-sel-bar-blink{0%,100%{box-shadow:inset 3px 0 0 0 #f59e0b}50%{box-shadow:inset 3px 0 0 0 rgba(251,191,36,.15)}}';
    var FRESH='zcode-fresh-hl', FRESH_MS=30*60*1000;
    css += '.'+FRESH+'{background-color:rgba(34,197,94,.38)!important;outline:3px solid #fbbf24!important;outline-offset:-1px!important;animation:zcode-fresh-blink .9s steps(1,end) infinite, zcode-fresh-glow 1.1s ease-in-out infinite!important}';
    css += '@keyframes zcode-fresh-blink{0%,49%{outline-color:#fbbf24}50%,100%{outline-color:rgba(251,191,36,.08)}}';
    css += '@keyframes zcode-fresh-glow{0%,100%{box-shadow:inset 3px 0 0 0 #22c559,0 0 0 0 rgba(251,191,36,.65)}60%{box-shadow:inset 3px 0 0 0 #22c559,0 0 12px 3px rgba(251,191,36,.2)}}';
    css += '@media (prefers-reduced-motion:reduce){.'+FRESH+'{animation:none!important}}';
    var LD='zcode-last-done-hl';
    css += '.'+LD+'{box-shadow:inset 0 0 0 2px #fbbf24,inset 0 0 18px 4px rgba(251,191,36,.35),inset 3px 0 0 0 #22c559!important;animation:zcode-last-radiance 1.6s ease-in-out infinite!important}';
    css += '.'+LD+'.'+FRESH+'{animation:zcode-fresh-blink .9s steps(1,end) infinite, zcode-last-radiance 1.6s ease-in-out infinite!important}';
    css += '@keyframes zcode-last-radiance{0%,100%{box-shadow:inset 0 0 0 2px rgba(251,191,36,.85),inset 0 0 18px 4px rgba(251,191,36,.3),inset 3px 0 0 0 #22c559,0 0 10px 2px rgba(251,191,36,.3)}55%{box-shadow:inset 0 0 0 3px #fbbf24,inset 0 0 26px 8px rgba(251,191,36,.5),inset 3px 0 0 0 #22c559,0 0 18px 5px rgba(251,191,36,.5)}}';
    css += '@media (prefers-reduced-motion:reduce){.'+LD+'{animation:none!important}}';
    var PERMP='zcode-perm-pulse';
    css += '.'+PERMP+'{outline:4px solid #d946ef!important;outline-offset:-1px!important;animation:zcode-perm-pulse-k .9s ease-in-out infinite!important}';
    css += '@keyframes zcode-perm-pulse-k{0%,100%{outline-color:rgba(217,70,239,1);background-color:rgba(217,70,239,.3)}50%{outline-color:rgba(217,70,239,.12);background-color:rgba(217,70,239,.06)}}';
    css += '#zcode-hud{position:fixed;top:16px;right:16px;width:232px;z-index:2147483646;background:rgba(15,18,25,.88);color:#e5e7eb;border:1px solid rgba(255,255,255,.14);border-radius:10px;font:11px/1.5 -apple-system,Menlo,monospace;box-shadow:0 6px 24px rgba(0,0,0,.45);overflow:hidden;user-select:none}';
    css += '#zcode-hud .zh-head{display:flex;align-items:center;gap:6px;padding:7px 10px;background:rgba(255,255,255,.06);cursor:grab;font-weight:600}';
    css += '#zcode-hud .zh-head:active{cursor:grabbing}';
    css += '#zcode-hud .zh-collapse{margin-left:auto;cursor:pointer;color:#9ca3af;padding:0 3px;border-radius:4px}';
    css += '#zcode-hud .zh-collapse:hover{color:#fff;background:rgba(255,255,255,.12)}';
    css += '#zcode-hud .zh-body{max-height:300px;overflow-y:auto;padding:4px 0}';
    css += '#zcode-hud .zh-sec{padding:4px 10px 2px;color:#9ca3af;font-size:10px;letter-spacing:.5px}';
    css += '#zcode-hud .zh-item{display:flex;align-items:center;gap:7px;padding:4px 10px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';
    css += '#zcode-hud .zh-item:hover{background:rgba(255,255,255,.08)}';
    css += '#zcode-hud .zh-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}';
    css += '#zcode-hud .zh-run .zh-dot{background:#3b82f6;animation:zh-pulse 1.2s ease-in-out infinite}';
    css += '#zcode-hud .zh-done .zh-dot{background:#22c559}';
    css += '#zcode-hud .zh-done:hover{color:#fca5a5}';
    css += '#zcode-hud.zh-min .zh-body{display:none}';
    css += '#zcode-hud .zh-empty{padding:6px 10px;color:#6b7280}';
    css += '@keyframes zh-pulse{0%,100%{opacity:1}50%{opacity:.35}}';
    var permAC=null,permKnown={},permInit=0,permFound={},permDismissed={};
var st=document.createElement('style');st.id='zcode-ui-patch-v22';st.textContent=css;
    (document.head||document.documentElement).appendChild(st);
    var doneMap={}, runningTitles={}, dirty=0;
    var VER='v22',D={};
    var HUDR=[],HUDD=[],HUDT0=null,HUDel=null;
    try{doneMap=JSON.parse(localStorage.getItem(LSKEY)||'{}')||{};}catch(e){}
    function save(){try{
      var ks=Object.keys(doneMap);
      if(ks.length>500){ks.sort(function(a,b){return doneMap[a]-doneMap[b];});ks.slice(0,ks.length-500).forEach(function(k){delete doneMap[k];});}
      localStorage.setItem(LSKEY,JSON.stringify(doneMap));
    }catch(e){}}
    function rowOf(el){
      if(!el||!el.closest)return null;
      return el.closest(CODEX_ROW)||el.closest(LEGACY_ROW);
    }
    function titleNode(row){
      if(!row)return null;
      return (row.matches&&row.matches(CODEX_TITLE)?row:null)||row.querySelector(CODEX_TITLE+',.truncate,[data-task-title-marquee-track],[title]');
    }
    function titleOf(row){
      var n=titleNode(row),t=n&&String(n.textContent||'').trim();
      if(t)return t;
      if(n){t=String(n.getAttribute('title')||n.getAttribute('aria-label')||'').trim();if(t)return t;}
      t=String(row.getAttribute('data-app-action-sidebar-thread-title')||'').trim();
      if(t)return t;
      return null;
    }
    function keyOf(row){
      if(row&&row.matches&&row.matches(CODEX_ROW)){
        var id=row.getAttribute('data-app-action-sidebar-thread-id'),host=row.getAttribute('data-app-action-sidebar-thread-host-id');
        if(id)return 'codex:'+String(host||'')+':'+id;
      }
      var t=titleOf(row);return t?'title:'+t:null;
    }
    function isTaskRow(row){
      if(!row)return false;
      if(row.matches&&row.matches(CODEX_ROW))return true;
      if((row.textContent||'').length>300)return false;
      return !!titleNode(row);
    }
    function doneTS(row){
      var k=keyOf(row),t=titleOf(row),best=0,v;
      if(k&&(v=doneMap[k])!==undefined&&v>best)best=v;
      if(t){ if((v=doneMap['title:'+t])!==undefined&&v>best)best=v; if((v=doneMap[t])!==undefined&&v>best)best=v; }
      return best;
    }
    function isDone(row){var k=keyOf(row),t=titleOf(row);return !!((k&&doneMap[k]!==undefined)||(t&&(doneMap['title:'+t]!==undefined||doneMap[t]!==undefined)));}
    function clearDone(row){
      var k=keyOf(row),t=titleOf(row),changed=false;
      if(k&&doneMap[k]!==undefined){delete doneMap[k];changed=true;}
      if(t&&doneMap['title:'+t]!==undefined){delete doneMap['title:'+t];changed=true;}
      if(t&&doneMap[t]!==undefined){delete doneMap[t];changed=true;}
      if(changed)save();
      if(row)row.classList.remove(GN);
    }
    function rows(){
      var all=document.querySelectorAll(CODEX_ROW+','+LEGACY_ROW),out=[],seen=[];
      for(var i=0;i<all.length&&out.length<300;i++){
        if(seen.indexOf(all[i])>=0||!isTaskRow(all[i]))continue;
        seen.push(all[i]);out.push(all[i]);
      }
      return out;
    }
    function scan(){
      var spins=document.querySelectorAll('.animate-spin'), i, row;
      var running=[], cur={};
      for(i=0;i<spins.length;i++){ row=rowOf(spins[i]); if(isTaskRow(row)&&running.indexOf(row)<0) running.push(row); }
      for(i=0;i<running.length;i++){
        row=running[i]; row.classList.remove(GN); row.classList.add(HL);
        var t=titleOf(row);
        if(t){ cur[t]=1; if(doneMap[t]!==undefined){ delete doneMap[t]; dirty=1; } }
      }
      /* 完成检测：上一轮在跑、这一轮不在跑的标题 => 记入 doneMap */
      for(var t2 in runningTitles){
        if(!cur[t2] && doneMap[t2]===undefined && !(dismissTs[t2]>Date.now()-12000)){ doneMap[t2]=Date.now(); dirty=1; }
      }
      runningTitles=cur;
      if(dirty){ save(); dirty=0; }
      /* 清理残留 HL（元素仍在但已不转） */
      var marked=document.querySelectorAll('.'+HL);
      for(i=0;i<marked.length;i++){ if(running.indexOf(marked[i])<0) marked[i].classList.remove(HL); }
    }
    function isPerm(row){
      try{ if(row.querySelector&&row.querySelector('[class*="bg-success/14"]')) return true; }catch(e){}
      var t=row.textContent||'';
      return t.indexOf('等待确认')>=0||t.indexOf('等待输入')>=0;
    }
    function permSound(){
      try{
        var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
        if(!permAC) permAC=new AC();
        if(permAC.state==='suspended') permAC.resume();
        var t0=permAC.currentTime;
        for(var i=0;i<6;i++){
          var o=permAC.createOscillator(),g=permAC.createGain();
          o.type='sine'; o.frequency.value=(i%2?660:990);
          var st=t0+i*0.5;
          g.gain.setValueAtTime(0,st);
          g.gain.linearRampToValueAtTime(0.25,st+0.05);
          g.gain.linearRampToValueAtTime(0,st+0.4);
          o.connect(g); g.connect(permAC.destination);
          o.start(st); o.stop(st+0.45);
        }
      }catch(e){}
    }
    var dismissTs={};
    function hudDismiss(t){
      delete doneMap[t]; delete doneMap['title:'+t]; save();
      dismissTs[t]=Date.now();
      var di=HUDD.indexOf(t); if(di>=0) HUDD.splice(di,1);
      var rows=document.querySelectorAll('.'+GN),i;
      for(i=0;i<rows.length;i++){ if(titleOf(rows[i])===t) rows[i].classList.remove(GN); }
      updateHUD();
    }
    function hudNavigate(t){
      try{
        var rows=document.querySelectorAll('.'+GN+',.'+HL),i,r=null;
        for(i=0;i<rows.length;i++){ if(titleOf(rows[i])===t){ r=rows[i]; break; } }
        if(!r){ var all=document.querySelectorAll('[data-task-item-key],[data-grouped-task-key]'); for(i=0;i<all.length;i++){ if(titleOf(all[i])===t){ r=all[i]; break; } } }
        if(r){ r.click(); return true; }
      }catch(e){}
      return false;
    }
    function makeHUD(){
      if(HUDel||!document.body) return;
      HUDel=document.createElement('div'); HUDel.id='zcode-hud';
      HUDel.innerHTML='<div class="zh-head"><span class="zh-title">任务状态</span><span class="zh-counts"></span><span class="zh-collapse">—</span></div><div class="zh-body"></div>';
      document.body.appendChild(HUDel);
      try{
        var x=localStorage.getItem('zh-x'),y=localStorage.getItem('zh-y');
        if(x){HUDel.style.left=x;HUDel.style.top=y;HUDel.style.right='auto';}
        if(localStorage.getItem('zh-c')==='1') HUDel.classList.add('zh-min');
      }catch(e){}
      var head=HUDel.querySelector('.zh-head'),col=HUDel.querySelector('.zh-collapse');
      col.addEventListener('click',function(e){ e.stopPropagation(); HUDel.classList.toggle('zh-min'); try{localStorage.setItem('zh-c',HUDel.classList.contains('zh-min')?'1':'0');}catch(err){} });
      head.addEventListener('pointerdown',function(e){
        if(e.target===col) return;
        var r=HUDel.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;
        function mv(e2){ var x=Math.max(0,Math.min(window.innerWidth-80,e2.clientX-ox)),y=Math.max(0,Math.min(window.innerHeight-40,e2.clientY-oy)); HUDel.style.left=x+'px'; HUDel.style.top=y+'px'; HUDel.style.right='auto'; }
        function up(){ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); try{localStorage.setItem('zh-x',HUDel.style.left);localStorage.setItem('zh-y',HUDel.style.top);}catch(err){} }
        document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
      });
      var body=HUDel.querySelector('.zh-body');
      body.addEventListener('click',function(e){
        var it=e.target.closest('.zh-item'); if(!it) return;
        var t=it.getAttribute('data-t'); if(!t) return;
        var jumped=hudNavigate(t);
        if(it.classList.contains('zh-done')) hudDismiss(t);
      });
    }
    function updateHUD(){
      try{
        makeHUD(); if(!HUDel) return;
        var cnt=HUDel.querySelector('.zh-counts');
        if(cnt) cnt.textContent='⟳'+HUDR.length+' ✓'+HUDD.length;
        var body=HUDel.querySelector('.zh-body'); if(!body) return;
        var h='';
        if(HUDR.length){ h+='<div class="zh-sec">执行中</div>'; for(var i=0;i<HUDR.length;i++) h+='<div class="zh-item zh-run" data-t="'+HUDR[i].replace(/"/g,'&quot;')+'"><span class="zh-dot"></span><span>'+HUDR[i].replace(/</g,'&lt;')+'</span></div>'; }
        if(HUDD.length){ h+='<div class="zh-sec">完成未读（点击清除）</div>'; for(var j=0;j<HUDD.length;j++) h+='<div class="zh-item zh-done" data-t="'+HUDD[j].replace(/"/g,'&quot;')+'"><span class="zh-dot"></span><span>'+HUDD[j].replace(/</g,'&lt;')+'</span></div>'; }
        if(!HUDR.length&&!HUDD.length) h='<div class="zh-empty">暂无执行中 / 未读任务</div>';
        body.innerHTML=h;
      }catch(e){}
    }
    function updateTitle(){
      try{
        if(HUDT0===null) HUDT0=document.title;
        if(String(document.title).indexOf('⟳')<0||true) document.title=HUDT0+'（⟳'+HUDR.length+' ✓'+HUDD.length+'）';
      }catch(e){}
    }
    function applyStates(){
      var lastKey=null,maxV=0;
      for(var k0 in doneMap){ if(doneMap[k0]>maxV){maxV=doneMap[k0];lastKey=k0;} }
      var seen=new Set(), pools=['[data-task-item-key]','[data-grouped-task-key]','li','[role="button"]'], pi, rowsE, i, row;
      for(pi=0;pi<pools.length;pi++){
        rowsE=document.querySelectorAll(pools[pi]);
        for(i=0;i<rowsE.length&&seen.size<300;i++){ if(!seen.has(rowsE[i])) seen.add(rowsE[i]); }
      }
      var cRun=0,cDone=0,cSelC=0,cCrown=0;
      var permFound={};
      seen.forEach(function(row){
        var running=row.classList.contains(HL);
        var sel=row.classList.contains('bg-selected');
        var done=!running&&isDone(row);
        if(sel)cSelC++;
        var isRealRow = !!(row.getAttribute&&(row.getAttribute('data-task-item-key')||row.getAttribute('data-grouped-task-key')));
        var want = running?HL : done?GN : null;
        if(!isRealRow) want = null;
        if(want===HL)cRun++;else if(want===GN)cDone++;
        var rt0=titleOf(row);
        if(want===HL&&rt0)HUDR.push(rt0);
        if(want===GN&&rt0)HUDD.push(rt0);
        [HL,GN,FRESH,LD].forEach(function(c){ if(c!==want) row.classList.remove(c); });
        if(want) row.classList.add(want);
        if(want===GN){
          var fresh = Date.now()-doneTS(row) < FRESH_MS;
          if(fresh&&!row.classList.contains(FRESH)) row.classList.add(FRESH);
          if(!fresh) row.classList.remove(FRESH);
          var k=keyOf(row),t=titleOf(row),isLast = lastKey!==null&&(k===lastKey||(t&&(t===lastKey||'title:'+t===lastKey)));
          if(isLast&&!row.classList.contains(LD)) row.classList.add(LD);
          if(!isLast) row.classList.remove(LD);
          if(isLast)cCrown++;
        } else { row.classList.remove(LD); row.classList.remove(FRESH); }
        if(sel&&!row.classList.contains(SEL)) row.classList.add(SEL);
        if(!sel) row.classList.remove(SEL);
        var pk=keyOf(row)||titleOf(row);
        if(pk&&isPerm(row)) permFound[pk]=row;
        else if(pk&&permDismissed[pk]===undefined){ if(row.classList.contains(PERMP)) row.classList.remove(PERMP); }
        if(pk&&!isPerm(row)&&permDismissed[pk]!==undefined){ delete permDismissed[pk]; }
      });
      D.rows=seen.size;D.run=cRun;D.done=cDone;D.sel=cSelC;D.crown=cCrown;
      HUDR=HUDR.filter(function(t,i){return HUDR.indexOf(t)===i;});
      HUDD=HUDD.filter(function(t,i){return HUDD.indexOf(t)===i;});
      var newly=[];
      for(var fk in permFound){
        if(permInit&&permKnown[fk]===undefined) newly.push(permFound[fk]);
        if(!permDismissed[fk]&&!permFound[fk].classList.contains(PERMP)) permFound[fk].classList.add(PERMP);
      }
      if(permInit&&newly.length) permSound();
      if(!permInit) permInit=1;
      permKnown=permFound;
      updateHUD(); updateTitle();
    }

    document.addEventListener('click',function(ev){
      try{
        var row=rowOf(ev.target);
        if(row&&isDone(row))clearDone(row);
        var pk=row?keyOf(row)||titleOf(row):null;
        if(pk&&isPerm(row)){ permDismissed[pk]=1; row.classList.remove(PERMP); }
      }catch(e){}
    },true);
    var timer=null;
    function schedule(){if(timer)return;timer=setTimeout(function(){timer=null;scan();},250);}
    function start(){scan();applyStates();updateHUD();updateTitle();setInterval(function(){applyStates();updateHUD();updateTitle();},3000);new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  }catch(e){}
})();
