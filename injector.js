;(function(){
  try{
    if (window.__zcodeRunningHL) return; window.__zcodeRunningHL = 1;
    var HL='zcode-running-hl', GN='zcode-done-hl', LSKEY='zcode-done-map-v1';
    var css='.'+HL+'{background-color:rgba(59,130,246,.22)!important;box-shadow:inset 3px 0 0 0 #3b82f6!important}'+
            '.'+HL+' .animate-spin{color:#3b82f6!important}'+
            '.'+GN+'{background-color:rgba(34,197,94,.18)!important;box-shadow:inset 3px 0 0 0 #22c559!important}';
    var st=document.createElement('style'); st.id='zcode-ui-patch-v6'; st.textContent=css;
    (document.head||document.documentElement).appendChild(st);
    var doneMap={};
    try{ doneMap=JSON.parse(localStorage.getItem(LSKEY)||'{}')||{}; }catch(e){}
    function save(){ try{
      var ks=Object.keys(doneMap);
      if(ks.length>500){ ks.sort(function(a,b){return doneMap[a]-doneMap[b];}); ks.slice(0,ks.length-500).forEach(function(k){delete doneMap[k];}); }
      localStorage.setItem(LSKEY,JSON.stringify(doneMap));
    }catch(e){} }
    function rowOf(sp){ return sp.closest('[data-grouped-task-key],li,[role="button"],article,button'); }
    function titleOf(row){ var t=row.querySelector('.truncate,[data-task-title-marquee-track]'); return t?String(t.textContent).trim():null; }
    function isTaskRow(row){
      if(!row) return false;
      if((row.textContent||'').length>300) return false;
      return !!row.querySelector('.truncate,[data-task-title-marquee-track],[title]');
    }
    function clearTitle(t){ if(t&&doneMap[t]!==undefined){ delete doneMap[t]; save(); } var rows=document.querySelectorAll('.'+GN),i; for(i=0;i<rows.length;i++){ if(titleOf(rows[i])===t) rows[i].classList.remove(GN); } }
    function scan(){
      var spins=document.querySelectorAll('.animate-spin'), i, row, marked, t;
      var running=[];
      for(i=0;i<spins.length;i++){ row=rowOf(spins[i]); if(isTaskRow(row)&&running.indexOf(row)<0) running.push(row); }
      marked=document.querySelectorAll('.'+HL);
      for(i=0;i<marked.length;i++){
        row=marked[i];
        if(running.indexOf(row)<0){ t=titleOf(row); if(t){ doneMap[t]=Date.now(); save(); } row.classList.remove(HL); }
      }
      for(i=0;i<running.length;i++){
        row=running[i]; row.classList.remove(GN);
        t=titleOf(row); if(t) clearTitle(t);
        row.classList.add(HL);
      }
    }
    function greenPass(){
      var rows=document.querySelectorAll('[data-grouped-task-key],li,[role="button"]'), i, row, t;
      for(i=0;i<rows.length;i++){
        row=rows[i]; t=titleOf(row); if(!t||!isTaskRow(row)) continue;
        if(doneMap[t]!==undefined){ if(!row.classList.contains(HL)) row.classList.add(GN); }
        else if(row.classList.contains(GN)) row.classList.remove(GN);
      }
    }
    document.addEventListener('click',function(ev){
      try{
        var el=ev.target;
        while(el&&el!==document.body){
          if(el.matches&&el.matches('[data-grouped-task-key],li,[role="button"]')){
            var t=titleOf(el);
            if(t&&doneMap[t]!==undefined) clearTitle(t);
            return;
          }
          el=el.parentElement;
        }
      }catch(e){}
    },true);
    var tId=null;
    function schedule(){ if(tId) return; tId=setTimeout(function(){ tId=null; scan(); },150); }
    var mo=new MutationObserver(schedule);
    function start(){ scan(); setInterval(greenPass,2000); mo.observe(document.body,{subtree:true,childList:true}); }
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',start); } else { start(); }
  }catch(e){}
})();
