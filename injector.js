;(function(){
  try{
    if(window.__zcodeRunningHL==='v8-static') return; window.__zcodeRunningHL='v8-static';
    var HL='zcode-running-hl',GN='zcode-done-hl',LSKEY='zcode-done-map-v1';
    var CODEX_ROW='[data-app-action-sidebar-thread-row]',CODEX_TITLE='[data-app-action-sidebar-thread-title]';
    var LEGACY_ROW='[data-grouped-task-key],li,[role="button"],article,button';
    var css='.'+HL+'{background-color:rgba(59,130,246,.22)!important;box-shadow:inset 3px 0 0 0 #3b82f6!important}'+
      '.'+HL+' .animate-spin{color:#3b82f6!important}'+
      '.'+GN+'{background-color:rgba(34,197,94,.18)!important;box-shadow:inset 3px 0 0 0 #22c559!important}';
    var st=document.createElement('style');st.id='zcode-ui-patch-v8-static';st.textContent=css;
    (document.head||document.documentElement).appendChild(st);
    var doneMap={};
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
      var spins=document.querySelectorAll('.animate-spin'),running=[],i,row,k;
      for(i=0;i<spins.length&&running.length<300;i++){
        row=rowOf(spins[i]);
        if(isTaskRow(row)&&running.indexOf(row)<0)running.push(row);
      }
      var marked=document.querySelectorAll('.'+HL);
      for(i=0;i<marked.length;i++){
        row=marked[i];
        if(running.indexOf(row)<0){k=keyOf(row);if(k){doneMap[k]=Date.now();save();}row.classList.remove(HL);}
      }
      for(i=0;i<running.length;i++){
        row=running[i];row.classList.remove(GN);clearDone(row);row.classList.add(HL);
      }
      greenPass();
    }
    function greenPass(){
      var list=rows();
      for(var i=0;i<list.length;i++){
        var row=list[i];
        if(isDone(row)&&!row.classList.contains(HL))row.classList.add(GN);
        else if(!isDone(row))row.classList.remove(GN);
      }
    }
    document.addEventListener('click',function(ev){
      try{var row=rowOf(ev.target);if(row&&isDone(row))clearDone(row);}catch(e){}
    },true);
    var timer=null;
    function schedule(){if(timer)return;timer=setTimeout(function(){timer=null;scan();},250);}
    function start(){scan();setInterval(greenPass,5000);new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  }catch(e){}
})();
