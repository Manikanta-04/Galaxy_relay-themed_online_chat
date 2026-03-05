
/* ════════════════════════════════════════════════════
   GALAXY RELAY — PART 3 OF 3
   Contains:
   1. Voice recording
   2. Voice playback
   3. WebRTC group calls (voice + video)
   4. Incoming call handling
   5. Activity tracking + beforeunload
   ════════════════════════════════════════════════════ */

/* Build the animated wave bars in recording indicator
   Wrapped in DOMContentLoaded so it runs after the element exists
   regardless of where this script tag is placed. */
function _buildWaveBars(){
  const w=document.getElementById('voice-rec-wave');
  if(!w)return;
  for(let i=0;i<18;i++){const s=document.createElement('span');w.appendChild(s);}
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',_buildWaveBars);
}else{
  _buildWaveBars();
}

function startVoiceRecording(){
  if(!navigator.mediaDevices?.getUserMedia){
    toast('MICROPHONE NOT SUPPORTED IN THIS BROWSER');return;
  }
  if(isRecording){return;}

  navigator.mediaDevices.getUserMedia({audio:true,video:false})
  .then(stream=>{
    recStream=stream;
    audioChunks=[];
    voiceSendIntent=false;

    const mimeOptions=[
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      ''
    ];
    capturedMime=mimeOptions.find(m=>{
      if(!m)return true;
      try{return MediaRecorder.isTypeSupported(m);}catch(e){return false;}
    })||'';

    try{
      mediaRecorder=new MediaRecorder(stream,capturedMime?{mimeType:capturedMime}:{});
    }catch(e){
      try{
        mediaRecorder=new MediaRecorder(stream);
        capturedMime='';
      }catch(e2){
        toast('RECORDING NOT SUPPORTED IN THIS BROWSER');
        stream.getTracks().forEach(t=>t.stop());
        recStream=null;return;
      }
    }

    isRecording=true;

    mediaRecorder.ondataavailable=e=>{
      if(e.data&&e.data.size>0){
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop=()=>{
      if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null;}
      const shouldSend=voiceSendIntent;
      const chunks=[...audioChunks];
      /* FIX: snapshot recStartTime before cleanupRecordUI zeroes state */
      const capturedStart=recStartTime;
      cleanupRecordUI();
      if(shouldSend&&chunks.length>0){
        processAndSendVoice(chunks,capturedStart);
      }else if(shouldSend&&chunks.length===0){
        toast('NO AUDIO CAPTURED — TRY AGAIN');
      }
    };

    mediaRecorder.onerror=err=>{
      console.warn('[GR] MediaRecorder error:',err);
      if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null;}
      voiceSendIntent=false;
      cleanupRecordUI();
      toast('RECORDING ERROR — TRY AGAIN');
    };

    mediaRecorder.start(100);

    recStartTime=Date.now();
    document.getElementById('voice-rec-timer').textContent='0:00';
    document.getElementById('voice-record-bar').classList.add('show');
    document.getElementById('btn-voice-rec').classList.add('recording');

    recTimerIv=setInterval(()=>{
      const elapsed=Math.floor((Date.now()-recStartTime)/1000);
      const m=Math.floor(elapsed/60),s=String(elapsed%60).padStart(2,'0');
      document.getElementById('voice-rec-timer').textContent=`${m}:${s}`;
      if(elapsed>=MAX_VOICE_SEC){
        toast('MAX RECORDING LENGTH REACHED');
        stopVoiceRecording(true);
      }
    },500);

  })
  .catch(err=>{
    console.warn('[GR] getUserMedia error:',err);
    recStream=null;
    if(err.name==='NotAllowedError'||err.name==='PermissionDeniedError'){
      toast('MICROPHONE ACCESS DENIED — ALLOW IN BROWSER SETTINGS');
    }else if(err.name==='NotFoundError'){
      toast('NO MICROPHONE DETECTED ON THIS DEVICE');
    }else{
      toast('MICROPHONE ERROR: '+String(err.message||err).slice(0,50));
    }
  });
}

function stopVoiceRecording(send=false){
  if(!isRecording||!mediaRecorder)return;
  clearInterval(recTimerIv);recTimerIv=null;
  voiceSendIntent=send;
  /* FIX: snapshot recStartTime before any async cleanup */
  const capturedStart=recStartTime;
  if(mediaRecorder.state==='recording'||mediaRecorder.state==='paused'){
    try{mediaRecorder.requestData();}catch(e){}
    setTimeout(()=>{
      try{mediaRecorder.stop();}catch(e){
        if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null;}
        const shouldSend=voiceSendIntent;
        const chunks=[...audioChunks];
        cleanupRecordUI();
        if(shouldSend&&chunks.length>0)processAndSendVoice(chunks,capturedStart);
        else if(shouldSend)toast('NO AUDIO CAPTURED — TRY AGAIN');
      }
    },80);
  }else{
    if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null;}
    const shouldSend=voiceSendIntent;
    const chunks=[...audioChunks];
    cleanupRecordUI();
    if(shouldSend&&chunks.length>0)processAndSendVoice(chunks,capturedStart);
    else if(shouldSend)toast('NO AUDIO CAPTURED — TRY AGAIN');
  }
}

function cancelVoiceRecording(){
  if(!isRecording)return;
  voiceSendIntent=false;
  clearInterval(recTimerIv);recTimerIv=null;
  if(mediaRecorder&&(mediaRecorder.state==='recording'||mediaRecorder.state==='paused')){
    try{mediaRecorder.stop();}catch(e){}
  }else{
    if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null;}
    cleanupRecordUI();
  }
}

function cleanupRecordUI(){
  isRecording=false;
  audioChunks=[];
  mediaRecorder=null;
  document.getElementById('voice-record-bar').classList.remove('show');
  document.getElementById('btn-voice-rec').classList.remove('recording');
}

/* FIX: accept capturedStart param so duration is correct regardless of cleanup timing */
function processAndSendVoice(chunks,capturedStart){
  if(!chunks||chunks.length===0){toast('NO AUDIO CAPTURED — TRY AGAIN');return;}
  const blobType=(capturedMime||'audio/webm').split(';')[0]||'audio/webm';
  const blob=new Blob(chunks,{type:blobType});
  if(blob.size===0){toast('EMPTY RECORDING — SPEAK CLOSER TO MIC');return;}
  if(blob.size>MAX_VOICE_BYTES){
    toast(`VOICE MSG TOO LARGE (${fsz(blob.size)}) — MAX ~${MAX_VOICE_SEC}s`);
    return;
  }
  const elapsed=Math.floor((Date.now()-(capturedStart||Date.now()))/1000);
  const m=Math.floor(elapsed/60),s=String(elapsed%60).padStart(2,'0');
  const dur=`${m}:${s}`;
  const reader=new FileReader();
  reader.onerror=()=>toast('AUDIO ENCODING FAILED — TRY AGAIN');
  reader.onload=ev=>{
    const src=String(ev.target?.result||'');
    if(!AUDIO_DATA_RE.test(src)){
      console.warn('[GR] Unexpected audio data URL format:',src.slice(0,60));
      toast('AUDIO FORMAT UNSUPPORTED — TRY ANOTHER BROWSER');
      return;
    }
    if(!me){toast('NOT CONNECTED — REJOIN');return;}
    if(!checkRate())return;
    const msg={
      id:genId(),userId:me.id,name:me.name,color:me.color,
      type:'voice',audioData:src,duration:dur,ts:Date.now()
    };
    try{
      addMsg(msg);
      bcast('message',{msg});
      logMsgToDB(msg);
      alienFx();
    }catch(e){
      console.error('[GR] voice send error:',e);
      toast('VOICE MSG FAILED — RECORDING TOO LARGE');
    }
  };
  reader.readAsDataURL(blob);
}

/* ══ VOICE BUTTON EVENTS ══ */
const vrBtn=document.getElementById('btn-voice-rec');
vrBtn.addEventListener('click',()=>{
  if(!isRecording){
    startVoiceRecording();
  }else{
    stopVoiceRecording(true);
  }
});
document.getElementById('btn-rec-cancel').addEventListener('click',cancelVoiceRecording);
document.getElementById('btn-rec-send').addEventListener('click',()=>stopVoiceRecording(true));

/* ══ VOICE PLAYBACK ══ */
function playVoice(msgId,btn,src){
  if(!src||!AUDIO_DATA_RE.test(src)){toast('AUDIO UNAVAILABLE');return;}
  if(voiceAudioMap.has(msgId)){
    const a=voiceAudioMap.get(msgId);
    if(!a.paused){
      a.pause();btn.textContent='▶';btn.classList.remove('playing');
    }else{
      a.currentTime=0;
      a.play().catch(()=>toast('PLAYBACK ERROR'));
      btn.textContent='⏸';btn.classList.add('playing');
    }
    return;
  }
  const audio=new Audio(src);
  voiceAudioMap.set(msgId,audio);
  audio.play().catch(err=>{
    console.warn('[GR] audio play:',err);
    voiceAudioMap.delete(msgId);
    toast('PLAYBACK FAILED — FORMAT MAY NOT BE SUPPORTED');
  });
  btn.textContent='⏸';btn.classList.add('playing');
  let progIv=null;
  audio.addEventListener('loadedmetadata',()=>{
    progIv=setInterval(()=>{
      if(audio.duration>0){
        const pct=audio.currentTime/audio.duration;
        const bars=document.querySelectorAll(`[id^="wfb-${CSS.escape(msgId)}-"]`);
        const playedCount=Math.floor(pct*bars.length);
        bars.forEach((b,i)=>b.classList.toggle('played',i<playedCount));
        const el=document.getElementById('vdur-'+CSS.escape(msgId));
        if(el){
          const cur=Math.floor(audio.currentTime);
          el.textContent=`${Math.floor(cur/60)}:${String(cur%60).padStart(2,'0')}`;
        }
      }
    },100);
  });
  audio.addEventListener('ended',()=>{
    btn.textContent='▶';btn.classList.remove('playing');
    clearInterval(progIv);
    document.querySelectorAll(`[id^="wfb-${CSS.escape(msgId)}-"]`).forEach(b=>b.classList.remove('played'));
    const el=document.getElementById('vdur-'+CSS.escape(msgId));
    const origMsg=messages.find(m=>m.id===msgId);
    if(el&&origMsg)el.textContent=origMsg.duration||'0:00';
  });
  audio.addEventListener('error',()=>{
    btn.textContent='▶';btn.classList.remove('playing');
    clearInterval(progIv);
    voiceAudioMap.delete(msgId);
    toast('PLAYBACK ERROR');
  });
}

/* ══ WEBRTC — GROUP AUDIO/VIDEO CALLS ══ */
function initiateCall(type){
  if(!me){toast('JOIN THE RELAY FIRST');return;}
  if(callActive){toast('ALREADY IN A CALL — END IT FIRST');return;}
  callType=type;
  bcast('call_invite',{from:me.id,fromName:me.name,fromColor:me.color,callType:type});
  addSys(`<span style="color:${me.color}">${esc(me.name)}</span> STARTED A ${type.toUpperCase()} CALL`);
  joinCall(type);
}

function onCallInvite(payload){
  if(callActive)return;
  const fromName=String(payload.fromName||'OPERATIVE').slice(0,20);
  const fromColor=safeColor(payload.fromColor);
  const ctype=payload.callType==='video'?'video':'voice';
  const notif=document.getElementById('incoming-call-notif');
  document.getElementById('ic-avatar').textContent=ini(fromName);
  document.getElementById('ic-avatar').style.cssText=avst(fromColor);
  document.getElementById('ic-name').textContent=fromName.toUpperCase();
  document.getElementById('ic-type').textContent=ctype==='video'?'📹 VIDEO CALL':'🎙️ VOICE CALL';
  notif.dataset.from=payload.from;notif.dataset.type=ctype;
  notif.classList.add('show');
  playCallRingtone(); /* ring for receiver */
  clearTimeout(notif._dt);notif._dt=setTimeout(()=>{notif.classList.remove('show');stopCallRingtone();},25000);
}

document.getElementById('btn-ic-accept').addEventListener('click',()=>{
  const notif=document.getElementById('incoming-call-notif');
  const ctype=notif.dataset.type||'voice';
  notif.classList.remove('show');clearTimeout(notif._dt);
  stopCallRingtone();
  if(!callActive)joinCall(ctype);
});
document.getElementById('btn-ic-decline').addEventListener('click',()=>{
  document.getElementById('incoming-call-notif').classList.remove('show');
  stopCallRingtone();
});

async function joinCall(type){
  if(callActive)return;
  callType=type;callActive=true;isMuted=false;isCamOff=false;
  updateCallUI();
  try{
    const constraints=type==='video'
      ?{audio:true,video:{width:{ideal:640},height:{ideal:480},facingMode:{ideal:'user'}}}
      :{audio:true,video:false};
    localStream=await navigator.mediaDevices.getUserMedia(constraints);
  }catch(err){
    /* Fallback 1: try without resolution constraints (some Android devices reject them) */
    if(type==='video'){
      try{
        localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:{facingMode:{ideal:'user'}}});
        toast('CAMERA: REDUCED QUALITY MODE');
      }catch(err2){
        /* Fallback 2: any camera, no constraints at all */
        try{
          localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
          toast('CAMERA: BASIC MODE — DEVICE LIMIT REACHED');
        }catch(err3){
          console.warn('[GR] getUserMedia for call:',err3);
          localStream=null;
          toast('MICROPHONE/CAMERA DENIED — JOINING WITHOUT AUDIO/VIDEO');
        }
      }
    }else{
      console.warn('[GR] getUserMedia for call:',err);
      localStream=null;
      toast('MICROPHONE DENIED — JOINING WITHOUT AUDIO');
    }
  }
  showCallOverlay(type);
  addCallParticipantUI(me.id,me.name,me.color,type);
  startCallTimer();
  acquireWakeLock();
  bcast('call_join',{from:me.id,fromName:me.name,fromColor:me.color,callType:type});
  logCallToDB('CALL_JOINED',{userId:me.id,userName:me.name,userColor:me.color,callType:type});
  updateCallSidebar();
}

function onCallJoin(payload){
  if(!callActive)return;
  const uid=String(payload.from).slice(0,40);
  if(uid===me.id)return; /* ignore own broadcast echoed back */
  const name=String(payload.fromName||'OPERATIVE').slice(0,20);
  const color=safeColor(payload.fromColor);
  addCallParticipantUI(uid,name,color,callType);
  /* Reply with roster so the new joiner discovers all existing members */
  bcast('call_roster',{to:uid,from:me.id,fromName:me.name,fromColor:me.color,callType});
  /* Existing members always create the offer TO the new joiner.
     The new joiner will answer via onCallOffer. This avoids the glare
     problem where both sides simultaneously try to offer. */
  const existing=peerConnections.get(uid);
  if(!existing||existing.signalingState==='closed'){
    createOfferFor(uid,name,color);
  }
}

/* Called when an existing member replies to our call_join with their info.
   We now know they exist — add their tile and ensure an offer is on the way.
   If no PC exists after a grace period, we create one as a fallback. */
function onCallRoster(payload){
  if(!callActive)return;
  const uid=String(payload.from).slice(0,40);
  if(uid===me.id)return;
  const name=String(payload.fromName||'OPERATIVE').slice(0,20);
  const color=safeColor(payload.fromColor);
  /* Add their tile if we don't have it yet */
  addCallParticipantUI(uid,name,color,callType);
  /* FIX: if no PC arrives within 3s (e.g. network delay), we create one ourselves */
  setTimeout(()=>{
    if(!callActive)return;
    const pc=peerConnections.get(uid);
    if(!pc||pc.signalingState==='closed'){
      console.warn('[GR] onCallRoster: no offer arrived for',uid,'— creating fallback offer');
      createOfferFor(uid,name,color);
    }
  },3000);
}

async function createOfferFor(targetId,targetName,targetColor){
  /* Don't create a new offer if a stable or in-progress PC already exists */
  const existing=peerConnections.get(targetId);
  if(existing&&existing.signalingState!=='closed'){
    /* Already have a live connection, skip */
    return;
  }
  if(existing){try{existing.close();}catch(e){}peerConnections.delete(targetId);}
  const pc=createPC(targetId,targetName,targetColor);
  /* FIX: snapshot callType now so closures use the correct value even if endCall fires */
  const _callType=callType;
  try{
    const offer=await pc.createOffer();
    await pc.setLocalDescription(offer);
    bcast('call_offer',{from:me.id,fromName:me.name,fromColor:me.color,to:targetId,sdp:pc.localDescription,callType:_callType});
  }catch(e){
    console.warn('[GR] createOffer failed:',e);
    peerConnections.delete(targetId);
  }
}

async function onCallOffer(payload){
  const uid=String(payload.from).slice(0,40);
  const name=String(payload.fromName||'OPERATIVE').slice(0,20);
  const color=safeColor(payload.fromColor);
  if(!callActive){
    /* joinCall handles: setting callActive, getUserMedia, showCallOverlay,
       addCallParticipantUI(me), startCallTimer, updateCallSidebar,
       AND broadcasting call_join exactly once. */
    await joinCall(payload.callType||'voice');
  }
  /* Ensure tile exists — addCallParticipantUI is idempotent (deduped by element id) */
  addCallParticipantUI(uid,name,color,callType);
  let pc=peerConnections.get(uid);
  if(pc){
    if(pc.signalingState==='have-local-offer'){
      if(me.id<uid){
        try{await pc.setLocalDescription({type:'rollback'});}catch(e){}
      }else{ return; }
    }
  }else{
    pc=createPC(uid,name,color);
  }
  try{
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    const buffered=pendingIceCandidates.get(uid)||[];
    for(const c of buffered){try{await pc.addIceCandidate(new RTCIceCandidate(c));}catch(e){}}
    pendingIceCandidates.delete(uid);
    const answer=await pc.createAnswer();
    await pc.setLocalDescription(answer);
    bcast('call_answer',{from:me.id,fromName:me.name,fromColor:me.color,to:uid,sdp:pc.localDescription});
  }catch(e){ console.warn('[GR] onCallOffer error:',e); }
}

async function onCallAnswer(payload){
  const uid=String(payload.from).slice(0,40);
  const pc=peerConnections.get(uid);
  if(!pc){console.warn('[GR] onCallAnswer: no PC for',uid);return;}
  if(pc.signalingState!=='have-local-offer'){console.warn('[GR] onCallAnswer: wrong state',pc.signalingState);return;}
  try{
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    const buffered=pendingIceCandidates.get(uid)||[];
    for(const c of buffered){try{await pc.addIceCandidate(new RTCIceCandidate(c));}catch(e){}}
    pendingIceCandidates.delete(uid);
  }catch(e){console.warn('[GR] onCallAnswer error:',e);}
}

async function onCallIce(payload){
  const uid=String(payload.from).slice(0,40);
  const pc=peerConnections.get(uid);
  if(pc&&pc.remoteDescription?.type){
    try{await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));}catch(e){}
  }else{
    if(!pendingIceCandidates.has(uid))pendingIceCandidates.set(uid,[]);
    pendingIceCandidates.get(uid).push(payload.candidate);
  }
}

function createPC(targetId,targetName,targetColor){
  /* FIX: snapshot callType so all closures in this PC use the same value
     even if the module-level callType changes (e.g. endCall sets it to null) */
  const _callType=callType;
  const pc=new RTCPeerConnection(ICE_SERVERS);
  peerConnections.set(targetId,pc);
  if(localStream)localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  pc.onicecandidate=e=>{
    if(e.candidate)bcast('call_ice',{from:me.id,to:targetId,candidate:e.candidate.toJSON()});
  };
  const _attachedStreams=new Set();
  pc.ontrack=e=>{
    if(e.streams&&e.streams[0]){
      const sid=e.streams[0].id;
      if(!_attachedStreams.has(sid)){
        _attachedStreams.add(sid);
        attachRemoteStream(targetId,targetName,targetColor,e.streams[0]);
      }
    }
    /* Track mute/unmute = remote peer toggled camera/mic */
    if(e.track&&e.track.kind==='video'){
      e.track.addEventListener('mute',()=>{
        const tile=document.getElementById('vt-'+CSS.escape(targetId));
        if(tile)tile.classList.add('no-video');
      });
      e.track.addEventListener('unmute',()=>{
        const tile=document.getElementById('vt-'+CSS.escape(targetId));
        if(tile)tile.classList.remove('no-video');
      });
    }
  };
  pc.oniceconnectionstatechange=async()=>{
    if(pc.iceConnectionState==='failed'){
      console.warn('[GR] ICE failed for',targetId,'— attempting restart');
      try{pc.restartIce();}catch(e){}
      if(me.id>targetId&&pc.signalingState==='stable'){
        try{
          const offer=await pc.createOffer({iceRestart:true});
          await pc.setLocalDescription(offer);
          bcast('call_offer',{from:me.id,fromName:me.name,fromColor:me.color,to:targetId,sdp:pc.localDescription,callType:_callType});
        }catch(e){console.warn('[GR] ICE restart offer failed:',e);}
      }
    }
    if(pc.iceConnectionState==='disconnected'){
      setTimeout(()=>{
        if(peerConnections.get(targetId)===pc&&
           (pc.iceConnectionState==='disconnected'||pc.iceConnectionState==='failed'||pc.iceConnectionState==='closed')){
          onCallRemoteLeave(targetId);
        }
      },5000);
    }
    if(pc.iceConnectionState==='closed'){
      setTimeout(()=>{
        if(peerConnections.get(targetId)===pc)onCallRemoteLeave(targetId);
      },3000);
    }
  };
  let _negotiating=false;
  pc.onnegotiationneeded=async()=>{
    if(!me||_negotiating)return;
    if(pc.signalingState!=='stable')return;
    _negotiating=true;
    try{
      const offer=await pc.createOffer();
      if(pc.signalingState!=='stable'){return;}
      await pc.setLocalDescription(offer);
      bcast('call_offer',{from:me.id,fromName:me.name,fromColor:me.color,to:targetId,sdp:pc.localDescription,callType:_callType});
    }catch(e){console.warn('[GR] renegotiation:',e);}
    finally{_negotiating=false;}
  };
  return pc;
}

function attachRemoteStream(uid,name,color,stream){
  if(callType==='video'){
    let tile=document.getElementById('vt-'+CSS.escape(uid));
    if(!tile){
      addCallParticipantUI(uid,name,color,'video');
      tile=document.getElementById('vt-'+CSS.escape(uid));
      if(!tile)return;
    }
    const vid=tile.querySelector('video');
    if(vid&&vid.srcObject!==stream){
      vid.srcObject=stream;
      /* FIX: also set playsInline as JS property for older iOS/Android WebViews */
      vid.playsInline=true;
      applySpeakerRouting(vid);
      vid.play().catch(err=>{
        console.warn('[GR] remote video autoplay blocked:',err);
        toast('TAP SCREEN TO START VIDEO');
        const tile=vid.closest('.video-tile');
        if(tile&&!tile._tapPlay){
          tile._tapPlay=true;
          tile.style.cursor='pointer';
          tile.addEventListener('click',()=>{vid.play().catch(()=>{});tile.style.cursor='';},{once:true});
        }
      });
    }
    tile.classList.remove('no-video');
  }else{
    let audio=document.getElementById('ra-'+CSS.escape(uid));
    if(!audio){
      audio=document.createElement('audio');audio.id='ra-'+CSS.escape(uid);
      audio.autoplay=true;audio.playsInline=true;audio.setAttribute('playsinline','');
      audio.style.display='none';document.body.appendChild(audio);
    }
    if(audio.srcObject!==stream){audio.srcObject=stream;applySpeakerRouting(audio);audio.play().catch(()=>{});}
  }
}

function addCallParticipantUI(uid,name){
  const color=arguments[2];
  const actualType=arguments[3]||callType;
  if(actualType==='video'){
    const layout=document.getElementById('call-video-layout');
    if(document.getElementById('vt-'+CSS.escape(uid)))return;
    const tile=makeVideoTile(uid,name,color);
    layout.appendChild(tile);
    if(uid===me.id&&localStream){
      const vid=tile.querySelector('video');
      if(vid){
        vid.srcObject=localStream;
        vid.muted=true;
        /* FIX: set playsInline as JS property for older iOS/Android WebViews */
        vid.playsInline=true;
        vid.play().catch(()=>{});
      }
      tile.classList.remove('no-video');
    }
    updateVideoGrid();
  }else{
    const grid=document.getElementById('call-participants-grid');
    if(document.getElementById('cp-'+CSS.escape(uid)))return;
    const div=document.createElement('div');
    div.className='call-participant';div.id='cp-'+CSS.escape(uid);
    div.innerHTML=`<div class="call-p-avatar" style="${avst(color)}">${esc(ini(name))}</div><div class="call-p-name">${esc(name)}</div>`;
    grid.appendChild(div);
    const cnt=grid.children.length;
    document.getElementById('call-status-txt').textContent=cnt===1?'WAITING FOR OTHERS...':cnt+' OPERATIVES IN CALL';
  }
}

function makeVideoTile(uid,name,color){
  const tile=document.createElement('div');
  tile.className='video-tile no-video'+(uid===me.id?' local-tile':'');tile.id='vt-'+CSS.escape(uid);
  tile.innerHTML=`<video autoplay playsinline webkit-playsinline ${uid===me.id?'muted':''}></video>
    <div class="v-avatar" style="${avst(color)}">${esc(ini(name))}</div>
    <div class="v-name">${esc(name)}</div>
    <div class="video-tile-label">${esc(name)}${uid===me.id?' (YOU)':''}</div>`;
  /* FIX: set playsInline as JS property after innerHTML for older iOS/Android WebViews */
  const vid=tile.querySelector('video');
  if(vid)vid.playsInline=true;
  return tile;
}

function updateVideoGrid(){
  const layout=document.getElementById('call-video-layout');
  const cnt=layout.children.length;
  const isPortrait=window.matchMedia('(orientation:portrait)').matches;
  let cols;
  if(isPortrait){
    cols='1fr';
  }else{
    cols=cnt<=1?'1fr':cnt<=2?'1fr 1fr':cnt<=4?'1fr 1fr':'repeat(3,1fr)';
  }
  layout.style.gridTemplateColumns=cols;
}

function onCallRemoteLeave(uid){
  const pc=peerConnections.get(uid);
  if(pc){try{pc.close();}catch(e){}peerConnections.delete(uid);}
  document.getElementById('cp-'+CSS.escape(uid))?.remove();
  document.getElementById('vt-'+CSS.escape(uid))?.remove();
  document.getElementById('ra-'+CSS.escape(uid))?.remove();
  updateVideoGrid();
  const name=users.get(uid)?.name||'OPERATIVE';
  addSys(`<span>${esc(name)}</span> LEFT THE CALL`);
  const grid=document.getElementById('call-participants-grid');
  const cnt=callType==='video'
    ?document.getElementById('call-video-layout').children.length
    :grid.children.length;
  if(cnt<=1)document.getElementById('call-status-txt').textContent='WAITING FOR OTHERS...';
  else document.getElementById('call-status-txt').textContent=cnt+' OPERATIVES IN CALL';
}

function showCallOverlay(type){
  const overlay=document.getElementById('call-overlay');
  overlay.classList.add('show');
  document.getElementById('call-title-bar').textContent=type==='video'?'VIDEO CALL — GALAXY RELAY':'VOICE CALL — GALAXY RELAY';
  document.getElementById('call-voice-layout').style.display=type==='video'?'none':'flex';
  document.getElementById('call-video-layout').style.display=type==='video'?'grid':'none';
  document.getElementById('btn-call-cam').style.display=type==='video'?'flex':'none';
  document.getElementById('btn-call-mute').textContent='🎤';
  document.getElementById('btn-call-mute').classList.remove('active');
  document.getElementById('btn-call-cam').textContent='📷';
  document.getElementById('btn-call-cam').classList.remove('active');
}

function startCallTimer(){
  callSeconds=0;clearInterval(callTimerIv);
  callTimerIv=setInterval(()=>{
    callSeconds++;
    const m=Math.floor(callSeconds/60),s=String(callSeconds%60).padStart(2,'0');
    document.getElementById('call-timer').textContent=`${m}:${s}`;
  },1000);
}

function updateCallUI(){
  document.getElementById('btn-sidebar-voice').classList.toggle('active-call',callActive&&callType==='voice');
  document.getElementById('btn-sidebar-video').classList.toggle('active-call',callActive&&callType==='video');
  updateSub();
}
function updateCallSidebar(){renderUsers();updateCallUI();}

/* Call controls */
document.getElementById('btn-call-mute').addEventListener('click',function(){
  isMuted=!isMuted;this.classList.toggle('active',isMuted);this.textContent=isMuted?'🔇':'🎤';
  if(localStream)localStream.getAudioTracks().forEach(t=>{t.enabled=!isMuted;});
});
document.getElementById('btn-call-cam').addEventListener('click',function(){
  isCamOff=!isCamOff;this.classList.toggle('active',isCamOff);this.textContent=isCamOff?'🚫':'📷';
  if(localStream)localStream.getVideoTracks().forEach(t=>{t.enabled=!isCamOff;});
  const myTile=document.getElementById('vt-'+CSS.escape(me?.id));
  if(myTile)myTile.classList.toggle('no-video',isCamOff);
});
document.getElementById('btn-call-speaker').addEventListener('click',async function(){
  this.classList.toggle('active');
  const isSpeaker=this.classList.contains('active');
  this.textContent=isSpeaker?'🔊':'🔈';
  const targetSink=isSpeaker?'default':'';
  document.querySelectorAll('[id^="ra-"]').forEach(async el=>{
    if(typeof el.setSinkId==='function'){
      try{await el.setSinkId(targetSink);}catch(e){console.warn('[GR] setSinkId audio:',e);}
    }
  });
  document.querySelectorAll('.video-tile:not(.local-tile) video').forEach(async el=>{
    if(typeof el.setSinkId==='function'){
      try{await el.setSinkId(targetSink);}catch(e){console.warn('[GR] setSinkId video:',e);}
    }
  });
  if(!isSpeaker&&typeof HTMLMediaElement.prototype.setSinkId==='undefined'){
    toast('SPEAKER ROUTING NOT SUPPORTED IN THIS BROWSER');
  }
});

function applySpeakerRouting(el){
  const isSpeaker=document.getElementById('btn-call-speaker').classList.contains('active');
  const targetSink=isSpeaker?'default':'';
  if(typeof el.setSinkId==='function'){
    el.setSinkId(targetSink).catch(()=>{});
  }
}
document.getElementById('btn-call-end').addEventListener('click',endCall);

function endCall(){
  if(!callActive)return;
  /* FIX: snapshot callSeconds before zeroing so logCallToDB gets the real duration */
  const finalSeconds=callSeconds;
  bcast('call_leave',{from:me.id});
  peerConnections.forEach(pc=>{try{pc.close();}catch(e){}});peerConnections.clear();
  pendingIceCandidates.clear();
  if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
  document.querySelectorAll('[id^="ra-"]').forEach(el=>el.remove());
  callActive=false;callType=null;clearInterval(callTimerIv);callTimerIv=null;
  callSeconds=0;isMuted=false;isCamOff=false;
  releaseWakeLock();
  document.getElementById('call-overlay').classList.remove('show');
  document.getElementById('call-participants-grid').innerHTML='';
  document.getElementById('call-video-layout').innerHTML='';
  document.getElementById('call-timer').textContent='0:00';
  document.getElementById('call-status-txt').textContent='WAITING FOR OTHERS TO JOIN...';
  updateCallUI();renderUsers();
  addSys(`<span style="color:${me?.color}">${esc(me?.name||'OPERATIVE')}</span> ENDED THE CALL`);
  logCallToDB('CALL_ENDED',{userId:me?.id,userName:me?.name,userColor:me?.color,durationSecs:finalSeconds});
}

/* ══ ACTIVITY TRACKING ══ */
let _wakeLock = null;
async function acquireWakeLock(){
  if(!('wakeLock' in navigator))return;
  try{
    _wakeLock = await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release',()=>{_wakeLock=null;});
  }catch(e){console.warn('[GR] WakeLock:',e);}
}
function releaseWakeLock(){
  if(_wakeLock){_wakeLock.release().catch(()=>{});_wakeLock=null;}
}

/* Single visibilitychange handler — covers typing stop (Part 2 concern),
   wake lock re-acquisition, and Android video/audio stream re-attachment. */
document.addEventListener('visibilitychange',async()=>{
  if(document.hidden&&me){
    /* Stop typing indicator when page is hidden */
    clearTimeout(typT);
    if(isTyping){isTyping=false;bcast('stop_typing',{userId:me.id});}
    /* Also pause canvas animation if present */
  }else{
    /* Page became visible again */
    if(callActive&&!_wakeLock){
      acquireWakeLock();
    }
    /* Android fix: re-attach streams when returning from background */
    if(callActive){
      const myTile=document.getElementById('vt-'+CSS.escape(me?.id));
      const myVid=myTile?.querySelector('video');
      if(myVid&&localStream){myVid.srcObject=null;myVid.srcObject=localStream;myVid.play().catch(()=>{});}
      document.querySelectorAll('.video-tile:not(.local-tile) video').forEach(v=>{
        if(v.srcObject&&v.paused){v.play().catch(()=>{});}
      });
      document.querySelectorAll('[id^="ra-"]').forEach(a=>{
        if(a.srcObject&&a.paused){a.play().catch(()=>{});}
      });
    }
  }
});

/* Re-layout video grid on orientation change */
window.addEventListener('orientationchange',()=>{setTimeout(()=>{if(callActive&&callType==='video')updateVideoGrid();},300);});
window.matchMedia('(orientation:portrait)').addEventListener('change',()=>{if(callActive&&callType==='video')updateVideoGrid();});

/* pagehide fires on Android back-gesture / tab close where beforeunload may not. */
window.addEventListener('pagehide',()=>{
  isLeavingIntentionally=true;
  endCall();
  if(ch){try{ch.untrack();}catch(e){}try{sb.removeChannel(ch);}catch(e){}}
});
 