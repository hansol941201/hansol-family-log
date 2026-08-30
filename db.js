window.DB=(()=>{const NAME='hansol-records',VERSION=1;let db;
  function open(){if(db)return Promise.resolve(db);return new Promise((res,rej)=>{const r=indexedDB.open(NAME,VERSION);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('days'))d.createObjectStore('days',{keyPath:'date'});if(!d.objectStoreNames.contains('files')){const s=d.createObjectStore('files',{keyPath:'id'});s.createIndex('date','date')}};r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error)})}
  async function store(name,mode='readonly'){return(await open()).transaction(name,mode).objectStore(name)}
  const request=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  async function getDay(date){return await request((await store('days')).get(date))||{date,activities:{golf:[],motorcycle:[]},childcare:{},sleepTime:'',chores:{},memo:''}}
  async function saveDay(day){await request((await store('days','readwrite')).put(day));return day}
  async function getDays(start,end){const all=await request((await store('days')).getAll());return all.filter(x=>x.date>=start&&x.date<=end).sort((a,b)=>a.date.localeCompare(b.date))}
  async function allDays(){return(await request((await store('days')).getAll())).sort((a,b)=>b.date.localeCompare(a.date))}
  async function addFile(file){await request((await store('files','readwrite')).put(file))}
  async function filesForDate(date){return request((await store('files')).index('date').getAll(date))}
  async function filesForRange(start,end){const all=await request((await store('files')).getAll());return all.filter(x=>x.date>=start&&x.date<=end)}
  async function deleteFile(id){await request((await store('files','readwrite')).delete(id))}
  async function allFiles(){return request((await store('files')).getAll())}
  async function clearAll(){for(const n of ['days','files'])await request((await store(n,'readwrite')).clear())}
  return{open,getDay,saveDay,getDays,allDays,addFile,filesForDate,filesForRange,deleteFile,allFiles,clearAll};
})();
