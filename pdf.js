window.PDFExport={lastHtml:'',async run(start,end){
  if(!start||!end){Utils.toast('PDF 시작일과 종료일을 선택해주세요.');return}
  if(start>end){Utils.toast('시작일은 종료일보다 빠르게 선택해주세요.');return}
  const storedDays=await DB.getDays(start,end),files=await DB.filesForRange(start,end);
  if(!storedDays.length&&!files.length){Utils.toast('선택한 기간에 기록이 없습니다.');return}
  const fileMap={};files.forEach(f=>(fileMap[f.date]??=[]).push(f));
  const dayMap=new Map(storedDays.map(d=>[d.date,d]));
  const dates=[...new Set([...storedDays.map(d=>d.date),...files.map(f=>f.date)])].sort();
  const days=dates.map(date=>dayMap.get(date)||{date,activities:{},soloCare:[],childcare:{},chores:{},itemTimes:{},bedtimeDetail:{}});
  const evidence=EvidenceSummary.summarize(days),soloMe=SoloCare.summarize(days,'me'),soloHusband=SoloCare.summarize(days,'husband');let sections='';
  for(const d of days){
    const rows=[],add=(label,value)=>rows.push(`<tr><th>${label}</th><td>${value}</td></tr>`);
    for(const [k,label] of Object.entries(Labels.activities)){const arr=d.activities?.[k]||[];if(arr.length)add(label,Outing.describeList(arr).map(Utils.escape).join('<br>'))}
    if(d.soloCare?.length)add('혼자 육아',d.soloCare.map(SoloCare.describe).map(Utils.escape).join('<br>'));
    for(const [k,label] of Object.entries(Labels.childcare)){const value=d.childcare?.[k],time=d.itemTimes?.[`childcare:${k}`];if(value||time)add(label,Utils.escape([value,time&&`시간 ${time}`].filter(Boolean).join(' · ')))}
    if(BedtimeDetail.describe(d.bedtimeDetail))add('재우기 상세',Utils.escape(BedtimeDetail.describe(d.bedtimeDetail)));
    if(d.daycarePrepMemo)add('등원 준비 내용',Utils.escape(d.daycarePrepMemo).replace(/\n/g,'<br>'));
    if(d.sleepTime)add('아이 잠든 시간',Utils.escape(d.sleepTime));
    for(const [k,label] of Object.entries(Labels.chores)){const value=d.chores?.[k],time=d.itemTimes?.[`chores:${k}`];if(value||time)add(label,Utils.escape([value,time&&`시간 ${time}`].filter(Boolean).join(' · ')))}
    if(d.choreMemo)add('청소·집안일 메모',Utils.escape(d.choreMemo).replace(/\n/g,'<br>'));
    if(d.memo)add('메모',Utils.escape(d.memo).replace(/\n/g,'<br>'));
    let attachments='';for(const f of fileMap[d.date]||[]){if(f.type.startsWith('image/'))attachments+=`<figure><img src="${await Backup.blobToDataURL(f.blob)}"><figcaption>${Utils.escape(f.name)}${f.note?` · ${Utils.escape(f.note)}`:''}</figcaption></figure>`;else attachments+=`<div class="file">${Utils.escape(f.category||'첨부')} · ${Utils.escape(f.name)} (${Utils.bytes(f.size)})${f.note?` · ${Utils.escape(f.note)}`:''}</div>`}
    sections+=`<section><h2>${Utils.formatDate(d.date)}</h2><table>${rows.join('')||'<tr><td>기록 없음</td></tr>'}</table>${attachments?`<div class="attachments">${attachments}</div>`:''}</section>`;
  }
  const summary=`<section class="summary"><h2>기간 분담 기록 요약</h2><p>기록·첨부가 있는 날짜 ${dates.length}일 · 직접 저장한 기록 기준</p><table><tr><th>구분</th><th>나</th><th>남편</th><th>같이</th></tr><tr><td>육아</td><td>${evidence.childcare.나}회</td><td>${evidence.childcare.남편}회</td><td>${evidence.childcare.같이}회</td></tr><tr><td>집안일</td><td>${evidence.chores.나}회</td><td>${evidence.chores.남편}회</td><td>${evidence.chores.같이}회</td></tr></table><p>혼자 육아: 나 ${soloMe.days}일·${soloMe.count}회 / 남편 ${soloHusband.days}일·${soloHusband.count}회<br>남편 외출: 골프 ${evidence.outings.golf}회 / 오토바이 ${evidence.outings.motorcycle}회<br>첨부 자료: ${files.length}개</p></section>`;
  const html=`<!doctype html><html lang="ko"><head><title>한솔기록 ${start}~${end}</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#17212b;font-size:12px;margin:16px}header{border-bottom:2px solid #3f466b;margin-bottom:18px}h1{font-size:22px;margin-bottom:5px}header p{color:#667}section{break-inside:avoid;margin:0 0 20px}h2{font-size:15px;color:#3f466b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd5dc;padding:7px;text-align:left;vertical-align:top}th{width:25%;background:#f1f2f7}.summary{padding:12px;border:2px solid #3f466b}.attachments{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}figure{margin:0;width:150px}img{max-width:150px;max-height:150px;object-fit:contain}figcaption,.file{font-size:10px;color:#667;margin-top:3px}</style></head><body><header><h1>한솔기록</h1><p>${start} ~ ${end} · ${days.length}일</p></header>${summary}${sections}</body></html>`;
  this.lastHtml=html;document.querySelector('#pdfPreviewFrame').srcdoc=html;document.querySelector('#pdfPreviewModal').hidden=false
},print(){if(!this.lastHtml){Utils.toast('먼저 PDF 기록을 만들어주세요.');return}const popup=window.open('','_blank');if(!popup){Utils.toast('팝업을 허용한 뒤 다시 눌러주세요.');return}popup.document.open();popup.document.write(this.lastHtml.replace('</body>',`<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350))<\/script></body>`));popup.document.close()},close(){document.querySelector('#pdfPreviewModal').hidden=true;document.querySelector('#pdfPreviewFrame').srcdoc=''}};
