(()=>{const el=document.getElementById('countdown');if(!el)return;const target=new Date(el.dataset.target).getTime();const tick=()=>{let t=Math.max(0,Math.floor((target-Date.now())/1000));const values={days:Math.floor(t/86400),hours:Math.floor(t/3600)%24,minutes:Math.floor(t/60)%60,seconds:t%60};Object.entries(values).forEach(([key,value])=>{el.querySelector('[data-'+key+']').textContent=String(value).padStart(2,'0')})};tick();setInterval(tick,1000)})();

(()=>{
 const initialize=()=>{
 const items=[...document.querySelectorAll('[data-scroll-reveal]')];
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  const entering=entries.filter(e=>e.isIntersecting).sort((a,b)=>items.indexOf(a.target)-items.indexOf(b.target));
  entering.forEach((entry,index)=>{
   const order=entry.target.matches('.tour-row')?entering.filter(e=>e.target.matches('.tour-row')).indexOf(entry):index;
   entry.target.style.setProperty('--scroll-delay',`${Math.min(order*140,700)}ms`);
   entry.target.classList.add('scroll-shown');
   observer.unobserve(entry.target);
  });
 },{threshold:0,rootMargin:'0px 0px -45px 0px'});
 items.forEach(item=>{item.classList.add('scroll-ready');observer.observe(item)});
 // Keyboard navigation must never focus an invisible control.
 document.addEventListener('focusin',event=>{
  const item=event.target.closest('[data-scroll-reveal]');
  if(item){item.style.setProperty('--scroll-delay','0ms');item.classList.add('scroll-shown');observer.unobserve(item)}
 });
 };
 const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(initialize));
 if(document.readyState==='complete')schedule();else window.addEventListener('load',schedule,{once:true});
})();
document.querySelectorAll('.t603__blockimg[role="button"]').forEach(photo=>photo.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();photo.click()}}));
// Shared historical counter across city pages.
(()=>{const badge=document.querySelector('.pairs-sticker');if(!badge)return;
const update=()=>{const weeks=Math.max(0,Math.floor((Date.now()-Date.parse(badge.dataset.start))/604800000));const count=Number(badge.dataset.base)+Math.floor(weeks/2)*5+(weeks%2)*2;badge.querySelector('.pairs-value').textContent=String(count);const last=count%10,teen=count%100;badge.querySelector('.pairs-unit').textContent=teen>=11&&teen<=14?'ПАР':last===1?'ПАРА':last>=2&&last<=4?'ПАРЫ':'ПАР'};
update();setInterval(update,3600000)})();
(()=>{
 const noise=document.querySelector('.site-noise'),hero=document.querySelector('.tour-hero');
 if(noise&&hero){const observer=new IntersectionObserver(entries=>noise.classList.toggle('noise-on-dark',!entries[0].isIntersecting),{threshold:0});observer.observe(hero)}
 const section=document.querySelector('.tour-contacts'),note=document.querySelector('.accreditation-note');
 if(!section||!note)return;
 let annotationObserver, reached=false;
 const hideNote=()=>{
  if(annotationObserver)annotationObserver.disconnect();
  note.hidden=true;note.classList.remove('is-annotating');section.classList.remove('is-accreditation');reached=false;
 };
 hideNote();
 document.querySelectorAll('.accreditation-link').forEach(link=>link.addEventListener('click',()=>{
  hideNote();note.hidden=false;section.classList.add('is-accreditation');
  annotationObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){
   reached=true;note.classList.add('is-annotating');annotationObserver.disconnect();
  }},{threshold:.2});
  annotationObserver.observe(note);
 }));
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link&&!link.classList.contains('accreditation-link'))hideNote();
 });
 new IntersectionObserver(entries=>{if(reached&&!entries[0].isIntersecting)hideNote()},{threshold:0}).observe(section);
 window.addEventListener('pageshow',event=>{if(event.persisted)hideNote()});
})();
(()=>{
 const track=document.querySelector('.emotions-track');if(!track)return;
 const prev=document.querySelector('.emotions-prev'),next=document.querySelector('.emotions-next');
 const update=()=>{prev.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2};
 const move=direction=>{const item=track.querySelector('.emotion-video');track.scrollBy({left:direction*(item.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
 const videos=[...document.querySelectorAll('.tour-video-section video,.tour-emotions video')];
 videos.forEach(video=>video.addEventListener('play',()=>videos.forEach(other=>{if(other!==video)other.pause()})));
})();
// Keep unavailable upstream media from leaving a broken native player.
document.querySelectorAll('.tour-video-section video,.tour-emotions video').forEach(video=>{
 const unavailable=()=>{video.hidden=true;const wrapper=video.parentElement;if(!wrapper.querySelector('.video-unavailable')){const message=document.createElement('p');message.className='video-unavailable';message.textContent='Видео временно недоступно';wrapper.append(message)}};
 video.addEventListener('error',unavailable);if(video.error)unavailable();
});

// Same 30-day last-source attribution and storage keys as chebanov.com.
// City utm_campaign stays on each ticket URL. Storage denial does not lose current UTM.
(()=>{
 if(window.chebanovTourUtmReady)return;
 window.chebanovTourUtmReady=true;
 const params=new URLSearchParams(location.search);
 let source=params.get('utm_source'),medium=params.get('utm_medium')||'';
 const keys=['cheb_utm_source','cheb_utm_medium','cheb_utm_time'];
 try{
  if(source){
   localStorage.setItem(keys[0],source);localStorage.setItem(keys[1],medium);
   localStorage.setItem(keys[2],String(Date.now()));
  }else{
   const stamp=Number(localStorage.getItem(keys[2]));
   if(stamp>0&&Date.now()-stamp<=30*86400000){
    source=localStorage.getItem(keys[0]);medium=localStorage.getItem(keys[1])||'';
   }else{keys.forEach(key=>localStorage.removeItem(key))}
  }
 }catch(e){/* Private browsing can restrict persistent storage. */}
 if(!source)return;
 const patch=()=>document.querySelectorAll('a[href*="qtickets.events"]').forEach(link=>{
  try{
   const url=new URL(link.href);
   if(url.protocol!=='https:'||!(url.hostname==='qtickets.events'||url.hostname.endsWith('.qtickets.events')))return;
   url.searchParams.set('utm_source',source);url.searchParams.set('utm_medium',medium);
   link.href=url.href;
  }catch(e){/* Leave malformed or non-ticket links unchanged. */}
 });
 window.chebanovApplyTicketAttribution=patch;
 patch();document.addEventListener('DOMContentLoaded',patch);window.addEventListener('load',patch);
 setTimeout(patch,1500);
})();

