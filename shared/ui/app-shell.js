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
   document.body.insertAdjacentHTML('beforeend',`<div id="user-menu" class="ui-popover user-menu" popover="auto" role="dialog" aria-label="Menú del usuario" hidden><div class="user-menu__identity"><strong>${e(user.name)}</strong><small>${e(user.email)}</small></div><div class="appearance" role="group" aria-label="Apariencia"><span class="appearance__label">Apariencia</span><div class="appearance__options">${[['light','Claro','sun','Tema claro'],['dark','Oscuro','moon','Tema oscuro'],['system','Sistema','monitor','Usar tema del sistema']].map(([value,label,icon,aria])=>`<button type="button" class="appearance__option" name="appearance" value="${value}" aria-label="${aria}" title="${label}" aria-pressed="false">${global.icon(icon)}<span class="appearance__tooltip" role="tooltip">${label}</span></button>`).join('')}</div></div><button id="account-logout" class="user-menu__logout" type="button">${global.icon('log-out')}Cerrar sesión</button><p id="account-error" role="alert" hidden></p></div><div id="navigation-tooltip" class="navigation-tooltip" role="tooltip" hidden></div>`);
   const sync=()=>document.querySelectorAll('[name="appearance"]').forEach(button=>button.setAttribute('aria-pressed',String(button.value===global.OFETheme.getPreference())));sync();global.OFETheme.subscribe(sync);
   $('user-menu-trigger').addEventListener('click',()=>global.OFEUI.openPopover($('user-menu'),$('user-menu-trigger')));
   $('user-menu-trigger').addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();global.OFEUI.openPopover($('user-menu'),$('user-menu-trigger'));}});
   document.querySelectorAll('[name="appearance"]').forEach(button=>button.addEventListener('click',()=>{global.OFETheme.setPreference(button.value);global.OFEUI.closePopover(true);}));
   $('account-logout').addEventListener('click',()=>global.runButtonTask($('account-logout'),async()=>{try{await global.OFEAuth.logout();}catch(error){$('account-error').textContent=error.message;$('account-error').hidden=false;}}));
   let preference=null;try{preference=localStorage.getItem('simulador_sidebar');}catch(_){}
   function setSidebar(value,persist=false){document.documentElement.dataset.sidebar=value;const collapsed=value==='collapsed',button=$('sidebar-collapse');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Expandir navegación':'Contraer navegación');button.title=collapsed?'Expandir navegación':'Contraer navegación';button.dataset.tooltip=button.title;const glyph=button.querySelector('[data-icon]');if(glyph){glyph.dataset.icon=collapsed?'panel-left-open':'panel-left-close';glyph.innerHTML=global.icon(glyph.dataset.icon);}if(persist)try{localStorage.setItem('simulador_sidebar',value);}catch(_){};}
   setSidebar(['expanded','collapsed'].includes(preference)?preference:matchMedia('(min-width:901px) and (max-width:1100px)').matches?'collapsed':'expanded');
   $('sidebar-collapse').addEventListener('click',()=>{global.OFEUI.closePopover();setSidebar(document.documentElement.dataset.sidebar==='collapsed'?'expanded':'collapsed',true);});
   refreshNavigation();
   const tooltip=$('navigation-tooltip');
   function hideTooltip(){tooltip.hidden=true;document.querySelectorAll('[aria-describedby="navigation-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));}
   function showTooltip(event){const button=event.target.closest('[data-tooltip]');if(!button)return;const nav=button.matches('.nav__item');if(nav&&(document.documentElement.dataset.sidebar!=='collapsed'||matchMedia('(max-width:900px)').matches))return;tooltip.textContent=button.dataset.tooltip;tooltip.hidden=false;const rect=button.getBoundingClientRect();tooltip.style.left=Math.max(12,Math.min(nav?rect.right+12:rect.left,innerWidth-tooltip.offsetWidth-12))+'px';tooltip.style.top=Math.max(12,Math.min(nav?rect.top:rect.bottom+8,innerHeight-tooltip.offsetHeight-12))+'px';button.setAttribute('aria-describedby','navigation-tooltip');}
   global.addEventListener('resize',hideTooltip);
   document.addEventListener('mouseover',showTooltip);document.addEventListener('focusin',showTooltip);document.addEventListener('mouseout',hideTooltip);document.addEventListener('focusout',hideTooltip);
   document.addEventListener('keydown',event=>{if(event.key==='Escape')hideTooltip();if(event.key!=='Tab'||!matchMedia('(max-width:900px)').matches||$('sidebar').dataset.open!=='true')return;const items=Array.from($('sidebar').querySelectorAll('button:not([hidden])')).filter(el=>el.offsetParent!==null&&!el.disabled),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
   document.addEventListener('click',event=>{hideTooltip();if(event.target.closest('.nav__item[data-tab]')){global.OFEUI.closePopover();}});
  }
 });
})(window);
