import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()
    if (typeof password !== 'string' || password.length > 200) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const expected = Deno.env.get('ACCESS_PASSWORD') ?? ''
    // constant-time compare
    const a = new TextEncoder().encode(password)
    const b = new TextEncoder().encode(expected)
    let ok = a.length === b.length
    const len = Math.max(a.length, b.length)
    let diff = a.length ^ b.length
    for (let i = 0; i < len; i++) {
      diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
    }
    ok = diff === 0

    return new Response(JSON.stringify({ ok }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
