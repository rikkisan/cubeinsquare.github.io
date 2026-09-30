(() => {
  'use strict';
  const tool = location.pathname.split('/').filter(Boolean).filter(p => !['ru','fr','de'].includes(p))[0];
  const supported = ['custom-item-builder','item-model-builder','book-letter-builder','dialogue-builder','bossbar-builder','advancement-builder','custom-potions','custom-villager-trades','datapack-generator','recipe-generator','loot-table-generator'];
  if (!supported.includes(tool)) return;
  const unitLabels = { en:['Branch','Page','Line','Effect','Trade','Text part'], ru:['Ветка','Страница','Реплика','Эффект','Сделка','Фрагмент текста'], fr:['Branche','Page','Réplique','Effet','Échange','Fragment de texte'], de:['Zweig','Seite','Zeile','Effekt','Handel','Textteil'] }[document.documentElement.lang.slice(0,2)];
  const text = {
    en: {form:'Form', nodes:'Nodes', title:'Node editor', hint:'Edit the nodes to update your result. Drag headers to move nodes; drag the background to pan. Connections show how settings and entries build the result.', actions:'Nodes, presets and export', fit:'Fit graph', arrange:'Arrange', zoomIn:'Zoom in', zoomOut:'Zoom out', result:'Result', settings:'Settings', move:'Move node', up:'Move earlier', down:'Move later', copy:'Copy result', copied:'Copied', empty:'No result yet', connection:'Connected to', zoom:'Zoom'},
    ru: {form:'Форма', nodes:'Ноды', title:'Нодовый редактор', hint:'Редактируйте ноды — результат обновится. Перетаскивайте заголовки для перемещения нод, фон — для движения по схеме. Связи показывают, как настройки и элементы формируют результат.', actions:'Ноды, примеры и экспорт', fit:'Вписать схему', arrange:'Упорядочить', zoomIn:'Приблизить', zoomOut:'Отдалить', result:'Результат', settings:'Настройки', move:'Переместить ноду', up:'Переместить раньше', down:'Переместить позже', copy:'Копировать результат', copied:'Скопировано', empty:'Результат пока пуст', connection:'Связь с', zoom:'Масштаб'},
    fr: {form:'Formulaire', nodes:'Nœuds', title:'Éditeur de nœuds', hint:'Modifiez les nœuds pour mettre à jour le résultat. Déplacez les nœuds par leur en-tête et la vue par le fond. Les liens montrent comment les paramètres et éléments composent le résultat.', actions:'Nœuds, exemples et export', fit:'Cadrer le graphe', arrange:'Organiser', zoomIn:'Agrandir', zoomOut:'Réduire', result:'Résultat', settings:'Paramètres', move:'Déplacer le nœud', up:'Déplacer avant', down:'Déplacer après', copy:'Copier le résultat', copied:'Copié', empty:'Aucun résultat', connection:'Lien vers', zoom:'Zoom'},
    de: {form:'Formular', nodes:'Knoten', title:'Knoteneditor', hint:'Bearbeite die Knoten, um das Ergebnis zu aktualisieren. Ziehe die Kopfzeilen zum Verschieben und den Hintergrund zum Schwenken. Verbindungen zeigen, wie Einstellungen und Einträge das Ergebnis bilden.', actions:'Knoten, Beispiele und Export', fit:'Graph einpassen', arrange:'Anordnen', zoomIn:'Vergrößern', zoomOut:'Verkleinern', result:'Ergebnis', settings:'Einstellungen', move:'Knoten verschieben', up:'Früher anordnen', down:'Später anordnen', copy:'Ergebnis kopieren', copied:'Kopiert', empty:'Noch kein Ergebnis', connection:'Verbunden mit', zoom:'Zoom'}
  }[document.documentElement.lang.slice(0,2)] || null;
  if (!text) return;
  const main = document.querySelector('main');
  const source = main && main.querySelector('.tool-layout, .item-builder-layout, .potion-layout');
  if (!source) return;
  const controls = 'input:not([type="hidden"]):not([type="file"]):not([type="submit"]):not([type="button"]), select, textarea';
  const groups = '.tool-panel, .trade-card, .effect-card, .blb-page-card, .dg-line-card, .imb-branch-card, .message-part, .item-version-group';
  const repeat = '.effect-card, .blb-page-card, .dg-line-card, .imb-branch-card, [data-trade-card], .message-part';
  const el = (tag, cls, content) => { const e=document.createElement(tag); if(cls) e.className=cls; if(content) e.textContent=content; return e; };
  const button = (label, action) => { const b=el('button','nv-button',label); b.type='button'; b.addEventListener('click',action); return b; };
  const shell=el('section','nv-editor');
  const modeBar=el('div','nv-modebar'); modeBar.setAttribute('role','tablist'); modeBar.setAttribute('aria-label',text.title);
  const form=button(text.form,()=>setMode(false)), nodes=button(text.nodes+' · Beta',()=>setMode(true));
  const view=el('div','nv-view'); view.id='constructor-nodes-view'; view.hidden=true;
  source.id=source.id || 'constructor-form-view';
  [form,nodes].forEach((b,i)=>{b.setAttribute('role','tab');b.id='nv-tab-'+i;b.setAttribute('aria-controls',i?view.id:source.id);});
  source.setAttribute('role','tabpanel');source.setAttribute('aria-labelledby',form.id);
  view.setAttribute('role','tabpanel');view.setAttribute('aria-labelledby',nodes.id);
  modeBar.append(form,nodes); shell.append(modeBar,view); source.before(shell);
  const hint=el('p','nv-hint',text.hint); view.append(hint);
  const tools=el('div','nv-toolbar'); view.append(tools);
  const actions=el('details','nv-actions'); actions.append(el('summary','',text.actions));
  const actionList=el('div','nv-action-list');actions.append(actionList);view.append(actions);
  const viewport=el('div','nv-viewport');viewport.tabIndex=0;viewport.setAttribute('aria-label',text.title);view.append(viewport);
  const world=el('div','nv-world');viewport.append(world);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('nv-wires');svg.setAttribute('aria-hidden','true');world.append(svg);
  const cards=el('div','nv-cards');world.append(cards);
  const live=el('p','nv-status');live.setAttribute('role','status');view.append(live);
  const storageKey='cube-nodes-layout:'+tool;
  let positions={};try {
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
    if(saved&&typeof saved==='object')Object.entries(saved).forEach(([key,p])=>{if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))positions[key]=p;});
  } catch (_) {}
  let opened=false, model=[], proxies=[], actionProxies=[], active=false, scheduled=false, scale=1, pan={x:24,y:24}, drag=null;
  const zoomText=el('span','nv-zoom');
  tools.append(button('−',()=>zoom(scale/1.2)),button('+',()=>zoom(scale*1.2)),zoomText,button(text.fit,fit),button(text.arrange,()=>{positions={};arrange();fit();save();}));
  tools.children[0].setAttribute('aria-label',text.zoomOut);tools.children[1].setAttribute('aria-label',text.zoomIn);
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(positions));}catch(_) {}}
  function shown(e){for(let a=e;a&&a!==source;a=a.parentElement){if(a.hidden||getComputedStyle(a).display==='none')return false;}return true;}
  function fieldLabel(field){
    const label=field.labels && field.labels[0] || field.closest('label') || field.closest('.tool-field');
    if(label){const clone=label.cloneNode(true);clone.querySelectorAll('input,select,textarea,button,small,.tool-field-hint').forEach(e=>e.remove());const str=clone.textContent.trim();if(str)return str;}
    return field.getAttribute('aria-label') || field.placeholder || field.closest(groups)?.querySelector('h2,h3')?.textContent || field.id || text.settings;
  }
  function collect(){
    const map=new Map();
    source.querySelectorAll(controls).forEach(f=>{
      if(f.readOnly||!shown(f))return;
      const group=f.closest(groups)||source;
      if(!map.has(group))map.set(group,[]);
      map.get(group).push(f);
    });
    return [...map].map(([group,fields],i)=>{
      const types=['.imb-branch-card','.blb-page-card','.dg-line-card','.effect-card','[data-trade-card]','.message-part'];
      const type=types.findIndex(t=>group.matches(t));
      const index=type<0?0:[...group.parentElement.children].filter(e=>e.matches(types[type])).indexOf(group)+1;
      return {source:group,fields,key:group.id||'group-'+i,title:type>=0?unitLabels[type]+' '+index:(group.querySelector('h2,h3,strong')?.textContent||text.settings).trim()};
    });
  }
  function refresh(){
    if(!active)return;
    const next=collect();
    const changed=next.length!==model.filter(n=>n.source).length||next.some((n,i)=>n.source!==model[i]?.source||n.fields.length!==model[i]?.fields.length||n.fields.some((f,j)=>f!==model[i]?.fields[j]));
    if(changed) build(next); else sync();
    refreshActions();draw();
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
  function build(next){
    const focused=proxies.find(p=>p.input===document.activeElement)?.original;
    model=next;proxies=[];cards.replaceChildren();
    model.forEach(n=>{
      const card=el('article','nv-node');card.dataset.nodeKey=n.key;n.card=card;
      const header=el('div','nv-node-header');const mover=button(n.title,()=>{});mover.className='nv-drag';mover.setAttribute('aria-label',text.move+': '+n.title);
      mover.addEventListener('pointerdown',e=>begin(e,n));
      mover.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const p=positions[n.key];p.x+=e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0;p.y+=e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0;place(n);draw();save();});
      header.append(el('span','nv-port'),mover,el('span','nv-port'));card.append(header);
      const body=el('div','nv-node-body');card.append(body);
      n.fields.forEach(original=>{
        const wrap=el('label','nv-field');wrap.append(el('span','',fieldLabel(original)));
        const input=original.cloneNode(true);input.removeAttribute('id');input.removeAttribute('name');input.removeAttribute('form');input.removeAttribute('style');input.className='nv-input';input.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
        for(const attr of [...input.attributes])if(attr.name.startsWith('on')||attr.name.startsWith('aria-labelledby')||attr.name.startsWith('aria-describedby'))input.removeAttribute(attr.name);
        input.value=original.value;input.checked=original.checked;input.disabled=original.disabled;input.dataset.sourceId=original.id||'';input.dataset.sourceField=original.dataset.field||'';
        const commit=e=>{e.stopPropagation();original.value=input.value;original.checked=input.checked;original.dispatchEvent(new Event(e.type,{bubbles:true}));schedule();};
        input.addEventListener('input',commit);input.addEventListener('change',commit);
        wrap.append(input);body.append(wrap);proxies.push({original,input});
      });
      const ownButtons=[...n.source.querySelectorAll('button')].filter(b=>shown(b)&&b.closest(groups)===n.source);
      if(ownButtons.length){const row=el('div','nv-node-actions');ownButtons.forEach(b=>row.append(proxyButton(b)));body.append(row);}
      if(n.source.matches(repeat)&&!n.source.closest('#lt-pools')){
        const row=el('div','nv-node-actions');row.append(button('↑',()=>reorder(n,-1)),button('↓',()=>reorder(n,1)));
        row.children[0].setAttribute('aria-label',text.up);row.children[1].setAttribute('aria-label',text.down);body.append(row);
      }
      cards.append(card);
    });
    const result=el('article','nv-node nv-result');result.dataset.nodeKey='result';
    const h=el('div','nv-node-header');const mover=button(text.result,()=>{});mover.className='nv-drag';h.append(el('span','nv-port'),mover);result.append(h);
    const output=el('div','nv-node-body nv-output');result.append(output);cards.append(result);
    const n={key:'result',card:result,title:text.result};model.push(n);mover.addEventListener('pointerdown',e=>begin(e,n));mover.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const p=positions[n.key];p.x+=e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0;p.y+=e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0;place(n);draw();save();});
    arrange();sync();
    if(focused)proxies.find(p=>p.original===focused)?.input.focus({preventScroll:true});
  }
  function reorder(n,direction){
    const siblings=[...n.source.parentElement.children].filter(e=>e.matches(repeat));
    const other=siblings[siblings.indexOf(n.source)+direction];if(!other)return;
    if(direction<0)other.before(n.source);else other.after(n.source);
    const field=n.fields[0];field.dispatchEvent(new Event('input',{bubbles:true}));schedule();
  }
  function proxyButton(original){const b=button(original.textContent.trim(),()=>{original.click();schedule();});b.disabled=original.disabled;b.dataset.sourceAction=original.id||original.className;return b;}
  function refreshActions(){
    actionList.replaceChildren();actionProxies=[];
    source.querySelectorAll('button').forEach(b=>{
      if(!shown(b)||b.closest(repeat))return;
      const copy=proxyButton(b);actionList.append(copy);actionProxies.push({original:b,copy});
    });
  }
  function sync(){
    proxies.forEach(({original,input})=>{if(!original.isConnected)return;if(input.tagName==='SELECT'&&input.innerHTML!==original.innerHTML)input.innerHTML=original.innerHTML;if(document.activeElement!==input){input.value=original.value;input.checked=original.checked;}input.disabled=original.disabled;});
    const output=cards.querySelector('.nv-output');if(!output)return;
    output.replaceChildren();
    [...source.querySelectorAll('textarea[readonly],input[readonly],pre.command-output,pre[id],code[id]')].sort((a,b)=>Number(b.matches('textarea,input'))-Number(a.matches('textarea,input'))).forEach(f=>{
      if(!shown(f))return;
      const heading=el('p','nv-output-label',fieldLabel(f));const area=el('textarea','nv-output-text');area.readOnly=true;area.value=f.value??f.textContent;
      const copy=button(text.copy,async()=>{try{await navigator.clipboard.writeText(area.value);live.textContent=text.copied;}catch(_){area.focus();area.select();}});const sourceCopy=[...(f.closest('.tool-panel')?.querySelectorAll('button')||[])].find(b=>/copy/i.test(b.id));copy.disabled=Boolean(sourceCopy?.disabled);output.append(heading,area,copy);
    });
    source.querySelectorAll('.tool-summary[id],[role="alert"]').forEach(e=>{if(shown(e)&&e.textContent.trim())output.append(el('p','nv-output-label',e.textContent.trim()));});
    if(!output.children.length)output.append(el('p','',text.empty));
    actionProxies.forEach(({original,copy})=>copy.disabled=original.disabled);
  }
  function arrange(){
    let y=24;
    model.forEach((n,i)=>{if(!positions[n.key])positions[n.key]={x:n.key==='result'?750:(i%2)*350,y:n.key==='result'?24:y};place(n);if(i%2===1)y+=Math.max(model[i-1].card.offsetHeight,n.card.offsetHeight)+60;});
    draw();
  }
  function place(n){const p=positions[n.key];n.card.style.transform='translate('+p.x+'px,'+p.y+'px)';}
  function transform(){world.style.transform='translate('+pan.x+'px,'+pan.y+'px) scale('+scale+')';zoomText.textContent=Math.round(scale*100)+'%';}
  function zoom(value,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const before=scale;scale=Math.max(.25,Math.min(1.8,value));pan.x=x-(x-pan.x)*scale/before;pan.y=y-(y-pan.y)*scale/before;transform();}
  function fit(){if(!model.length)return;const bounds=model.map(n=>({...positions[n.key],w:n.card.offsetWidth,h:n.card.offsetHeight}));const left=Math.min(...bounds.map(p=>p.x)),top=Math.min(...bounds.map(p=>p.y));const width=Math.max(...bounds.map(p=>p.x+p.w))-left,height=Math.max(...bounds.map(p=>p.y+p.h))-top;scale=Math.max(.25,Math.min(1,(viewport.clientWidth-48)/width,(viewport.clientHeight-48)/height));pan={x:24-left*scale,y:24-top*scale};transform();}
  function draw(){
    svg.replaceChildren();const result=model.find(n=>n.key==='result');if(!result)return;
    let maxX=1200,maxY=900;
    model.forEach(n=>{const p=positions[n.key];if(!p)return;maxX=Math.max(maxX,p.x+n.card.offsetWidth+80);maxY=Math.max(maxY,p.y+n.card.offsetHeight+80);if(n===result)return;
      const parent=n.source.parentElement.closest(groups);const target=model.find(m=>m.source===parent)||result;
      const t=positions[target.key];const x1=p.x+n.card.offsetWidth,y1=p.y+24,x2=t.x,y2=t.y+24;
      const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M '+x1+' '+y1+' C '+(x1+80)+' '+y1+', '+(x2-80)+' '+y2+', '+x2+' '+y2);svg.append(path);
      n.card.setAttribute('aria-description',text.connection+' '+target.title);
    });svg.setAttribute('width',maxX);svg.setAttribute('height',maxY);
  }
  function begin(e,node){if(e.button!==0)return;e.preventDefault();const p=node?positions[node.key]:pan;drag={node,x:e.clientX,y:e.clientY,px:p.x,py:p.y};viewport.setPointerCapture(e.pointerId);}
  viewport.addEventListener('pointerdown',e=>{if(e.target===viewport||e.target===world||e.target===cards||e.target===svg)begin(e,null);});
  viewport.addEventListener('pointermove',e=>{if(!drag)return;const unit=drag.node?scale:1;const p={x:drag.px+(e.clientX-drag.x)/unit,y:drag.py+(e.clientY-drag.y)/unit};if(drag.node){positions[drag.node.key]=p;place(drag.node);draw();}else{pan=p;transform();}});
  const stop=()=>{if(drag?.node)save();drag=null;};viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
  viewport.addEventListener('wheel',e=>{if(e.target.closest('.nv-node-body'))return;e.preventDefault();const box=viewport.getBoundingClientRect();zoom(scale*(e.deltaY>0?.9:1.1),e.clientX-box.left,e.clientY-box.top);},{passive:false});
  viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale*1.2);}if(e.key==='-'){e.preventDefault();zoom(scale/1.2);}if(e.key==='Home'){e.preventDefault();fit();}});
  function setMode(value){
    active=value;view.hidden=!value;source.classList.toggle('nv-form-hidden',value);form.setAttribute('aria-selected',String(!value));nodes.setAttribute('aria-selected',String(value));form.tabIndex=value?-1:0;nodes.tabIndex=value?0:-1;
    if(value){build(collect());refreshActions();transform();if(!opened){fit();if(scale<.75){scale=.75;pan={x:24-Math.min(...model.map(n=>positions[n.key].x))*scale,y:24-Math.min(...model.map(n=>positions[n.key].y))*scale};transform();}opened=true;}}
  }
  modeBar.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const value=e.key==='End'?true:e.key==='Home'?false:!active;setMode(value);(value?nodes:form).focus();}});
  source.addEventListener('input',schedule);source.addEventListener('change',schedule);source.addEventListener('click',schedule);
  new MutationObserver(schedule).observe(source,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','style','disabled']});
  new ResizeObserver(()=>{if(active)draw();}).observe(viewport);
  setMode(false);
})();
