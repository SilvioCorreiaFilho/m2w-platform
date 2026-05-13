import { NextRequest, NextResponse } from "next/server";
import {
  buildComfyPayload,
  VALID_POSES,
  VALID_SCENARIOS,
  VALID_OUTFITS,
  VALID_EXPRESSIONS,
} from "@/lib/comfyui";
import type { MiaInfluencerParams } from "@/types/comfyui";

const COMFYUI_URL =
  process.env.COMFYUI_LOCAL_URL ?? "http://127.0.0.1:8188";

export async function POST(req: NextRequest) {
  let body: Partial<MiaInfluencerParams>;

  try {
    body = (await req.json()) as Partial<MiaInfluencerParams>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!body.pose || !VALID_POSES.includes(body.pose)) {
    return NextResponse.json(
      { error: `Invalid pose. Must be one of: ${VALID_POSES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!body.scenario || !VALID_SCENARIOS.includes(body.scenario)) {
    return NextResponse.json(
      {
        error: `Invalid scenario. Must be one of: ${VALID_SCENARIOS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (!body.outfit || !VALID_OUTFITS.includes(body.outfit)) {
    return NextResponse.json(
      { error: `Invalid outfit. Must be one of: ${VALID_OUTFITS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!body.expression || !VALID_EXPRESSIONS.includes(body.expression)) {
    return NextResponse.json(
      {
        error: `Invalid expression. Must be one of: ${VALID_EXPRESSIONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const params: MiaInfluencerParams = {
    pose: body.pose,
    scenario: body.scenario,
    outfit: body.outfit,
    expression: body.expression,
    product: body.product,
    seed: body.seed,
  };

  const payload = buildComfyPayload(params);

  try {
    const comfyResponse = await fetch(`${COMFYUI_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // 30s timeout for queue submission
      signal: AbortSignal.timeout(30_000),
    });

    if (!comfyResponse.ok) {
      const errorText = await comfyResponse.text();
      return NextResponse.json(
        { error: `ComfyUI error ${comfyResponse.status}: ${errorText}` },
        { status: 502 }
      );
    }

    const result = (await comfyResponse.json()) as {
      prompt_id: string;
      number: number;
    };

    return NextResponse.json({
      success: true,
      promptId: result.prompt_id,
      clientId: payload.client_id,
      queuePosition: result.number,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to connect to ComfyUI";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}

// Health check
export async function GET() {
  try {
    const res = await fetch(`${COMFYUI_URL}/system_stats`, {
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const stats = await res.json();

    return NextResponse.json({ status: "ok", comfyui: stats });
  } catch (err) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: err instanceof Error ? err.message : "Unknown",
      },
      { status: 503 }
    );
  }
}
