import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    return NextResponse.json({message:"Unotherized area" , warnnnig:"Backend Designed for ChatBot Extension - Aditya Rawat, Suuspecies not allowed" },{status: 401})
    
}