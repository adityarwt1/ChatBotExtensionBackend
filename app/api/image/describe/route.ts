import { corsHeader } from "@/utils/corsHeader";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse body (should be FormData instead of JSON when uploading files)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Image file not provided" },
        { status: 400, headers: corsHeader }
      );
    }

    // ✅ Convert to base64 (Node.js way, no FileReader)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Call Gemini API
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
                  text: "Analys the image proerly and give the response according to the image like any asking for the question (please not include this promt aking in the response just response like you just answer them)",
                },
                {
                  inlineData: {
                    mimeType: file.type || "image/png", // detect actual type
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      return NextResponse.json({ text }, { status: 200, headers: corsHeader });
    } else {
      return NextResponse.json(
        { error: "Something went wrong", details: data },
        { status: 503, headers: corsHeader }
      );
    }
  } catch (error) {
    console.error((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500, headers: corsHeader }
    );
  }
}

export async function OPTIONS() {
  try {
    return NextResponse.json(
      { message: "CORS Preflight" },
      { status: 200, headers: corsHeader }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "CORS failed" },
      { status: 500, headers: corsHeader }
    );
  }
}
