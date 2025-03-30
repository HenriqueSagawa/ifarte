import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AulaDetalhesModalProps {
    aula: any
    alunos: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AulaDetalhesModal({ aula, alunos, open, onOpenChange }: AulaDetalhesModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Aula</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Data</h3>
                        <p>{new Date(aula.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Professor</h3>
                        <p>{aula.professor}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Conteúdo</h3>
                        <p>{aula.conteudo}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Lista de Presença</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Presença</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alunos.map(aluno => {
                                    const presenca = aula.presencas?.find((p: any) => p.alunoId === aluno.id)
                                    return (
                                        <TableRow key={aluno.id}>
                                            <TableCell>{aluno.nome}</TableCell>
                                            <TableCell>
                                                {presenca?.presente ? "Presente" : "Ausente"}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 