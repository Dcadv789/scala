"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getConversations } from "@/lib/store"

interface ActiveChatsProps {
  refreshTrigger?: number
}

export function ActiveChats({ refreshTrigger }: ActiveChatsProps) {
  const [conversations, setConversations] = useState<ReturnType<typeof getConversations>>([])

  const loadConversations = () => {
    const allConversations = getConversations()
    // Show only first 3 active conversations
    setConversations(allConversations.filter((c) => c.status === "active").slice(0, 3))
  }

  useEffect(() => {
    loadConversations()
  }, [refreshTrigger])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Conversas Ativas</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/chat">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma conversa ativa</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/chat?conversation=${chat.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {chat.contactName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{chat.contactName}</h4>
                    <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {chat.unreadCount}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
