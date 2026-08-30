window.DB=(()=>{const NAME='hansol-records',VERSION=1;let db;
  function open(){if(db)return Promise.resolve(db);return new Promise((res,rej)=>{const r=indexedDB.open(NAME,VERSION);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('days'))d.createObjectStore('days',{keyPath:'date'});if(!d.objectStoreNames.contains('files')){const s=d.createObjectStore('files',{keyPath:'id'});s.createIndex('date','date')}};r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error)})}
  async function store(name,mode='readonly'){return(await open()).transaction(name,mode).objectStore(name)}
  const request=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  /* 예전 버전이 저장한 기록도 최신 구조로 읽고 쓰도록 맞춰줍니다. 저장된 값은 지우지 않습니다. */
  function normalizeDay(day){
    if(!day||typeof day!=='object')return day;
    const stored=day.activities&&typeof day.activities==='object'?day.activities:{};
    const activities={};
    for(const key of new Set([...Object.keys(Labels.activities),...Object.keys(stored)]))activities[key]=(Array.isArray(stored[key])?stored[key]:[]).map(Outing.normalize);
    return{...day,activities,childcare:day.childcare&&typeof day.childcare==='object'?day.childcare:{},chores:day.chores&&typeof day.chores==='object'?day.chores:{},sleepTime:day.sleepTime||'',memo:day.memo||''};
  }
  function emptyDay(date){return normalizeDay({date,activities:{},childcare:{},sleepTime:'',chores:{},memo:''})}
  async function getDay(date){const found=await request((await store('days')).get(date));return found?normalizeDay(found):emptyDay(date)}
  async function saveDay(day){const normalized=normalizeDay(day);await request((await store('days','readwrite')).put(normalized));return normalized}
  async function getDays(start,end){const all=await request((await store('days')).getAll());return all.filter(x=>x.date>=start&&x.date<=end).map(normalizeDay).sort((a,b)=>a.date.localeCompare(b.date))}
  async function allDays(){return(await request((await store('days')).getAll())).map(normalizeDay).sort((a,b)=>b.date.localeCompare(a.date))}
  async function addFile(file){await request((await store('files','readwrite')).put(file))}
  async function filesForDate(date){return request((await store('files')).index('date').getAll(date))}
  async function filesForRange(start,end){const all=await request((await store('files')).getAll());return all.filter(x=>x.date>=start&&x.date<=end)}
  async function deleteFile(id){await request((await store('files','readwrite')).delete(id))}
  async function allFiles(){return request((await store('files')).getAll())}
  async function clearAll(){for(const n of ['days','files'])await request((await store(n,'readwrite')).clear())}
  return{open,normalizeDay,getDay,saveDay,getDays,allDays,addFile,filesForDate,filesForRange,deleteFile,allFiles,clearAll};
})();
