import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(10)
});

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "AI polish unavailable" }, { status: 400 });
  }

  const body = await request.json();
  const { text } = requestSchema.parse(body);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a concise executive editor for customer dispatch reports. Improve clarity and polish without adding new facts."
        },
        { role: "user", content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI polish failed" }, { status: 500 });
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const polished = data.choices?.[0]?.message?.content ?? text;
  return NextResponse.json({ polished });
}
