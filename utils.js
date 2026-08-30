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

/* 기록 항목 이름을 한곳에서 관리합니다. 화면·통계·PDF가 모두 이 목록을 사용합니다. */
window.Labels={
  activities:{golf:'골프',motorcycle:'오토바이'},
  childcare:{dropoff:'등원',pickup:'하원',bath:'씻기',bedtime:'아기 재우기'},
  chores:{dishesAm:'설거지 · 오전',dishesPm:'설거지 · 오후',vacuum:'청소기',laundry:'빨래',recycling:'분리수거',bathroom:'화장실 청소'},
  choreGroups:[{label:'매일',keys:['dishesAm','dishesPm','vacuum','laundry']},{label:'필요할 때',keys:['recycling','bathroom']}],
  people:['나','남편','같이']
};

/* 외출(골프·오토바이) 한 건의 시간 상태를 다룹니다.
   나간 시간과 들어온 시간은 서로 독립이고, 둘 다 몰라도 외출한 사실은 남습니다.
   startMode: time(시간 입력) | unknown(모름)
   endMode:   time(시간 입력) | unknown(모름) | out(아직 외출 중)            */
window.Outing=(()=>{
  const START_MODES={time:'직접 입력',unknown:'모름'};
  const END_MODES={time:'직접 입력',unknown:'모름',out:'아직 외출 중'};
  /* 예전 버전이 저장한 {start,end}만 있는 기록도 그대로 읽히도록 변환합니다. */
  function normalize(entry){
    const src=entry&&typeof entry==='object'?entry:{};
    const start=typeof src.start==='string'?src.start:'';
    const end=typeof src.end==='string'?src.end:'';
    let startMode=START_MODES[src.startMode]?src.startMode:(start?'time':'unknown');
    let endMode=END_MODES[src.endMode]?src.endMode:(end?'time':'unknown');
    if(startMode==='time'&&!start)startMode='unknown';
    if(endMode==='time'&&!end)endMode='unknown';
    return{id:src.id||Utils.uid(),startMode,start:startMode==='time'?start:'',endMode,end:endMode==='time'?end:''};
  }
  const startText=e=>e.startMode==='time'&&e.start?`${e.start} 출발`:'나간 시간 모름';
  const endText=e=>e.endMode==='out'?'아직 외출 중':e.endMode==='time'&&e.end?`${e.end} 귀가`:'들어온 시간 모름';
  const describe=entry=>{const e=normalize(entry);return `${startText(e)} · ${endText(e)}`};
  const describeList=(list)=>(Array.isArray(list)?list:[]).map(describe);
  return{START_MODES,END_MODES,normalize,describe,describeList,startText,endText};
})();
