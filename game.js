(() => {
  'use strict';
  const KEY = 'kevins-cookie-shop-v1';
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const forecasts = [
    {title:'A good day for cookies', text:'Steady foot traffic. A classic day at the shop.', factor:1, icon:'☀'},
    {title:'Rain on the window', text:'A quieter street today. Plan a smaller, cozy batch.', factor:.75, icon:'☂'},
    {title:'The neighborhood is buzzing', text:'More people out and about. Expect a little extra demand.', factor:1.25, icon:'✦'},
    {title:'A sweet weekend ahead', text:'Weekend wanderers are looking for a treat.', factor:1.4, icon:'☀'},
    {title:'A slow and peaceful day', text:'Fewer passersby. Watch your costs today.', factor:.85, icon:'☁'}
  ];
  const fresh = () => ({cash:100, history:[], forecast:0});
  let state = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Number.isFinite(saved.cash) && saved.cash >= 0 && Array.isArray(saved.history) && saved.history.length <= 30 && Number.isInteger(saved.forecast) && forecasts[saved.forecast] && saved.history.every(r => ['day','baked','sold','price','revenue','expenses','profit','cash','ads'].every(k => Number.isFinite(r[k])))) state = saved;
  } catch (_) { /* Storage may be unavailable in private or file browsing. */ }
  const save = () => { try {localStorage.setItem(KEY, JSON.stringify(state));} catch (_) {$('strategy-tip').textContent = 'Browser storage is unavailable. Keep this tab open to retain your game.';} };
  const isOver = () => state.history.length >= 30 || state.cash < 5;
  let animationTimer, animationRunning = false;
  function finishAnimation(r) {
    clearTimeout(animationTimer);
    animationRunning = false;
    $('customers').replaceChildren();
    $('skip-animation').hidden = true;
    $('scene-sales').textContent = `${r.sold} cookies sold`;
    $('scene-status').textContent = r.sold ? `Day ${r.day}: thanks for stopping by!` : `Day ${r.day}: a quiet day at the shop.`;
    $('scene-caption').textContent = r.sold ? `${money(r.revenue)} in sweet sales. See you tomorrow!` : 'No cookie purchases today. Try adjusting your next batch or price.';
    $('shop-open-sign').textContent = 'CLOSED';
    updateCost();
  }
  function animateCustomers(r) {
    clearTimeout(animationTimer);
    $('customers').replaceChildren();
    $('scene-sales').textContent = '0 cookies sold';
    $('scene-status').textContent = `Day ${r.day}: the shop is open!`;
    $('shop-open-sign').textContent = 'OPEN';
    $('scene-caption').textContent = 'Here come the cookie lovers…';
    $('skip-animation').hidden = false;
    $('skip-animation').onclick = () => finishAnimation(r);
    // Each visitor represents one purchase or a small group on busier days.
    const count = Math.min(r.sold, 18);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) { finishAnimation(r); return; }
    const gap = 180, duration = 2700;
    let soldSoFar = 0, settled = 0;
    const colors = ['#729984', '#d79568', '#8b8caf', '#c5a953', '#bd7d84'];
    const skins = ['#e9b688', '#9c674a', '#c48a61', '#f0c9a7'];
    for (let i = 0; i < count; i++) {
      const group = Math.floor((i + 1) * r.sold / count) - Math.floor(i * r.sold / count);
      const customer = document.createElement('div');
      customer.className = 'customer';
      customer.style.setProperty('--delay', `${i * gap}ms`);
      customer.style.setProperty('--shirt', colors[i % colors.length]);
      customer.style.setProperty('--skin', skins[i % skins.length]);
      customer.innerHTML = `<div class="customer-bob"><div class="customer-head"></div><div class="customer-body"></div><div class="customer-legs"></div><span class="customer-cookie">🍪</span><span class="purchase-pop">+${group} 🍪</span></div>`;
      // CSS emits the purchase moment, so counters stay in sync with the scene.
      customer.addEventListener('animationend', event => {
        if (event.animationName !== 'purchase-pop' || !animationRunning) return;
        soldSoFar += group;
        settled++;
        $('scene-sales').textContent = `${soldSoFar} cookies sold`;
        $('scene-caption').textContent = `${settled} happy ${settled === 1 ? 'visitor' : 'visitors'}${r.sold > count ? ' · each represents a few cookie lovers' : ''}`;
      });
      $('customers').append(customer);
    }
    if (!count) $('scene-caption').textContent = 'No purchases today. Even a little shop has quiet days.';
    animationTimer = setTimeout(() => finishAnimation(r), count ? (count - 1) * gap + duration : 1600);
    $('scene-status').closest('.shop-scene').scrollIntoView({behavior:'smooth', block:'center'});
  }
  function values() {return {baked:Number($('quantity').value), price:Number($('price').value), ads:Number($('advertising').value)};}
  function updateCost() {
    const v=values(), cost=round(v.baked*.5+v.ads+5);
    $('ingredient-cost').textContent=money(v.baked*.5);
    $('ad-cost').textContent=money(v.ads);
    $('investment').textContent=money(cost);
    const valid = $('plan-form').checkValidity() && Number.isInteger(v.baked) && Number.isFinite(cost) && cost<=state.cash;
    $('form-error').textContent=cost>state.cash ? `That's ${money(cost-state.cash)} over your budget. Reduce your batch or advertising.` : '';
    $('bake').disabled=!valid || isOver() || animationRunning;
  }
  function showResult(r) {
    $('result-heading').textContent=`Day ${r.day}: that's a wrap.`;
    $('results').innerHTML=`<div class="result-summary"><div class="eyebrow">TODAY'S NET ${r.profit>=0?'PROFIT':'LOSS'}</div><div class="result-profit ${r.profit>=0?'positive':'negative'}">${r.profit>0?'+':''}${money(r.profit)}</div><p>${r.sold===r.baked && r.baked>0?'Sold out. A delicious day at the shop!':r.profit>=0?'Another day, another step toward your empire.':'Every batch is a lesson. Adjust your recipe tomorrow.'}</p></div><div class="result-metrics"><div><span>Cookies sold</span><strong>${r.sold} <small>/ ${r.baked} baked</small></strong></div><div><span>Revenue</span><strong>${money(r.revenue)}</strong></div><div><span>Total expenses</span><strong>${money(r.expenses)}</strong></div><div><span>Cash remaining</span><strong>${money(r.cash)}</strong></div></div><div class="result-note">${r.baked-r.sold} unsold cookies discarded. Expenses include ${money(r.baked*.5)} in ingredients, ${money(r.ads)} in advertising, and $5.00 in shop costs.</div>`;
  }
  function render() {
    const count=state.history.length, over=isOver();
    $('cash').textContent=money(state.cash);
    const profit=round(state.cash-100);
    $('total-profit').textContent=(profit>0?'+':'')+money(profit);
    $('total-profit').className=profit<0?'negative':'';
    $('total-sold').textContent=state.history.reduce((a,r)=>a+r.sold,0).toLocaleString();
    $('day-label').textContent=over?'Your journey':`Day ${count+1} of 30`;
    $('days-left').textContent=over?'Shop closed':count===0?'Opening day':`${30-count} days to go`;
    $('progress-fill').style.width=`${count/30*100}%`;
    $('day-badge').textContent=over?'COMPLETE':`DAY ${String(count+1).padStart(2,'0')}`;
    const f=forecasts[state.forecast];
    $('forecast-title').textContent=f.title; $('forecast-text').textContent=f.text;
    document.querySelector('.forecast-icon').textContent=f.icon;
    $('ledger-count').textContent=`${count} ${count===1?'day':'days'} completed`;
    if(count){
      $('ledger-body').innerHTML=state.history.slice().reverse().map(r=>`<tr><td>${String(r.day).padStart(2,'0')}</td><td>${r.baked} / ${r.sold}</td><td>${money(r.price)}</td><td>${money(r.revenue)}</td><td>${money(r.expenses)}</td><td class="${r.profit>=0?'positive':'negative'}">${r.profit>0?'+':''}${money(r.profit)}</td><td>${money(r.cash)}</td></tr>`).join('');
      showResult(state.history[count-1]);
    }
    $('plan-title').textContent=count?'A new day. A fresh batch.':"Let's open up shop.";
    $('plan-form').hidden=over;
    if(over){
      $('plan-title').textContent=count===30?'Thirty days. Well baked.':'Time to close the shop.';
      $('forecast-title').textContent=count===30?'Your 30-day challenge is complete':'The till needs a fresh start';
      $('forecast-text').textContent=count===30?'Take a moment to admire what you built.':'You have less than $5 left for daily shop costs.';
      let finish=document.createElement('div');finish.id='finish';finish.className='finish';
      const title=state.cash>=500?'A neighborhood legend.':state.cash>=200?'One smart cookie.':state.cash>=100?'A promising little bakery.':'A little wiser. A little sweeter.';
      finish.innerHTML=`<div class="eyebrow">${count===30?'CHALLENGE COMPLETE':'SHOP CLOSED EARLY'}</div><h3>${title}</h3><p>You ran the shop for ${count} ${count===1?'day':'days'} and sold ${state.history.reduce((a,r)=>a+r.sold,0).toLocaleString()} cookies. ${count===30?'Your final balance is in.':'Try a smaller batch and a balanced price next time.'}</p><div class="finish-stat"><span>Final cash</span><strong>${money(state.cash)}</strong><p>Started with $100.00 · Net ${profit>=0?'profit':'loss'}: ${money(Math.abs(profit))}</p></div><button class="primary-button" id="play-again">Bake a new beginning <span>↗</span></button>`;
      $('finish')?.remove();$('plan-form').after(finish);$('play-again').addEventListener('click',()=>$('restart-dialog').showModal());
    }
    updateCost();
  }
  $('plan-form').addEventListener('input',updateCost);
  $('plan-form').addEventListener('submit',event=>{
    event.preventDefault();updateCost();if($('bake').disabled)return;
    const v=values(), expenses=round(v.baked*.5+v.ads+5);
    // Price-sensitive demand, diminishing advertising returns, and modest daily variation.
    const traffic=(55+24*Math.sqrt(v.ads))*forecasts[state.forecast].factor;
    const demand=Math.max(0,Math.round(traffic*Math.exp(-.65*(v.price-1.5))*(.85+Math.random()*.3)));
    const sold=Math.min(v.baked,demand),revenue=round(sold*v.price),profit=round(revenue-expenses);
    state.cash=round(state.cash+profit);
    state.history.push({day:state.history.length+1,...v,sold,revenue,expenses,profit,cash:state.cash});
    state.forecast=Math.floor(Math.random()*forecasts.length);
    animationRunning=true;save();render();animateCustomers(state.history[state.history.length-1]);
  });
  $('restart').addEventListener('click',()=>$('restart-dialog').showModal());
  $('cancel-restart').addEventListener('click',()=>$('restart-dialog').close());
  $('confirm-restart').addEventListener('click',()=>{state=fresh();save();location.reload();});
  render();
  if (state.history.length) finishAnimation(state.history[state.history.length-1]);
})();
