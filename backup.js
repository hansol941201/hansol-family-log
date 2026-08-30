window.Backup={
  async download(){const days=await DB.allDays(),files=await DB.allFiles();const encoded=[];for(const f of files){encoded.push({...f,blob:await Backup.blobToDataURL(f.blob)})}const data={app:'한솔기록',version:1,exportedAt:new Date().toISOString(),days,files:encoded};const blob=new Blob([JSON.stringify(data)],{type:'application/json'});Backup.saveBlob(blob,`한솔기록-백업-${Utils.today()}.json`)},
  async restore(file){const data=JSON.parse(await file.text());if(data.app!=='한솔기록'||!Array.isArray(data.days))throw Error('올바른 백업 파일이 아닙니다.');if(!confirm(`기존 기록에 백업 기록 ${data.days.length}일을 불러올까요?`))return;for(const d of data.days)await DB.saveDay(d);for(const f of data.files||[]){f.blob=await(await fetch(f.blob)).blob();await DB.addFile(f)}Utils.toast('백업을 불러왔습니다.')},
  blobToDataURL:blob=>new Promise((res,rej)=>{const r=new FileReader;r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob)}),
  saveBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
};
