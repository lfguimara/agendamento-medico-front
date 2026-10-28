import { useCallback, useState, type FormEvent } from 'react'
import { medicosApi } from '../api/recursos'
import type { Medico, MedicoInput } from '../api/types'
import { Button, Card, ErrorAlert, Field, Input, Tabela, Vazio } from '../components/ui'
import { useDados } from '../hooks/useDados'

const vazio: MedicoInput = { nome: '', crm: '', especialidade: '' }

export function MedicosPage() {
  const [filtro, setFiltro] = useState('')
  const buscarMedicos = useCallback(() => medicosApi.listar(filtro), [filtro])
  const { dados: medicos, erro: erroLista, carregando, recarregar } = useDados(buscarMedicos)
  const [form, setForm] = useState<MedicoInput>(vazio)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [erro, setErro] = useState<unknown>(null)
  const [salvando, setSalvando] = useState(false)

  const alterar = (campo: keyof MedicoInput) => (e: { target: { value: string } }) =>
    setForm({ ...form, [campo]: e.target.value })

  function limpar() {
    setForm(vazio)
    setEditandoId(null)
    setErro(null)
  }

  function editar(m: Medico) {
    setForm({ nome: m.nome, crm: m.crm, especialidade: m.especialidade })
    setEditandoId(m.id)
    setErro(null)
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      if (editandoId) await medicosApi.atualizar(editandoId, form)
      else await medicosApi.criar(form)
      limpar()
      await recarregar()
    } catch (err) {
      setErro(err)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(m: Medico) {
    if (!window.confirm(`Excluir o médico ${m.nome}?`)) return
    try {
      await medicosApi.remover(m.id)
      if (editandoId === m.id) limpar()
      await recarregar()
    } catch (err) {
      setErro(err)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card titulo={editandoId ? 'Editar médico' : 'Novo médico'}>
        <ErrorAlert erro={erro} />
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <Field label="Nome">
            <Input value={form.nome} onChange={alterar('nome')} required />
          </Field>
          <Field label="CRM">
            <Input value={form.crm} onChange={alterar('crm')} placeholder="CRM-SP 123456" required />
          </Field>
          <Field label="Especialidade">
            <Input value={form.especialidade} onChange={alterar('especialidade')} placeholder="Cardiologia" required />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
            {editandoId && (
              <Button type="button" variante="secundario" onClick={limpar}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card
        titulo="Médicos"
        acoes={
          <div className="w-56">
            <Input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtrar por especialidade"
              aria-label="Filtrar por especialidade"
            />
          </div>
        }
      >
        <ErrorAlert erro={erroLista} />
        {carregando && !medicos ? (
          <Vazio>Carregando...</Vazio>
        ) : !medicos?.length ? (
          <Vazio>{filtro ? 'Nenhum médico com essa especialidade.' : 'Nenhum médico cadastrado.'}</Vazio>
        ) : (
          <Tabela cabecalho={['Nome', 'CRM', 'Especialidade', '']}>
            {medicos.map((m) => (
              <tr key={m.id} className={editandoId === m.id ? 'bg-teal-50' : ''}>
                <td className="px-3 py-2 font-medium text-slate-800">{m.nome}</td>
                <td className="px-3 py-2">{m.crm}</td>
                <td className="px-3 py-2">{m.especialidade}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <Button variante="secundario" onClick={() => editar(m)}>
                      Editar
                    </Button>
                    <Button variante="perigo" onClick={() => remover(m)}>
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </Card>
    </div>
  )
}
