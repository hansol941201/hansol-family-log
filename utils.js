window.Utils={
  today:()=>new Date().toLocaleDateString('sv-SE'),
  nowTime:()=>new Date().toTimeString().slice(0,5),
  formatDate(date){const d=new Date(date+'T12:00:00');return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d)},
  escape(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))},
  uid:()=>crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(16).slice(2),
  bytes(n){return n<1048576?Math.round(n/1024)+' KB':(n/1048576).toFixed(1)+' MB'},
  toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)},
  debounce(fn,ms=400){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}},
  normalizeTime(value=''){const digits=String(value).replace(/\D/g,'').slice(0,4);if(digits.length<3)return String(value).trim();const h=Number(digits.slice(0,-2)),m=Number(digits.slice(-2));return h<24&&m<60?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`:''},
  /* 한국 시간 기준 토·일 여부. 날짜 문자열(YYYY-MM-DD) 자체의 요일을 보므로
     기기 시간대와 상관없이 같은 결과가 나옵니다. */
  isWeekendKST(date){const d=new Date(date+'T12:00:00Z').getUTCDay();return d===0||d===6}
};

/* 기록 항목 이름을 한곳에서 관리합니다. 화면·통계·PDF가 모두 이 목록을 사용합니다. */
window.Labels={
  activities:{golf:'골프',motorcycle:'오토바이'},
  childcare:{handoff:'아이 맡김',dropoff:'등원',pickup:'하원',daycarePrep:'등원 준비물·준비사항',breakfast:'아침밥',dinner:'저녁밥',bath:'씻기',bedtime:'아기 재우기'},
  chores:{dishesAm:'설거지 · 오전',dishesPm:'설거지 · 오후',vacuum:'청소기',wetMop:'물걸레',steamMop:'스팀걸레',toyClean:'아기 장난감 청소·소독',laundry:'빨래',beddingLaundry:'이불 빨래',carpetLaundry:'카페트 빨래',recycling:'분리수거',foodWaste:'음식물 쓰레기',bathroom:'화장실 청소'},
  choreGroups:[{label:'자주 하는 집안일',keys:['dishesAm','dishesPm','vacuum','laundry']},{label:'가끔 하는 청소',keys:['wetMop','steamMop','toyClean','beddingLaundry','carpetLaundry']},{label:'필요할 때',keys:['recycling','foodWaste','bathroom']}],
  icons:{dropoff:'🎒',pickup:'🏠',daycarePrep:'🧳',breakfast:'🥣',dinner:'🍚',bath:'🛁',bedtime:'🌙',handoff:'🤝',dishesAm:'🍽️',dishesPm:'🍽️',vacuum:'🧹',wetMop:'🫧',steamMop:'♨️',toyClean:'🧸',laundry:'👕',beddingLaundry:'🛏️',carpetLaundry:'🧺',recycling:'♻️',foodWaste:'🗑️',bathroom:'🚿'},
  iconFor(key){return this.icons[key]||'•'},
  people:['나','남편','같이'],
  /* 사람(나·남편·같이)이 아닌 다른 버튼을 쓰는 육아 항목만 여기에 적습니다. */
  childcareOptions:{handoff:['우리 언니','시댁','기타','안 맡김']},
  /* 버튼 글자가 길어 이름 아래에 한 줄로 펼쳐 그리는 항목 */
  wideChoiceRows:['daycarePrep','handoff','toyClean'],
  /* 한국 시간 기준 토·일에는 오늘 화면에서 감추는 육아 항목.
     이미 저장된 주말 기록은 지우지 않고 기록·통계·PDF에 그대로 남습니다. */
  weekdayOnlyChildcare:['dropoff','pickup'],
  /* 오늘 화면에서 그 항목이 보여줄 버튼 목록 */
  optionsFor(group,key){return group==='childcare'?(this.childcareOptions[key]||this.people):[...this.people,'안 함']},
  /* 월간 통계에서 막대로 나눠 보여줄 값 목록(집안일의 '안 함'은 기존대로 막대에 넣지 않습니다) */
  statOptionsFor(group,key){return group==='childcare'&&this.childcareOptions[key]?this.childcareOptions[key]:this.people}
};

window.BedtimeDetail={durations:{under5:'5분 미만',min5to10:'5~10분',min10to20:'10~20분',over20:'20분 이상',untilSleep:'잠들 때까지'},outcomes:{asleep:'잠듦',leftCrying:'울어도 나옴',switched:'교대함',other:'기타'},describe(value={}){return[this.durations[value.duration],this.outcomes[value.outcome]].filter(Boolean).join(' · ')}};

/* 골프·오토바이 외출은 오전/오후만 기록합니다.
   예전 시각 기록은 나간 시간을 기준으로 오전/오후로 변환해 계속 읽습니다. */
window.Outing=(()=>{
  const PERIODS={am:'오전',pm:'오후'};
  function normalize(entry){
    const src=entry&&typeof entry==='object'?entry:{};
    let period=PERIODS[src.period]?src.period:'';
    if(!period&&typeof src.start==='string'&&src.start){const hour=Number(src.start.split(':')[0]);if(Number.isFinite(hour))period=hour<12?'am':'pm'}
    return{id:src.id||Utils.uid(),period:period||'am'};
  }
  const describe=entry=>`${PERIODS[normalize(entry).period]}에 나감`;
  const describeList=(list)=>(Array.isArray(list)?list:[]).map(describe);
  return{PERIODS,normalize,describe,describeList};
})();

/* 혼자 육아 한 건의 시간 상태. 날짜 객체의 soloCare 배열에 저장합니다. */
window.SoloCare=(()=>{
  const PEOPLE={me:'나 혼자 육아',husband:'남편 혼자 육아'};
  const START_MODES={time:'직접 입력',unknown:'모름'};
  const END_MODES={time:'직접 입력',unknown:'모름',ongoing:'진행 중'};
  function normalize(entry){
    const src=entry&&typeof entry==='object'?entry:{};
    const person=PEOPLE[src.person]?src.person:'me',start=typeof src.start==='string'?src.start:'',end=typeof src.end==='string'?src.end:'';
    let startMode=START_MODES[src.startMode]?src.startMode:(start?'time':'unknown'),endMode=END_MODES[src.endMode]?src.endMode:(end?'time':'unknown');
    if(startMode==='time'&&!start)startMode='unknown';if(endMode==='time'&&!end)endMode='unknown';
    return{id:src.id||Utils.uid(),person,startMode,start:startMode==='time'?start:'',endMode,end:endMode==='time'?end:''};
  }
  function describe(entry){const e=normalize(entry),label=PEOPLE[e.person];if(e.startMode==='time'&&e.endMode==='time')return`${label} · ${e.start}~${e.end}`;if(e.startMode==='time'&&e.endMode==='ongoing')return`${label} · ${e.start}부터 진행 중`;if(e.startMode==='unknown'&&e.endMode==='time')return`${label} · 시작 시간 모름 · ${e.end} 종료`;if(e.startMode==='time'&&e.endMode==='unknown')return`${label} · ${e.start} 시작 · 종료 시간 모름`;if(e.endMode==='ongoing')return`${label} · 시작 시간 모름 · 진행 중`;return`${label} · 시간 모름`}
  function minutes(entry){const e=normalize(entry);if(e.startMode!=='time'||e.endMode!=='time')return null;const [sh,sm]=e.start.split(':').map(Number),[eh,em]=e.end.split(':').map(Number);let n=eh*60+em-(sh*60+sm);if(n<0)n+=1440;return n}
  function summarize(days,person){const records=[];for(const d of days)for(const e of d.soloCare||[])if(e.person===person)records.push({date:d.date,entry:e});const known=records.map(x=>minutes(x.entry)).filter(x=>x!==null);return{days:new Set(records.map(x=>x.date)).size,count:records.length,minutes:known.reduce((a,b)=>a+b,0),unknown:records.length-known.length}}
  function formatMinutes(n){return`${Math.floor(n/60)}시간 ${n%60}분`}
  return{PEOPLE,START_MODES,END_MODES,normalize,describe,minutes,summarize,formatMinutes};
})();
