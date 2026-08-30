window.AudioRecorder=(()=>{let recorder,chunks=[],stream;
  async function start(){stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.start()}
  function stop(){return new Promise(res=>{recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});stream.getTracks().forEach(t=>t.stop());res(blob)};recorder.stop()})}
  return{start,stop,isRecording:()=>recorder?.state==='recording'};
})();
