// Dependency-free checks for the economy, input limits, persistence and endings.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync('game.js','utf8');
function game(saved, random=.5){
  const elements=new Map();
  function el(id){
    if(!elements.has(id)) elements.set(id,{value:'',textContent:'',innerHTML:'',style:{setProperty(){}},listeners:{},children:[],hidden:false,disabled:false,addEventListener(e,fn){this.listeners[e]=fn;},append(child){this.children.push(child);},replaceChildren(){this.children=[];},closest(){return {scrollIntoView(){}};},after(){},remove(){},showModal(){},close(){}});
    return elements.get(id);
  }
  el('quantity').value='60';el('price').value='2';el('advertising').value='10';
  el('plan-form').checkValidity=()=>{
    const q=+el('quantity').value,p=+el('price').value,a=+el('advertising').value;
    return q>=0&&q<=10000&&Number.isInteger(q)&&p>=.25&&p<=20&&a>=0&&a<=1000000;
  };
  let stored=saved?JSON.stringify(saved):null;
  let timer, created=0;
  vm.runInNewContext(source,{document:{getElementById:el,querySelector:()=>el('icon'),createElement:()=>el(`created-${created++}`)},window:{matchMedia:()=>({matches:false})},setTimeout(fn){timer=fn;},clearTimeout(){timer=null;},localStorage:{getItem:()=>stored,setItem:(_,v)=>stored=v},location:{reload(){}},Intl,Number,Math:Object.assign(Object.create(Math),{random:()=>random})});
  return {el,choose(id){el('variety').value=id;el('variety').listeners.change();},play(finish=true){el('plan-form').listeners.submit({preventDefault(){}});if(finish)timer?.();},input(q,p,a){el('quantity').value=String(q);el('price').value=String(p);el('advertising').value=String(a);el('plan-form').listeners.input();},state:()=>JSON.parse(stored)};
}
let g=game();
assert.equal(g.el('cash').textContent,'$100.00');
g.input(200,2,10);assert.equal(g.el('bake').disabled,true);g.play();assert.equal(g.el('cash').textContent,'$100.00');
g.input(1.5,2,0);assert.equal(g.el('bake').disabled,true);
g.input(-1,2,0);assert.equal(g.el('bake').disabled,true);
g.input(60,2,10);g.play();
let s=g.state();assert.equal(s.history[0].sold,60);assert.equal(s.history[0].revenue,120);assert.equal(s.history[0].expenses,45);assert.equal(s.cash,175);
let restored=game(s);assert.equal(restored.el('cash').textContent,'$175.00');assert.equal(restored.el('day-label').textContent,'Day 2 of 30');
for(let n=1;n<30;n++)g.play();
s=g.state();assert.equal(s.history.length,30);assert.equal(g.el('plan-form').hidden,true);g.play();assert.equal(g.state().history.length,30);
for(const r of s.history){assert.ok(r.sold<=r.baked);assert.equal(r.profit,Math.round((r.revenue-r.expenses)*100)/100);assert.ok(r.cash>=0);}
g=game();g.input(0,2,95);g.play();assert.equal(g.state().cash,0);assert.equal(g.el('plan-form').hidden,true);
g=game();g.input(190,20,0);g.play();assert.equal(g.state().history[0].sold,0);assert.equal(g.state().history[0].profit,-100);
console.log('PASS: budgets, invalid quantities, sales accounting, saved games, 30-day completion, oversupply, and bankruptcy.');
g=game();g.play(false);assert.equal(g.el('customers').children.length,18);assert.equal(g.el('bake').disabled,true);
g.play(false);assert.equal(g.state().history.length,1);
for(const child of g.el('customers').children)child.listeners.animationend({animationName:'purchase-pop'});
assert.equal(g.el('scene-sales').textContent,'60 cookies sold');
g.el('skip-animation').onclick();assert.equal(g.el('customers').children.length,0);assert.equal(g.el('bake').disabled,false);
g=game();g.input(3,2,0);g.play(false);assert.equal(g.el('customers').children.length,3);g.el('skip-animation').onclick();assert.equal(g.el('scene-sales').textContent,'3 cookies sold');
g=game();g.input(0,2,0);g.play();assert.equal(g.el('customers').children.length,0);assert.equal(g.el('scene-sales').textContent,'0 cookies sold');
console.log('PASS: visitor counts, grouped purchases, sale counter, duplicate-day prevention, skip, and zero-sale days.');
g=game();g.choose('oatmeal');assert.equal(g.el('price').value,'1.75');assert.equal(g.el('recipe-cost').textContent,'$0.35 / cookie');
g.input(60,1.8,10);assert.equal(g.el('ingredient-cost').textContent,'$21.00');g.play();
s=g.state();assert.equal(s.history[0].variety,'oatmeal');assert.equal(s.history[0].expenses,36);assert.equal(s.history[0].revenue,s.history[0].sold*1.8);assert.equal(s.cash,100+s.history[0].profit);
assert.match(g.el('results').innerHTML,/Oatmeal raisin/);assert.match(g.el('results').innerHTML,/\$21.00 in oatmeal raisin ingredients/);assert.match(g.el('ledger-body').innerHTML,/Oatmeal raisin/);
g.choose('double');assert.equal(g.el('price').value,'2.75');g.input(60,2.75,10);assert.equal(g.el('ingredient-cost').textContent,'$48.00');assert.equal(g.el('investment').textContent,'$63.00');
g.play(false);assert.equal(g.state().history[1].variety,'double');for(const child of g.el('customers').children)child.listeners.animationend({animationName:'purchase-pop'});assert.equal(g.el('scene-sales').textContent,`${g.state().history[1].sold} cookies sold`);g.el('skip-animation').onclick();
g.choose('oatmeal');assert.equal(g.el('price').value,'1.80');
restored=game(g.state());assert.equal(restored.el('variety').value,'oatmeal');assert.equal(restored.el('price').value,'1.80');
const legacy={cash:175,history:[{day:1,baked:60,sold:60,price:2,revenue:120,expenses:45,profit:75,cash:175,ads:10}],forecast:0};
g=game(legacy);assert.equal(g.el('cash').textContent,'$175.00');assert.equal(g.el('total-profit').textContent,'+$75.00');assert.match(g.el('results').innerHTML,/\$30.00 in chocolate chip ingredients/);assert.match(g.el('ledger-body').innerHTML,/Chocolate chip/);g.choose('double');g.input(20,2.75,0);g.play();assert.equal(g.state().history[0].revenue,120);assert.equal(g.state().history[1].expenses,21);
g=game();g.choose('double');g.input(120,2.75,0);assert.equal(g.el('bake').disabled,true);assert.match(g.el('form-error').textContent,/\$1.00 over/);
for(const [variety,price,expected] of [['classic',2,40],['oatmeal',1.75,36],['double',2.75,29]]){g=game();g.choose(variety);g.input(100,price,0);g.play();assert.equal(g.state().history[0].sold,expected);}
console.log('PASS: variety costs/prices, recipe-specific demand and reports, remembered pricing, aggregate animated sales, legacy migration, and premium-budget checks.');
