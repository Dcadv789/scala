export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4 text-sm text-muted-foreground">Carregando construtor de chatbot...</p>
      </div>
    </div>
  )
}
