export const LIB=[
{name:"Leg press",g:"inferiores",equip:"maquina",requiresAny:[["maquina"],["legpress"]],stab:3,lum:1,knee:2,complex:1},
{name:"Hack squat",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:2,complex:2},
{name:"Agachamento livre",g:"inferiores",equip:"barra",stab:1,lum:3,knee:2,complex:3},
{name:"Agachamento goblet",g:"inferiores",equip:"halter",stab:2,lum:2,knee:2,complex:2},
{name:"Cadeira extensora",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:2,complex:1},
{name:"Mesa flexora",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:1,complex:1},
{name:"Cadeira flexora",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:1,complex:1},
{name:"Hip thrust",g:"inferiores",equip:"barra",requiresAny:[["barra","banco"]],stab:2,lum:1,knee:1,complex:2},
{name:"Elevação pélvica máquina",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:1,complex:1},
{name:"Panturrilha máquina",g:"inferiores",equip:"maquina",stab:3,lum:1,knee:1,complex:1},
{name:"Chest press",g:"superiores",equip:"maquina",stab:3,lum:1,knee:0,complex:1},
{name:"Supino reto barra",g:"superiores",equip:"barra",requiresAny:[["barra","banco"]],stab:2,lum:1,knee:0,complex:2},
{name:"Supino halteres",g:"superiores",equip:"halter",requiresAny:[["halter","banco"]],stab:2,lum:1,knee:0,complex:2},
{name:"Puxada frontal",g:"superiores",equip:"cabo",stab:3,lum:1,knee:0,complex:1},
{name:"Puxada neutra",g:"superiores",equip:"cabo",stab:3,lum:1,knee:0,complex:1},
{name:"Remada apoiada",g:"superiores",equip:"maquina",stab:3,lum:1,knee:0,complex:1},
{name:"Remada sentada",g:"superiores",equip:"cabo",stab:3,lum:1,knee:0,complex:1},
{name:"Remada curvada",g:"superiores",equip:"barra",stab:1,lum:3,knee:0,complex:3},
{name:"Desenvolvimento máquina",g:"superiores",equip:"maquina",stab:3,lum:1,knee:0,complex:1},
{name:"Desenvolvimento halteres",g:"superiores",equip:"halter",stab:2,lum:2,knee:0,complex:2},
{name:"Elevação lateral",g:"superiores",equip:"halter",stab:2,lum:1,knee:0,complex:1},
{name:"Rosca direta",g:"superiores",equip:"barra",stab:2,lum:1,knee:0,complex:1},
{name:"Tríceps corda",g:"superiores",equip:"cabo",stab:3,lum:1,knee:0,complex:1},
{name:"Agachamento ao banco",g:"inferiores",equip:"corpo",requiresAny:[["banco"]],stab:3,lum:1,knee:1,complex:1},
{name:"Afundo assistido",g:"inferiores",equip:"corpo",stab:2,lum:1,knee:2,complex:2},
{name:"Flexão de braços",g:"superiores",equip:"corpo",stab:2,lum:1,knee:0,complex:2},
{name:"Flexão inclinada",g:"superiores",equip:"corpo",requiresAny:[["banco"]],stab:3,lum:1,knee:0,complex:1},
{name:"Dead bug",g:"core",equip:"corpo",stab:3,lum:1,knee:0,complex:1},
{name:"Pallof press",g:"core",equip:"cabo",stab:3,lum:1,knee:0,complex:1},
{name:"Prancha",g:"core",equip:"corpo",stab:2,lum:2,knee:0,complex:1},
{name:"Bird dog",g:"core",equip:"corpo",stab:3,lum:1,knee:0,complex:1}
];

export function requirements(ex,equipment=[]) {
  return (ex.requiresAny||[[ex.equip]]).find(group=>group.every(x=>equipment.includes(x))) || (ex.requiresAny||[[ex.equip]])[0];
}
export function eligible(ex,equipment=[]) {
  return (ex.requiresAny||[[ex.equip]]).some(group=>group.every(x=>equipment.includes(x)));
}
export function keyFor(name){return name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_$/,'');}
export function score(ex,p,feedback=[]){
let s=10;
if(p.level==="iniciante"){s+=ex.stab; s-=ex.complex;}
if(p.level==="avancado") s+=ex.complex*.6;
if(p.priority===ex.g) s+=3;
if(p.style==="rapido" && ex.stab===3) s+=1.5;
if(p.age>=60){s+=ex.stab*1.2; s-=ex.complex*.6;}
if(p.plan==="plus"){
 if(p.discomfort==="lombar") s-=ex.lum*2.2;
 if(p.discomfort==="joelho") s-=ex.knee*2.2;
 if(p.avoid && ex.name.toLowerCase().includes(p.avoid.toLowerCase())) s-=30;
}
for(const f of feedback){
 if(f.exercise && f.exercise.toLowerCase()===ex.name.toLowerCase() && f.pain) s-=30;
}
return s;
}

export function quotas(p){
if(p.priority==="inferiores") return {inferiores:3,superiores:2,core:1};
if(p.priority==="superiores") return {inferiores:2,superiores:3,core:1};
return {inferiores:2,superiores:3,core:1};
}

export function makeSession(p,offset=0,feedback=[]){
let out=[];
for(const [g,c] of Object.entries(quotas(p))){
 let a=LIB.filter(x=>x.g===g && eligible(x,p.equipment)).sort((a,b)=>score(b,p,feedback)-score(a,p,feedback));
 for(let i=0;i<Math.min(c,a.length);i++) out.push(a[(i+offset)%a.length]);
}
return out;
}

export function decideProgress(ex,difficulty,painExercise,previous=null){
  const valid=ex.sets.filter(x=>x.reps>0);
  const avgReps=valid.length?valid.reduce((a,b)=>a+b.reps,0)/valid.length:0;
  const avgLoad=valid.length?valid.reduce((a,b)=>a+b.load,0)/valid.length:0;
  const prev=previous;
  if(painExercise && ex.name.toLowerCase()===painExercise.toLowerCase()) return {nextHint:"Trocar no próximo treino",label:"Troca"};
  if(difficulty==="pesado") return {nextHint:"Manter ou reduzir levemente",label:"="};
  if(prev){
    const improvedLoad=avgLoad>prev.avgLoad;
    const improvedReps=avgReps>prev.avgReps;
    if(difficulty==="leve" && (improvedLoad || improvedReps) && avgReps>=10){
      return {nextHint:avgLoad>0?`Subir levemente acima de ${avgLoad.toFixed(1)} kg`:"Aumentar desafio",label:"↑"};
    }
    if(avgLoad<prev.avgLoad*0.9 || avgReps<prev.avgReps-2){
      return {nextHint:"Manter ou reduzir e consolidar",label:"↓"};
    }
    return {nextHint:"Manter e consolidar",label:"="};
  }
  if(difficulty==="leve" && avgReps>=10) return {nextHint:avgLoad>0?`Subir levemente acima de ${avgLoad.toFixed(1)} kg`:"Aumentar desafio",label:"↑"};
  if(avgReps>=8) return {nextHint:"Manter e consolidar",label:"="};
  return {nextHint:"Reduzir exigência e consolidar técnica",label:"↓"};
}

export function generatePlan(profile,feedback=[],offset=0){
 const rejected=LIB.filter(x=>!eligible(x,profile.equipment));
 const days=Array.from({length:profile.days},(_,index)=>({index,exercises:makeSession(profile,index+offset,feedback).map((x,position)=>({key:keyFor(x.name),name:x.name,g:x.g,requires:requirements(x,profile.equipment),position,sets:3,repMin:8,repMax:12}))}));
 if(days.some(d=>!d.exercises.length)) throw new Error('NO_ELIGIBLE_EXERCISES');
 return {input:profile,days,decisions:[
  {rule:'equipment_required',condition:{available:profile.equipment},decision:{excluded:rejected.map(x=>x.name)},reason:'Equipamento ausente exclui o exercício antes da pontuação.',alternative:null},
  {rule:'muscle_priority',condition:{priority:profile.priority,level:profile.level,style:profile.style,age:profile.age},decision:{quotas:quotas(profile)},reason:'Preferência e experiência ordenam somente os exercícios elegíveis; idade mantém o prior leve do beta.',alternative:null},
  {rule:'available_catalogue',condition:{requested:quotas(profile)},decision:{counts:days.map(d=>d.exercises.length)},reason:'Catálogo limitado reduz a sessão sem repetir exercícios nem introduzir equipamento ausente.',alternative:{action:'review_equipment'}},
  {rule:'individual_feedback',condition:{previous_feedback_count:feedback.length,cycle_offset:offset},decision:{applied:feedback.length>0},reason:'Histórico real e desconfortos relatados têm prioridade sobre a seleção inicial.',alternative:null}
 ]};
}
