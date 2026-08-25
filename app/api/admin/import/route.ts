import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(req:NextRequest){try{const {url}=await req.json();const r=await fetch(url);const b=Buffer.from(await r.arrayBuffer());const parsed=await pdf(b);return NextResponse.json({pages:parsed.numpages,text:parsed.text})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Erro interno"},{status:500})}}
