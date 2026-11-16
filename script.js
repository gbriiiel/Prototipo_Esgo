const $=id=>document.getElementById(id);
const TABS=[["inicio","Início"],["empresa","Empresa"],["registrar","Registrar"],["painel","Painel"],["dashboard","Dashboard"],["acoes","Ações"]];
let S={emp:null,regs:[],acts:[]};
try{const r=localStorage.getItem("esgo");if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem("esgo",JSON.stringify(S))}catch(e){}};
const nav=$("nav");
TABS.forEach(([id,t])=>{const b=document.createElement("button");b.textContent=t;b.dataset.go=id;nav.appendChild(b)});
function go(id){
 TABS.forEach(([i])=>$(i).hidden=i!==id);
 nav.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",b.dataset.go===id));
 if(id==="registrar")drawList();if(id==="painel")drawPanel();if(id==="dashboard")drawDash();if(id==="acoes")drawActs();
 if(id==="empresa"&&S.emp){$("cNome").value=S.emp.nome;$("cSetor").value=S.emp.setor;$("cFunc").value=S.emp.func}
 try{history.replaceState(null,"","#"+id)}catch(e){}scrollTo(0,0)}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g)go(g.dataset.go)});
const n=v=>{v=parseFloat(v);return isNaN(v)?null:v};
const fmt=(v,d=1)=>v==null?"–":v.toLocaleString("pt-BR",{maximumFractionDigits:d});
const mesTxt=m=>{const[a,b]=m.split("-");return["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][b-1]+"/"+a.slice(2)};

$("salvarEmp").onclick=()=>{const nome=$("cNome").value.trim();if(!nome){$("cNome").focus();return}
 S.emp={nome,setor:$("cSetor").value,func:n($("cFunc").value)||1};save();$("rFunc").value=S.emp.func;go("registrar")};
$("rMes").value=new Date().toISOString().slice(0,7);
if(S.emp)$("rFunc").value=S.emp.func;

$("salvarReg").onclick=()=>{
 const f=n($("rFunc").value),mes=$("rMes").value;
 if(!mes||!f){$("regMsg").textContent="Informe o mês e o número de funcionários.";return}
 const r={mes,f,falt:n($("rFalt").value),desl:n($("rDesl").value),acid:n($("rAcid").value),sat:n($("rSat").value),agua:n($("rAgua").value),ener:n($("rEner").value),res:n($("rRes").value),meta:n($("rMeta").value),proc:n($("rProc").value)};
 S.regs=S.regs.filter(x=>x.mes!==mes).concat(r).sort((a,b)=>a.mes<b.mes?-1:1);save();
 $("regMsg").textContent="Registro de "+mesTxt(mes)+" salvo. Veja o painel.";drawList()};
function drawList(){
 $("lista").innerHTML=S.regs.length?`<table><tr><th>Mês</th><th>Func.</th><th>Faltas</th><th>Deslig.</th><th>Acid.</th><th>Satisf.</th><th></th></tr>${S.regs.map(r=>`<tr><td>${mesTxt(r.mes)}</td><td>${r.f}</td><td>${fmt(r.falt,0)}</td><td>${fmt(r.desl,0)}</td><td>${fmt(r.acid,0)}</td><td>${fmt(r.sat)}</td><td><button class="btn alt" data-del="${r.mes}" style="padding:4px 10px">Excluir</button></td></tr>`).join("")}</table>`:'<div class="empty">Nenhum registro ainda. Preencha o formulário acima.</div>'}
$("lista").onclick=e=>{const m=e.target.dataset.del;if(m){S.regs=S.regs.filter(r=>r.mes!==m);save();drawList()}};

/* indicadores: st = 2 ok, 1 atenção, 0 crítico */
const IND=[
{k:"abs",d:"S",nome:"Absenteísmo",un:"%",low:1,val:r=>r.falt==null?null:r.falt/(r.f*22)*100,st:v=>v<=3?2:v<=5?1:0,tip:"Faltas acima de 5% sugerem desmotivação ou problemas de saúde. Converse com a equipe e revise a carga de trabalho.",act:"Conversar individualmente com os colaboradores que mais faltam e revisar escalas e carga de trabalho"},
{k:"rot",d:"S",nome:"Rotatividade",un:"%",low:1,val:r=>r.desl==null?null:r.desl/r.f*100,st:v=>v<=2?2:v<=4?1:0,tip:"Cada desligamento gera custo de demissão, nova contratação e treinamento.",act:"Fazer entrevistas de desligamento e revisar clima, salários e oportunidades de crescimento"},
{k:"acid",d:"S",nome:"Acidentes de trabalho",un:"",low:1,val:r=>r.acid,st:v=>v===0?2:v<=1?1:0,tip:"Qualquer acidente pede análise de causa e reforço de segurança.",act:"Investigar a causa dos acidentes e reforçar treinamento e equipamentos de segurança"},
{k:"sat",d:"S",nome:"Satisfação",un:"/10",low:0,val:r=>r.sat,st:v=>v>=7.5?2:v>=6?1:0,tip:"Satisfação baixa antecede faltas e saídas. Ouça a equipe.",act:"Aplicar pesquisa rápida de satisfação e definir uma melhoria combinada com a equipe"},
{k:"agua",d:"E",nome:"Água por pessoa",un:"m³",low:1,val:r=>r.agua==null?null:r.agua/r.f,rel:1,tip:"Consumo subindo sem motivo costuma indicar vazamento ou desperdício.",act:"Vistoriar vazamentos e criar regras de uso consciente de água"},
{k:"ener",d:"E",nome:"Energia por pessoa",un:"kWh",low:1,val:r=>r.ener==null?null:r.ener/r.f,rel:1,tip:"Equipamentos ligados sem uso e iluminação elevam a conta.",act:"Desligar equipamentos ociosos e avaliar troca por lâmpadas e aparelhos eficientes"},
{k:"res",d:"E",nome:"Resíduos por pessoa",un:"kg",low:1,val:r=>r.res==null?null:r.res/r.f,rel:1,tip:"Mais resíduo é, em geral, mais material desperdiçado.",act:"Mapear onde há desperdício de materiais e implantar coleta seletiva"},
{k:"meta",d:"G",nome:"Metas cumpridas",un:"%",low:0,val:r=>r.meta,st:v=>v>=80?2:v>=60?1:0,tip:"Metas sem cumprimento indicam metas irreais ou falta de acompanhamento.",act:"Revisar as metas com a equipe, deixando-as realistas, mensuráveis e com prazo"},
{k:"proc",d:"G",nome:"Processos documentados",un:"%",low:0,val:r=>r.proc,st:v=>v>=70?2:v>=40?1:0,tip:"Processos claros reduzem erros e dependência de uma só pessoa.",act:"Documentar os 3 processos mais importantes do negócio, passo a passo"}];
const DN={E:"Ambiental",S:"Social",G:"Governança"};
function status(i,v,prev){
 if(v==null)return null;
 if(i.rel){if(prev==null)return 2;const c=(v-prev)/(prev||1);return c<=0.02?2:c<=0.1?1:0}
 return i.st(v)}
const SL=["Crítico","Atenção","Em dia"],SC=["bad","warn","ok"];
function chart(i){
 const pts=S.regs.map(r=>({m:r.mes,v:i.val(r)})).filter(p=>p.v!=null);
 if(pts.length<2)return'<p class="mut" style="margin:8px 0 0">Registre ao menos 2 meses para ver a evolução.</p>';
 const W=300,H=90,mx=Math.max(...pts.map(p=>p.v),.0001),bw=W/pts.length;
 return`<svg viewBox="0 0 ${W} ${H+16}" width="100%" role="img" aria-label="Evolução de ${i.nome}">${pts.map((p,x)=>{const h=Math.max(2,p.v/mx*H),last=x===pts.length-1;return`<rect x="${x*bw+bw*.15}" y="${H-h}" width="${bw*.7}" height="${h}" rx="3" fill="${last?"var(--g)":"var(--g2)"}"/><text x="${x*bw+bw/2}" y="${H+12}" text-anchor="middle">${mesTxt(p.m)}</text>`}).join("")}</svg>`}
function calc(){
 const L=S.regs[S.regs.length-1],P=S.regs[S.regs.length-2];
 return IND.map(i=>{const v=L?i.val(L):null,p=P?i.val(P):null;return{i,v,p,s:status(i,v,p)}})}
function drawPanel(){
 const el=$("pBody");
 $("pTitulo").textContent=S.emp?"Painel de "+S.emp.nome:"Painel";
 if(!S.regs.length){el.innerHTML='<div class="empty">Ainda não há dados. <button class="btn" data-go="registrar">Registrar dados</button> ou <button class="btn alt" id="demo2">carregar exemplo</button></div>';$("demo2").onclick=demo;return}
 const R=calc(),L=S.regs[S.regs.length-1];
 const sc=d=>{const a=R.filter(x=>x.i.d===d&&x.s!=null);return a.length?Math.round(a.reduce((t,x)=>t+[25,60,100][x.s],0)/a.length):null};
 const cls=v=>v==null?"":v>=80?"ok":v>=55?"warn":"bad";
 let h=`<p class="mut">Referência: ${mesTxt(L.mes)}. As notas por dimensão resumem o semáforo dos indicadores.</p><div class="dims">${["E","S","G"].map(d=>{const v=sc(d);return`<div class="dim"><span class="mut">${DN[d]} (${d})</span><br><b class="${cls(v)}">${v==null?"–":v}</b><span class="mut"> /100</span></div>`}).join("")}</div>`;
 const al=R.filter(x=>x.s===0||x.s===1).sort((a,b)=>a.s-b.s);
 h+=al.length?`<h3>Pontos de atenção</h3>`+al.map(x=>`<div class="alert ${SC[x.s]}" style="border-color:currentColor"><b class="${SC[x.s]}">${x.i.nome}: ${SL[x.s]}</b><div style="color:var(--ink)">${x.i.tip}</div><button class="btn alt" style="margin-top:8px;padding:5px 12px;color:var(--ink)" data-add="${x.i.k}">Criar ação</button></div>`).join(""):'<div class="alert ok" style="border-color:currentColor"><b>Tudo em dia neste mês.</b></div>';
 h+='<h3 style="margin-top:20px">Indicadores</h3><div class="dims">'+R.filter(x=>x.v!=null).map(x=>{
  const t=x.p==null?"":x.v>x.p?"▲":x.v<x.p?"▼":"=";
  return`<div class="dim"><span class="pill ${SC[x.s]}">${SL[x.s]}</span> <span class="mut">${x.i.d}</span><h3 style="margin-top:8px">${x.i.nome}</h3><b style="font-size:30px;letter-spacing:-1px">${fmt(x.v)}</b> <span class="mut">${x.i.un} ${t}</span>${chart(x.i)}</div>`}).join("")+'</div>';
 el.innerHTML=h}
$("pBody").addEventListener("click",e=>{const k=e.target.dataset.add;if(k){addAct(IND.find(i=>i.k===k).act);go("acoes")}});


/* ===== DASHBOARD ===== */
const DCOR={E:"var(--g)",S:"var(--warn)",G:"#5b8fb9"};
function scoreAt(d,x){
 const r=S.regs[x],p=S.regs[x-1];
 const a=IND.filter(i=>i.d===d).map(i=>status(i,i.val(r),p?i.val(p):null)).filter(s=>s!=null);
 return a.length?Math.round(a.reduce((t,s)=>t+[25,60,100][s],0)/a.length):null}
function overallAt(x){const a=["E","S","G"].map(d=>scoreAt(d,x)).filter(v=>v!=null);return a.length?Math.round(a.reduce((t,v)=>t+v,0)/a.length):null}
const delta=(a,b)=>a==null||b==null?"":(a-b>0?'<span class="ok">▲ +':a-b<0?'<span class="bad">▼ ':'<span class="mut">= ')+(a-b)+"</span>";
function lineChart(){
 const N=S.regs.length,W=560,H=170,px=36,py=10;
 const X=x=>N===1?W/2:px+x*(W-px-12)/(N-1),Y=v=>py+(100-v)/100*H;
 let g=[0,50,100].map(v=>`<line x1="${px}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="4" y="${Y(v)+4}">${v}</text>`).join("");
 g+=S.regs.map((r,x)=>`<text x="${X(x)}" y="${H+py+16}" text-anchor="middle">${mesTxt(r.mes)}</text>`).join("");
 ["E","S","G"].forEach(d=>{
  const pts=S.regs.map((r,x)=>({x,v:scoreAt(d,x)})).filter(p=>p.v!=null);
  if(pts.length>1)g+=`<polyline fill="none" stroke="${DCOR[d]}" stroke-width="3" stroke-linejoin="round" points="${pts.map(p=>X(p.x)+","+Y(p.v)).join(" ")}"/>`;
  g+=pts.map(p=>`<circle cx="${X(p.x)}" cy="${Y(p.v)}" r="4" fill="${DCOR[d]}"><title>${DN[d]}: ${p.v}</title></circle>`).join("")});
 return`<svg viewBox="0 0 ${W} ${H+py+24}" width="100%" role="img" aria-label="Evolução das notas ambiental, social e de governança">${g}</svg>
 <div class="legend">${["E","S","G"].map(d=>`<span><i style="background:${DCOR[d]}"></i>${DN[d]}</span>`).join("")}</div>`}
function heat(){
 const cols=S.regs.map(r=>`<th>${mesTxt(r.mes)}</th>`).join("");
 const rows=IND.filter(i=>S.regs.some(r=>i.val(r)!=null)).map(i=>{
  const cells=S.regs.map((r,x)=>{const v=i.val(r),s=status(i,v,x?i.val(S.regs[x-1]):null);
   return v==null?"<td>–</td>":`<td><span class="dot" style="background:var(--${SC[s]})"></span>${fmt(v)}</td>`}).join("");
  return`<tr><th scope="row">${i.nome} <span class="mut">(${i.d})</span></th>${cells}</tr>`}).join("");
 return`<div class="scroll"><table class="heat"><tr><th>Indicador</th>${cols}</tr>${rows}</table></div>
 <div class="legend"><span><i style="background:var(--ok)"></i>Em dia</span><span><i style="background:var(--warn)"></i>Atenção</span><span><i style="background:var(--bad)"></i>Crítico</span></div>`}
function drawDash(){
 const el=$("dBody");
 $("dTitulo").textContent=S.emp?"Dashboard de "+S.emp.nome:"Dashboard";
 if(!S.regs.length){el.innerHTML='<div class="empty">Ainda não há dados para o dashboard. <button class="btn" data-go="registrar">Registrar dados</button> ou <button class="btn alt" id="demo3">carregar exemplo</button></div>';$("demo3").onclick=demo;return}
 const x=S.regs.length-1,R=calc();
 const cont=[0,0,0];R.forEach(r=>{if(r.s!=null)cont[r.s]++});
 const tot=cont[0]+cont[1]+cont[2]||1;
 const ov=overallAt(x),ovP=x?overallAt(x-1):null;
 const done=S.acts.filter(a=>a.ok).length,pct=S.acts.length?Math.round(done/S.acts.length*100):null;
 const crit=R.filter(r=>r.s===0).map(r=>r.i.nome);
 const best=R.filter(r=>r.s===2).length;
 let h=`<div class="kpis">
 <div class="kpi"><span class="mut">Nota geral</span><b>${ov==null?"–":ov}</b><span>${delta(ov,ovP)||'<span class="mut">primeiro mês</span>'}</span></div>
 <div class="kpi"><span class="mut">Indicadores em dia</span><b class="ok">${best}</b><span class="mut">de ${tot} medidos</span></div>
 <div class="kpi"><span class="mut">Críticos</span><b class="${cont[0]?"bad":"ok"}">${cont[0]}</b><span class="mut">${crit.length?crit.slice(0,2).join(", "):"nenhum"}</span></div>
 <div class="kpi"><span class="mut">Ações concluídas</span><b>${pct==null?"–":pct+"%"}</b><span class="mut">${S.acts.length?done+" de "+S.acts.length:"sem ações"}</span></div></div>
 <div class="dims">${["E","S","G"].map(d=>{const v=scoreAt(d,x);return`<div class="dim" style="border-top:4px solid ${DCOR[d]}"><span class="mut">${DN[d]} (${d})</span><br><b>${v==null?"–":v}</b> ${x?delta(v,scoreAt(d,x-1)):""}</div>`}).join("")}</div>
 <div class="card"><h3>Evolução das notas</h3>${S.regs.length>1?lineChart():'<p class="mut">Registre ao menos 2 meses para ver as linhas de evolução.</p>'}</div>
 <div class="card"><h3>Situação dos indicadores neste mês</h3>
  <div class="stack" role="img" aria-label="Distribuição do semáforo"><span style="width:${cont[2]/tot*100}%;background:var(--ok)"></span><span style="width:${cont[1]/tot*100}%;background:var(--warn)"></span><span style="width:${cont[0]/tot*100}%;background:var(--bad)"></span></div>
  <p class="mut" style="margin-top:8px">${cont[2]} em dia · ${cont[1]} em atenção · ${cont[0]} críticos</p></div>
 <div class="card"><h3>Mapa mês a mês</h3><p class="mut">Cada ponto colorido mostra a situação do indicador naquele mês.</p>${heat()}</div>`;
 el.innerHTML=h}

function addAct(t){if(!t)return;if(!S.acts.some(a=>a.t===t))S.acts.push({t,ok:false});save()}
$("aAdd").onclick=()=>{addAct($("aTxt").value.trim());$("aTxt").value="";drawActs()};
function drawActs(){
 $("aLista").innerHTML=S.acts.length?S.acts.map((a,x)=>`<div class="act ${a.ok?"done":""}"><input type="checkbox" ${a.ok?"checked":""} data-t="${x}" aria-label="Concluir"><span>${a.t.replace(/</g,"&lt;")}</span><button data-r="${x}" aria-label="Remover ação">×</button></div>`).join(""):'<div class="empty">Nenhuma ação ainda. Crie uma ação a partir de um alerta do painel ou escreva a sua acima.</div>';
 const pend=S.acts.filter(a=>!a.ok).length;
 $("sug").innerHTML=S.acts.length?`<p class="mut">${S.acts.length-pend} de ${S.acts.length} ações concluídas.</p>`:""}
$("aLista").onclick=e=>{const d=e.target.dataset;if(d.t!=null){S.acts[d.t].ok=e.target.checked}if(d.r!=null){S.acts.splice(d.r,1)}save();drawActs()};

function demo(){
 S.emp={nome:"Padaria Boa Massa",setor:"Alimentação",func:12};
 const d=[[2,6,1,0,6.8,41,2700,210,55,35],[2,7,1,1,6.5,42,2750,220,58,38],[3,8,1,1,6.2,44,2900,236,50,40],[3,10,2,1,5.9,47,3100,260,45,45],[3,12,2,2,5.6,52,3300,300,40,45],[3,13,3,2,5.4,56,3500,330,38,50]];
 const base=new Date();base.setDate(1);
 S.regs=d.map((x,i)=>{const t=new Date(base.getFullYear(),base.getMonth()-(5-i),1);return{mes:t.toISOString().slice(0,7),f:12,falt:x[1]*2+x[0]*0,desl:x[2]-1<0?0:x[2]-1+(i>3?1:0),acid:x[3],sat:x[4],agua:x[5],ener:x[6],res:x[7],meta:x[8]+20,proc:x[9]}});
 S.acts=[];save();go("painel")}
$("demo").onclick=demo;
go((location.hash||"#inicio").slice(1).match(/^(inicio|empresa|registrar|painel|dashboard|acoes)$/)?location.hash.slice(1):"inicio");