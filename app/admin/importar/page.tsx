"use client";
import { useState } from "react";
type Alternative={letter:string;content:string};
type Question={number:number;statement:string;alternatives:Alternative[];confidence:number};
type ImportResult={questions:Question[];pages:number};
async function readApi(r:Response){const ct=r.headers.get("content-type")||"";if(ct.includes("application/json")){const j=await r.json();if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);return j}const t=await r.text();throw new Error(`A API retornou HTML/texto (HTTP ${r.status}). ${t.replace(/<[^>]*>/g," ").replace(/\s+/g," ").slice(0,220)}`)}
export default function Page(){
 const[url,setUrl]=useState("");const[loading,setLoading]=useState(false);const[data,setData]=useState<ImportResult|null>(null);const[error,setError]=useState("");
 async function processar(){setLoading(true);setError("");setData(null);try{const r=await fetch("/api/admin/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});setData(await readApi(r))}catch(e){setError(e instanceof Error?e.message:"Erro desconhecido")}finally{setLoading(false)}}
 async function salvar(status:"review"|"published"){if(!data)return;const title=window.prompt("Título da prova:","Processo Seletivo")||"";const year=Number(window.prompt("Ano:","2026"));if(!title||!Number.isInteger(year))return;try{const r=await fetch("/api/admin/import/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,title,year,shift:"diurno",status,questions:data.questions})});const j=await readApi(r);alert(`Prova salva com ${j.questions} questões. Status: ${j.status}`)}catch(e){alert(e instanceof Error?e.message:"Erro ao salvar")}}
 function updateStatement(i:number,v:string){setData(d=>d?{...d,questions:d.questions.map((q,n)=>n===i?{...q,statement:v}:q)}:d)}
 function updateAlt(i:number,j:number,v:string){setData(d=>d?{...d,questions:d.questions.map((q,n)=>n===i?{...q,alternatives:q.alternatives.map((a,k)=>k===j?{...a,content:v}:a)}:q)}:d)}
 const ready=data?.questions.filter(q=>q.confidence>=.9&&q.alternatives.length===5).length||0;
 return <main className="container"><h1>Importar prova</h1><p className="muted">Informe a URL direta de um PDF oficial. O PDF é processado no servidor.</p>
 <div className="card"><label htmlFor="url">URL do PDF</label><input id="url" type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://.../prova.pdf" style={{width:"100%",padding:12,margin:"10px 0"}}/><button className="btn" disabled={!url||loading} onClick={processar}>{loading?"Processando PDF...":"Processar PDF"}</button></div>
 {error&&<div className="card"><b>Erro:</b> {error}</div>}
 {data&&<><div className="card"><h2>Resultado</h2><p>{data.pages} páginas · {data.questions.length} questões encontradas</p><p>Prontas: {ready} · Revisar: {data.questions.length-ready}</p><button className="btn secondary" onClick={()=>salvar("review")}>Salvar para revisão</button>{" "}<button className="btn" onClick={()=>salvar("published")}>Publicar agora</button></div>
 {data.questions.map((q,i)=><div className="card" key={`${q.number}-${i}`}><b>Questão {q.number}</b><span className="muted"> · confiança {Math.round(q.confidence*100)}%</span><textarea value={q.statement} onChange={e=>updateStatement(i,e.target.value)} style={{display:"block",width:"100%",minHeight:100,padding:8,margin:"10px 0"}}/>{q.alternatives.map((a,j)=><div key={`${a.letter}-${j}`} style={{display:"flex",gap:8,marginBottom:8}}><b>{a.letter})</b><input value={a.content} onChange={e=>updateAlt(i,j,e.target.value)} style={{flex:1,padding:8}}/></div>)}</div>)}</>}
 </main>
}