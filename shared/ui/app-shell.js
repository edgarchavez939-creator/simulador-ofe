(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 function initials(name){return String(name||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>Array.from(part)[0]).join('').toLocaleUpperCase('es-CO');}
 function refreshNavigation(){
  document.querySelectorAll('.nav__item[data-tab]').forEach(button=>{const name=button.querySelector('.nav__item-text')?.textContent.trim();if(name){button.setAttribute('aria-label',name);button.dataset.tooltip=name;}});
 }
 global.OFEAppShell=Object.freeze({initials,refreshNavigation});
 global.SimuladorOFE.register('application-shell',{
  async init(){
   if(!global.OFE_SERVER)return;const user=await global.OFEAuth.getUser();if(!user)return;
   const e=global.escHTML;
   $('header-user').innerHTML=`<button type="button" id="user-menu-trigger" class="user-trigger" aria-expanded="false" aria-controls="user-menu" aria-haspopup="dialog"><span class="user-avatar" aria-hidden="true">${e(initials(user.name))}</span><span class="user-trigger__name">${e(user.name)}</span>${global.icon('chevron-down')}</button>`;
   document.body.insertAdjacentHTML('beforeend',`<div id="user-menu" class="ui-popover user-menu" popover="auto" role="dialog" aria-label="Menú del usuario" hidden><div class="user-menu__identity"><strong>${e(user.name)}</strong><small>${e(user.email)}</small></div><fieldset class="appearance"><legend>Apariencia</legend>${[['light','Claro','sun'],['dark','Oscuro','moon'],['system','Sistema','monitor']].map(([value,label,icon])=>`<label>${global.icon(icon)}<span>${label}</span><input type="radio" name="appearance" value="${value}"></label>`).join('')}</fieldset><button id="account-logout" class="user-menu__logout" type="button">${global.icon('log-out')}Cerrar sesión</button><p id="account-error" role="alert" hidden></p></div><div id="navigation-tooltip" class="navigation-tooltip" role="tooltip" hidden></div>`);
   const sync=()=>document.querySelectorAll('[name="appearance"]').forEach(radio=>radio.checked=radio.value===global.OFETheme.getPreference());sync();global.OFETheme.subscribe(sync);
   $('user-menu-trigger').addEventListener('click',()=>global.OFEUI.openPopover($('user-menu'),$('user-menu-trigger')));
   $('user-menu-trigger').addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();global.OFEUI.openPopover($('user-menu'),$('user-menu-trigger'));}});
   document.querySelectorAll('[name="appearance"]').forEach(radio=>{radio.addEventListener('change',()=>{global.OFETheme.setPreference(radio.value);global.OFEUI.closePopover(true);});radio.addEventListener('click',()=>global.OFEUI.closePopover(true));});
   $('account-logout').addEventListener('click',()=>global.runButtonTask($('account-logout'),async()=>{try{await global.OFEAuth.logout();}catch(error){$('account-error').textContent=error.message;$('account-error').hidden=false;}}));
   let preference=null;try{preference=localStorage.getItem('simulador_sidebar');}catch(_){}
   function setSidebar(value,persist=false){document.documentElement.dataset.sidebar=value;const collapsed=value==='collapsed',button=$('sidebar-collapse');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Expandir navegación':'Contraer navegación');button.title=collapsed?'Expandir navegación':'Contraer navegación';if(persist)try{localStorage.setItem('simulador_sidebar',value);}catch(_){};}
   setSidebar(['expanded','collapsed'].includes(preference)?preference:matchMedia('(min-width:901px) and (max-width:1100px)').matches?'collapsed':'expanded');
   $('sidebar-collapse').addEventListener('click',()=>{global.OFEUI.closePopover();setSidebar(document.documentElement.dataset.sidebar==='collapsed'?'expanded':'collapsed',true);});
   refreshNavigation();
   const tooltip=$('navigation-tooltip');
   function hideTooltip(){tooltip.hidden=true;document.querySelectorAll('[aria-describedby="navigation-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
   function showTooltip(event){const button=event.target.closest('.nav__item[data-tooltip]');if(!button||document.documentElement.dataset.sidebar!=='collapsed'||matchMedia('(max-width:900px)').matches)return;tooltip.textContent=button.dataset.tooltip;tooltip.hidden=false;const rect=button.getBoundingClientRect();tooltip.style.left=(rect.right+12)+'px';tooltip.style.top=Math.min(rect.top,innerHeight-60)+'px';button.setAttribute('aria-describedby','navigation-tooltip');}
   global.addEventListener('resize',hideTooltip);
   $('sidebar').addEventListener('mouseover',showTooltip);$('sidebar').addEventListener('focusin',showTooltip);$('sidebar').addEventListener('mouseout',hideTooltip);$('sidebar').addEventListener('focusout',hideTooltip);
   document.addEventListener('keydown',event=>{if(event.key==='Escape')hideTooltip();if(event.key!=='Tab'||!matchMedia('(max-width:900px)').matches||$('sidebar').dataset.open!=='true')return;const items=Array.from($('sidebar').querySelectorAll('button:not([hidden])')).filter(el=>el.offsetParent!==null&&!el.disabled),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
   document.addEventListener('click',event=>{if(event.target.closest('.nav__item[data-tab]')){hideTooltip();global.OFEUI.closePopover();}});
  }
 });
})(window);
