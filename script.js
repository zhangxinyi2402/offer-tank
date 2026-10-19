'use strict';
const $=id=>document.getElementById(id),faults=OFFER_CONTENT.faults,views=['cover','driver','scout','fire','review'];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let repairOperation=null;
let viewState='cover',progressState,mission,overlay=null,epoch=0,timers=new Set();
function defer(fn,ms){const version=epoch,id=setTimeout(()=>{timers.delete(id);if(version===epoch)fn();},ms);timers.add(id);}
function requirements(i){return [...faults[i].quick,...faults[i].long];}
function unlocked(view){return view==='cover'||view==='driver'&&mission.begun||view==='scout'&&progressState.driverCompleted===4||view==='fire'&&progressState.scoutCompleted===4||view==='review'&&progressState.reviewUnlocked;}
function lockedCopy(view){return{driver:'请先启动任务。',scout:'请先完成四项系统维修。',fire:'请先完成四项侦察验证。',review:'请先完成真实验证。'}[view];}
function notice(copy){$('notice-copy').textContent=copy;$('notice').hidden=false;}
function navigate(view){
 if(!views.includes(view))return;
 if(overlay){notice('请先关闭当前面板，再切换视角。');return;}
 if(!unlocked(view)){notice(lockedCopy(view));return;}
 viewState=view;$('notice').hidden=true;
 render();if(view==='scout'&&mission.scan==='idle')openScoutIntro();
}
const SCOUT_TESTS=[
 {name:'目标锁定测试',description:'是否真正锁定目标，而不是泛泛瞄准。',x:60,y:35,w:12,h:18},
 {name:'火力输出测试',description:'是否真正打出结果，而不是只有动作没有命中。',x:39,y:30,w:17,h:20},
 {name:'装甲承压测试',description:'是否经得住追问冲击，防御链是否稳固。',x:35,y:60,w:24,h:23},
 {name:'观测精度测试',description:'参数、边界、口径是否足够清楚。',x:32,y:16,w:13,h:18}
];
function openScoutIntro(){
 if(viewState!=='scout'||overlay||mission.scan!=='idle')return;
 const copy=element('p','准备通过观察镜对目标进行校验。','scout-intro-copy');copy.id='scout-intro-copy';
 const button=element('button','开始校验','primary');button.id='scout-start';button.addEventListener('click',()=>{if(mission.scan==='idle')startScoutScan();else if(mission.scan==='done')closePanel();});
 openPanel('scout-intro','观察系统 · 等待指令','侦察已就位',[copy,element('p','个人贡献 · 验证证据 · 结果归因 · 缺口可补性','intro-dimensions'),button]);
}
function startScoutScan(){
 if(viewState!=='scout'||overlay?.kind!=='scout-intro'||mission.scan!=='idle')return;
 mission.scan='running';mission.scanStarted=Date.now();mission.scanCount++;render();
 defer(()=>{mission.scan='done';render();},reduced.matches?100:1900);
}
function updateScoutIntro(){
 const state=mission.scan;
 $('panel-title').textContent=state==='idle'?'侦察已就位':state==='running'?'目标识别中':'目标已锁定';
 $('scout-intro-copy').textContent=state==='idle'?'准备通过观察镜对目标进行校验。':state==='running'?'正在完成一次测距与部件识别。此提示不会自动关闭。':'观察镜已完成初始扫描。请手动进入第一项承压校验。';
 $('scout-start').disabled=state==='running';$('scout-start').textContent=state==='idle'?'开始校验':state==='running'?'识别进行中…':'进入校验 →';
}

function begin(){mission.begun=true;navigate('driver');}
function render(){
 $('app').dataset.view=viewState;$('app').dataset.fire=mission.firePhase;
 views.forEach(v=>{$('view-'+v).hidden=v!==viewState;});
 const titles={cover:['任务简报','同一辆坦克，三种观察位置。'],driver:['01 / 驾驶舱 · 求职者视角','从驾驶舱内，修复自己的证据链。'],scout:['02 / 观察镜 · 面试官视角','锁定目标，校验证据能否承压。'],fire:['03 / 全景 · 真实验证','准备完成，进入真实验证。'],review:['04 / 战后复盘','把这次验证，带进下一轮。']};
 $('view-eyebrow').textContent=titles[viewState][0];$('view-heading').textContent=titles[viewState][1];$('footer-state').textContent=('0'+views.indexOf(viewState))+' / '+({cover:'任务封面',driver:'驾驶舱',scout:'侦察验证',fire:'真实验证',review:'战后复盘'})[viewState];
 $('navigation').querySelectorAll('button').forEach(button=>{const v=button.dataset.view,done=v==='cover'?mission.begun:v==='driver'?progressState.driverCompleted===4:v==='scout'?progressState.scoutCompleted===4:v==='fire'?progressState.fireCompleted:mission.reviewVisited;
 button.classList.toggle('current',v===viewState);button.classList.toggle('locked',!unlocked(v));button.classList.toggle('done',done);button.setAttribute('aria-disabled',String(!unlocked(v)));button.setAttribute('aria-current',v===viewState?'page':'false');$('mark-'+v).textContent=done?'✓':!unlocked(v)?'⌑':'';});
 $('driver-progress').textContent=progressState.driverCompleted+' / 4 '+'已修复';$('scout-progress').textContent=progressState.scoutCompleted+' / 4 '+'已验证';
 faults.forEach((fault,i)=>{
 const b=$('diagnostic-'+i),complete=i<progressState.driverCompleted||i===progressState.driverCompleted&&requirements(i).every(id=>mission.applied[i].has(id)),active=i===progressState.driverCompleted&&!mission.sweeping&&!complete;
 b.className='diagnostic'+(complete?' complete':'')+(mission.sweeping===i+1?' sweeping':'')+(overlay?.kind==='repair'&&overlay.index===i?' inspecting':active&&!overlay?' pending':'');
 b.disabled=!active||!!overlay;b.setAttribute('aria-label',`Fault 0${i+1} ${fault.name} ${complete?'已完成':active?'待维修':'未激活'}`);b.querySelector('.instrument-state').textContent=complete?'修复完成 ✓':mission.sweeping===i+1?'系统校准中':overlay?.kind==='repair'&&overlay.index===i?'系统诊断中':active?'当前系统告警':'待激活';
 const v=$('verify-'+i),verified=i<progressState.scoutCompleted,current=i===progressState.scoutCompleted&&mission.scan==='done',inspecting=overlay?.kind==='verify'&&overlay.index===i;v.className='verify-point'+(verified?' verified':'')+(current&&!overlay?' active':'')+(inspecting?' inspecting':'');v.disabled=!current||!!overlay;v.querySelector('.test-number').textContent='0'+(i+1);v.querySelector('.test-name').textContent=SCOUT_TESTS[i].name;v.querySelector('.test-status').textContent=verified?'✓ 校验通过':inspecting?'正在校验':current?'点击锁定校验':'等待校验';v.setAttribute('aria-label',SCOUT_TESTS[i].name+' '+fault.name+(verified?' 已通过':current?' 待校验':''));
 });
 $('driver-ready').hidden=progressState.driverCompleted!==4;$('driver-status').textContent=progressState.driverCompleted===4?'系统已恢复':`诊断 ${Math.min(4,progressState.driverCompleted+1)} / 4 · 按顺序维修`;
 $('scan-beam').hidden=mission.scan!=='running';if(mission.scan==='running')$('scan-beam').style.animationDelay=-Math.max(0,Date.now()-mission.scanStarted)+'ms';$('scan-hud').hidden=true;$('scout-status').textContent=mission.scan==='running'?'初始测距与目标识别中':progressState.scoutCompleted===4?'四项测试已通过':mission.scan==='done'?'当前任务：'+SCOUT_TESTS[progressState.scoutCompleted].name:'等待手动启动';
 $('recon-entry').disabled=mission.scan==='running'||mission.scan==='done'&&progressState.scoutCompleted<4;$('recon-entry').textContent=mission.scan==='idle'?'开始校验':mission.scan==='running'?'扫描进行中':progressState.scoutCompleted===4?'查看校验结果':'校验系统在线';
 if(overlay?.kind==='scout-intro')updateScoutIntro();
 $('scout-ready').hidden=progressState.scoutCompleted!==4;$('core').disabled=!!overlay;
 const ready=unlocked('fire')&&mission.firePhase==='idle';$('fire').disabled=!ready||!!overlay;$('fire').classList.toggle('ready',ready);$('fire').textContent=progressState.fireCompleted?'验证完成 ✓':mission.firePhase!=='idle'?'正在执行验证…':'进入真实验证 →';
 $('victory').hidden=!progressState.fireCompleted;$('to-review').disabled=!mission.reportReady;
 if(viewState==='review'){mission.reviewVisited=true;$('mark-review').textContent='✓';}
}
function element(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function openPanel(kind,code,title,nodes,index=null){if(overlay)return;overlay={kind,index,focus:document.activeElement};$('panel').dataset.mode=kind;$('panel-code').textContent=code;$('panel-title').textContent=title;$('panel-body').replaceChildren(...nodes);$('panel-layer').hidden=false;render();$('close-panel').focus({preventScroll:true});}
function currentRepairOperation(i){return repairOperation&&repairOperation.epoch===epoch&&repairOperation.index===i&&!repairOperation.cancelled?repairOperation:null;}
function openRepair(index){
 if(viewState!=='driver'||overlay||index!==progressState.driverCompleted||mission.sweeping)return;
 const fault=faults[index],diagnosis=element('div',null,'diagnosis');
 ['表征症状','原因定位'].forEach((title,i)=>{const box=element('section');box.append(element('h3',title),element('p',fault.driver[i]));diagnosis.append(box);});
 const columns=element('div',null,'repair-columns');
 [['短期修复',fault.driver[2],fault.quick],['长期升级',fault.driver[3],fault.long]].forEach(([title,copy,ids])=>{const section=element('section'),list=element('div',null,'component-list');list.setAttribute('role','list');section.append(element('h3',title),element('p',copy));ids.forEach(id=>{const item=element('div',null,'component'),status=element('small'),label=element('strong',OFFER_CONTENT.components[id].name);item.dataset.module=id;item.setAttribute('role','listitem');item.title=[OFFER_CONTENT.components[id].summary,...OFFER_CONTENT.components[id].details].filter(Boolean).join(' · ');item.append(status,label);list.append(item);});section.append(list);columns.append(section);});
 const layout=element('div',null,'hud-repair-layout'),meter=element('div',null,'hud-repair-meter');meter.id='repair-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','系统维修进度');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');
 const ring=element('div',null,'hud-repair-ring'),percent=element('strong');percent.id='repair-percentage';const gaugeLabel=element('span');gaugeLabel.id='repair-gauge-label';ring.append(percent,gaugeLabel);meter.append(element('small','系统维修进度'),ring,element('span','证据链 · 自动装配','meter-caption'));
 const info=element('div',null,'hud-repair-information');info.append(diagnosis,columns);layout.append(meter,info);
 const status=element('div',null,'repair-feedback');status.id='repair-feedback';const button=element('button','一键修复','primary repair-all');button.id='repair-all';button.addEventListener('click',()=>repairAll(index));
 openPanel('repair',`系统维修终端 / 故障 0${index+1}`,fault.name,[layout,status,button,element('p','自动依次装配全部修复项；完成后请手动关闭终端继续。','footnote')],index);updateModules();
}
function updateModules(){
 if(overlay?.kind!=='repair')return;const i=overlay.index,req=requirements(i),done=req.every(id=>mission.applied[i].has(id)),operation=currentRepairOperation(i),running=!!operation&&!operation.done,percent=Math.round(mission.applied[i].size/req.length*100);
 document.querySelectorAll('[data-module]').forEach(item=>{const installed=mission.applied[i].has(item.dataset.module);item.classList.toggle('installed',installed);item.setAttribute('aria-label',OFFER_CONTENT.components[item.dataset.module].name+(installed?' 已装配':' 等待装配'));item.querySelector('small').textContent=installed?'✓ 已装配':'□ 等待装配';});
 $('repair-feedback').textContent=done?'修复完成 ✓':running?`自动装配中 · ${mission.applied[i].size} / ${req.length}`:`待装配 ${req.length-mission.applied[i].size} 项组件`;$('repair-feedback').classList.toggle('complete',done);
 $('repair-percentage').textContent=percent+'%';$('repair-meter').style.setProperty('--repair-progress',percent+'%');$('repair-meter').setAttribute('aria-valuenow',String(percent));$('repair-meter').classList.toggle('complete',done);$('repair-gauge-label').textContent=done?'修复完成':running?'自动装配中':'等待维修指令';
 $('repair-all').disabled=running||done;$('repair-all').textContent=done?'修复完成 ✓':running?'系统修复中…':'一键修复';
}
function install(i,id){if(overlay?.kind!=='repair'||overlay.index!==i||i!==progressState.driverCompleted||!requirements(i).includes(id))return;mission.applied[i].add(id);updateModules();}
function repairAll(i){
 if(overlay?.kind!=='repair'||overlay.index!==i||i!==progressState.driverCompleted||currentRepairOperation(i)&&!currentRepairOperation(i).done)return;
 const remaining=requirements(i).filter(id=>!mission.applied[i].has(id));if(!remaining.length)return;
 const operation={index:i,epoch,done:false,goldDone:false,cancelled:false,awaitingClose:false};repairOperation=operation;updateModules();
 remaining.forEach((id,step)=>defer(()=>{
  if(repairOperation!==operation||operation.cancelled||operation.epoch!==epoch)return;
  if(overlay?.kind!=='repair'||overlay.index!==i){operation.cancelled=true;return;}
  install(i,id);
  if(step===remaining.length-1){operation.done=true;mission.sweeping=i+1;mission.sweepCount[i]++;updateModules();render();defer(()=>{if(repairOperation!==operation||operation.cancelled||operation.epoch!==epoch)return;mission.sweeping=0;operation.goldDone=true;if(operation.awaitingClose)progressState.driverCompleted=i+1;render();},reduced.matches?50:700);}
 },(step+1)*(reduced.matches?70:420)));
}

function openVerify(i){if(viewState!=='scout'||overlay||mission.scan!=='done'||i!==progressState.scoutCompleted)return;const grid=element('dl',null,'verification');['观察到的表征','追问施压点','可接受证据','校验结论'].forEach((label,j)=>{const section=element('div');section.append(element('dt',label),element('dd',faults[i].scout[j]));grid.append(section);});openPanel('verify',`目标校验面板 / 测试 0${i+1}`,SCOUT_TESTS[i].name,[element('p',SCOUT_TESTS[i].description,'test-description'),grid,element('p','关闭本项面板后记录通过，再锁定下一项。','footnote')],i);}
function closePanel(){if(!overlay)return;const closing=overlay;overlay=null;$('panel-layer').hidden=true;
 if(closing.kind==='repair'){
  const i=closing.index,operation=currentRepairOperation(i);
  if(operation&&!operation.done)operation.cancelled=true;
  if(requirements(i).every(id=>mission.applied[i].has(id))){
   if(operation?.done){if(operation.goldDone)progressState.driverCompleted=i+1;else operation.awaitingClose=true;}
   else{mission.sweeping=i+1;mission.sweepCount[i]++;render();defer(()=>{mission.sweeping=0;progressState.driverCompleted=i+1;render();},reduced.matches?50:700);}
  }
 }else if(closing.kind==='verify')progressState.scoutCompleted=closing.index+1;
 render();if(closing.focus&&!closing.focus.disabled)closing.focus.focus?.({preventScroll:true});
}
function openCore(){if(viewState!=='scout')return;openPanel('core','侦察员辅助模块','校验准则',[element('p','证据不足，不代表能力不足。','core-principle'),element('p','核心火力有证据\n+\n非核心缺口可补\n=\n值得继续考察','formula'),element('p','流畅、热情、诚实都是加分项，\n但不能替代承压校验。','core-note')]);}
function preflight(){const nodes=OFFER_CONTENT.preflight.map((copy,i)=>{const label=element('label',null,'check-row'),input=element('input');input.type='checkbox';input.checked=mission.preflight[i];input.addEventListener('change',()=>{mission.preflight[i]=input.checked;});label.append(input,element('span',copy));return label;});openPanel('preflight','PRE-FLIGHT CHECK','进入真实验证前',nodes);}
function about(){openPanel('about','ABOUT / OFFER TANK','面试 = 能力证据交换',[element('p','这是一个基于“双向模拟面试复盘”的互动展示。'),element('p','核心方法：\n从求职者的“如何回答”，\n切换到面试官的“如何验证”，\n再将暴露出的 Gap 反哺下一轮求职准备。','about-copy')]);}
function fire(){if(viewState!=='fire'||!unlocked('fire')||mission.firePhase!=='idle'||overlay)return;mission.fireCount++;mission.firePhase='calibrating';render();defer(()=>{mission.firePhase='muzzle';render();$('shell-motion').beginElement?.();},1000);defer(()=>{mission.firePhase='flight';render();},1250);defer(()=>{mission.firePhase='impact';render();},1650);defer(()=>{mission.firePhase='complete';progressState.fireCompleted=true;progressState.reviewUnlocked=true;render();defer(()=>{mission.reportReady=true;render();},900);},3100);}
function reset(){epoch++;timers.forEach(clearTimeout);timers.clear();try{$('shell-motion').endElement?.();}catch{}viewState='cover';progressState={driverCompleted:0,scoutCompleted:0,fireCompleted:false,reviewUnlocked:false};mission={begun:false,applied:faults.map(()=>new Set()),sweeping:0,sweepCount:[0,0,0,0],scan:'idle',scanCount:0,firePhase:'idle',fireCount:0,reportReady:false,reviewVisited:false,preflight:[false,false,false]};overlay=null;$('panel-layer').hidden=true;$('notice').hidden=true;render();}
faults.forEach((f,i)=>{const b=element('button',null,'diagnostic');b.id='diagnostic-'+i;b.append(element('small','故障 0'+(i+1)),element('strong',f.name),element('span',null,'instrument-state'));b.addEventListener('click',()=>openRepair(i));$('diagnostic-buttons').append(b);const v=element('button',null,'verify-point');v.id='verify-'+i;v.style.left=SCOUT_TESTS[i].x+'%';v.style.top=SCOUT_TESTS[i].y+'%';v.style.width=SCOUT_TESTS[i].w+'%';v.style.height=SCOUT_TESTS[i].h+'%';v.append(element('small',null,'test-number'),element('strong',null,'test-name'),element('span',null,'test-status'));v.addEventListener('click',()=>openVerify(i));$('verify-points').append(v);});
$('recon-entry').addEventListener('click',()=>{if(progressState.scoutCompleted===4){$('scout-ready').removeAttribute('data-dismissed');}else if(mission.scan==='idle')openScoutIntro();});
$('dismiss-scout-ready').addEventListener('click',()=>{$('scout-ready').setAttribute('data-dismissed','true');});$('reset').addEventListener('click',()=>{$('scout-ready').removeAttribute('data-dismissed');});
$('navigation').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));$('brand').addEventListener('click',e=>{e.preventDefault();navigate('cover');});$('begin').addEventListener('click',begin);$('to-scout').addEventListener('click',()=>navigate('scout'));$('to-fire').addEventListener('click',()=>navigate('fire'));$('to-review').addEventListener('click',()=>navigate('review'));$('fire').addEventListener('click',fire);$('core').addEventListener('click',openCore);$('preflight').addEventListener('click',preflight);$('about').addEventListener('click',about);$('reset').addEventListener('click',reset);$('close-panel').addEventListener('click',closePanel);$('panel-scrim').addEventListener('click',closePanel);$('close-notice').addEventListener('click',()=>{$('notice').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!overlay)return;const controls=[...$('panel').querySelectorAll('button,input')].filter(el=>!el.disabled);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
reset();
