import { corsHeader } from "@/utils/corsHeader";
import { NextRequest, NextResponse } from "next/server";

// Utility to extract base64 from Data URL (e.g. from Canvas or Camera Capture)
function extractBase64FromDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.*);base64,(.*)$/);
  if (!matches) throw new Error("Invalid Data URL");
  const mimeType = matches[1];
  const base64Data = matches[2];
  return { mimeType, base64Data };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let base64Data: string = "";
    let mimeType: string = "image/png";
    let prompt: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData uploads
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      prompt = formData.get("prompt") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: "Image file not provided" },
          { status: 400, headers: corsHeader }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString("base64");
      mimeType = file.type || "image/png";

    } else {
      // Handle direct base64 JSON input from captured image (like camera capture)
      const body = await req.json();
      prompt = body.prompt || null;

      if (body.image && typeof body.image === "string") {
        if (body.image.startsWith("data:")) {
          const result = extractBase64FromDataUrl(body.image);
          base64Data = result.base64Data;
          mimeType = result.mimeType;
        } else {
          base64Data = body.image;
        }
      } else {
        throw new Error("No image or file provided");
      }
    }

    // Send request to Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    prompt ||
                    "Analyze the image properly and answer naturally according to the content.",
                },
                {
                  inlineData: {
                    mimeType,
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      return NextResponse.json({ text }, { status: 200, headers: corsHeader });
    } else {
      return NextResponse.json(
        { error: "Gemini API error", details: data },
        { status: 503, headers: corsHeader }
      );
    }
  } catch (error) {
    console.error(error);
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
