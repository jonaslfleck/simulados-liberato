import { createClient } from "./supabase/client";
export async function getPublishedExams(){const s=createClient();const {data,error}=await s.from("exams").select("*").eq("import_status","published").order("year",{ascending:false});if(error)throw error;return data||[]}
export async function getExamQuestions(examId:string){const s=createClient();const {data,error}=await s.from("questions").select("id,question_number,subject,statement,alternatives(id,letter,content)").eq("exam_id",examId).order("question_number");if(error)throw error;return data||[]}
