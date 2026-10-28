import { useCallback, useEffect, useState } from 'react'

// Carrega dados da API e expõe estado de carregamento, erro e uma função para recarregar.
// `buscar` precisa ser estável (função de módulo ou useCallback): quando ela muda, os dados são buscados de novo.
export function useDados<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<unknown>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Ignora respostas de buscas antigas (ex.: filtro trocado antes da resposta chegar)
    let ativo = true
    buscar().then(
      (resultado) => {
        if (!ativo) return
        setDados(resultado)
        setErro(null)
        setCarregando(false)
      },
      (e) => {
        if (!ativo) return
        setErro(e)
        setCarregando(false)
      },
    )
    return () => {
      ativo = false
    }
  }, [buscar])

  const recarregar = useCallback(async () => {
    try {
      setDados(await buscar())
      setErro(null)
    } catch (e) {
      setErro(e)
    }
  }, [buscar])

  return { dados, erro, carregando, recarregar }
}
