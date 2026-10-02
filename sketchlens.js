(function(){
  "use strict";

  var vp=document.getElementById('viewport'), layer=document.getElementById('layer');
  var imgC=document.getElementById('img'), ictx=imgC.getContext('2d',{willReadFrequently:true});
  var drop=document.getElementById('drop'), runBtn=document.getElementById('run');
  var p1=document.getElementById('p1'), p2=document.getElementById('p2'), p3=document.getElementById('p3');
  var MAXDIM=1100, loaded=false, IW=0, IH=0, scale=1, tx=0, ty=0;

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* 탭 */
  document.getElementById('tabs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    this.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x===b); });
    ['p1','p2','p3'].forEach(function(id){
      document.getElementById(id).classList.toggle('on', id===b.dataset.p);
    });
  });

  /* 확대·축소·이동 */
  function apply(){
    layer.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')';
    document.getElementById('zoomVal').textContent = loaded ? Math.round(scale*100)+'%' : '—';
  }
  function cl(s){ return Math.max(0.1, Math.min(8, s)); }
  function fit(){
    if(!loaded) return;
    scale = cl(Math.min((vp.clientWidth-32)/IW, (vp.clientHeight-32)/IH));
    tx=(vp.clientWidth-IW*scale)/2; ty=(vp.clientHeight-IH*scale)/2; apply();
  }
  function zoomAt(cx,cy,f){
    if(!loaded) return;
    var ns=cl(scale*f), k=ns/scale;
    tx=cx-(cx-tx)*k; ty=cy-(cy-ty)*k; scale=ns; apply();
  }
  function zc(f){ zoomAt(vp.clientWidth/2, vp.clientHeight/2, f); }
  document.getElementById('z-in').onclick=function(){ zc(1.25); };
  document.getElementById('z-out').onclick=function(){ zc(1/1.25); };
  document.getElementById('z-fit').onclick=fit;
  document.getElementById('z-100').onclick=function(){ if(loaded) zc(1/scale); };
  vp.addEventListener('wheel', function(e){
    if(!loaded) return; e.preventDefault();
    var r=vp.getBoundingClientRect();
    zoomAt(e.clientX-r.left, e.clientY-r.top, e.deltaY<0?1.12:1/1.12);
  },{passive:false});
  var pan=false,px=0,py=0;
  vp.addEventListener('pointerdown',function(e){
    if(!loaded) return; pan=true; px=e.clientX; py=e.clientY;
    vp.classList.add('drag'); vp.setPointerCapture(e.pointerId);
  });
  vp.addEventListener('pointermove',function(e){
    if(!pan) return; tx+=e.clientX-px; ty+=e.clientY-py; px=e.clientX; py=e.clientY; apply();
  });
  function ep(){ pan=false; vp.classList.remove('drag'); }
  vp.addEventListener('pointerup',ep); vp.addEventListener('pointercancel',ep);
  window.addEventListener('resize',function(){ if(loaded) fit(); });

  /* 이미지 로드 */
  function loadImage(src,name){
    var im=new Image();
    im.onload=function(){
      var s=Math.min(1, MAXDIM/Math.max(im.width,im.height));
      IW=Math.round(im.width*s); IH=Math.round(im.height*s);
      imgC.width=IW; imgC.height=IH;
      ictx.fillStyle='#FFF'; ictx.fillRect(0,0,IW,IH); ictx.drawImage(im,0,0,IW,IH);
      loaded=true; drop.classList.add('hidden'); runBtn.disabled=false;
      document.getElementById('fileName').textContent=name||'이미지';
      document.getElementById('sizeInfo').textContent=im.width+' × '+im.height+' px';
      p1.innerHTML='<div class="empty-r"><b>진단 준비 완료</b><p>아래 진단하기를 눌러주세요.</p></div>';
      p2.innerHTML=''; fit();
    };
    im.onerror=function(){ alert('이미지를 불러오지 못했습니다.'); };
    im.src=src;
  }
  function readFile(f){
    if(!f||!/^image\//.test(f.type)){ alert('이미지 파일만 올려주세요.'); return; }
    var fr=new FileReader(); fr.onload=function(){ loadImage(fr.result,f.name); }; fr.readAsDataURL(f);
  }
  document.getElementById('t-open').onclick=function(){ document.getElementById('file').click(); };
  document.getElementById('file').onchange=function(e){ readFile(e.target.files[0]); };
  ['dragenter','dragover'].forEach(function(t){ vp.addEventListener(t,function(e){ e.preventDefault(); vp.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(t){ vp.addEventListener(t,function(e){ e.preventDefault(); vp.classList.remove('over'); }); });
  vp.addEventListener('drop',function(e){ if(e.dataTransfer.files&&e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); });

  /* 예시 */
  function su(s){ return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); }
  var TEE='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="560" viewBox="0 0 640 560">'+
   '<rect width="640" height="560" fill="#fff"/>'+
   '<g fill="none" stroke="#2A3A42" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'+
   '<path d="M250 120 C262 104 286 96 320 96 C354 96 378 104 390 120"/>'+
   '<path d="M250 120 L150 168 L120 276 L186 300 L196 236"/>'+
   '<path d="M390 120 L496 166 L520 252 L462 272 L452 224"/>'+
   '<path d="M196 236 L192 452 L452 452 L452 224"/>'+
   '<path d="M286 100 C300 118 340 118 354 100"/></g>'+
   '<g fill="none" stroke="#5C6A66" stroke-width="1.8" stroke-linecap="round">'+
   '<path d="M360 300 L438 300 M360 318 L434 318 M360 336 L440 336 M364 354 L432 354 M362 372 L436 372"/>'+
   '<path d="M380 396 L428 398 M384 412 L424 414"/><circle cx="330" cy="330" r="14"/>'+
   '<path d="M214 320 L250 322"/></g>'+
   '<g fill="none" stroke="#9AA4A0" stroke-width="1.4" stroke-dasharray="6 5">'+
   '<path d="M186 300 L196 236 M462 272 L452 224"/></g></svg>';
  var DRESS='<svg xmlns="http://www.w3.org/2000/svg" width="560" height="680" viewBox="0 0 560 680">'+
   '<rect width="560" height="680" fill="#fff"/>'+
   '<g fill="none" stroke="#2A3A42" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'+
   '<path d="M186 104 C198 88 220 82 250 82 C280 82 302 88 314 104"/>'+
   '<path d="M186 104 L136 140 L150 196 L196 180"/>'+
   '<path d="M314 104 L366 138 L352 194 L306 178"/>'+
   '<path d="M196 180 L188 300 L96 596 L392 596 L312 300 L306 178"/>'+
   '<path d="M188 300 L312 300"/></g>'+
   '<g fill="none" stroke="#5C6A66" stroke-width="1.8" stroke-linecap="round">'+
   '<path d="M140 380 L176 384 M132 420 L172 424 M124 460 L168 464 M116 500 L164 504 M108 540 L160 544"/>'+
   '<path d="M212 214 L250 216 M212 244 L246 246"/></g></svg>';
  document.getElementById('t-s1').onclick=function(){ loadImage(su(TEE),'예시 · 티셔츠 도식화'); };
  document.getElementById('t-s2').onclick=function(){ loadImage(su(DRESS),'예시 · 원피스'); };

  /* 항목 (라벨링 체계가 정해지면 이 배열만 바꾸면 됨) */
  var AXES=[
    {id:'C1',name:'의류 종류 인식도'},
    {id:'C2',name:'좌우 대칭'},
    {id:'C3',name:'비율 정합'},
    {id:'C4',name:'부위 완결성'},
    {id:'C5',name:'디테일 밀도 균형'},
    {id:'C6',name:'스타일 일치'},
    {id:'C7',name:'패턴화 가능성'}
  ];
  var RULES={
    C1:['알아보','뭔지','종류','모양','형태'],
    C2:['대칭','좌우','한쪽','기울','비뚤','짝'],
    C3:['비율','길이','소매','총장','어깨','밸런스','어색','이상'],
    C4:['부위','칼라','밑단','포켓','끊','미완','마무리','닫'],
    C5:['디테일','밋밋','심심','빽빽','비어','단조','밀도'],
    C6:['스타일','콘셉트','컨셉','느낌','분위기','톤'],
    C7:['패턴','제작','생산','도식','봉제']
  };
  var focus={}, chipsEl=document.getElementById('chips');
  function chips(){
    chipsEl.innerHTML='';
    AXES.forEach(function(a){
      var b=document.createElement('button');
      b.className='chip'; b.type='button'; b.textContent=a.name;
      b.setAttribute('aria-pressed', focus[a.id]?'true':'false');
      b.onclick=function(){ focus[a.id]=!focus[a.id]; b.setAttribute('aria-pressed',focus[a.id]?'true':'false'); };
      chipsEl.appendChild(b);
    });
  }
  chips();
  document.getElementById('worry').addEventListener('input',function(){
    // TODO: 지금은 프론트에서 키워드만 매칭해 칩을 켜는 데 그친다.
    // 실제로는 이 매칭 결과(선택된 항목들)를 서버로 보내 LLM 프롬프트에 함께 전달해야 한다.
    var t=this.value, hit={};
    Object.keys(RULES).forEach(function(k){ RULES[k].forEach(function(w){ if(t.indexOf(w)>-1) hit[k]=true; }); });
    Object.keys(hit).forEach(function(k){ focus[k]=true; });
    chips();
  });

  /* ─────────── 로컬 데모 계산 (Django+LLM 서버로 교체될 부분) ─────────── */
  function erf(x){
    var s=x<0?-1:1; x=Math.abs(x);
    var t=1/(1+0.3275911*x);
    return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x));
  }
  function pct(v,m,sd,hi){
    var z=(v-m)/sd; if(!hi) z=-z;
    return Math.max(2,Math.min(98,Math.round(0.5*(1+erf(z/Math.SQRT2))*100)));
  }
  var GX=10, GY=12;

  function localAnalyze(){
    var step=Math.max(1,Math.round(Math.max(IW,IH)/420));
    var d=ictx.getImageData(0,0,IW,IH).data;
    var bw=Math.ceil(IW/step), bh=Math.ceil(IH/step), bin=new Uint8Array(bw*bh);
    var ink=0,minX=IW,maxX=0,minY=IH,maxY=0,sx=0,sy=0,x,y;
    for(y=0;y<bh;y++) for(x=0;x<bw;x++){
      var i=((y*step)*IW+(x*step))*4;
      var lum=d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114;
      if(d[i+3]>40 && lum<170){
        bin[y*bw+x]=1; ink++; sx+=x; sy+=y;
        if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
      }
    }
    if(ink<60) return null;
    var W0=Math.max(1,maxX-minX+1), H0=Math.max(1,maxY-minY+1);
    var cxn=(sx/ink-(minX+maxX)/2)/W0;

    var mid=(minX+maxX)/2, both=0, one=0, L=0, R=0;
    for(y=minY;y<=maxY;y++) for(x=minX;x<=maxX;x++){
      var v=bin[y*bw+x];
      if(v){ if(x<mid) L++; else R++; }
      if(x>mid) continue;
      var mx=Math.round(mid+(mid-x)), w=(mx>=0&&mx<bw)?bin[y*bw+mx]:0;
      if(v&&w) both++; if(v||w) one++;
    }
    var sym=one?both/one:0, side=Math.max(L,R)/Math.max(1,Math.min(L,R));

    var seen=new Uint8Array(bw*bh), q=[], head=0;
    for(x=0;x<bw;x++){ q.push(x); q.push((bh-1)*bw+x); }
    for(y=0;y<bh;y++){ q.push(y*bw); q.push(y*bw+bw-1); }
    q.forEach(function(i){ if(!bin[i]) seen[i]=1; });
    while(head<q.length){
      var c=q[head++]; if(!seen[c]) continue;
      var cy=Math.floor(c/bw), cx=c%bw;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dd){
        var nx=cx+dd[0], ny=cy+dd[1];
        if(nx<0||ny<0||nx>=bw||ny>=bh) return;
        var n=ny*bw+nx;
        if(!bin[n]&&!seen[n]){ seen[n]=1; q.push(n); }
      });
    }
    var box=0, enc=0;
    for(y=minY;y<=maxY;y++) for(x=minX;x<=maxX;x++){
      box++; var ii=y*bw+x; if(!bin[ii]&&!seen[ii]) enc++;
    }
    var closure=box?enc/box:0;

    var cells=[], mean=0;
    for(var gy=0;gy<GY;gy++) for(var gx=0;gx<GX;gx++){
      var x0=minX+Math.floor(W0*gx/GX), x1=minX+Math.floor(W0*(gx+1)/GX);
      var y0=minY+Math.floor(H0*gy/GY), y1=minY+Math.floor(H0*(gy+1)/GY);
      var n=0;
      for(y=y0;y<y1;y++) for(x=x0;x<x1;x++) if(bin[y*bw+x]) n++;
      cells.push({gx:gx,gy:gy,n:n}); mean+=n;
    }
    mean/=cells.length;
    var sd=0; cells.forEach(function(c){ sd+=(c.n-mean)*(c.n-mean); });
    sd=Math.sqrt(sd/cells.length);
    var cv=mean?sd/mean:1;
    var hot=cells.slice().sort(function(a,b){return b.n-a.n;})[0];
    var empt=cells.filter(function(c){ return c.n<mean*0.2; }).length;
    var aspect=H0/W0, seed=(ink*13+Math.round(aspect*100))%97;

    return {
      pcts:{
        C1:pct((seed%31)/31,0.5,0.2,true),
        C2:pct(sym*0.75+(1-Math.min(1,Math.abs(cxn)*3))*0.25,0.62,0.13,true),
        C3:pct(Math.abs(aspect-1.35),0.30,0.20,false),
        C4:pct(closure,0.42,0.18,true),
        C5:pct(cv,0.72,0.24,false),
        C6:pct((seed%43)/43,0.5,0.22,true),
        C7:pct((seed%37)/37,0.5,0.21,true)
      },
      detail:{sym:sym,side:side,heavy:(L>R?'왼쪽':'오른쪽'),cxn:cxn,closure:closure,cv:cv,mean:mean,
        hot:hot,empt:empt,aspect:aspect}
    };
  }

  function zone(gx,gy){
    return ['왼쪽','가운데','오른쪽'][Math.min(2,Math.floor(gx/(GX/3)))]+' '+
           ['위쪽','가슴~허리','아래쪽'][Math.min(2,Math.floor(gy/(GY/3)))];
  }
  function comment(id,r){
    var t=r.detail;
    switch(id){
      case 'C1': return '업로드된 스케치에서 의류 종류를 확정하기 어려운 상태입니다. (실제 서비스에서는 LLM 기반 분류로 계산합니다)';
      case 'C2': return '중심선 기준으로 좌우를 겹쳐보면 '+Math.round((1-t.sym)*100)+'%가 어긋나고, '+t.heavy+' 쪽 선 양이 반대쪽의 '+t.side.toFixed(1)+'배입니다. 의류는 좌우 대칭이 기본 전제라 이 편차는 그대로 지적이 됩니다. 중심선을 먼저 긋고 소매와 어깨를 같은 높이에서 다시 잡아보세요.';
      case 'C3': return '전체 세로 대 가로 비율이 '+t.aspect.toFixed(2)+'로 일반적인 범위에서 벗어나 있습니다. 어깨너비 대 총장 기준을 먼저 정하고 그 안에서 부위 길이를 잡는 편이 안정적입니다.';
      case 'C4': return '외곽에서 채워봤을 때 닫힌 영역이 전체의 '+Math.round(t.closure*100)+'%뿐입니다. 선이 끊겨 면이 닫히지 않은 곳이 남아 있어 부위를 특정하기 어렵습니다. 몸판과 소매 외곽선을 먼저 닫아주세요.';
      case 'C5': return zone(t.hot.gx,t.hot.gy)+' 구역의 선 밀도가 나머지 평균의 '+(t.mean?(t.hot.n/t.mean).toFixed(1):'2.0')+'배입니다'+(t.empt?', 반대로 거의 비어 있는 구역이 '+t.empt+'곳 있습니다':'')+'. 몰린 쪽 디테일을 덜어내거나 빈 쪽에 봉제선과 주름을 더해 균형을 맞추세요.';
      case 'C6': return '의도한 스타일과 예측 스타일이 어긋났습니다. (실제 서비스에서는 LLM 기반 스타일 분석이 필요한 항목입니다)';
      case 'C7': return '패턴 도면으로 옮기기 어려운 특징이 보입니다. (실제 서비스에서는 LLM 기반 분석이 필요한 항목입니다)';
    }
    return '';
  }

  /* ─────────── 결과 렌더 ─────────── */
  var hist=[];
  function tone(p){ return p<=25?'low':(p<=45?'mid':''); }

  function render(r){
    var ranked=AXES.map(function(a){
      var p=r.pcts[a.id];
      return {a:a,p:p,eff:focus[a.id]?p-14:p};
    }).sort(function(x,y){ return x.eff-y.eff; });
    var top=ranked[0];
    var avg=Math.round(AXES.reduce(function(s,a){ return s+r.pcts[a.id]; },0)/AXES.length);
    hist.push({axis:top.a.name,avg:avg});

    var h='<div class="pills"><span class="pill">로컬 데모 계산 · 서버 연동 전</span></div>';
    h+='<div class="lead"><div class="l">가장 먼저 볼 항목</div>'+
       '<h3>'+top.a.name+' <em>하위 '+top.p+'%</em></h3><p>'+comment(top.a.id,r)+'</p></div>';
    ranked.forEach(function(it){
      var c=tone(it.p), lb=it.p<=50?('하위 '+it.p+'%'):('상위 '+(100-it.p)+'%');
      h+='<div class="axis'+(focus[it.a.id]?' f':'')+'"><div class="axis-top">'+
         '<span class="nm">'+it.a.name+'</span>'+
         '<span class="pc '+c+'">'+lb+'</span></div>'+
         '<div class="bar"><i class="'+c+'" data-w="'+it.p+'"></i></div></div>';
    });
    p1.innerHTML=h;

    var t=r.detail;
    p2.innerHTML='<table class="dl">'+
      '<tr><td>좌우 겹침률</td><td>'+Math.round(t.sym*100)+'%</td></tr>'+
      '<tr><td>'+t.heavy+' 쪽 선 양</td><td>반대쪽의 '+t.side.toFixed(2)+'배</td></tr>'+
      '<tr><td>무게중심 치우침</td><td>'+(t.cxn>0?'오른쪽 ':'왼쪽 ')+Math.abs(Math.round(t.cxn*100))+'%</td></tr>'+
      '<tr><td>세로 / 가로 비율</td><td>'+t.aspect.toFixed(2)+'</td></tr>'+
      '<tr><td>닫힌 영역 비율</td><td>'+Math.round(t.closure*100)+'%</td></tr>'+
      '<tr><td>밀도 변동계수</td><td>'+t.cv.toFixed(2)+'</td></tr>'+
      '<tr><td>최다 밀도 구역</td><td>'+zone(t.hot.gx,t.hot.gy)+'</td></tr>'+
      '</table><p class="hint-box">지금은 업로드한 이미지에서 브라우저가 직접 계산한 로컬 값입니다.</p>';

    var hh='<div class="rec">';
    hist.slice(-6).forEach(function(x,i,arr){
      var pv=arr[i-1], df=pv?x.avg-pv.avg:null;
      hh+='<div class="row"><span class="n">'+(i+1)+'차 · '+x.axis+'</span>'+
          '<span class="a">평균 '+x.avg+'%'+(df===null?'':' <span class="'+(df>=0?'up':'down')+'">'+(df>=0?'▲':'▼')+Math.abs(df)+'</span>')+'</span></div>';
    });
    hh+='</div><p class="hint-box">스케치를 수정해 다시 올리면 항목별 변화가 쌓입니다.</p>';
    p3.innerHTML=hh;

    requestAnimationFrame(function(){
      p1.querySelectorAll('.bar i').forEach(function(f){ f.style.width=f.dataset.w+'%'; });
    });
  }

  /* ─────────── ① 관련성 확인 (연관성 없는 이미지 필터링) ───────────
     TODO(Django 연동 지점): 실제로는 이미지를 서버로 보내 GPT-4o(LMM)에게
     "이게 패션 스케치인가?"를 물어 confidence·category를 받고,
     그 값으로 pass(자동 통과) / reject(거절) / unsure(사용자 재확인)를 나눠야 한다.
     지금은 서버가 없어서, 선(잉크) 밀도만 보는 아주 가벼운 로컬 필터로 그 3가지
     화면 상태만 미리 만들어 둔 것. */
  function checkRelevance(){
    return new Promise(function(resolve){
      setTimeout(function(){
        var d=ictx.getImageData(0,0,IW,IH).data, dark=0, total=0;
        for(var i=0;i<d.length;i+=40){
          total++;
          var lum=d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114;
          if(lum<170) dark++;
        }
        var ratio = total ? dark/total : 0;
        if(ratio < 0.01){
          resolve({status:'reject', message:'이미지에서 선(스케치)을 거의 찾지 못했습니다. 다른 이미지를 올려주세요.'});
        }else if(ratio > 0.6){
          resolve({status:'unsure', message:'이미지 대부분이 어둡게 채워져 있어 스케치인지 확실하지 않습니다. 스케치가 맞다면 계속 진행해 주세요.'});
        }else{
          resolve({status:'pass', message:''});
        }
      }, 420);
    });
  }

  /* ─────────── ② 본 진단 ───────────
     TODO(Django 연동 지점): 실제로는 이미지 + 고민 텍스트(+ 선택된 항목)를
     서버로 보내 LLM 응답(항목별 점수·피드백)을 받아 render()에 넘겨야 한다.
     지금은 localAnalyze()가 그 자리를 대신한다. */
  function runFullDiagnosis(){
    p1.innerHTML='<div class="load">선을 추출하고 진단하는 중<div class="t"><i></i></div></div>';
    runBtn.disabled=true;
    setTimeout(function(){
      var r=localAnalyze();
      runBtn.disabled=false;
      if(!r){
        p1.innerHTML='<div class="empty-r"><b>선을 찾지 못했습니다</b><p>배경이 너무 밝거나 선이 연한 이미지일 수 있습니다. 대비가 분명한 스케치로 시도해 보세요.</p></div>';
        return;
      }
      render(r);
    },560);
  }

  runBtn.onclick=function(){
    if(!loaded) return;
    runBtn.disabled=true;
    p1.innerHTML='<div class="load">이미지가 패션 스케치인지 확인하는 중<div class="t"><i></i></div></div>';

    checkRelevance().then(function(rel){
      if(rel.status==='reject'){
        runBtn.disabled=false;
        p1.innerHTML='<div class="empty-r"><b>패션 스케치로 인식되지 않았습니다</b><p>'+escapeHtml(rel.message)+'</p></div>';
        return;
      }
      if(rel.status==='unsure'){
        runBtn.disabled=false;
        p1.innerHTML='<div class="empty-r"><b>이미지를 다시 확인해 주세요</b><p>'+escapeHtml(rel.message)+'</p>'+
          '<button class="btn primary" id="confirmProceed">그래도 진단 진행</button></div>';
        document.getElementById('confirmProceed').onclick=function(){ runFullDiagnosis(); };
        return;
      }
      runFullDiagnosis();
    });
  };

  apply();
})();
