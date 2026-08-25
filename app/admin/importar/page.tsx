"use client";
import {useState} from "react";
type Alt={letter:string;content:string}; type Q={number:number;statement:string;alternatives:Alt[];confidence:number};
export default function Importar(){
 const[url,setUrl]=useState(""); const[loading,setLoading]=useState(false); const[data,setData]=useState<{questions:Q[];pages:number;error?:string}|null>(null); const[error,setError]=useState("");
 async function processar(){
  setLoading(true);setError("");setData(null);
  try{const r=await fetch("/api/admin/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Falha");setData(j)}catch(e:any){setError(e.message)}finally{setLoading(false)}
 }
 async function salvar(status:"review"|"published"){
  if(!data)return; const title=prompt("Título da prova:","Processo Seletivo"); const year=Number(prompt("Ano:","2026")); if(!title||!year)return;
  const r=await fetch("/api/admin/import/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,title,year,shift:"diurno",status,questions:data.questions})});
  const j=await r.json(); if(!r.ok)alert(j.error||"Erro"); else alert(`Prova salva com ${j.questions} questões. Status: ${j.status}`);
 }
 return <main className="container"><h1>Importar prova</h1><p className="muted">Use PDF oficial. O processamento ocorre no servidor; revise antes de publicar.</p>
 <div className="card"><label>URL do PDF oficial</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://.../prova.pdf" style={{width:"100%",padding:12,margin:"10px 0"}}/><button className="btn" disabled={!url||loading} onClick={processar}>{loading?"Processando PDF...":"Processar PDF"}</button></div>
 {error&&<div className="card">Erro: {error}</div>}
 {data&&<><div className="card"><h2>Resultado</h2><p>{data.pages} páginas · {data.questions.length} questões encontradas</p><p>Prontas: {data.questions.filter(q=>q.confidence>=.9&&q.alternatives.length===5).length} · Revisar: {data.questions.filter(q=>q.confidence<.9||q.alternatives.length!==5).length}</p>
 <button className="btn secondary" onClick={()=>salvar("review")}>Salvar para revisão</button>{" "}<button className="btn" onClick={()=>salvar("published")}>Publicar agora</button></div>
 {data.questions.map((q,i)=><div className="card" key={i}><b>Questão {q.number}</b><span className="muted"> · confiança {Math.round(q.confidence*100)}%</span><textarea value={q.statement} onChange={e=>setData(d=>d?{...d,questions:d.questions.map((x,n)=>n===i?{...x,statement:e.target.value}:x)}:d)} style={{width:"100%",minHeight:90,marginTop:8}}/>{q.alternatives.map((a,j)=><div key={j}><b>{a.letter}) </b><input value={a.content} onChange={e=>setData(d=>d?{...d,questions:d.questions.map((x,n)=>n===i?{...x,alternatives:x.alternatives.map((y,k)=>k===j?{...y,content:e.target.value}:y)}:x)}:d)} style={{width:"90%",padding:6,margin:4}}/></div>)}</>)}</main>
}