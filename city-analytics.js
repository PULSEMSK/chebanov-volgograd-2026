/* One first-party analytics counter per city. No VK/myTarget pixel. */
(()=>{
 const config=window.CHEBANOV_SITE||{};
 const enabled=Number.isInteger(config.metrika_id)&&[config.domain,'www.'+config.domain].includes(location.hostname);
 window.chebanovGoal=(name,params={})=>{
  const detail={...params,city:config.city,site:config.slug};
  document.dispatchEvent(new CustomEvent('chebanov:analytics',{detail:{counter:config.metrika_id,name,params:detail,enabled}}));
  if(enabled&&typeof window.ym==='function')window.ym(config.metrika_id,'reachGoal',name,detail);
 };
 if(enabled){
  window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};window.ym.l=Date.now();
  const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js?id='+config.metrika_id;document.head.append(script);
  window.ym(config.metrika_id,'init',{webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,referrer:document.referrer,url:location.href});
 }
 document.addEventListener('click',event=>{const link=event.target.closest('[data-city-goal]');if(link)window.chebanovGoal(link.dataset.cityGoal)});
})();
