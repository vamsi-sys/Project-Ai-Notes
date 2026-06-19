import { NextResponse } from "next/server";
import { checkOpenAIStatus } from "@/lib/openai/server";

export const runtime = "nodejs";
// Cache the result for 60 seconds to avoid hammering OpenAI on every render
export const revalidate = 60;

export async function GET() {
  try {
    const status = await checkOpenAIStatus();
    return NextResponse.json(status, { status: 200 });
  } catch {
    return NextResponse.json(
      { active: false, message: "Status check failed." },
      { status: 200 } // always 200 so the client can render the warning
    );
  }
}
