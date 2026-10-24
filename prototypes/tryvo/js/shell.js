/* Responsive left navigation. No gameplay or saved-state changes. */
(()=>{
 const toggle=document.querySelector('.sidebar-toggle'),panel=document.querySelector('.sidebar-panel'),scrim=document.querySelector('.sidebar-scrim'),mobile=matchMedia('(max-width:760px)');
 function setOpen(open,restore=false){
  document.body.classList.toggle('sidebar-open',open);toggle.setAttribute('aria-expanded',String(open));scrim.hidden=!open;
  panel.inert=mobile.matches&&!open;
  if(open)(panel.querySelector('[aria-current=page]')||panel.querySelector('a'))?.focus();
  else if(restore)toggle.focus();
 }
 toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
 scrim.addEventListener('click',()=>setOpen(false,true));
 panel.addEventListener('click',e=>{if(mobile.matches&&e.target.closest('a,button'))setOpen(false);});
 window.addEventListener('hashchange',()=>setOpen(false));
 document.addEventListener('keydown',e=>{
  if(!mobile.matches||!document.body.classList.contains('sidebar-open'))return;
  if(e.key==='Escape'){e.preventDefault();setOpen(false,true);}
  if(e.key==='Tab'){
   const items=[toggle,...panel.querySelectorAll('a,button')],first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 mobile.addEventListener('change',()=>setOpen(false));setOpen(false);
})();
