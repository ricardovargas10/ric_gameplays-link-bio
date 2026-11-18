import { addVisit } from "@/lib/content";

/** Recebe o aviso de que alguém abriu a página. */
export async function POST(request: Request) {
  let visitor = "";
  let session = false;
  try {
    const body = (await request.json()) as { v?: unknown; s?: unknown };
    visitor = typeof body.v === "string" ? body.v : "";
    session = body.s === true;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!/^[a-z0-9]{16,40}$/.test(visitor)) return new Response(null, { status: 400 });
  try {
    await addVisit(visitor, session);
  } catch {
    /* contador indisponível: não atrapalha a página */
  }
  return new Response(null, { status: 204 });
}
