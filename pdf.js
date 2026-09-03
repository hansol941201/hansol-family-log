window.PDFExport={async run(start,end){
  const days=await DB.getDays(start,end),files=await DB.filesForRange(start,end);
  if(!days.length&&!files.length){Utils.toast('선택한 기간에 기록이 없습니다.');return}
  const fileMap={};files.forEach(f=>(fileMap[f.date]??=[]).push(f));let sections='';
  for(const d of days){
    const rows=[],add=(label,value)=>rows.push(`<tr><th>${label}</th><td>${value}</td></tr>`);
    for(const [k,label] of Object.entries(Labels.activities)){const arr=d.activities?.[k]||[];if(arr.length)add(label,Outing.describeList(arr).map(Utils.escape).join('<br>'))}
    if(d.soloCare?.length)add('혼자 육아',d.soloCare.map(SoloCare.describe).map(Utils.escape).join('<br>'));
    for(const [k,label] of Object.entries(Labels.childcare)){const value=d.childcare?.[k],time=d.itemTimes?.[`childcare:${k}`];if(value||time)add(label,Utils.escape([value,time&&`시간 ${time}`].filter(Boolean).join(' · ')))}
    if(d.daycarePrepMemo)add('등원 준비 내용',Utils.escape(d.daycarePrepMemo).replace(/\n/g,'<br>'));
    if(d.sleepTime)add('아이 잠든 시간',Utils.escape(d.sleepTime));
    for(const [k,label] of Object.entries(Labels.chores)){const value=d.chores?.[k],time=d.itemTimes?.[`chores:${k}`];if(value||time)add(label,Utils.escape([value,time&&`시간 ${time}`].filter(Boolean).join(' · ')))}
    if(d.choreMemo)add('청소·집안일 메모',Utils.escape(d.choreMemo).replace(/\n/g,'<br>'));
    if(d.memo)add('메모',Utils.escape(d.memo).replace(/\n/g,'<br>'));
    let attachments='';for(const f of fileMap[d.date]||[]){if(f.type.startsWith('image/'))attachments+=`<figure><img src="${await Backup.blobToDataURL(f.blob)}"><figcaption>${Utils.escape(f.name)}${f.note?` · ${Utils.escape(f.note)}`:''}</figcaption></figure>`;else attachments+=`<div class="file">${Utils.escape(f.category||'첨부')} · ${Utils.escape(f.name)} (${Utils.bytes(f.size)})${f.note?` · ${Utils.escape(f.note)}`:''}</div>`}
    sections+=`<section><h2>${Utils.formatDate(d.date)}</h2><table>${rows.join('')||'<tr><td>기록 없음</td></tr>'}</table>${attachments?`<div class="attachments">${attachments}</div>`:''}</section>`;
  }
  const html=`<!doctype html><html lang="ko"><head><title>한솔기록 ${start}~${end}</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#17212b;font-size:12px;margin:16px}header{border-bottom:2px solid #3f466b;margin-bottom:18px}h1{font-size:22px;margin-bottom:5px}header p{color:#667}section{break-inside:avoid;margin:0 0 20px}h2{font-size:15px;color:#3f466b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd5dc;padding:7px;text-align:left;vertical-align:top}th{width:25%;background:#f1f2f7}.attachments{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}figure{margin:0;width:150px}img{max-width:150px;max-height:150px;object-fit:contain}figcaption,.file{font-size:10px;color:#667;margin-top:3px}</style></head><body><header><h1>한솔기록</h1><p>${start} ~ ${end} · ${days.length}일</p></header>${sections}</body></html>`;
  document.querySelector('#pdfPreviewFrame').srcdoc=html;document.querySelector('#pdfPreviewModal').hidden=false
},print(){const frame=document.querySelector('#pdfPreviewFrame');frame.contentWindow.focus();frame.contentWindow.print()},close(){document.querySelector('#pdfPreviewModal').hidden=true;document.querySelector('#pdfPreviewFrame').srcdoc=''}};
