window.Utils={
  today:()=>new Date().toLocaleDateString('sv-SE'),
  nowTime:()=>new Date().toTimeString().slice(0,5),
  formatDate(date){const d=new Date(date+'T12:00:00');return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d)},
  escape(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))},
  uid:()=>crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(16).slice(2),
  bytes(n){return n<1048576?Math.round(n/1024)+' KB':(n/1048576).toFixed(1)+' MB'},
  toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)},
  debounce(fn,ms=400){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
};
