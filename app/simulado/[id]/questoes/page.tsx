"use client";
import { useEffect, useState } from "react";
import Nav from "../../../../components/Nav";
import { getExamQuestions } from "../../../../lib/questions";
type Alternative={id:string;letter:string;content:string};
type Question={id:string;question_number:number;subject?:string;statement:string;alternatives:Alternative[]};
export default function QuestionsPage({params}:{params:Promise<{id:string}>}){
 const [questions,setQuestions]=useState<Question[]>([]);const [currentIndex,setCurrentIndex]=useState(0);const [answers,setAnswers]=useState<Record<string,string>>({});const [error,setError]=useState("");
 useEffect(()=>{async function load(){try{const {id}=await params;setQuestions(await getExamQuestions(id) as Question[])}catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar as questões")}}load()},[params]);
 if(error)return <><Nav/><main className="container"><div className="card"><strong>Erro:</strong> {error}</div></main></>;
 if(!questions.length)return <><Nav/><main className="container"><div className="card">Carregando questões...</div></main></>;
 const q=questions[currentIndex];
 return <><Nav/><main className="container"><p className="muted">Questão {currentIndex+1} de {questions.length}</p><div className="card">{q.subject&&<p className="muted">{q.subject}</p>}<h2>{q.question_number}. {q.statement}</h2>{q.alternatives.map(a=><label key={a.id} style={{display:"block",padding:10,cursor:"pointer"}}><input type="radio" name={`answer-${q.id}`} checked={answers[q.id]===a.id} onChange={()=>setAnswers(p=>({...p,[q.id]:a.id}))}/> <strong>{a.letter})</strong> {a.content}</label>)}</div><div style={{display:"flex",gap:10,marginTop:15}}><button className="btn secondary" disabled={currentIndex===0} onClick={()=>setCurrentIndex(i=>Math.max(0,i-1))}>Anterior</button>{currentIndex<questions.length-1?<button className="btn" onClick={()=>setCurrentIndex(i=>Math.min(questions.length-1,i+1))}>Próxima</button>:<button className="btn" onClick={()=>alert(`Simulado finalizado. ${Object.keys(answers).length} respostas registradas nesta sessão.`)}>Finalizar</button>}</div><p className="muted" style={{marginTop:15}}>Respondidas: {Object.keys(answers).length} de {questions.length}</p></main></>;}