import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY!);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Please summarize the following note in 3-4 clear, concise bullet points:

${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json({ summary: response.text() });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
