import { createClient } from "./supabase/client";
export async function getPublishedExams(){
 const supabase=createClient();
 const {data,error}=await supabase.from("exams").select("id,year,shift,title,total_questions").eq("import_status","published").order("year",{ascending:false});
 if(error) throw error; return data||[];
}
export async function getExamQuestions(examId:string){
 const supabase=createClient();
 const {data,error}=await supabase.from("questions").select("id,question_number,subject,statement,alternatives(id,letter,content)").eq("exam_id",examId).order("question_number");
 if(error) throw error; return data||[];
}