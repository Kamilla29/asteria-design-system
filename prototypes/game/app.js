function flatten(node, prefix = [], out = {}) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return out;
  for (const [key, value] of Object.entries(node)) {
    const path = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value) && !('hex' in value) && !('value' in value && 'unit' in value) && !('fontFamily' in value && 'fontSize' in value)) flatten(value, path, out);
    else out[path.join('.')] = value;
  }
  return out;
}
function serialize(value){
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('hex' in value) return value.hex;
    if ('value' in value && 'unit' in value) return `${value.value}${value.unit}`;
    if ('fontFamily' in value && 'fontSize' in value) return `${value.fontWeight} ${serialize(value.fontSize)}/${value.lineHeight} ${value.fontFamily.join(',')}`;
  }
  if (Array.isArray(value)) return value.length === 4 && value.every(v => typeof v === 'number') ? `cubic-bezier(${value.join(',')})` : value.join(',');
  return String(value);
}

const items = {
  solar:{name:'Solar Prism',rarity:'RARE RELIC',art:'r1',description:'Amplifies celestial resonance after a perfect evade.',aLabel:'Resonance',a:'+18%',bLabel:'Cooldown',b:'12s'},
  echo:{name:'Echo Lens',rarity:'UNCOMMON RELIC',art:'r2',description:'Reveals unstable signal traces near archive fragments.',aLabel:'Scan range',a:'+24%',bLabel:'Charge',b:'8s'},
  void:{name:'Void Key',rarity:'RARE RELIC',art:'r3',description:'Temporarily stabilizes sealed routes between observatory nodes.',aLabel:'Stability',a:'+31%',bLabel:'Charges',b:'3'},
  thread:{name:'Star Thread',rarity:'COMMON RELIC',art:'r4',description:'Links navigation markers and shortens return-route recalculation.',aLabel:'Route speed',a:'+9%',bLabel:'Duration',b:'45s'},
  sigil:{name:'North Sigil',rarity:'EPIC RELIC',art:'r5',description:'Marks a safe vector through northern magnetic storms.',aLabel:'Protection',a:'+26%',bLabel:'Cooldown',b:'20s'}
};
const quests = {
  meridian:{type:'MAIN QUEST',name:'The Glass Meridian',description:'The unstable route has opened beyond the northern observatory. Calibrate the gate before the current cycle ends.',label:'Gate calibration',progress:72,objectives:['✓ Synchronize three beacons','○ Reach the observatory core'],hud:'Observatory Gate',distance:'340 m · Reach the core'},
  signals:{type:'SIDE QUEST',name:'Lost Signals',description:'Three archive fragments stopped transmitting after the last magnetic surge.',label:'Fragments recovered',progress:33,objectives:['✓ Locate the first fragment','○ Recover two remaining fragments'],hud:'Lost Signals',distance:'2 fragments remaining'},
  bloom:{type:'SIDE QUEST',name:'Prismatic Bloom',description:'Iona has detected an unusual bloom near the eastern calibration field.',label:'Investigation',progress:10,objectives:['○ Speak with Iona','○ Inspect the eastern field'],hud:'Prismatic Bloom',distance:'Speak with Iona'}
};

async function init(){
  const i18n = await AsteriaI18n.init();
  const tr = (source, vars={}) => i18n.t(source, vars);

  const response = await fetch('../../dist/game/tokens.json');
  const tokens = flatten(await response.json());
  for (const [path,value] of Object.entries(tokens)) document.documentElement.style.setProperty(`--${path.replaceAll('.','-')}`,serialize(value));
  document.getElementById('loading').hidden = true;
  document.getElementById('game').hidden = false;

  const views = [...document.querySelectorAll('.view')];
  const viewButtons = [...document.querySelectorAll('[data-view]')];
  let currentView = 'menu';
  let selectedItem = 'solar';
  let equippedItem = null;
  let selectedQuest = 'meridian';
  let interfaceScale = 100;
  let controllerVibrationEnabled = true;
  let highContrastEnabled = false;
  let dialogStage = 'default';
  let beaconCalibrated = false;
  let hudObjective = 'Observatory Gate';
  let hudDistance = '340 m · Reach the core';

  function show(name, {push=true} = {}){
    if (!document.getElementById(`view-${name}`)) name = 'menu';
    currentView = name;
    views.forEach(v=>v.hidden=v.id!==`view-${name}`);
    viewButtons.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    document.body.classList.toggle('in-game', name !== 'menu');
    if (push) history.replaceState(null,'',`?view=${name}`);
    const first = document.querySelector(`#view-${name} button:not([disabled])`);
    if (first) requestAnimationFrame(()=>first.focus({preventScroll:true}));
  }

  function renderHud(){
    document.getElementById('hud-objective').textContent=tr(hudObjective);
    document.getElementById('hud-distance').textContent=tr(hudDistance);
  }

  function renderCalibration(){
    const stability=document.getElementById('signal-stability');
    const prompt=document.getElementById('calibrate-beacon');
    const label=document.getElementById('calibrate-label');
    if(!stability || !prompt || !label) return;
    stability.textContent=tr(beaconCalibrated?'Signal stability 100%':'Signal stability 72%');
    label.textContent=tr(beaconCalibrated?'✓ Beacon calibrated':'Calibrate navigation beacon');
    prompt.classList.toggle('complete',beaconCalibrated);
    prompt.disabled=beaconCalibrated;
    prompt.setAttribute('aria-disabled',String(beaconCalibrated));
  }

  function calibrateBeacon(){
    if(beaconCalibrated) return;
    beaconCalibrated=true;
    hudObjective='Observatory Core';
    hudDistance='Route stabilized · proceed to core';
    renderCalibration();
    renderHud();
    rumble(140, 0.32, 0.72);
    toast('Calibration complete');
  }

  document.getElementById('calibrate-beacon').addEventListener('click',calibrateBeacon);

  function resetDemoState(){
    beaconCalibrated=false;
    hudObjective='Observatory Gate';
    hudDistance='340 m · Reach the core';
    selectedItem='solar';
    equippedItem=null;
    selectedQuest='meridian';
    interfaceScale=100;
    controllerVibrationEnabled=true;
    highContrastEnabled=false;
    dialogStage='default';
    const vibration=document.getElementById('vibration-toggle');
    const contrast=document.getElementById('contrast-toggle');
    vibration.classList.add('on'); vibration.setAttribute('aria-pressed','true');
    contrast.classList.remove('on'); contrast.setAttribute('aria-pressed','false');
    document.body.classList.remove('vibration-off','high-contrast');
    document.querySelectorAll('[data-item]').forEach(b=>b.classList.remove('equipped'));
    renderItem(selectedItem);
    renderQuest(selectedQuest);
    renderHud();
    renderCalibration();
    updateScale();
    setDialog('default');
    toast('Demo state reset');
  }
  document.getElementById('reset-demo').addEventListener('click',resetDemoState);

  viewButtons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));

  document.querySelectorAll('[data-load-profile]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-load-profile]').forEach(b=>b.classList.toggle('selected', b===button));
    const profile = button.dataset.loadProfile;
    if (profile === '3') show('new');
    else { show('gameplay'); toast(profile === '1' ? 'Glass Meridian loaded' : 'Verdant Reach loaded'); }
  }));

  document.getElementById('start-new').addEventListener('click',()=>{
    hudObjective='First Calibration';
    hudDistance='120 m · Reach the first beacon';
    renderHud();
    show('gameplay'); toast('New expedition started');
  });

  function renderItem(key){
    const item = items[key];
    if (!item) return;
    selectedItem = key;
    document.querySelectorAll('[data-item]').forEach(b=>b.classList.toggle('selected', b.dataset.item===key));
    document.getElementById('item-rarity').textContent=tr(item.rarity);
    document.getElementById('item-name').textContent=tr(item.name);
    document.getElementById('item-description').textContent=tr(item.description);
    document.getElementById('item-stat-a-label').textContent=tr(item.aLabel);
    document.getElementById('item-stat-a').textContent=item.a;
    document.getElementById('item-stat-b-label').textContent=tr(item.bLabel);
    document.getElementById('item-stat-b').textContent=item.b;
    const art=document.getElementById('item-art'); art.className=`big-relic ${item.art}`;
    document.getElementById('equip-button').textContent=tr(equippedItem===key?'Equipped':'Equip');
  }
  document.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>renderItem(b.dataset.item)));
  document.getElementById('equip-button').addEventListener('click',()=>{
    equippedItem=selectedItem;
    rumble(90, 0.20, 0.48);
    renderItem(selectedItem);
    document.querySelectorAll('[data-item]').forEach(b=>b.classList.toggle('equipped',b.dataset.item===selectedItem));
    toast('{name} equipped',{name:tr(items[selectedItem].name)});
  });

  function renderQuest(key){
    const q=quests[key]; if(!q)return; selectedQuest=key;
    document.querySelectorAll('[data-quest]').forEach(b=>b.classList.toggle('active',b.dataset.quest===key));
    document.getElementById('quest-type').textContent=tr(q.type);
    document.getElementById('quest-name').textContent=tr(q.name);
    document.getElementById('quest-description').textContent=tr(q.description);
    document.getElementById('quest-progress-label').textContent=tr(q.label);
    document.getElementById('quest-progress-value').textContent=`${q.progress}%`;
    document.getElementById('quest-progress-bar').style.width=`${q.progress}%`;
    document.getElementById('quest-objectives').innerHTML=q.objectives.map((o,i)=>`<span class="${i===0&&o.startsWith('✓')?'done':''}">${tr(o)}</span>`).join('');
  }
  document.querySelectorAll('[data-quest]').forEach(b=>b.addEventListener('click',()=>renderQuest(b.dataset.quest)));
  document.getElementById('track-quest').addEventListener('click',()=>{
    const q=quests[selectedQuest];
    hudObjective=q.hud; hudDistance=q.distance; renderHud();
    rumble(70, 0.16, 0.34);
    toast('{name} tracked',{name:tr(q.name)});
    show('gameplay');
  });

  const dialogLine=document.getElementById('dialog-line');
  const dialogActions=document.getElementById('dialog-actions');
  function setDialog(stage){
    dialogStage=stage;
    if(stage==='prism'){
      dialogLine.textContent=tr('“The prism reacts to unstable routes before our instruments do. Red means the gate is already collapsing.”');
      dialogActions.innerHTML=`<button class="action selected" data-dialog-choice="thanks">${tr('Understood')}</button><button class="action ghost" data-dialog-choice="route">${tr('Ask about the route')}</button>`;
    } else if(stage==='route'){
      dialogLine.textContent=tr('“Follow the northern markers. If the HUD loses the objective signal, return to the last beacon.”');
      dialogActions.innerHTML=`<button class="action selected" data-dialog-choice="thanks">${tr('End conversation')}</button>`;
    } else if(stage==='thanks'){
      dialogStage='default'; show('gameplay'); toast('Conversation ended'); return;
    } else {
      dialogStage='default';
      dialogLine.textContent=tr('“The route is stable for now. If the prism starts pulsing red, do not cross the gate.”');
      dialogActions.innerHTML=`<button class="action selected" data-dialog-choice="prism">${tr('Ask about the prism')}</button><button class="action ghost" data-dialog-choice="continue">${tr('Continue')}</button>`;
    }
    bindDialogChoices();
  }
  function bindDialogChoices(){dialogActions.querySelectorAll('[data-dialog-choice]').forEach(b=>b.addEventListener('click',()=>setDialog(b.dataset.dialogChoice==='continue'?'route':b.dataset.dialogChoice)))}
  bindDialogChoices();

  function updateScale(){
    const factor=interfaceScale/100;
    document.getElementById('scale-value').textContent=`${interfaceScale}%`;
    document.documentElement.style.setProperty('--runtime-interface-scale',String(factor));
  }
  function setScale(next){
    interfaceScale=Math.max(90,Math.min(110,next));
    updateScale();
    toast('HUD scale {value}%',{value:interfaceScale});
  }
  document.getElementById('scale-down').addEventListener('click',()=>setScale(interfaceScale-10));
  document.getElementById('scale-up').addEventListener('click',()=>setScale(interfaceScale+10));

  function getRumbleActuator(){
    const pads=navigator.getGamepads?.() || [];
    for(const pad of pads){
      if(!pad?.connected) continue;
      if(pad.vibrationActuator?.playEffect) return {type:'dual',actuator:pad.vibrationActuator};
      const legacy=pad.hapticActuators?.[0];
      if(legacy?.pulse) return {type:'pulse',actuator:legacy};
    }
    return null;
  }
  function rumble(duration=100,weak=0.25,strong=0.55){
    if(!controllerVibrationEnabled) return false;
    const found=getRumbleActuator();
    if(!found) return false;
    try{
      if(found.type==='dual') found.actuator.playEffect('dual-rumble',{duration,startDelay:0,weakMagnitude:weak,strongMagnitude:strong});
      else found.actuator.pulse(Math.max(weak,strong),duration);
      return true;
    }catch(error){ console.warn('Gamepad vibration unavailable:',error); return false; }
  }
  const vibration=document.getElementById('vibration-toggle');
  vibration.addEventListener('click',()=>{
    controllerVibrationEnabled=!controllerVibrationEnabled;
    vibration.classList.toggle('on',controllerVibrationEnabled);
    vibration.setAttribute('aria-pressed',String(controllerVibrationEnabled));
    document.body.classList.toggle('vibration-off',!controllerVibrationEnabled);
    if(controllerVibrationEnabled){
      const supported=rumble(130,0.28,0.62);
      toast(supported?'Controller vibration ON':'Controller vibration ON · connect a supported gamepad to feel haptics');
    }else toast('Controller vibration OFF');
  });

  const contrast=document.getElementById('contrast-toggle');
  contrast.addEventListener('click',()=>{
    highContrastEnabled=!highContrastEnabled;
    contrast.classList.toggle('on',highContrastEnabled);
    contrast.setAttribute('aria-pressed',String(highContrastEnabled));
    document.body.classList.toggle('high-contrast',highContrastEnabled);
    toast(highContrastEnabled?'High contrast indicators ON':'High contrast indicators OFF');
  });

  function toast(message, vars={}){
    const el=document.getElementById('toast'); if(!el)return;
    el.textContent=tr(message,vars); el.hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.hidden=true,1800);
  }

  function refreshLocalizedState(){
    renderItem(selectedItem);
    renderQuest(selectedQuest);
    renderHud();
    renderCalibration();
    setDialog(dialogStage);
  }
  addEventListener('asteria:localechange', refreshLocalizedState);

  const traceAction = document.getElementById('trace-action-demo');
  if (traceAction) traceAction.addEventListener('click',()=>{
    traceAction.textContent=tr('Action activated');
    clearTimeout(traceAction.resetTimer);
    traceAction.resetTimer=setTimeout(()=>traceAction.textContent=tr('Primary action'),900);
  });
  document.querySelectorAll('[data-trace-slot]').forEach(slot=>slot.addEventListener('click',()=>{
    document.querySelectorAll('[data-trace-slot]').forEach(other=>other.classList.toggle('selected',other===slot));
  }));

  addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(currentView==='menu') return;
      show(currentView==='gameplay'?'menu':'gameplay');
    }
    if(currentView==='gameplay' && event.key.toLowerCase()==='i'){event.preventDefault();show('inventory')}
    if(currentView==='gameplay' && event.key.toLowerCase()==='q'){event.preventDefault();show('quests')}
    if(currentView==='gameplay' && event.key.toLowerCase()==='f'){event.preventDefault();show('dialog')}
    if(currentView==='gameplay' && !beaconCalibrated && event.key.toLowerCase()==='e'){event.preventDefault();calibrateBeacon()}
  });

  const params = new URLSearchParams(location.search);
  renderItem(selectedItem); renderQuest(selectedQuest); renderHud(); renderCalibration(); updateScale(); setDialog('default');
  show(params.get('view') || 'menu', {push:false});
}
init().catch(err=>{document.getElementById('loading').textContent=`Token loading failed: ${err.message}`;console.error(err)});
