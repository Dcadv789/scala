"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function TestTabs() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-8">TESTE DE TABS</h1>
      
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>

        <TabsContent value="tab1">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Tab 1</CardTitle>
              <CardDescription>Descrição do tab 1</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Campo de Teste</Label>
                  <Input placeholder="Digite algo aqui" />
                </div>
                <Button>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tab2">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Tab 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Este é o conteúdo do Tab 2</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tab3">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Tab 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Este é o conteúdo do Tab 3</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

