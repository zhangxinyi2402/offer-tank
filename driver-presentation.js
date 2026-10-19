// Visual-only exit animation. No mission state, guards or completion callbacks are modified.
(()=>{const layer=document.getElementById('panel-layer'),panel=document.getElementById('panel'),app=document.getElementById('app');let lastRect=null;
 const clean=()=>document.querySelectorAll('.terminal-retiring').forEach(el=>el.remove());
 const observer=new MutationObserver(()=>{
 if(!layer.hidden){if(panel.dataset.mode==='repair')requestAnimationFrame(()=>{lastRect=panel.getBoundingClientRect();});return;}
 if(panel.dataset.mode!=='repair'||app.dataset.view!=='driver'||!lastRect||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 clean();const ghost=panel.cloneNode(true);ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));ghost.querySelectorAll('button,input').forEach(el=>{el.disabled=true;});ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.classList.add('terminal-retiring');Object.assign(ghost.style,{position:'fixed',left:lastRect.left+'px',top:lastRect.top+'px',width:lastRect.width+'px',height:lastRect.height+'px',margin:'0',pointerEvents:'none',zIndex:'80'});document.body.append(ghost);ghost.addEventListener('animationend',()=>ghost.remove(),{once:true});setTimeout(()=>ghost.remove(),250);
 });observer.observe(layer,{attributes:true,attributeFilter:['hidden']});document.getElementById('reset').addEventListener('click',clean);
})();
