
(function(){
  function showError(msg){
    try {
      const el = document.getElementById('errBanner');
      el.textContent = msg;
      el.style.display = 'block';
    } catch(e){}
  }

  function start(){
    try {
      // Minimal guards: rely on globals provided by updated map.js & rules.js
      if (typeof POWERS==='undefined' ||
          typeof PROVINCES==='undefined' ||
          typeof START_UNITS==='undefined' ||
          typeof START_OWNERSHIP==='undefined' ||
          typeof PHASES==='undefined' ||
          typeof canMove==='undefined' ||
          typeof resolveMovementPhase==='undefined') {
        showError('Scripts failed to load. Please unzip and open index.html from the folder.');
        return;
      }

      // App state
      let STATE = {
        year: 1901,
        phaseIndex: 0,
        units: JSON.parse(JSON.stringify(START_UNITS)),
        ownership: { ...START_OWNERSHIP },
        orders: {},
        _attackOrigins: new Map(),
        lastOccupant: new Map()
      };
      // Seed "last occupant" from initial unit locations
      STATE.units.forEach(u => STATE.lastOccupant.set(u.prov, u.power));

      // DOM refs
      const svg        = document.getElementById('svgBoard');
      const ordersRoot = document.getElementById('ordersRoot');
      const phaseLabel = document.getElementById('phaseLabel');
      const logBox     = document.getElementById('log');

      function setPhaseLabel(){
        const ph = PHASES[STATE.phaseIndex];
        phaseLabel.innerHTML = `${STATE.year} · ${ph.label}`;
      }

      function renderLegend(){
        const root = document.getElementById('legend');
        root.innerHTML='';
        POWERS.forEach(p=>{
          const div=document.createElement('div');
          div.className='pill';
          const dot=document.createElement('span');
          dot.className='dot';
          dot.style.background=p.color;
          div.appendChild(dot);
          div.appendChild(document.createTextNode(p.name));
          root.appendChild(div);
        });
      }

      function circle(x,y,r,cls,strokeColor,fillColor){
        const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',x);
        c.setAttribute('cy',y);
        c.setAttribute('r',r);
        c.setAttribute('class',cls);
        if (strokeColor) c.setAttribute('stroke', strokeColor);
        if (fillColor)   c.setAttribute('fill', fillColor);
        return c;
      }
      function line(x1,y1,x2,y2,cls){
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        l.setAttribute('x1',x1);
        l.setAttribute('y1',y1);
        l.setAttribute('x2',x2);
        l.setAttribute('y2',y2);
        l.setAttribute('class',cls);
        return l;
      }
      function label(x,y,text,cls){
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',x);
        t.setAttribute('y',y);
        t.setAttribute('class',cls);
        t.textContent=text;
        return t;
      }

      // Province fill: current occupant -> last occupant -> default by type
      function computeNodeFill(pid, p) {
        const occ = STATE.units.find(u => u.prov === pid);
        if (occ) return byPower(occ.power).color;
        const last = STATE.lastOccupant.get(pid);
        if (last) return byPower(last).color;
        return p.type === 'sea' ? '#0f172a' : '#2c3e50';
      }

      function drawBoard(){
        svg.innerHTML='';
        // draw edges
        for(const [pid,p] of Object.entries(PROVINCES)){
          (p.adj || []).forEach(adj=>{
            const q=PROVINCES[adj];
            if (!q) return; // tolerate minor mismatches
            svg.appendChild(line(p.x,p.y,q.x,q.y,'edge'));
          });
        }
        // draw province nodes + names
        for (const [pid,p] of Object.entries(PROVINCES)){
          svg.appendChild(circle(p.x,p.y,(p.type==='sea')?18:16,`prov-node ${p.type}`,null,computeNodeFill(pid,p)));
          const name = p.name + (p.sc ? ' ★' : '');
          svg.appendChild(label(p.x+20,p.y-10,name,`prov-label ${p.type==='sea'?'sea-label':''}`));
        }
        // draw units
        STATE.units.forEach(u=>{
          const p=PROVINCES[u.prov];
          const fill=byPower(u.power).color;
          svg.appendChild(circle(p.x,p.y,9,`unit ${u.dislodged?'dislodged':''}`, fill, fill));
          svg.appendChild(label(p.x-4,p.y+4,u.kind,'prov-label'));
        });
      }

      function writeOrder(unitId,payload){
        STATE.orders[unitId] = { unitId, ...payload };
      }

      function renderOrdersPanel(){
        ordersRoot.innerHTML='';
        const phase = PHASES[STATE.phaseIndex].key;

        if (phase.endsWith('R')){
          ordersRoot.innerHTML=' \nRetreats phase. \n';
          return;
        }
        if (phase==='W-A'){
          ordersRoot.innerHTML=' \nWinter phase. \n';
          return;
        }

        POWERS.forEach(p=>{
          const box=document.createElement('div');
          box.className='country';

          const title=document.createElement('h2');
          title.textContent=p.name;
          title.style.color=p.color;
          box.appendChild(title);

          STATE.units.filter(u=>u.power===p.id).forEach(u=>{
            const row=document.createElement('div');
            row.className='unit-row';

            const unitLabel=document.createElement('div');
            unitLabel.innerHTML=`${u.kind} @ ${PROVINCES[u.prov].name}`;
            row.appendChild(unitLabel);

            const typeSelect=document.createElement('select');
            ['HOLD','MOVE','SUPPORT_HOLD','SUPPORT_MOVE'].forEach(t=>{
              const opt=document.createElement('option');
              opt.value=t;
              opt.textContent=t.replace('_',' ');
              typeSelect.appendChild(opt);
            });
            if(u.kind==='F'){
              const o=document.createElement('option');
              o.value='CONVOY';
              o.textContent='CONVOY';
              typeSelect.appendChild(o);
            }
            row.appendChild(typeSelect);

            const targetSelect=document.createElement('select');
            targetSelect.appendChild(new Option('— target —',''));
            (PROVINCES[u.prov].adj || []).forEach(a=>{
              const ok = canMove(u, a);
              const opt = new Option(`${PROVINCES[a].name}`, a);
              if (!ok){
                opt.disabled = true;
                opt.textContent += ' (invalid)';
              }
              targetSelect.appendChild(opt);
            });
            row.appendChild(targetSelect);

            const supportSelect=document.createElement('select');
            supportSelect.appendChild(new Option('— unit —',''));
            STATE.units.filter(x=>x.id!==u.id).forEach(x=>{
              const opt=new Option(`${byPower(x.power).name}: ${x.kind} @ ${PROVINCES[x.prov].name}`, x.id);
              supportSelect.appendChild(opt);
            });
            row.appendChild(supportSelect);

            const convoyTo=document.createElement('select');
            convoyTo.appendChild(new Option('— to —',''));
            Object.keys(PROVINCES).forEach(pid=> convoyTo.appendChild(new Option(pid,pid)));
            const convoyFrom=document.createElement('select');
            convoyFrom.appendChild(new Option('— from —',''));
            Object.keys(PROVINCES).forEach(pid=> convoyFrom.appendChild(new Option(pid,pid)));
            convoyFrom.style.display = convoyTo.style.display = 'none';
            row.appendChild(convoyFrom);
            row.appendChild(convoyTo);

            function sync(){
              const t=typeSelect.value;
              targetSelect.disabled = !(t==='MOVE' || t==='SUPPORT_MOVE');
              supportSelect.disabled = !(t==='SUPPORT_HOLD' || t==='SUPPORT_MOVE');
              convoyFrom.style.display = convoyTo.style.display = (t==='CONVOY') ? 'inline-block' : 'none';

              if(t==='CONVOY'){
                writeOrder(u.id,{
                  type:'CONVOY',
                  armyUnitId:  supportSelect.value || null,
                  fromProv:    convoyFrom.value || null,
                  toProv:      convoyTo.value   || null
                });
              } else if (t==='MOVE'){
                writeOrder(u.id,{ type:'MOVE', targetProv: targetSelect.value || null });
              } else if (t==='SUPPORT_HOLD'){
                writeOrder(u.id,{ type:'SUPPORT_HOLD', supportUnitId: supportSelect.value || null });
              } else if (t==='SUPPORT_MOVE'){
                writeOrder(u.id,{
                  type:'SUPPORT_MOVE',
                  supportUnitId: supportSelect.value || null,
                  targetProv:    targetSelect.value || null
                });
              } else {
                writeOrder(u.id,{ type:'HOLD' });
              }
            }

            typeSelect.addEventListener('change', ()=>{ sync(); drawBoard(); });
            targetSelect.addEventListener('change', ()=>{ sync(); drawBoard(); });
            supportSelect.addEventListener('change', ()=>{ sync(); drawBoard(); });
            convoyFrom.addEventListener('change', ()=>{ sync(); drawBoard(); });
            convoyTo.addEventListener('change', ()=>{ sync(); drawBoard(); });

            typeSelect.value='HOLD';
            writeOrder(u.id,{type:'HOLD'});
            sync();
            box.appendChild(row);
          });

          ordersRoot.appendChild(box);
        });
      }

      function appendLog(lines, kind='ok'){
        const p=document.createElement('pre');
        p.className=`msg ${kind}`;
        p.textContent = Array.isArray(lines) ? lines.join('\n') : lines;
        logBox.prepend(p);
      }

      // Controls
      document.getElementById('btnResolve').addEventListener('click', ()=>{
        const res = resolveMovementPhase(STATE);
        // Apply positions
        STATE.units = res.units;
        // Update last-occupant memory
        STATE.units.forEach(u => STATE.lastOccupant.set(u.prov, u.power));
        // Redraw & log
        drawBoard();
        renderOrdersPanel();
        appendLog(res.log, 'ok');
      });

      document.getElementById('btnResetOrders').addEventListener('click', ()=>{
        STATE.orders = {};
        renderOrdersPanel();
        appendLog('Orders reset.','bad');
      });

      document.getElementById('btnRandom').addEventListener('click', ()=>{
        STATE.units.forEach(u=>{
          const opts = (PROVINCES[u.prov].adj || []).filter(a=> canMove(u,a));
          const r = Math.random();
          if (opts.length && r < 0.6){
            writeOrder(u.id,{ type:'MOVE', targetProv: opts[Math.floor(Math.random()*opts.length)] });
          } else {
            writeOrder(u.id,{ type:'HOLD' });
          }
        });
        drawBoard();
        renderOrdersPanel();
        appendLog('Random demo orders generated.','ok');
      });

      document.getElementById('btnAdvance').addEventListener('click', ()=>{
        appendLog('Advance (admin)');
      });

      document.getElementById('btnExport').addEventListener('click', ()=>{
        const payload = {
          year: STATE.year,
          phase: { key: PHASES[STATE.phaseIndex].key, label: PHASES[STATE.phaseIndex].label },
          units: STATE.units.map(u => ({ id:u.id, power:u.power, kind:u.kind, prov:u.prov, dislodged:!!u.dislodged })),
          ownership: STATE.ownership
        };
        const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `diplomacy_state_${STATE.year}_${PHASES[STATE.phaseIndex].key}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
      });

      // Boot
      renderLegend();
      setPhaseLabel();
      drawBoard();
      renderOrdersPanel();

    } catch(e){
      showError('Startup error: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', start);
})();
