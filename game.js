'use strict';
// PERSONALIZA AQUÍ LOS NOMBRES, LA MÚSICA Y LOS MENSAJES.
const CONFIG = {
  name: 'Princesa', signature: 'Alguien que sonríe por ti', videoId: 'b3GyAtcoogc',
  dedication: 'Derrotaste al dinosaurio… y a mí me conquistaste con tu sonrisa. 💖',
  message: 'Quería regalarte algo diferente: una pequeña aventura que te hiciera sonreír. Porque, aunque este juego termina aquí, me encantaría que nuestra historia apenas estuviera comenzando. ✨',
  invitation: 'Me gustas. ¿Te gustaría salir conmigo algún día? 🌷',
  intro: ['¡Oh, no! Este dinosaurio travieso se llevó una sorpresa para ti…', 'Por suerte, tienes un superpoder: conquistar con corazones.', 'Aunque… creo que no es tan malo como parece.', 'Recoge corazones, lánzalos y descubre lo que está guardando. 💌'],
  reactions: ['¡Eso hizo cosquillas!', '¡Me estás conquistando!', '¡Mi corazón hace pum, pum!'],
  hits: 8, lives: 3
};
const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let state = 'cover', W = 1100, H = 660, time = 0, last = 0, introTime = 0, introIndex = -1;
let player, dino, hearts = [], shots = [], particles = [], platforms = [], elapsed = 0, cooldown = 0, victoryTime = 0, countdown = 0, toastTime = 0;
let tutorialSeen = false, learned = {}, muted = false, audio, youtube, musicReady = false, musicRequested = false, coverHop = 0;
const keys = new Set(), pointers = new Map();
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
function path(points,color,stroke){ctx.beginPath();points(ctx);if(color){ctx.fillStyle=color;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function heart(x,y,size,color='#f5a8c9'){ctx.save();ctx.translate(x,y);ctx.scale(size/20,size/20);path(c=>{c.moveTo(0,8);c.bezierCurveTo(-25,-7,-9,-23,0,-12);c.bezierCurveTo(9,-23,25,-7,0,8)},color);ctx.restore();}
function star(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4;let s=i%2?r*.22:r;ctx.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s)}ctx.closePath();ctx.fill();}
function flower(x,y,s,color){ctx.strokeStyle='#749b8c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-4,y-12*s,x,y-24*s);ctx.stroke();ellipse(x-5*s,y-10*s,6*s,3*s,'#699b91');for(let i=0;i<5;i++){let a=i*6.283/5;ellipse(x+Math.cos(a)*5*s,y-25*s+Math.sin(a)*5*s,4*s,4*s,color)}ellipse(x,y-25*s,2.3*s,2.3*s,'#f4dba0');}
function princess(x,y,s,pose='idle'){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);let bob=reduced?0:Math.sin(time*3)*1.5;ctx.translate(0,bob);
 ellipse(0,1,29,5,'#14182d40'); // feet and flowing hair
 ellipse(-8,-3,7,4,'#e4b878');ellipse(9,-3,7,4,'#e4b878');
 path(c=>{c.moveTo(-18,-92);c.bezierCurveTo(-44,-62,-29,-31,-36,-22);c.quadraticCurveTo(0,-6,30,-32);c.lineTo(20,-91)},'#744957');
 path(c=>{c.moveTo(-11,-53);c.bezierCurveTo(-16,-32,-27,-18,-32,-8);c.quadraticCurveTo(0,5,33,-8);c.quadraticCurveTo(14,-34,12,-53)},'#c58dc5','#f1bad9');
 path(c=>{c.moveTo(-6,-43);c.quadraticCurveTo(-9,-22,-20,-7);c.quadraticCurveTo(1,-1,18,-8);c.lineTo(5,-43)},'#e9b5d6');
 ellipse(0,-53,13,16,'#dcb0dc');ctx.fillStyle='#e6c08b';ctx.fillRect(-12,-44,24,3);
 const wave=pose==='wave'?Math.sin(time*8)*9:0;
 path(c=>{c.moveTo(-12,-57);c.quadraticCurveTo(-22,-51,-25,-38);c.moveTo(12,-57);c.quadraticCurveTo(27,-52,30,-66-wave)},null,'#efc7b3');ellipse(30,-67-wave,4,5,'#f1c9b8');
 ellipse(0,-78,20,23,'#f2cbbb');path(c=>{c.moveTo(-20,-80);c.bezierCurveTo(-22,-111,26,-111,21,-72);c.quadraticCurveTo(9,-81,5,-94);c.quadraticCurveTo(-7,-76,-20,-80)},'#79515d');
 ellipse(-7,-78,2,3,'#433049');ellipse(8,-78,2,3,'#433049');ellipse(-12,-72,4,2,'#eaa5b0');ellipse(13,-72,4,2,'#eaa5b0');path(c=>{c.moveTo(-3,-70);c.quadraticCurveTo(1,-65,5,-70)},null,'#a95d74');
 path(c=>{c.moveTo(-15,-98);c.lineTo(-19,-115);c.lineTo(-7,-108);c.lineTo(0,-122);c.lineTo(7,-108);c.lineTo(18,-116);c.lineTo(14,-98);c.closePath()},'#e9c47f','#ffdfa1');ellipse(0,-107,3,4,'#d68fab');
 if(pose==='heart')heart(27,-64,18);ctx.restore();
}
function dinosaur(x,y,s,pose='idle'){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);let hop=state==='cover'&&coverHop>0?Math.sin(coverHop*Math.PI/.6)*20:pose==='hit'?Math.sin(Math.max(0,dino?.flash||0)*12)*10:pose==='sneeze'?Math.sin(time*20)*3:Math.sin(time*2)*2;ctx.translate(0,reduced?0:-Math.abs(hop));
 ellipse(1,1,49,8,'#14182d40');
 path(c=>{c.moveTo(23,-35);c.quadraticCurveTo(57,-22,68,-61);c.quadraticCurveTo(81,-16,29,-12)},'#7baa98','#b9d8ad');
 for(let i=0;i<5;i++){let x=20+i*8,y=-74+i*10;path(c=>{c.moveTo(x,y);c.lineTo(x+12,y-12);c.lineTo(x+15,y+7)},'#d8b7d7');}
 ellipse(0,-38,32,37,'#92bca5');ellipse(-11,-29,20,25,'#c8d9b5');ellipse(-21,-5,15,9,'#8db8a1');ellipse(20,-5,14,9,'#8db8a1');
 ellipse(0,-77,36,31,'#9cc6ad');ellipse(-23,-69,28,20,'#a9d0b6');
 ellipse(-16,-85,7,9,'#fbf5dd');ellipse(7,-85,7,9,'#fbf5dd');ellipse(-18,-85,3.2,5,'#334e50');ellipse(5,-85,3.2,5,'#334e50');ellipse(-19,-87,1.3,1.5,'white');ellipse(4,-87,1.3,1.5,'white');
 ellipse(-39,-71,2,2,'#608c7c');ellipse(-13,-67,7,3,'#d6a5b4');path(c=>{c.moveTo(-34,-60);c.quadraticCurveTo(-20,-51,-11,-58)},null,'#577f70');
 ellipse(-24,-40,13,7,'#8db9a0');
 if(pose==='envelope'){ctx.save();ctx.translate(-30,-37);ctx.rotate(-.2);ctx.fillStyle='#ffe4db';ctx.fillRect(-15,-11,30,22);path(c=>{c.moveTo(-15,-11);c.lineTo(0,1);c.lineTo(15,-11)},null,'#d5a5b4');heart(0,2,6);ctx.restore();}
 else if(pose==='flower'){flower(-31,-37,1.2,'#f3a9c4');}
 else heart(29,-40,12,'#efa6c7');ctx.restore();
}
function castle(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.65;
 for(const [tx,ty,w,h] of [[-76,-93,34,93],[46,-105,34,105],[-21,-152,42,152],[-45,-70,90,70]]){ctx.fillStyle='#77799b';ctx.fillRect(tx,ty,w,h);path(c=>{c.moveTo(tx-8,ty);c.lineTo(tx+w/2,ty-36);c.lineTo(tx+w+8,ty)},'#a79abc');ctx.fillStyle='#e5caa5';ctx.fillRect(tx+w/2-3,ty+17,6,14);ctx.strokeStyle='#c4a5bc';ctx.beginPath();ctx.moveTo(tx+w/2,ty-36);ctx.lineTo(tx+w/2,ty-58);ctx.stroke();path(c=>{c.moveTo(tx+w/2,ty-58);c.lineTo(tx+w/2+18,ty-51);c.lineTo(tx+w/2,ty-46)},'#d8a3ba');}
 path(c=>{c.moveTo(-14,0);c.lineTo(-14,-29);c.bezierCurveTo(-14,-53,14,-53,14,-29);c.lineTo(14,0)},'#484a70');ctx.restore();}
function scenery(){
 let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1c2848');sky.addColorStop(.48,'#555078');sky.addColorStop(.8,state==='victory'?'#c298ba':'#92758e');sky.addColorStop(1,'#293d48');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 for(let i=0;i<65;i++){let x=(i*137.3)%W,y=(i*67.9)%(H*.67);let a=reduced?.7:.4+Math.sin(time*.8+i)*.25;ctx.globalAlpha=a;star(x,y,i%7===0?4:1.7,'#f6dbb3')}ctx.globalAlpha=1;
 ellipse(W*.82,H*.15,26,26,'#eddbbf');ellipse(W*.82-10,H*.15-8,24,24,'#293450');
 for(let i=0;i<6;i++){let x=(i*.21*W+(reduced?0:Math.sin(time*.13+i)*15));let y=H*(.29+(i%3)*.12);ellipse(x,y,90,12,'#b7a6cb13');ellipse(x+30,y-6,40,14,'#b7a6cb13')}
 path(c=>{c.moveTo(0,H*.7);c.bezierCurveTo(W*.18,H*.37,W*.3,H*.71,W*.53,H*.61);c.bezierCurveTo(W*.76,H*.4,W*.92,H*.5,W,H*.62);c.lineTo(W,H);c.lineTo(0,H)},'#5c617b');castle(W*.2,H*.71,W<600?.68:1.05);
 path(c=>{c.moveTo(0,H*.76);c.bezierCurveTo(W*.3,H*.60,W*.58,H*.91,W,H*.67);c.lineTo(W,H);c.lineTo(0,H)},'#435a66');
 let ground=H*.87;path(c=>{c.moveTo(0,ground);c.bezierCurveTo(W*.2,ground-20,W*.8,ground+6,W,ground-13);c.lineTo(W,H);c.lineTo(0,H)},'#304d53');
 path(c=>{c.moveTo(W*.42,H);c.quadraticCurveTo(W*.65,H*.91,W*.45,H*.79);c.quadraticCurveTo(W*.7,H*.9,W*.67,H);},'#b5a09233');
 for(let i=0;i<42;i++){let x=(i*89.7)%W,y=H*.9+(i%4)*H*.028;flower(x,y,.45+(i%3)*.2,i%2?'#b9a4d4':'#d89db7')}
 for(let side of [0,1]){ctx.save();ctx.translate(side?W:0,H);ctx.scale(side?-1:1,1);for(let i=0;i<8;i++){let x=i*15;path(c=>{c.moveTo(x,0);c.quadraticCurveTo(x+8,-70-i*7,x-15,-112-i*4);c.quadraticCurveTo(x+35,-70,x+12,0)},i%2?'#273e49':'#294853')}ctx.restore()}
 if(!reduced)for(let i=0;i<12;i++){let x=(i*113+Math.sin(time*.4+i)*15)%W,y=H*.5+(i*47)%(H*.42)+Math.sin(time+i)*5;ellipse(x,y,1.8,1.8,'#f1d39b');}
}
function resize(){const r=canvas.getBoundingClientRect();const oldW=W,oldH=H;W=r.width;H=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(player){player.x*=W/oldW;player.y*=H/oldH;dino.x*=W/oldW;makePlatforms();hearts.forEach(h=>{h.x*=W/oldW;h.y*=H/oldH})}}
new ResizeObserver(resize).observe(canvas);
function makePlatforms(){platforms=[{x:W*.25,y:H*.73,w:W*.2},{x:W*.53,y:H*.64,w:W*.19}];}
function reset(){player={x:W*.14,y:H*.87,vy:0,grounded:true,lives:CONFIG.lives,ammo:0,invulnerable:0};dino={x:W*.8,hits:0,flash:0};makePlatforms();hearts=[.22,.36,.5,.63].map((v,i)=>({x:W*v,y:H*.87-26,timer:0}));shots=[];particles=[];elapsed=0;cooldown=0;victoryTime=0;keys.clear();pointers.clear();learned={move:tutorialSeen,jump:tutorialSeen,collect:tutorialSeen,throw:tutorialSeen};updateHUD();}
function setState(next){state=next;for(const id of ['cover','intro','ending'])$(id).hidden=next!==id&&!(id==='ending'&&next==='final');$('dino-touch').hidden=next!=='cover';$('hud').hidden=!['playing','pause','loss','victory'].includes(next);$('controls').hidden=!['playing','pause'].includes(next);$('hint').hidden=next!=='playing';$('stage').classList.toggle('playing',['playing','pause','loss','victory'].includes(next));if(next!=='playing'){keys.clear();pointers.clear();} }
function play(){if($('modal').open)$('modal').close();setState('playing');resize();reset();canvas.focus();}
function updateHUD(){$('lives').textContent='♥ '.repeat(player.lives)+' · '+player.lives+' vidas';$('ammo').textContent='♡ '+player.ammo;$('hits').textContent=dino.hits+' / '+CONFIG.hits;$('resistance').value=CONFIG.hits-dino.hits;$('resistance').max=CONFIG.hits;}
function unlockSound(){if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audio=new Audio()}if(audio?.state==='suspended')audio.resume().catch(()=>{});}
function sound(type){if(muted||!audio||audio.state!=='running')return;const frequencies={collect:660,throw:440,hit:880,hurt:180,win:1046};const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(frequencies[type],audio.currentTime);osc.frequency.exponentialRampToValueAtTime(frequencies[type]*1.4,audio.currentTime+.15);gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.31);osc.onended=()=>{osc.disconnect();gain.disconnect()};}
function burst(x,y,n=10){for(let i=0;i<n&&particles.length<65;i++)particles.push({x,y,vx:(Math.random()-.5)*100,vy:-30-Math.random()*80,life:1.2,size:5+Math.random()*7});}
function toast(message){$('toast').textContent=message;toastTime=2.5;$('toast').classList.add('visible');}
function action(type){if(state!=='playing')return;if(type==='jump'&&player.grounded){player.vy=-Math.min(430,H*.88);player.grounded=false;learned.jump=true;}if(type==='throw'&&cooldown<=0){if(player.ammo<=0){toast('Recoge un corazón brillante primero ♡');return;}player.ammo--;cooldown=1;shots.push({x:player.x+10,y:player.y-43,life:4});learned.throw=true;sound('throw');updateHUD();}}
function hurt(){if(player.invulnerable>0||state!=='playing')return;player.lives--;player.invulnerable=2.4;player.x=Math.max(25,player.x-45);player.vy=-170;player.grounded=false;sound('hurt');burst(player.x,player.y-30,5);updateHUD();if(player.lives<=0){setState('loss');showDialog('loss');}else toast('¡Ups! Tienes un momento de protección.');}
function hit(){if(state!=='playing')return;dino.hits++;dino.flash=.65;burst(dino.x,H*.87-55);sound('hit');updateHUD();if(dino.hits>=CONFIG.hits){shots=[];setState('victory');victoryTime=0;sound('win');toast('No era feroz… ¡solo un poquito tímido!');}else if(dino.hits%2===0)toast(CONFIG.reactions[(dino.hits/2-1)%CONFIG.reactions.length]);}
function showDialog(id){for(const part of ['tutorial','pause-panel','loss'])$(part).hidden=part!==id;if(!$('modal').open)$('modal').showModal();}
function pause(){if(state==='playing'){setState('pause');countdown=0;$('pause-title').textContent='Tu aventura te espera';$('resume').hidden=false;showDialog('pause-panel');}}
function resume(){if(state!=='pause'||countdown)return;countdown=3;$('resume').hidden=true;$('pause-title').textContent='3';}
function update(dt){time+=dt;coverHop=Math.max(0,coverHop-dt);toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');
 if(state==='intro'){introTime+=dt;const index=Math.min(3,Math.floor(introTime/3));if(index!==introIndex){introIndex=index;$('intro-text').textContent=CONFIG.intro[index];$('intro-dots').textContent=[0,1,2,3].map(i=>i===index?'●':'○').join(' ');$('ready').hidden=index!==3;if(index===2)burst(W*.76,H*.8-65,18);}}
 if(state==='pause'&&countdown>0&&!document.hidden){countdown-=dt;$('pause-title').textContent=String(Math.max(1,Math.ceil(countdown)));if(countdown<=0){$('modal').close();setState('playing');}}
 if(state==='playing'){
 elapsed+=dt;cooldown-=dt;player.invulnerable=Math.max(0,player.invulnerable-dt);dino.flash=Math.max(0,dino.flash-dt);
 let left=keys.has('left')||[...pointers.values()].includes('left'),right=keys.has('right')||[...pointers.values()].includes('right');let dx=Number(right)-Number(left);if(dx){player.x+=dx*Math.max(105,W*.2)*dt;learned.move=true;}player.x=Math.max(22,Math.min(W-28,player.x));
 let oldY=player.y;player.vy+=Math.min(1100,H*2)*dt;player.y+=player.vy*dt;player.grounded=false;let floor=H*.87;for(const p of platforms)if(player.x>p.x-8&&player.x<p.x+p.w+8&&oldY<=p.y+2&&player.y>=p.y&&player.vy>=0)floor=Math.min(floor,p.y);if(player.y>=floor){player.y=floor;player.vy=0;player.grounded=true;}
 dino.x=W*(.79+Math.sin(elapsed*.5)*.1);
 for(const h of hearts){if(h.timer>0)h.timer=Math.max(0,h.timer-dt);else if(Math.hypot(h.x-player.x,h.y-(player.y-27))<32){h.timer=10;player.ammo++;learned.collect=true;sound('collect');burst(h.x,h.y,5);updateHUD();}}
 for(const shot of shots){let dx=dino.x-shot.x,dy=H*.87-48-shot.y,dist=Math.hypot(dx,dy);let speed=Math.max(220,W*.55);if(dist<speed*dt+22){shot.life=0;hit();if(state!=='playing')break;}else{shot.x+=dx/dist*speed*dt;shot.y+=dy/dist*speed*dt;shot.life-=dt;}}
 shots=shots.filter(s=>s.life>0);
 if(Math.abs(player.x-dino.x)<(W<600?32:50)&&Math.abs(player.y-H*.87)<45)hurt();
 let hint=!learned.move?'Muévete con ← → o A / D':!learned.collect?'Acércate a un corazón brillante para recogerlo':!learned.jump?'Prueba un salto: ↑ o Espacio':!learned.throw?'Lanza un corazón con F o el botón ♡':player.ammo===0?'Los corazones vuelven a crecer. ¡Recoge más!':'Ocho corazones, una sorpresa. Vas muy bien ♡';$('hint').textContent=hint;if(Object.values(learned).every(Boolean))tutorialSeen=true;
 }
 if(state==='victory'){victoryTime+=dt;if(!reduced&&Math.random()<dt*16)burst(Math.random()*W,H*.25,2);if(victoryTime>=5){setState('final');$('envelope-area').hidden=false;$('letter').hidden=true;$('envelope').classList.remove('open');$('envelope').disabled=false;$('envelope').focus();}}
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=80*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
}
function draw(){scenery();let game=['playing','pause','loss','victory'].includes(state);if(game&&player){for(const p of platforms){ctx.fillStyle='#79788b';ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,13,7);ctx.fill();ctx.fillStyle='#9ebaa5';ctx.fillRect(p.x+5,p.y,p.w-10,3);flower(p.x+14,p.y,.45,'#deb2d3');}for(const h of hearts)if(h.timer<=0){ellipse(h.x,h.y,20,20,'#f5b2cb12');heart(h.x,h.y+(reduced?0:Math.sin(time*3+h.x)*3),16);}
 let s=W<600?.65:.93;if(player.invulnerable<=0||Math.floor(time*9)%2===0)princess(player.x,player.y,s,state==='victory'?'wave':'idle');
 let ds=state==='victory'?Math.max(.48,1-victoryTime*.15):1;dinosaur(dino.x,H*.87,s*1.12*ds,state==='victory'?'flower':dino.flash>0?'hit':'idle');
 if(state==='victory'){ctx.globalAlpha=.25;ellipse(dino.x,H*.87-35,50+victoryTime*12,80,'#ffe4ab');ctx.globalAlpha=1;let t=Math.min(1,Math.max(0,(victoryTime-2)/2));let x=dino.x+(player.x-dino.x)*t;ctx.fillStyle='#ffe1dc';ctx.fillRect(x-13,H*.87-65,26,18);heart(x,H*.87-56,7);}
 shots.forEach(s=>{heart(s.x,s.y,16);star(s.x-12,s.y+3,4,'#f9d39a')});
 }else{let s=W<600?.9:1.35;let py=H*.88;princess(W*(W<600?.23:.29)+(state==='cover'&&!reduced?Math.max(0,1-time)*-60:0),py,s,state==='intro'&&introIndex===1?'heart':'wave');dinosaur(W*(W<600?.77:.77),py,s*(state==='final'?.75:1),state==='intro'?(introIndex===2?'sneeze':'envelope'):state==='final'?'flower':'idle');if(state==='intro'&&introIndex===1)heart(W*.35,py-90,26);if(state==='intro'&&introIndex===2)for(let i=0;i<5;i++)heart(W*.65-i*15,py-90-Math.sin(time*3+i)*20,10);}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/1.2);heart(p.x,p.y,p.size)}ctx.globalAlpha=1;
}
function frame(now){let dt=Math.min((now-last)/1000||0,.04);last=now;if(!document.hidden)update(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyF:'throw'};
document.addEventListener('keydown',e=>{if(e.code==='Escape'){if(state==='playing')pause();else if(state==='pause')resume();return;}const k=keyMap[e.code];if(!k||state!=='playing'||e.target.closest('button,a,iframe')&&e.code==='Space')return;e.preventDefault();unlockSound();keys.add(k);if(!e.repeat)action(k);});
document.addEventListener('keyup',e=>keys.delete(keyMap[e.code]));window.addEventListener('blur',()=>{keys.clear();pointers.clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(countdown>0){countdown=0;$('resume').hidden=false;$('pause-title').textContent='Tu aventura te espera';}}last=performance.now();});
for(const button of document.querySelectorAll('[data-control]')){button.addEventListener('pointerdown',e=>{e.preventDefault();unlockSound();button.setPointerCapture(e.pointerId);pointers.set(e.pointerId,button.dataset.control);action(button.dataset.control)});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>pointers.delete(e.pointerId));button.addEventListener('click',e=>{if(e.detail===0)action(button.dataset.control)});}
$('start').onclick=()=>{unlockSound();musicRequested=true;if(musicReady)youtube.playVideo();setState('intro');introTime=0;introIndex=-1;update(0);};$('how').onclick=()=>{setState('tutorial');showDialog('tutorial');};$('close-tutorial').onclick=()=>{$('modal').close();setState('cover');$('how').focus();};$('modal').addEventListener('cancel',e=>{e.preventDefault();if(state==='tutorial')$('close-tutorial').click();else if(state==='pause')resume();});
$('skip').onclick=play;$('ready').onclick=play;$('retry').onclick=play;$('replay').onclick=play;$('pause').onclick=pause;$('resume').onclick=resume;
$('dino-touch').onclick=()=>{unlockSound();toast('¡Todavía no empieza! 🦖');burst(W*.77,H*.78,10);coverHop=.6;};
$('sound').onclick=()=>{muted=!muted;if(!muted)unlockSound();$('sound').textContent='♫ Efectos: '+(muted?'no':'sí');$('sound').setAttribute('aria-pressed',String(muted));};
$('envelope').onclick=()=>{$('envelope').classList.add('open');$('envelope').disabled=true;sound('collect');setTimeout(()=>{if(state!=='final')return;$('envelope-area').hidden=true;$('letter').hidden=false;$('more').hidden=false;$('invitation').hidden=true;$('more').focus();},reduced?0:650);};$('more').onclick=()=>{$('invitation').hidden=false;$('more').hidden=true;$('invitation').scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'});};
for(const [id,key] of [['player-name','name'],['recipient','name'],['signature','signature'],['dedication','dedication'],['message','message'],['invitation','invitation']])$(id).textContent=CONFIG[key];
// Un único reproductor: no se vuelve a crear ni se reinicia entre partidas.
$('youtube-link').href='https://www.youtube.com/watch?v='+encodeURIComponent(CONFIG.videoId);
function musicFailure(){$('music-status').textContent='No se pudo reproducir aquí. Puedes usar «Escuchar en YouTube» o continuar sin música.';}
window.onYouTubeIframeAPIReady=()=>{youtube=new YT.Player('player',{width:480,height:270,videoId:CONFIG.videoId,playerVars:{playsinline:1,controls:1,loop:1,playlist:CONFIG.videoId,origin:location.origin},events:{onReady:e=>{musicReady=true;e.target.setVolume(25);e.target.getIframe().title='La música de esta aventura';if(musicRequested)e.target.playVideo();},onStateChange:e=>{if(e.data===1)$('music-status').textContent='La banda sonora está sonando. Ajusta el volumen o pausa con los controles de YouTube.';},onAutoplayBlocked:()=>{$('music-status').textContent='Pulsa reproducir en el reproductor para iniciar la música. La aventura puede continuar.';},onError:musicFailure}});};
const api=document.createElement('script');api.src='https://www.youtube.com/iframe_api';api.onerror=musicFailure;document.head.append(api);setTimeout(()=>{if(!musicReady)musicFailure();},12000);
