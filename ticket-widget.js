/* CHEBANOV city sites - Qtickets native launcher, 2026-09-17.
   Qtickets owns the only purchase modal and checkout lifecycle. */
(()=>{
 'use strict';
 if(window.chebanovWidgetReady)return;
 window.chebanovWidgetReady=true;

 const config=window.CHEBANOV_SITE||{};
 const SDK_URL='https://cdn.qtickets.tech/openapi.js';
 const VERSION='2026-09-17-native-2-metrika-click';
 const originals=new WeakMap();
 const byEvent=new Map();
 let sdkReady=false,sdkLoading=false,sdkError='',pollTimer=0;

 const sourceNow=()=>{
  const query=new URLSearchParams(location.search);
  if(query.get('utm_source'))return {source:query.get('utm_source'),medium:query.get('utm_medium')||''};
  try{
   const stamp=Number(localStorage.getItem('cheb_utm_time'));
   const source=localStorage.getItem('cheb_utm_source');
   if(source&&stamp>0&&Date.now()-stamp<=30*86400000)return {source,medium:localStorage.getItem('cheb_utm_medium')||''};
  }catch(_error){}
  return null;
 };
 const ticketURL=link=>{const url=new URL(originals.get(link));const source=sourceNow();if(source){url.searchParams.set('utm_source',source.source);url.searchParams.set('utm_medium',source.medium)}return url};
 const setOfficialLink=link=>{const url=new URL('https://qtickets.ru/event/'+link.dataset.ticketEvent);url.search=ticketURL(link).search;link.href=url.href;link.removeAttribute('target');link.setAttribute('aria-haspopup','dialog')};
 const register=()=>{let added=0;document.querySelectorAll('a[data-ticket-event]').forEach(link=>{if(originals.has(link)||!/^[0-9]+$/.test(link.dataset.ticketEvent||''))return;try{const url=new URL(link.href,location.href);if(url.protocol!=='https:'||!(url.hostname==='qtickets.events'||url.hostname.endsWith('.qtickets.events')))return;originals.set(link,url.href);byEvent.set(String(link.dataset.ticketEvent),link);setOfficialLink(link);added++}catch(_error){}});return added};
 register();if(!byEvent.size)return;
 const installAttributionHook=()=>{const jq=window.jQueryQtickets;if(typeof jq!=='function')return;try{jq(document).off('qtickets.openapi.prepareRequest.chebanovCity');jq(document).on('qtickets.openapi.prepareRequest.chebanovCity',(_event,request)=>{if(!request||typeof request!=='object')return;const link=byEvent.get(String(request.event_id));if(!link)return;const url=ticketURL(link);Object.keys(request).filter(key=>key.startsWith('utm_')).forEach(key=>delete request[key]);url.searchParams.forEach((value,key)=>{if(key.startsWith('utm_'))request[key]=value});request.base_color='f0a33e';request.lang=request.lang||'ru';request.site_url=location.href;if(document.referrer)request.site_referer=document.referrer;const landing=new URLSearchParams(location.search);['yclid','gclid','fbclid','rb_clickid'].forEach(key=>{if(!landing.has(key))return;if(!request.ads||typeof request.ads!=='object')request.ads={};request.ads[key]=landing.get(key)})})}catch(error){console.warn('[CHEBANOV] Qtickets attribution hook:',error)}};
 const initSDK=()=>{if(!window.qTickets||typeof window.qTickets.init!=='function')return false;try{window.qTickets.init();installAttributionHook();if(typeof window.jQueryQtickets==='function')window.jQueryQtickets(()=>setTimeout(installAttributionHook,0));sdkReady=true;sdkLoading=false;sdkError='';document.body.dataset.chebanovTickets=VERSION;return true}catch(error){sdkError=String(error);return false}};
 const loadSDK=()=>{if(sdkLoading)return;if(initSDK())return;sdkLoading=true;sdkError='';const deadline=Date.now()+15000;let script=document.querySelector('script[src="'+SDK_URL+'"]');const check=()=>{clearTimeout(pollTimer);if(initSDK())return;if(Date.now()>=deadline){sdkLoading=false;sdkError=sdkError||'SDK timeout';return}pollTimer=setTimeout(check,100)};if(!script){script=document.createElement('script');script.src=SDK_URL;script.async=true;script.addEventListener('load',()=>setTimeout(check,0),{once:true});script.addEventListener('error',()=>{clearTimeout(pollTimer);sdkLoading=false;sdkError='SDK network error'},{once:true});document.head.append(script)}check()};
 const sendGoal=link=>{const detail={city:link.dataset.ticketCity||config.city,event_id:link.dataset.ticketEvent||config.event_id,page:config.slug,placement:link.dataset.ticketPlacement||'purchase'};let attempts=0;const send=()=>{if(typeof window.chebanovGoal==='function'){try{window.chebanovGoal('ticket_widget_open',detail)}catch(_error){}document.dispatchEvent(new CustomEvent('chebanov:ticket-goals',{detail:{...detail,goals:['ticket_widget_open'],counter:config.metrika_id}}));return}if(attempts++<20)setTimeout(send,100)};send()};
 document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;const link=target&&target.closest('a[data-ticket-event]');if(!link||!originals.has(link)||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;sendGoal(link);setOfficialLink(link);if(!sdkReady){link.href=ticketURL(link).href;link.target='_blank';event.stopImmediatePropagation();setTimeout(()=>setOfficialLink(link),0);return}installAttributionHook();document.dispatchEvent(new CustomEvent('chebanov:widget-open',{detail:{city:link.dataset.ticketCity||config.city,event_id:link.dataset.ticketEvent||config.event_id,page:config.slug,placement:link.dataset.ticketPlacement||'purchase'}}))},true);
 window.chebanovCityTickets={version:VERSION,mode:'official',getStatus:()=>({ready:sdkReady,loading:sdkLoading,error:sdkError,events:byEvent.size}),refresh:()=>{const added=register();if(added||!sdkReady)loadSDK()}};
 loadSDK();
})();
