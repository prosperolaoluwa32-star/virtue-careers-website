/* Virtue Careers: interaction layer */
(function(){
  'use strict';
  var d=document, root=d.documentElement, body=d.body;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var safe=function(f){try{return f()}catch(e){return null}};

  /* ---------- Loader / intro ---------- */
  var loader=$('#loader'), curtain=$('#curtain');
  var seen=safe(function(){return sessionStorage.getItem('vc_seen')});
  var navIn=root.classList.contains('nav-in');
  function ready(){ root.classList.add('ready'); body.classList.remove('loading'); startCounters(); }
  function finishLoader(){
    if(!loader) return ready();
    loader.classList.add('open');
    setTimeout(function(){ root.classList.add('ready'); }, 520);
    setTimeout(function(){ if(loader&&loader.parentNode) loader.parentNode.removeChild(loader); body.classList.remove('loading'); startCounters(); }, 1300);
  }
  if(loader && !seen && !reduced && !navIn){
    safe(function(){sessionStorage.setItem('vc_seen','1')});
    body.classList.add('loading');
    var num=$('#loader .count'), fill=$('#loader .bar i'), t0=performance.now(), dur=2500, done=false;
    var skip=function(){ if(done) return; done=true; finishLoader(); };
    loader.addEventListener('click',skip);
    (function tick(now){
      if(done) return;
      var p=Math.min((now-t0)/dur,1), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      if(num) num.textContent=String(Math.round(e*100)).padStart(3,'0');
      if(fill) fill.style.transform='scaleX('+e+')';
      if(p<1) requestAnimationFrame(tick); else { setTimeout(skip,260); }
    })(t0);
    setTimeout(skip,6500);
  } else {
    safe(function(){sessionStorage.setItem('vc_seen','1')});
    if(loader&&loader.parentNode) loader.parentNode.removeChild(loader);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      if(navIn){ root.classList.remove('nav-in'); }
      ready();
    }); });
  }

  /* ---------- Page transitions ---------- */
  if(curtain && !reduced){
    $$('a[href]').forEach(function(a){
      var h=a.getAttribute('href');
      if(!h||h.charAt(0)==='#'||/^(mailto|tel|https?:)/.test(h)||a.target==='_blank') return;
      a.addEventListener('click',function(e){
        if(e.metaKey||e.ctrlKey||e.shiftKey) return;
        e.preventDefault();
        curtain.classList.add('on');
        safe(function(){sessionStorage.setItem('vc_nav','1')});
        setTimeout(function(){ location.href=h; },620);
      });
    });
    window.addEventListener('pageshow',function(e){ if(e.persisted&&curtain) curtain.classList.remove('on'); });
  }

  /* ---------- Header, progress, menu ---------- */
  var header=$('#header'), prog=$('#progress'), lastY=0, ticking=false;
  function onScroll(){
    var y=window.scrollY||window.pageYOffset, h=d.documentElement.scrollHeight-window.innerHeight;
    if(header){ header.classList.toggle('scrolled',y>40); header.classList.toggle('hide',y>lastY+4&&y>500&&!$('.nav-wrap.open')); if(y<lastY-4) header.classList.remove('hide'); }
    if(prog) prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    lastY=y; ticking=false;
    parallax(y); timeline();
  }
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(onScroll);} },{passive:true});
  var toggle=$('#menuToggle'), wrap=$('#navWrap');
  if(toggle&&wrap){
    toggle.addEventListener('click',function(){
      var o=wrap.classList.toggle('open'); toggle.classList.toggle('open',o);
      toggle.setAttribute('aria-expanded',o); body.style.overflow=o?'hidden':'';
    });
    $$('a',wrap).forEach(function(a){ a.addEventListener('click',function(){ wrap.classList.remove('open'); toggle.classList.remove('open'); body.style.overflow=''; }); });
  }

  /* ---------- Reveal ---------- */
  var rev=$$('.reveal');
  if('IntersectionObserver' in window && !reduced){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} }); },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rev.forEach(function(el){ io.observe(el); });
  } else { rev.forEach(function(el){ el.classList.add('visible'); }); }

  /* ---------- Counters ---------- */
  var counted=false;
  function startCounters(){
    if(counted) return; counted=true;
    var els=$$('[data-count]');
    function run(el){
      var to=parseFloat(el.dataset.count), suf=el.dataset.suffix||'', pre=el.dataset.prefix||'', dur=1900, t0=performance.now();
      if(reduced){ el.textContent=pre+to+suf; return; }
      (function step(now){
        var p=Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,4);
        el.textContent=pre+Math.round(e*to)+suf;
        if(p<1) requestAnimationFrame(step);
      })(t0);
    }
    if('IntersectionObserver' in window){
      var co=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ run(e.target); co.unobserve(e.target);} }); },{threshold:.5});
      els.forEach(function(el){ co.observe(el); });
    } else els.forEach(run);
  }

  /* ---------- Parallax ---------- */
  var par=$$('[data-parallax]');
  function parallax(){
    if(reduced) return;
    par.forEach(function(el){
      var r=el.parentNode.getBoundingClientRect(), vh=window.innerHeight;
      if(r.bottom<-100||r.top>vh+100) return;
      var k=parseFloat(el.dataset.parallax)||.15, c=(r.top+r.height/2-vh/2);
      el.style.transform='translate3d(0,'+(-c*k).toFixed(1)+'px,0)';
    });
  }

  /* ---------- Timeline ---------- */
  var tl=$('.timeline');
  function timeline(){
    if(!tl) return;
    var r=tl.getBoundingClientRect(), vh=window.innerHeight;
    var p=Math.max(0,Math.min(1,(vh*.62-r.top)/r.height));
    tl.style.setProperty('--p',(p*100).toFixed(1)+'%');
    $$('.tl-step',tl).forEach(function(s){ s.classList.toggle('on',s.getBoundingClientRect().top<vh*.62); });
  }

  /* ---------- Hero pointer effects ---------- */
  var hero=$('#hero');
  if(hero && !reduced && window.matchMedia('(pointer:fine)').matches){
    var stage=$('.stage',hero), spot=$('.spot',hero);
    hero.addEventListener('mousemove',function(e){
      var r=hero.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      if(spot){ spot.style.setProperty('--mx',(e.clientX-r.left)+'px'); spot.style.setProperty('--my',(e.clientY-r.top)+'px'); }
      if(stage){
        stage.style.setProperty('--tx1',(x*-26)+'px'); stage.style.setProperty('--ty1',(y*-20)+'px');
        stage.style.setProperty('--tx2',(x*30)+'px'); stage.style.setProperty('--ty2',(y*22)+'px');
      }
    });
  }
  /* magnetic buttons */
  if(!reduced && window.matchMedia('(pointer:fine)').matches){
    $$('.btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(); b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'; });
      b.addEventListener('mouseleave',function(){ b.style.transform=''; });
    });
  }

  /* ---------- Testimonial marquee ---------- */
  var tt=$('.t-track');
  if(tt){ $$('.t-card',tt).map(function(c){ return c.cloneNode(true); }).forEach(function(c){ c.setAttribute('aria-hidden','true'); tt.appendChild(c); }); }
  var tk=$('.ticker .track');
  if(tk){ tk.innerHTML=tk.innerHTML+tk.innerHTML; }

  /* ---------- Tabs (pricing / faq) ---------- */
  $$('[data-tabs]').forEach(function(group){
    var tabs=$$('.tab',group), target=d.getElementById(group.dataset.tabs);
    tabs.forEach(function(t){
      t.addEventListener('click',function(){
        tabs.forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
        t.classList.add('active'); t.setAttribute('aria-selected','true');
        var k=t.dataset.k;
        $$('[data-k]',target).forEach(function(el){
          if(el.classList.contains('tab')) return;
          var show=(k==='all'||el.dataset.k===k);
          if(el.classList.contains('band')){ el.classList.toggle('active',show); }
          else { el.style.display=show?'':'none'; }
        });
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  $$('.fq').forEach(function(f){
    var b=$('button',f);
    b.addEventListener('click',function(){
      var o=!f.classList.contains('open');
      $$('.fq.open').forEach(function(x){ if(x!==f){ x.classList.remove('open'); $('button',x).setAttribute('aria-expanded','false'); } });
      f.classList.toggle('open',o); b.setAttribute('aria-expanded',o);
    });
  });
  var firstFq=$('.fq'); if(firstFq && !firstFq.classList.contains('open')){ firstFq.classList.add('open'); $('button',firstFq).setAttribute('aria-expanded','true'); }

  /* ---------- Before/after sliders ---------- */
  $$('.ba').forEach(function(ba){
    var inp=$('input',ba);
    function set(v){ ba.style.setProperty('--pos',v+'%'); }
    inp.addEventListener('input',function(){ set(inp.value); });
    if(!reduced && 'IntersectionObserver' in window){
      var o=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ o.disconnect(); var t0=performance.now(); (function s(n){ var p=Math.min((n-t0)/1800,1); var v=50+Math.sin(p*Math.PI*2)*30*(1-p); set(v.toFixed(1)); inp.value=v; if(p<1) requestAnimationFrame(s); else { set(50); inp.value=50; } })(t0); } }); },{threshold:.6});
      o.observe(ba);
    }
  });

  /* ---------- Lightbox ---------- */
  var lb=$('#lightbox');
  if(lb){
    var lbi=$('img',lb);
    $$('.shot').forEach(function(s){ s.addEventListener('click',function(){ lbi.src=s.dataset.full||$('img',s).src; lbi.alt=$('img',s).alt; lb.classList.add('on'); body.style.overflow='hidden'; }); });
    var close=function(){ lb.classList.remove('on'); body.style.overflow=''; };
    lb.addEventListener('click',close); d.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  }

  /* ---------- Forms (Formspree, inline success) ---------- */
  $$('form[data-ajax]').forEach(function(f){
    f.addEventListener('submit',function(e){
      if(!window.fetch) return;
      e.preventDefault();
      var btn=$('button[type=submit]',f), old=btn?btn.innerHTML:'';
      if(btn){ btn.disabled=true; btn.textContent='Sending...'; }
      fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}}).then(function(r){
        if(r.ok){ f.classList.add('sent'); f.reset(); } else throw 0;
      }).catch(function(){ f.submit(); }).then(function(){ if(btn){ btn.disabled=false; btn.innerHTML=old; } });
    });
  });

  /* ---------- Map (About) ---------- */
  if(window.L && $('#reach-map')){
    var map=L.map('reach-map',{scrollWheelZoom:false,worldCopyJump:true}).setView([22,12],2);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles &copy; Esri | Source: US National Park Service',maxZoom:8}).addTo(map);
    var icon=L.divIcon({className:'custom-marker',html:'<span></span>',iconSize:[16,16]});
    [{n:'North America',c:[39.8,-98.5],t:'Serving executives across the United States and Canada.'},
     {n:'South America',c:[-14.2,-51.9],t:'Supporting professionals pursuing global opportunities.'},
     {n:'Europe',c:[54.5,15.2],t:'Executive positioning for leaders across the region.'},
     {n:'Africa',c:[1.5,20],t:'Helping talent position for international opportunities.'},
     {n:'Asia',c:[34,100.6],t:'Partnering with executives targeting global markets.'}].forEach(function(l){
      L.marker(l.c,{icon:icon}).addTo(map).bindPopup('<strong>'+l.n+'</strong><br>'+l.t);
    });
    map.on('click',function(){ map.scrollWheelZoom.enable(); });
  }

  onScroll();
})();
