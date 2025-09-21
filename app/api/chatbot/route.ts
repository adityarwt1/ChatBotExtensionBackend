import { corsHeader } from "@/utils/corsHeader";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {promt} = await req.json()

    if(!promt){
        return NextResponse.json({error: "Prompt not provided"},{status: 400,headers: corsHeader})
    }
 const response = await fetch(
   "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
   {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "X-goog-api-key": process.env.GEMINI_API_KEY!, // better: keep key in .env
     },
     body: JSON.stringify({
       contents: [
         {
           parts: [
             {
               text: promt,
             },
            
           ],
         },
       ],
     }),
   }
 );

 const data = await response.json();

 if(response.ok){
      if (response.ok) {
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        return NextResponse.json(
          { text },
          { status: 200, headers: corsHeader }
        );
      } else {
        return NextResponse.json(
          { error: "Something went wrong", details: data },
          { status: 503, headers: corsHeader }
        );
      }
 }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 ,headers: corsHeader }
    );
  }
}



export async function OPTIONS(req: NextRequest) {

    try {
        return NextResponse.json({message: "Cors Preflight"},{status: 200,headers   : corsHeader})
    } catch (error) {
        console.log((error as Error).message)
    return NextResponse.json({error:"Something went wrong"},{status: 500 , headers:corsHeader})
    }
    
}