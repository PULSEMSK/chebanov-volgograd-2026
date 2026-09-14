/* CHEBANOV tour: official Qtickets renderer inside an accessible page popup.
   Original outbound hrefs remain a fallback and retain existing attribution. */
(()=>{
 if(window.chebanovWidgetReady)return;
 window.chebanovWidgetReady=true;
 const buttons=[...document.querySelectorAll('a[data-ticket-event]')];
 if(!buttons.length)return;
 const config=window.CHEBANOV_SITE||{};
 const local=!([config.domain,'www.'+config.domain].includes(location.hostname));
 const views=new Map();
 let apiPromise,active=null,opener=null,visit=0,scrollY=0;
 const layer=document.createElement('div');
 layer.className='ticket-popup';layer.hidden=true;
 layer.innerHTML='<div class="ticket-popup-panel" role="dialog" aria-modal="true" aria-labelledby="ticket-popup-title" tabindex="-1"><header class="ticket-popup-header"><div><span class="ticket-popup-kicker">CHEBANOV · КОНЦЕРТ-СВИДАНИЕ</span><h2 id="ticket-popup-title"></h2><span class="ticket-popup-subtitle"></span></div><button class="ticket-popup-close" type="button" aria-label="Закрыть покупку билетов">×</button></header><div class="ticket-popup-scroll"><p class="ticket-popup-status" role="status">Загружаем билеты…</p><div class="ticket-popup-hosts"></div><div class="ticket-popup-fallback" hidden><p>Виджет не загрузился. Продолжите покупку на сайте Qtickets.</p><a target="_blank" rel="noopener noreferrer">Открыть билеты на Qtickets</a><button type="button" class="ticket-popup-retry">Попробовать ещё раз</button></div></div></div>';
 document.body.append(layer);
 const panel=layer.querySelector('.ticket-popup-panel'),closeButton=layer.querySelector('.ticket-popup-close');
 const status=layer.querySelector('.ticket-popup-status'),fallback=layer.querySelector('.ticket-popup-fallback');
 const hosts=layer.querySelector('.ticket-popup-hosts');
 const requestFor=link=>{
  const url=new URL(link.href);
  const request={event_id:Number(link.dataset.ticketEvent),base_color:'f0a33e',lang:'ru',site_url:location.href,height:Math.max(440,Math.min(720,innerHeight-150))};
  // Use the same resolved source/medium and per-city campaign as the existing URL.
  url.searchParams.forEach((value,key)=>{if(key.startsWith('utm_'))request[key]=value});
  if(document.referrer)request.site_referer=document.referrer;
  const landing=new URLSearchParams(location.search);
  ['yclid','gclid','fbclid','rb_clickid'].forEach(key=>{if(landing.has(key))(request.ads||(request.ads={}))[key]=landing.get(key)});
  return request;
 };
 const recordOpen=entry=>{
  if(active!==entry||layer.hidden||entry.tracked===visit)return;
  entry.tracked=visit;
  const detail={city:entry.link.dataset.ticketCity,event_id:entry.link.dataset.ticketEvent,page:config.slug,placement:entry.link.dataset.ticketPlacement||'purchase'};
  const goals=['ticket_widget_open'];
  // Local previews never send test events to the site's production counter.
  layer.dataset.analytics=JSON.stringify({counter:config.metrika_id,goals,params:detail,local});
  if(window.chebanovGoal)goals.forEach(goal=>window.chebanovGoal(goal,detail));
  document.dispatchEvent(new CustomEvent('chebanov:widget-open',{detail}));
 };
 const loaded=entry=>{
  entry.ready=true;entry.failed=false;entry.host.dataset.loaded="true";clearTimeout(entry.timer);
  entry.host.querySelectorAll("iframe").forEach(frame=>frame.title="Купить билеты · "+entry.link.dataset.ticketCity);
  if(active===entry&&!layer.hidden){status.hidden=true;fallback.hidden=true;recordOpen(entry)}
 };
 const failed=entry=>{
  clearTimeout(entry.timer);entry.failed=true;
  if(active===entry&&!layer.hidden){status.hidden=true;fallback.hidden=false}
 };
 const loadAPI=()=>{
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
   const finish=()=>setTimeout(()=>{
    if(typeof window.qTickets!=='function'){reject(new Error('Qtickets unavailable'));return}
    // Run after the official cookie handler so stale Qtickets attribution cannot override ours.
    window.jQueryQtickets(document).on('qtickets.openapi.prepareRequest.chebanov',(_event,request)=>{
     const entry=views.get(String(request.event_id));
     if(!entry)return;
     const resolved=requestFor(entry.link);
     Object.keys(request).filter(k=>k.startsWith('utm_')).forEach(k=>delete request[k]);
     Object.keys(resolved).filter(k=>k.startsWith('utm_')).forEach(k=>request[k]=resolved[k]);
    });resolve();
   },0);
   if(window.qTickets){finish();return}
   const script=document.createElement('script');script.src='https://cdn.qtickets.tech/openapi.js';script.async=true;
   const timeout=setTimeout(()=>reject(new Error('Qtickets timeout')),15000);
   script.onload=()=>{clearTimeout(timeout);finish()};
   script.onerror=()=>{clearTimeout(timeout);script.remove();reject(new Error('Qtickets network error'))};
   document.head.append(script);
  }).catch(error=>{apiPromise=null;throw error});
  return apiPromise;
 };
 const render=async entry=>{
  if(entry.loading)return;entry.loading=true;
  try{
   await loadAPI();
   if(active!==entry||layer.hidden)return;
   const request=requestFor(entry.link);
   entry.host.dataset.request=JSON.stringify(request);
   entry.timer=setTimeout(()=>failed(entry),22000);
   entry.instance=new window.qTickets({element:entry.host.id,request,handlers:{
    complete(){loaded(entry)},load(){loaded(entry)},error(){failed(entry)},
    newInstance(instance){entry.instance=instance},modalClose(){dismiss()},forceCloseWidget(){dismiss()},clickOnCloseBtn(){dismiss()}
   }});
  }catch(error){failed(entry)}finally{entry.loading=false}
 };
 const dismiss=()=>{
  layer.hidden=true;document.body.classList.remove('ticket-popup-open');
  document.body.style.top='';window.scrollTo({top:scrollY,behavior:'instant'});
  if(opener)opener.focus({preventScroll:true});
 };
 const open=link=>{
  if(window.chebanovApplyTicketAttribution)window.chebanovApplyTicketAttribution();
  if(layer.hidden){scrollY=window.scrollY;document.body.style.top=-scrollY+'px';document.body.classList.add('ticket-popup-open')}
  const menu=link.closest('.t450');if(menu){const close=menu.querySelector('.t450__close-button');if(close)close.click()}
  opener=link;visit++;
  const id=link.dataset.ticketEvent;
  let entry=views.get(id);
  if(!entry){const host=document.createElement('div');host.id='chebanov-widget-'+id;host.className='ticket-popup-widget';hosts.append(host);entry={host,link,ready:false};views.set(id,entry)}
  entry.link=link;active=entry;
  views.forEach(item=>item.host.hidden=item!==entry);
  layer.querySelector('h2').textContent=link.dataset.ticketCity;
  layer.querySelector('.ticket-popup-subtitle').textContent=link.dataset.ticketDate+' · '+link.dataset.ticketVenue;
  fallback.querySelector('a').href=link.href;
  fallback.hidden=!entry.failed;status.hidden=entry.ready||entry.failed;
  layer.hidden=false;closeButton.focus({preventScroll:true});
  if(entry.ready){entry.instance.resize(entry.host.clientWidth,Math.max(440,innerHeight-150));recordOpen(entry)}
  else if(!entry.instance)render(entry);
 };
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-ticket-event]');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();event.stopImmediatePropagation();open(link);
 },true);
 closeButton.addEventListener('click',dismiss);
 layer.addEventListener('click',event=>{if(event.target===layer)dismiss()});
 layer.querySelector('.ticket-popup-retry').addEventListener('click',()=>{
  if(!active)return;active.failed=false;fallback.hidden=true;status.hidden=false;
  if(active.instance){active.timer=setTimeout(()=>failed(active),22000);active.instance.reload()}
  else render(active);
 });
 document.addEventListener('keydown',event=>{
  if(layer.hidden)return;
  if(event.key==='Escape'){event.preventDefault();dismiss()}
  if(event.key==='Tab'){
   const focusables=[...panel.querySelectorAll('button,a,iframe')].filter(el=>el.getClientRects().length);
   const first=focusables[0],last=focusables[focusables.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
 });
})();
