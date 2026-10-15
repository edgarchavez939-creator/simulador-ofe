(function(global){
 'use strict';
 let active=null;
 function close(restore=false){if(!active)return;const {element,anchor}=active;active=null;if(element.hidePopover&&element.matches(':popover-open'))element.hidePopover();element.hidden=true;element.removeAttribute('data-open');anchor?.setAttribute('aria-expanded','false');if(restore&&anchor?.isConnected)anchor.focus();}
 function place(element,anchor){
  if(!anchor.isConnected){close();return;}
  const rect=anchor.getBoundingClientRect(),width=Math.min(element.offsetWidth,innerWidth-24),height=Math.min(element.scrollHeight,innerHeight-24);
  element.style.left=Math.max(12,Math.min(rect.right-width,innerWidth-width-12))+'px';
  element.style.top=Math.max(12,rect.bottom+8+height>innerHeight-12&&rect.top>height?rect.top-height-8:Math.min(rect.bottom+8,innerHeight-height-12))+'px';
 }
 function open(element,anchor,{focus=true}={}){
  if(active?.element===element){close(true);return;}close();
  active={element,anchor};element.hidden=false;anchor.setAttribute('aria-expanded','true');
  if(element.showPopover)element.showPopover();else element.dataset.open='true';
  place(element,anchor);
  if(focus)(element.querySelector('[aria-pressed="true"]')||element.querySelector('input:checked')||element.querySelector('[role="menuitem"], button, input')||element).focus();
  element.ontoggle=event=>{if(event.newState==='closed'&&!element.matches(':popover-open')&&active?.element===element){active=null;element.hidden=true;anchor.setAttribute('aria-expanded','false');}};
 }
 document.addEventListener('keydown',event=>{
  if(!active)return;const {element,anchor}=active;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close(true);return;}
  if(event.key==='Tab'&&element.contains(document.activeElement)){const items=Array.from(element.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [role="menuitem"]')).filter(item=>!item.hidden&&item.getClientRects().length);const boundary=event.shiftKey?document.activeElement===items[0]:document.activeElement===items.at(-1);if(element.getAttribute('role')==='menu'||boundary){close();anchor.focus();}return;}
  if(element.getAttribute('role')!=='menu'||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  const items=Array.from(element.querySelectorAll('[role="menuitem"]:not([disabled])'));if(!items.length)return;event.preventDefault();
  const index=items.indexOf(document.activeElement);items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:items.length-1))%items.length].focus();
 },true);
 global.addEventListener('resize',()=>close(true));global.addEventListener('scroll',event=>{if(active&&!active.element.contains(event.target))place(active.element,active.anchor);},true);
 document.addEventListener('click',event=>{if(active&&!active.element.contains(event.target)&&!active.anchor.contains(event.target))close();});
 function dialog(id,title,description=''){
  const escape=global.escHTML;
  document.body.insertAdjacentHTML('beforeend',`<div id="${id}" class="scrim" hidden aria-hidden="true"><section class="modal admin-dialog" role="dialog" aria-modal="true" aria-labelledby="${id}-title" aria-describedby="${id}-description" tabindex="-1"><header class="modal__head"><div><h2 class="modal__title" id="${id}-title">${escape(title)}</h2><p class="modal__desc" id="${id}-description">${escape(description)}</p></div><button class="btn btn--ghost btn--icon modal-close-btn" type="button" data-dialog-close="${id}" aria-label="Cerrar diálogo">${global.icon('x')}</button></header><div class="modal__body" id="${id}-body"></div></section></div>`);
  const scrim=document.getElementById(id);scrim.addEventListener('click',event=>{if(event.target===scrim||event.target.closest('[data-dialog-close]'))global.cerrarModalAccesible(scrim);});return scrim;
 }
 function openDialog(id,focus){close();global.abrirModalAccesible(document.getElementById(id),focus);}
 function enhanceSelects(root=document){root.querySelectorAll('select.select').forEach(select=>{if(select.parentElement.classList.contains('ui-select'))return;const wrapper=document.createElement('div');wrapper.className='ui-select';select.before(wrapper);wrapper.appendChild(select);wrapper.insertAdjacentHTML('beforeend',global.icon('chevron-down'));});}
 global.OFEUI=Object.freeze({openPopover:open,closePopover:close,dialog,openDialog,enhanceSelects});
})(window);
