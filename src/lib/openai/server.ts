// Server-side only — never import this in client components

export function getOpenAIKey(): string | null {
  return process.env.OPENAI_API_KEY ?? null;
}

export async function checkOpenAIStatus(): Promise<{
  active: boolean;
  message: string;
}> {
  const key = getOpenAIKey();

  if (!key) {
    return {
      active: false,
      message: "OpenAI API key is not configured.",
    };
  }

  if (!key.startsWith("sk-")) {
    return {
      active: false,
      message: "OpenAI API key format appears invalid.",
    };
  }

  try {
    // Lightweight models list call — fast and cheap
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      // Short timeout so it doesn't block the page
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401) {
      return { active: false, message: "OpenAI API key is invalid or revoked." };
    }

    if (!res.ok) {
      return {
        active: false,
        message: `OpenAI returned status ${res.status}.`,
      };
    }

    return { active: true, message: "AI summarization is active." };
  } catch {
    return {
      active: false,
      message: "Could not reach OpenAI — check your network or key.",
    };
  }
}

export async function summarizeNote(
  title: string,
  content: string
): Promise<string> {
  const key = getOpenAIKey();
  if (!key) throw new Error("OpenAI API key not configured.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are a concise summarizer. Respond with a 1-3 sentence plain-text summary. No markdown, no bullet points.",
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent:\n${content}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${res.status}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content?.trim() ?? "";
}
