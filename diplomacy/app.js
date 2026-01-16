
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
        phaseIndex: 0, // 0 = Spring move, 1 = Spring resolve, 2 = Autumn move, 3 = Autumn resolve, 4 = Winter build or destroy
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

      // Advance phase and year (roll year when we wrap to Spring Movement)
      function advancePhase() {
        STATE.phaseIndex = (STATE.phaseIndex + 1) % PHASES.length;
        if (STATE.phaseIndex === 0) {
          STATE.year += 1; // wrapped from W-A to S-M → new year
        }
        setPhaseLabel();
      }

      // Build a readable, per-power summary of last phase orders using unit positions BEFORE resolution
      function buildLastPhaseSummary(orders, unitsBefore) {
        const byId = new Map(unitsBefore.map(u => [u.id, u]));
        const perPower = new Map(POWERS.map(p => [p.id, []]));

        function nameOf(provId) {
          return PROVINCES[provId] ? PROVINCES[provId].name : provId;
        }

        for (const [unitId, ord] of Object.entries(orders || {})) {
          const u = byId.get(unitId);
          if (!u) continue;

          let text;
          switch (ord.type) {
            case 'MOVE':
              text = `${u.kind} ${nameOf(u.prov)} → ${nameOf(ord.targetProv || '—')}`;
              break;
            case 'HOLD':
              text = `${u.kind} ${nameOf(u.prov)} HOLD`;
              break;
            case 'SUPPORT_HOLD':
              text = `${u.kind} ${nameOf(u.prov)} S ${ord.supportUnitId || '—'}`;
              break;
            case 'SUPPORT_MOVE':
              text = `${u.kind} ${nameOf(u.prov)} S ${ord.supportUnitId || '—'} → ${nameOf(ord.targetProv || '—')}`;
              break;
            case 'CONVOY':
              text = `${u.kind} ${nameOf(u.prov)} C ${ord.armyUnitId || '—'} ${nameOf(ord.fromProv || '—')} → ${nameOf(ord.toProv || '—')}`;
              break;
            default:
              text = `${u.kind} ${nameOf(u.prov)} (unknown)`;
          }
          perPower.get(u.power)?.push(text);
        }

        // Return an array to preserve display order of POWERS
        return POWERS.map(p => ({
          power: p,
          orders: perPower.get(p.id) || []
        }));
      }   

      // Render the under-board pane from STATE.lastPhaseSummary
      function renderLastMovesPane() {
        const body = document.getElementById('lastMovesBody');
        if (!body) return;

        body.innerHTML = '';
        const data = STATE.lastPhaseSummary;
        if (!data) {
          const p = document.createElement('div');
          p.className = 'muted';
          p.textContent = 'No prior phase.';
          body.appendChild(p);
          return;
        }

        data.forEach(({ power, orders }) => {
          const wrap = document.createElement('div');
          wrap.className = 'power';

          const h4 = document.createElement('h4');
          h4.textContent = power.name;
          h4.style.color = power.color;
          wrap.appendChild(h4);

          const ul = document.createElement('ul');
          if (!orders.length) {
            const li = document.createElement('li');
            li.textContent = '— no orders —';
            ul.appendChild(li);
          } else {
            orders.forEach(t => {
              const li = document.createElement('li');
              li.textContent = t;
              ul.appendChild(li);
            });
          }

          wrap.appendChild(ul);
          body.appendChild(wrap);
        });
      }

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

      
      function ensureBackground(svg) {
        const href = window.MAP_BG_IMAGE;
        if (!href) return; // no background configured

        const { width, height } = window.MAP_BG_SIZE || { width: 1835, height: 1360 };

        // Reuse if already present
        let img = svg.querySelector('#bgImage');
        if (!img) {
          img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
          img.setAttribute('id', 'bgImage');
          img.setAttribute('x', '0');
          img.setAttribute('y', '0');
          img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          // modern attribute
          img.setAttribute('href', href);
          // xlink fallback for older browsers
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
          svg.appendChild(img);
        } else {
          img.setAttribute('href', href);
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
        }
        img.setAttribute('width', width);
        img.setAttribute('height', height);
      }

      function groupFor(pid) {
        const g = (window.COAST_GROUPS && window.COAST_GROUPS[pid]);
        return g ? g : [pid];
      }    
      function shouldHideNode(pid, p) {
        // Hide if this province is part of a coast group AND it doesn't have its own path,
        // while some sibling in the group *does* have a path (e.g., StP).
        if (!window.COAST_GROUPS) return false;
        const group = groupFor(pid);
        if (group.length <= 1) return false;
        const thisHasPath = !!p?.path;
        if (thisHasPath) return false;
        const groupHasAnyPath = group.some(q => !!(window.PROVINCES[q] && window.PROVINCES[q].path));
        return groupHasAnyPath;
      }
      function groupLastOccupant(pid, lastMap) {
        for (const k of groupFor(pid)) {
          const v = lastMap.get(k);
          if (v) return v;
        }
        return null;
      }

      // Province fill: current occupant -> last occupant -> default by type
      function computeNodeFill(pid, p) {
        const occ = STATE.units.find(u => groupFor(pid).includes(u.prov));
        if (occ) return byPower(occ.power).color;
        const last = STATE.lastOccupant.get(pid, STATE.lastOccupant);
        if (last) return byPower(last).color;
                
        // fall back to default map colours
        if (p?.type === 'sea') return (window.MAP_COLORS?.sea ?? '#78b8bd');
        if (p?.type === 'land') return (window.MAP_COLORS?.land ?? '#8ad475');

        return (window.MAP_COLORS?.neutral ?? '#1b0115');

      }
      
      function drawBoard() {
        svg.innerHTML = '';
        // --- draw province nodes + names ---
        for (const [pid, p] of Object.entries(PROVINCES)) {
          const fill = computeNodeFill(pid, p);
          const hideNode = shouldHideNode(pid, p);

          if (p.path) {
            // Vector province shape
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', p.path);
            pathEl.setAttribute('class', `prov-shape ${p.type}`);
            pathEl.setAttribute('fill', fill);
            svg.appendChild(pathEl);
          } else if (!hideNode) {
            // Fallback: node circle
            svg.appendChild(circle(
              p.x, p.y,
              (p.type === 'sea') ? 24 : 20,
              `prov-node ${p.type}`, null, fill));
          }

          // Province label (kept simple: anchored to province coords)
          const name = p.name + (p.sc ? ' ★' : '');
          svg.appendChild(label(
            (p.x ?? 0) + 20,
            (p.y ?? 0) - 10,
            name,
            `prov-label ${p.type === 'sea' ? 'sea-label' : ''}`
          ));
        }

        // --- draw units ---
        STATE.units.forEach(u => {
          const p = PROVINCES[u.prov];
          const fill = byPower(u.power).color;
          svg.appendChild(circle(p.x, p.y, 16, `unit ${u.dislodged ? 'dislodged' : ''}`, fill, fill));
          svg.appendChild(label(p.x - 4, p.y + 4, u.kind, 'prov-label'));
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
      document.getElementById('btnResolve').addEventListener('click', () => {
        // Snapshot positions BEFORE resolve for clean rendering of last-phase orders
        const unitsBefore = STATE.units.map(u => ({ ...u }));
        STATE.lastPhaseSummary = buildLastPhaseSummary(STATE.orders, unitsBefore);
        const res = resolveMovementPhase(STATE);
        STATE.units = res.units;

        // Update "last occupant" memory from the new positions
        STATE.units.forEach(u => {groupFor(u.prov).forEach(id => STATE.lastOccupant.set(id, u.power));});

        // Redraw board & update under-board summary and log
        drawBoard();
        renderLastMovesPane();
        appendLog(res.log, 'ok');

        // Advance to the next phase and roll the year if needed
        advancePhase();
        STATE.orders = {};
        renderOrdersPanel();
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
      renderLastMovesPane();

    } catch(e){
      showError('Startup error: ' + (e && e.message ? e.message : e));
      console.error(e);
    }
  }

  window.addEventListener('DOMContentLoaded', start);
})();
