import { useState, type FormEvent } from 'react'
import { pacientesApi } from '../api/recursos'
import type { Paciente, PacienteInput } from '../api/types'
import { Button, Card, ErrorAlert, Field, Input, Tabela, Vazio } from '../components/ui'
import { useDados } from '../hooks/useDados'

const vazio: PacienteInput = { nome: '', cpf: '', email: '', telefone: '' }

export function PacientesPage() {
  const { dados: pacientes, erro: erroLista, carregando, recarregar } = useDados(pacientesApi.listar)
  const [form, setForm] = useState<PacienteInput>(vazio)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [erro, setErro] = useState<unknown>(null)
  const [salvando, setSalvando] = useState(false)

  const alterar = (campo: keyof PacienteInput) => (e: { target: { value: string } }) =>
    setForm({ ...form, [campo]: e.target.value })

  function limpar() {
    setForm(vazio)
    setEditandoId(null)
    setErro(null)
  }

  function editar(p: Paciente) {
    setForm({ nome: p.nome, cpf: p.cpf, email: p.email, telefone: p.telefone })
    setEditandoId(p.id)
    setErro(null)
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      if (editandoId) await pacientesApi.atualizar(editandoId, form)
      else await pacientesApi.criar(form)
      limpar()
      await recarregar()
    } catch (err) {
      setErro(err)
    } finally {
      setSalvando(false)
    }
  }

  async function remover(p: Paciente) {
    if (!window.confirm(`Excluir o paciente ${p.nome}?`)) return
    try {
      await pacientesApi.remover(p.id)
      if (editandoId === p.id) limpar()
      await recarregar()
    } catch (err) {
      setErro(err)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card titulo={editandoId ? 'Editar paciente' : 'Novo paciente'}>
        <ErrorAlert erro={erro} />
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <Field label="Nome">
            <Input value={form.nome} onChange={alterar('nome')} required />
          </Field>
          <Field label="CPF">
            <Input value={form.cpf} onChange={alterar('cpf')} placeholder="000.000.000-00" required />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={alterar('email')} required />
          </Field>
          <Field label="Telefone">
            <Input value={form.telefone} onChange={alterar('telefone')} placeholder="11999990000" required />
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

      <Card titulo="Pacientes">
        <ErrorAlert erro={erroLista} />
        {carregando && !pacientes ? (
          <Vazio>Carregando...</Vazio>
        ) : !pacientes?.length ? (
          <Vazio>Nenhum paciente cadastrado.</Vazio>
        ) : (
          <Tabela cabecalho={['Nome', 'CPF', 'E-mail', 'Telefone', '']}>
            {pacientes.map((p) => (
              <tr key={p.id} className={editandoId === p.id ? 'bg-teal-50' : ''}>
                <td className="px-3 py-2 font-medium text-slate-800">{p.nome}</td>
                <td className="px-3 py-2">{p.cpf}</td>
                <td className="px-3 py-2">{p.email}</td>
                <td className="px-3 py-2">{p.telefone}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <Button variante="secundario" onClick={() => editar(p)}>
                      Editar
                    </Button>
                    <Button variante="perigo" onClick={() => remover(p)}>
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
