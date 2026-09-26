/* City-specific Yandex Metrika and VK Ads counters. */
(()=>{
 const config=window.CHEBANOV_SITE||{};
 const onDomain=[config.domain,'www.'+config.domain].includes(location.hostname);
 const enabled=Number.isInteger(config.metrika_id)&&onDomain;
 const vkEnabled=Number.isSafeInteger(config.vk_counter_id)&&config.vk_counter_id>0&&onDomain;
 const vkQueue=()=>window._tmr||(window._tmr=[]);
 if(vkEnabled){
  vkQueue().push({id:config.vk_counter_id,type:'pageView',start:Date.now()});
  if(!document.getElementById('tmr-code')){
   const script=document.createElement('script');script.async=true;script.id='tmr-code';
   script.src='https://top-fwz1.mail.ru/js/code.js';document.head.append(script);
  }
 }
 window.chebanovGoal=(name,params={})=>{
  const detail={...params,city:config.city,site:config.slug};
  document.dispatchEvent(new CustomEvent('chebanov:analytics',{detail:{counter:config.metrika_id,name,params:detail,enabled}}));
  if(vkEnabled&&name==='ticket_widget_open'){
   try{vkQueue().push({id:config.vk_counter_id,type:'reachGoal',goal:name})}catch(_error){}
  }
  if(enabled&&typeof window.ym==='function')window.ym(config.metrika_id,'reachGoal',name,detail);
 };
 if(enabled){
  window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};window.ym.l=Date.now();
  const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js?id='+config.metrika_id;document.head.append(script);
  window.ym(config.metrika_id,'init',{webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,referrer:document.referrer,url:location.href});
 }
 document.addEventListener('click',event=>{const link=event.target.closest('[data-city-goal]');if(link)window.chebanovGoal(link.dataset.cityGoal)});
})();
