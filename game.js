document.addEventListener('DOMContentLoaded', () => {

  // 1) Resources
  const resLoose = { wood: 10, stone: 10, food: 10, coin: 0, metal: 0 };
  const resStorable = { wood: 0, stone: 0, food: 0, coin: 0, metal: 0 };
  const resStored = { wood: 0, stone: 0, food: 0, coin: 0, metal: 0 };

  // 2) Buildings
  const buildings = {
    townCentre: 1,
    house: 0,
    farm: 0,
    logging: 0,
    market: 0,
    mine: 0,
    metalMine: 0,
    warehouse: 0,
    tower: 0,
    archery: 0,
    barracks: 0
  };

  // 3) Villagers
  const villagers = {
    idle: 2,
    gathering: 0,
    working: 0,
    training: 0,
    guards: 0,
    soldiers: 0,
    archers: 0
  };

  // 4) Workers
  const workersAssigned = {
    farm: 0,
    logging: 0,
    market: 0,
    mine: 0,
    metalMine: 0
  };

  // 5) Canvas + grid
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const GRID = 20;
  const snap = v => Math.round(v / GRID) * GRID;

  // 6) Buildings config
  const BUILDINGS = {
    house: { cost:{wood:10,stone:5}, size:{w:70,h:70}, sprite:'images/house.png', onBuild:()=>villagers.idle+=2 },
    farm: { cost:{wood:15,stone:7}, size:{w:90,h:70}, sprite:'images/farm.png', workers:2, prod:{food:1} },
    logging:{ cost:{wood:20,stone:10}, size:{w:90,h:70}, sprite:'images/logging.png', workers:2, prod:{wood:1} },
    market:{ cost:{wood:25,stone:15}, size:{w:90,h:70}, sprite:'images/market.png', workers:2, prod:{coin:1}, unique:true },
    mine:{ cost:{wood:20,stone:12,coin:5}, size:{w:90,h:70}, sprite:'images/mine.png', workers:2, prod:{stone:1}, req:['market'] },
    metalMine:{ cost:{wood:30,stone:20,coin:10}, size:{w:90,h:70}, sprite:'images/metal-mine.png', workers:2, prod:{metal:1}, req:['market'] },
    warehouse:{ cost:{wood:40,stone:20}, size:{w:90,h:70}, sprite:'images/warehouse.png', cap:{wood:1000,stone:1000,food:1000,metal:1000,coin:100} },
    tower:{ cost:{wood:30,stone:20,coin:10}, size:{w:70,h:90}, sprite:'images/guard-tower.png', train:2, guard:2, time:5000 },
    archery:{ cost:{wood:100,stone:200,coin:50}, size:{w:90,h:70}, sprite:'images/archery.png', train:2, time:7000 },
    barracks:{ cost:{wood:100,stone:300,metal:300,coin:150}, size:{w:90,h:70}, sprite:'images/barracks.png', train:2, time:9000, req:['metalMine','market'] }
  };

  // 7) Placement state
  const placed = [{ type:'townCentre', x:400, y:400 }];
  const place = { active:false, type:null };
  const ghost = { x:0, y:0, ok:false };

  // 8) Helpers
  const has = cost => Object.keys(cost).every(k => (resLoose[k]||0) >= cost[k]);
  const pay = cost => Object.keys(cost).forEach(k => resLoose[k]-=cost[k]);
  const reqOk = t => (BUILDINGS[t].req||[]).every(r => buildings[r]>0);

  // 9) Collision
  const box = t => BUILDINGS[t].size;
  const inside = (x,y,t) => {
    const {w,h}=box(t);
    return x-w/2>=0 && y-h/2>=0 && x+w/2<=canvas.width && y+h/2<=canvas.height;
  };
  const hit = (x,y,t) => placed.some(b=>{
    const a=box(t), c=box(b.type);
    return x-a.w/2<b.x+c.w/2 && x+a.w/2>b.x-c.w/2 && y-a.h/2<b.y+c.h/2 && y+a.h/2>b.y-c.h/2;
  });

  // 10) Draw
  const sprites = {};
  Object.keys(BUILDINGS).forEach(t=>{ const i=new Image(); i.src=BUILDINGS[t].sprite; sprites[t]=i; });
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    placed.forEach(b=>{
      const s=sprites[b.type], {w,h}=box(b.type);
      if(s.complete) ctx.drawImage(s,b.x-w/2,b.y-h/2,w,h);
      else ctx.fillRect(b.x-w/2,b.y-h/2,w,h);
    });
    if(place.active){
      const {w,h}=box(place.type);
      ctx.globalAlpha=0.5;
      ctx.fillStyle=ghost.ok?'green':'red';
      ctx.fillRect(ghost.x-w/2,ghost.y-h/2,w,h);
      ctx.globalAlpha=1;
    }
  };

  // 11) Start build
  const start = t => {
    const d=BUILDINGS[t];
    if(d.unique && buildings[t]>0) return alert('Only one allowed');
    if(!reqOk(t)) return alert('Missing requirement');
    if(!has(d.cost)) return alert('Not enough resources');
    place.active=true; place.type=t;
  };

  // 12) Place building
  canvas.addEventListener('mousemove',e=>{
    if(!place.active) return;
    const r=canvas.getBoundingClientRect();
    ghost.x=snap(e.clientX-r.left);
    ghost.y=snap(e.clientY-r.top);
    ghost.ok=inside(ghost.x,ghost.y,place.type)&&!hit(ghost.x,ghost.y,place.type);
    draw();
  });

  canvas.addEventListener('click',()=>{
    if(!place.active||!ghost.ok) return;
    const t=place.type;
    pay(BUILDINGS[t].cost);
    placed.push({type:t,x:ghost.x,y:ghost.y});
    buildings[t]++;
    if(BUILDINGS[t].onBuild) BUILDINGS[t].onBuild();
    place.active=false;
    updateUI();
    draw();
  });

  // 13) Workers
  const addWorker = t => {
    if(villagers.idle<=0) return;
    if(workersAssigned[t]>=buildings[t]*BUILDINGS[t].workers) return;
    villagers.idle--; villagers.working++; workersAssigned[t]++;
    updateUI();
  };
  const remWorker = t => {
    if(workersAssigned[t]<=0) return;
    villagers.idle++; villagers.working--; workersAssigned[t]--;
    updateUI();
  };

  // 14) Training
  const train = (b,u) => {
    if(buildings[b]<=0) return;
    if(villagers.idle<=0) return;
    if(villagers.training>=buildings[b]*BUILDINGS[b].train) return;
    villagers.idle--; villagers.training++;
    setTimeout(()=>{
      villagers.training--;
      villagers[u]++; updateUI();
    }, BUILDINGS[b].time);
    updateUI();
  };

  // 15) Storage
  const store = () => {
    const n=buildings.warehouse;
    if(n<=0) return;
    const cap=BUILDINGS.warehouse.cap;
    Object.keys(resStorable).forEach(k=>{
      const max=cap[k]*n;
      const free=max-resStored[k];
      const move=Math.min(free,resStorable[k]);
      resStorable[k]-=move; resStored[k]+=move;
    });
  };

  // 16) Tick
  setInterval(()=>{
    resLoose.food+=villagers.gathering;
    resLoose.wood+=villagers.gathering;
    resLoose.stone+=villagers.gathering;
    Object.keys(workersAssigned).forEach(t=>{
      const p=BUILDINGS[t].prod||{};
      Object.keys(p).forEach(r=>resStorable[r]+=p[r]*workersAssigned[t]);
    });
    store(); updateUI();
  },3000);

  // 17) UI
  const txt=(i,v)=>{const e=document.getElementById(i); if(e) e.textContent=v;};
  const updateUI=()=>{
    txt('food',`🌾:${resLoose.food}`);
    txt('wood',`🪵:${resLoose.wood}`);
    txt('stone',`⛏️:${resLoose.stone}`);
    txt('metal',`🔩:${resLoose.metal}`);
    txt('coin',`🪙:${resLoose.coin}`);
    txt('villagers-idle',`Idle: ${villagers.idle}`);
    txt('villagers-gathering',`Gathering: ${villagers.gathering}`);
    txt('villagers-working',`Working: ${villagers.working}`);
    txt('villagers-training',`Training: ${villagers.training}`);
  };

  // 18) Buttons
  document.getElementById('send-villagers')?.addEventListener('click',()=>{if(villagers.idle>0){villagers.idle--;villagers.gathering++;updateUI();}});
  document.getElementById('recall-villagers')?.addEventListener('click',()=>{if(villagers.gathering>0){villagers.gathering--;villagers.idle++;updateUI();}});

  ['house','farm','logging','market','mine','metalMine','warehouse','tower','archery','barracks']
    .forEach(t=>document.getElementById(`build-${t}`)?.addEventListener('click',()=>start(t)));

  ['farm','logging','market','mine','metalMine']
    .forEach(t=>{
      document.getElementById(`${t}-add-worker`)?.addEventListener('click',()=>addWorker(t));
      document.getElementById(`${t}-remove-worker`)?.addEventListener('click',()=>remWorker(t));
    });

  document.getElementById('train-archer')?.addEventListener('click',()=>train('archery','archers'));
  document.getElementById('train-soldier')?.addEventListener('click',()=>train('barracks','soldiers'));
  document.getElementById('send-villagers-training')?.addEventListener('click',()=>train('tower','guards'));

  // 19) Init
  updateUI(); draw();
});
