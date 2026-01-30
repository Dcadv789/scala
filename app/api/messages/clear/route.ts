import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  try {
    // Limpar todas as mensagens do webhook
    const { error } = await supabase
      .from("mensagens_webhook")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all (workaround)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Todas as mensagens foram limpas"
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
