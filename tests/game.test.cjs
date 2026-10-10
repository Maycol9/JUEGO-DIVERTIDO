// Pruebas de la lógica real con DOM/Canvas simulados; no sustituyen una prueba visual.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const events = {};
const timers = [];
const context2d = new Proxy({}, {get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
function element(id){if(!elements.has(id))elements.set(id,{id,hidden:false,textContent:'',value:0,style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){events[id+':'+type]=fn},setAttribute(){},focus(){},scrollIntoView(){},getBoundingClientRect(){return {width:1100,height:660}},getContext(){return context2d},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)}
const sandbox={console,Math,Set,Map,performance:{now:()=>0},devicePixelRatio:2,matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},setTimeout(fn){timers.push(fn)},location:{origin:'http://localhost:8080'},document:{hidden:false,getElementById:element,querySelectorAll:()=>[],addEventListener:(type,fn)=>events[type]=fn,createElement:()=>({}),head:{append(){}}},addEventListener:(type,fn)=>events[type]=fn};sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
function run(code){return vm.runInContext(code,sandbox)}
function test(name,fn){fn();console.log('OK '+name)}
test('Portada, saludo y tutorial',()=>{assert.equal(run('state'),'cover');run("$('dino-touch').onclick()");assert.equal(run('coverHop'),.6);run("$('how').onclick()");assert.equal(run('state'),'tutorial');run("$('close-tutorial').onclick()");assert.equal(run('state'),'cover')});
test('Introducción completa y salto',()=>{run("$('start').onclick()");for(let i=0;i<3;i++)run('update(3)');assert.equal(run('introIndex'),3);assert.equal(element('ready').hidden,false);run("$('ready').onclick()");assert.equal(run('state'),'playing');run("$('start').onclick();$('skip').onclick()");assert.equal(run('state'),'playing')});
test('Movimiento, salto y aterrizaje',()=>{const before=run('player.x');run("keys.add('right');update(.2);keys.clear()");assert.ok(run('player.x')>before);run("action('jump');update(.1)");assert.ok(run('player.y < H*.87'));for(let i=0;i<100;i++)run('update(.02)');assert.equal(run('player.grounded'),true)});
test('Recolección y regeneración',()=>{run('reset();player.x=hearts[0].x;update(.01)');assert.equal(run('player.ammo'),1);assert.ok(run('hearts[0].timer')>0);run('player.x=25');for(let i=0;i<510;i++)run('update(.02)');assert.equal(run('hearts[0].timer'),0)});
test('Puntería e impacto real de proyectil',()=>{run("reset();player.ammo=1;action('throw')");for(let i=0;i<100;i++)run('update(.02)');assert.equal(run('dino.hits'),1);assert.equal(run('player.ammo'),0)});
test('Daño, invulnerabilidad, derrota y reinicio',()=>{run('reset();hurt();hurt()');assert.equal(run('player.lives'),2);run('player.invulnerable=0;hurt();player.invulnerable=0;hurt()');assert.equal(run('state'),'loss');run("$('retry').onclick()");assert.equal(run('player.lives'),3);assert.equal(run('dino.hits'),0);assert.equal(run('shots.length'),0);assert.equal(run('player.ammo'),0)});
test('Pausa y cuenta regresiva',()=>{run('pause();resume();update(1)');assert.equal(run('state'),'pause');run('update(2.1)');assert.equal(run('state'),'playing')});
test('Pestaña oculta pausa y cancela reanudación',()=>{run('pause();resume()');sandbox.document.hidden=true;events.visibilitychange();assert.equal(run('countdown'),0);assert.equal(run('state'),'pause');sandbox.document.hidden=false;run('resume();update(3.1)');assert.equal(run('state'),'playing')});
test('Victoria exacta a ocho impactos y fin de ataques',()=>{run('reset()');for(let i=0;i<7;i++)run('hit()');assert.equal(run('state'),'playing');run('hit();hurt()');assert.equal(run('state'),'victory');assert.equal(run('player.lives'),3);run('update(5.1)');assert.equal(run('state'),'final')});
test('Sobre, dedicatoria e invitación voluntaria',()=>{run("$('envelope').onclick()");timers.pop()();assert.equal(element('letter').hidden,false);assert.equal(element('invitation').hidden,true);run("$('more').onclick()");assert.equal(element('invitation').hidden,false);assert.ok(element('dedication').textContent.includes('sonrisa'));run("$('replay').onclick()");assert.equal(run('state'),'playing')});
test('Error de YouTube no bloquea el juego',()=>{run('musicFailure()');assert.ok(element('music-status').textContent.includes('continuar sin música'));assert.equal(run('state'),'playing')});
test('Dibujo ejecutable en todos los estados y tamaño vertical',()=>{for(const s of ['cover','intro','playing','pause','loss','victory','final'])run(`state='${s}';draw()`);run('W=360;H=600;reset();draw()');assert.ok(run('player.x > 0 && dino.x < W'));assert.ok(run('hearts.every(h=>h.x<W)'))});
