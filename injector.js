;(function(){
  try{
    if(window.__zcodeRunningHL==='v15') return; window.__zcodeRunningHL='v15';
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
    css += '.'+LD+'{animation:zcode-last-radiance 2.4s ease-in-out infinite!important}';
    css += '.'+LD+'.'+FRESH+'{animation:zcode-fresh-blink .9s steps(1,end) infinite, zcode-last-radiance 2.4s ease-in-out infinite!important}';
    css += '@keyframes zcode-last-radiance{0%,100%{box-shadow:inset 3px 0 0 0 #22c559,0 0 8px 2px rgba(251,191,36,.5),0 0 22px 7px rgba(251,191,36,.3)}55%{box-shadow:inset 3px 0 0 0 #22c559,0 0 16px 6px rgba(251,191,36,.85),0 0 44px 16px rgba(251,191,36,.5)}}';
    css += '@media (prefers-reduced-motion:reduce){.'+LD+'{animation:none!important}}';
    var PERMP='zcode-perm-pulse';
    css += '.'+PERMP+'{outline:4px solid #d946ef!important;outline-offset:-1px!important;animation:zcode-perm-pulse-k .5s ease-in-out 6!important}';
    css += '@keyframes zcode-perm-pulse-k{0%,100%{outline-color:rgba(217,70,239,1);background-color:rgba(217,70,239,.3)}50%{outline-color:rgba(217,70,239,.12);background-color:rgba(217,70,239,.06)}}';
    var permAC=null,permKnown={},permInit=0,permFound={};
var st=document.createElement('style');st.id='zcode-ui-patch-v15';st.textContent=css;
    (document.head||document.documentElement).appendChild(st);
    var doneMap={}, runningTitles={}, dirty=0;
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
        if(!cur[t2] && doneMap[t2]===undefined){ doneMap[t2]=Date.now(); dirty=1; }
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
    function applyStates(){
      var lastKey=null,maxV=0;
      for(var k0 in doneMap){ if(doneMap[k0]>maxV){maxV=doneMap[k0];lastKey=k0;} }
      var seen=new Set(), pools=['[data-task-item-key]','[data-grouped-task-key]','li','[role="button"]'], pi, rowsE, i, row;
      for(pi=0;pi<pools.length;pi++){
        rowsE=document.querySelectorAll(pools[pi]);
        for(i=0;i<rowsE.length&&seen.size<300;i++){ if(!seen.has(rowsE[i])) seen.add(rowsE[i]); }
      }
      var permFound={};
      seen.forEach(function(row){
        var running=row.classList.contains(HL);
        var sel=row.classList.contains('bg-selected');
        var done=!running&&isDone(row);
        var want = running?HL : done?GN : null;
        [HL,GN,FRESH,LD].forEach(function(c){ if(c!==want) row.classList.remove(c); });
        if(want) row.classList.add(want);
        if(want===GN){
          var fresh = Date.now()-doneTS(row) < FRESH_MS;
          if(fresh&&!row.classList.contains(FRESH)) row.classList.add(FRESH);
          if(!fresh) row.classList.remove(FRESH);
          var k=keyOf(row),t=titleOf(row),isLast = lastKey!==null&&(k===lastKey||(t&&(t===lastKey||'title:'+t===lastKey)));
          if(isLast&&!row.classList.contains(LD)) row.classList.add(LD);
          if(!isLast) row.classList.remove(LD);
        } else { row.classList.remove(LD); row.classList.remove(FRESH); }
        if(sel&&!row.classList.contains(SEL)) row.classList.add(SEL);
        if(!sel) row.classList.remove(SEL);
        var pk=keyOf(row)||titleOf(row);
        if(pk&&isPerm(row)) permFound[pk]=row;
      });
      var newly=[];
      for(var fk in permFound){ if(permKnown[fk]===undefined) newly.push(permFound[fk]); }
      if(permInit&&newly.length){
        permSound();
        for(var ni=0;ni<newly.length;ni++){
          (function(r){ r.classList.add(PERMP); setTimeout(function(){ r.classList.remove(PERMP); },3000); })(newly[ni]);
        }
      }
      if(!permInit) permInit=1;
      permKnown=permFound;
    }

    document.addEventListener('click',function(ev){
      try{var row=rowOf(ev.target);if(row&&isDone(row))clearDone(row);}catch(e){}
    },true);
    var timer=null;
    function schedule(){if(timer)return;timer=setTimeout(function(){timer=null;scan();},250);}
    function start(){scan();applyStates();setInterval(applyStates,3000);new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  }catch(e){}
})();
