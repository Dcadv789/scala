"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import {
  Bot,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Clock,
  Zap,
  Menu,
  Save,
} from "lucide-react"
import { getChatbotFlows, addChatbotFlow, updateChatbotFlow, deleteChatbotFlow } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

type ChatbotFlow = {
  id: string
  name: string
  description?: string
  active: boolean
  trigger: "keyword" | "first_message" | "menu" | "always"
  keywords?: string[]
  nodes: ChatbotNode[]
  connections: ChatbotConnection[]
  createdAt: string
  updatedAt: string
}

type ChatbotNode = {
  id: string
  type: "message" | "question" | "condition" | "delay" | "action" | "menu"
  position: { x: number; y: number }
  data: {
    label: string
    messageType?: "text" | "audio" | "image" | "video" | "document"
    text?: string
    audioUrl?: string
    imageUrl?: string
    videoUrl?: string
    delay?: number
    options?: Array<{ label: string; value: string; nextNode?: string }>
    conditions?: Array<{ keyword: string; nextNode?: string }>
    action?: "transfer_to_human" | "save_data" | "api_call"
  }
}

type ChatbotConnection = {
  id: string
  source: string
  target: string
  label?: string
}

export default function ChatbotPage() {
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null)
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false)
  const [showNodeDialog, setShowNodeDialog] = useState(false)
  const [editingNode, setEditingNode] = useState<ChatbotNode | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = () => {
    const loadedFlows = getChatbotFlows()
    setFlows(loadedFlows)
  }

  const handleCreateFlow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newFlow = addChatbotFlow({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      active: false,
      trigger: formData.get("trigger") as any,
      keywords:
        formData.get("trigger") === "keyword"
          ? (formData.get("keywords") as string).split(",").map((k) => k.trim())
          : undefined,
      nodes: [
        {
          id: "start",
          type: "message",
          position: { x: 100, y: 100 },
          data: {
            label: "Início",
            messageType: "text",
            text: "Olá! Como posso ajudar?",
          },
        },
      ],
      connections: [],
    })

    setFlows([...flows, newFlow])
    setShowNewFlowDialog(false)
    setSelectedFlow(newFlow)
    toast({
      title: "Fluxo criado!",
      description: "Seu chatbot foi criado com sucesso.",
    })
  }

  const handleToggleActive = (flowId: string, active: boolean) => {
    updateChatbotFlow(flowId, { active })
    loadFlows()
    toast({
      title: active ? "Chatbot ativado!" : "Chatbot pausado",
      description: active ? "O chatbot está agora respondendo automaticamente" : "O chatbot foi pausado",
    })
  }

  const handleDeleteFlow = (flowId: string) => {
    if (confirm("Tem certeza que deseja excluir este chatbot?")) {
      deleteChatbotFlow(flowId)
      loadFlows()
      if (selectedFlow?.id === flowId) {
        setSelectedFlow(null)
      }
      toast({
        title: "Chatbot excluído",
        description: "O fluxo foi removido com sucesso",
      })
    }
  }

  const handleAddNode = (type: ChatbotNode["type"]) => {
    if (!selectedFlow) return

    const newNode: ChatbotNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: {
        x: 100 + selectedFlow.nodes.length * 50,
        y: 100 + selectedFlow.nodes.length * 50,
      },
      data: {
        label:
          type === "message"
            ? "Nova Mensagem"
            : type === "question"
              ? "Nova Pergunta"
              : type === "condition"
                ? "Nova Condição"
                : type === "delay"
                  ? "Aguardar"
                  : type === "menu"
                    ? "Menu de Opções"
                    : "Nova Ação",
        messageType: "text",
      },
    }

    setEditingNode(newNode)
    setShowNodeDialog(true)
  }

  const handleSaveNode = (node: ChatbotNode) => {
    if (!selectedFlow) return

    const updatedNodes =
      editingNode && selectedFlow.nodes.find((n) => n.id === editingNode.id)
        ? selectedFlow.nodes.map((n) => (n.id === node.id ? node : n))
        : [...selectedFlow.nodes, node]

    updateChatbotFlow(selectedFlow.id, { nodes: updatedNodes })
    setSelectedFlow({ ...selectedFlow, nodes: updatedNodes })
    setEditingNode(null)
    setShowNodeDialog(false)
    loadFlows()

    toast({
      title: "Nó salvo!",
      description: "As alterações foram salvas com sucesso",
    })
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedFlow) return

    const updatedNodes = selectedFlow.nodes.filter((n) => n.id !== nodeId)
    const updatedConnections = selectedFlow.connections.filter((c) => c.source !== nodeId && c.target !== nodeId)

    updateChatbotFlow(selectedFlow.id, {
      nodes: updatedNodes,
      connections: updatedConnections,
    })
    setSelectedFlow({
      ...selectedFlow,
      nodes: updatedNodes,
      connections: updatedConnections,
    })
    loadFlows()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Construtor de Chatbot</h1>
          <p className="text-sm text-muted-foreground">Crie fluxos automatizados de conversação</p>
        </div>
        <Dialog open={showNewFlowDialog} onOpenChange={setShowNewFlowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Chatbot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFlow} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Chatbot</Label>
                <Input id="name" name="name" placeholder="Ex: Atendimento Inicial" required />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva o objetivo deste chatbot..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="trigger">Gatilho de Ativação</Label>
                <Select name="trigger" defaultValue="keyword">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Palavra-chave</SelectItem>
                    <SelectItem value="first_message">Primeira mensagem</SelectItem>
                    <SelectItem value="menu">Menu principal</SelectItem>
                    <SelectItem value="always">Sempre ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
                <Input id="keywords" name="keywords" placeholder="oi, olá, menu, ajuda" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewFlowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Chatbot</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with flows list */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 space-y-2">
            {flows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Nenhum chatbot criado ainda</p>
                <Button variant="link" onClick={() => setShowNewFlowDialog(true)} className="mt-2">
                  Criar primeiro chatbot
                </Button>
              </div>
            ) : (
              flows.map((flow) => (
                <Card
                  key={flow.id}
                  className={`p-4 cursor-pointer transition-all hover:border-primary ${
                    selectedFlow?.id === flow.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedFlow(flow)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{flow.name}</h3>
                    </div>
                    <Badge variant={flow.active ? "default" : "secondary"}>{flow.active ? "Ativo" : "Pausado"}</Badge>
                  </div>
                  {flow.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{flow.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      {flow.nodes.length} nós
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(flow.id, !flow.active)
                        }}
                      >
                        {flow.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFlow(flow.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedFlow ? (
            <>
              <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-semibold">{selectedFlow.name}</h2>
                  <Switch
                    checked={selectedFlow.active}
                    onCheckedChange={(checked) => handleToggleActive(selectedFlow.id, checked)}
                  />
                  <span className="text-sm text-muted-foreground">{selectedFlow.active ? "Ativo" : "Pausado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                  <Button size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex">
                {/* Toolbox */}
                <div className="w-64 border-r border-border bg-card p-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-4">Adicionar Nó</h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("message")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("question")}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Pergunta
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("menu")}
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    Menu
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("condition")}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Condição
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("delay")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Aguardar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleAddNode("action")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Ação
                  </Button>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-950 overflow-auto">
                  <div className="absolute inset-0 p-8">
                    {selectedFlow.nodes.map((node) => (
                      <Card
                        key={node.id}
                        className="absolute w-64 p-4 cursor-move hover:shadow-lg transition-shadow"
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {node.type === "message" && <MessageSquare className="h-4 w-4" />}
                            {node.type === "question" && <HelpCircle className="h-4 w-4" />}
                            {node.type === "menu" && <Menu className="h-4 w-4" />}
                            {node.type === "condition" && <GitBranch className="h-4 w-4" />}
                            {node.type === "delay" && <Clock className="h-4 w-4" />}
                            {node.type === "action" && <Zap className="h-4 w-4" />}
                            <span className="font-semibold text-sm">{node.data.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingNode(node)
                                setShowNodeDialog(true)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteNode(node.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {node.data.text && <p className="line-clamp-2">{node.data.text}</p>}
                          {node.data.messageType && node.data.messageType !== "text" && (
                            <Badge variant="outline" className="mt-1">
                              {node.data.messageType}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Node editor dialog */}
              <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNode?.type === "message" && "Configurar Mensagem"}
                      {editingNode?.type === "question" && "Configurar Pergunta"}
                      {editingNode?.type === "menu" && "Configurar Menu"}
                      {editingNode?.type === "condition" && "Configurar Condição"}
                      {editingNode?.type === "delay" && "Configurar Aguardar"}
                      {editingNode?.type === "action" && "Configurar Ação"}
                    </DialogTitle>
                  </DialogHeader>
                  {editingNode && (
                    <NodeEditor
                      node={editingNode}
                      onSave={handleSaveNode}
                      onCancel={() => {
                        setShowNodeDialog(false)
                        setEditingNode(null)
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um chatbot</h3>
                <p className="text-sm text-muted-foreground">Escolha um chatbot da lista ou crie um novo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NodeEditor({
  node,
  onSave,
  onCancel,
}: {
  node: ChatbotNode
  onSave: (node: ChatbotNode) => void
  onCancel: () => void
}) {
  const [editedNode, setEditedNode] = useState(node)

  return (
    <div className="space-y-4">
      <div>
        <Label>Nome do Nó</Label>
        <Input
          value={editedNode.data.label}
          onChange={(e) =>
            setEditedNode({
              ...editedNode,
              data: { ...editedNode.data, label: e.target.value },
            })
          }
        />
      </div>

      {(editedNode.type === "message" || editedNode.type === "question") && (
        <>
          <div>
            <Label>Tipo de Mensagem</Label>
            <Select
              value={editedNode.data.messageType}
              onValueChange={(value: any) =>
                setEditedNode({
                  ...editedNode,
                  data: { ...editedNode.data, messageType: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="document">Documento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editedNode.data.messageType === "text" && (
            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={editedNode.data.text || ""}
                onChange={(e) =>
                  setEditedNode({
                    ...editedNode,
                    data: { ...editedNode.data, text: e.target.value },
                  })
                }
                rows={4}
                placeholder="Digite a mensagem..."
              />
            </div>
          )}

          {editedNode.data.messageType === "audio" && (
            <div>
              <Label>URL do Áudio</Label>
              <Input
                value={editedNode.data.audioUrl || ""}
                onChange={(e) =>
                  setEditedNode({
                    ...editedNode,
                    data: { ...editedNode.data, audioUrl: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>
          )}

          {editedNode.data.messageType === "image" && (
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={editedNode.data.imageUrl || ""}
                onChange={(e) =>
                  setEditedNode({
                    ...editedNode,
                    data: { ...editedNode.data, imageUrl: e.target.value },
                  })
                }
                placeholder="https://..."
              />
            </div>
          )}
        </>
      )}

      {editedNode.type === "delay" && (
        <div>
          <Label>Tempo de Espera (segundos)</Label>
          <Input
            type="number"
            value={editedNode.data.delay || 5}
            onChange={(e) =>
              setEditedNode({
                ...editedNode,
                data: { ...editedNode.data, delay: Number.parseInt(e.target.value) },
              })
            }
          />
        </div>
      )}

      {editedNode.type === "action" && (
        <div>
          <Label>Tipo de Ação</Label>
          <Select
            value={editedNode.data.action}
            onValueChange={(value: any) =>
              setEditedNode({
                ...editedNode,
                data: { ...editedNode.data, action: value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transfer_to_human">Transferir para Humano</SelectItem>
              <SelectItem value="save_data">Salvar Dados</SelectItem>
              <SelectItem value="api_call">Chamar API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(editedNode)}>Salvar</Button>
      </DialogFooter>
    </div>
  )
}
