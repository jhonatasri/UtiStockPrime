import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const dashboardResponseSchema = z.object({
  // Bares
  totalBares: z.number(),
  baresAbertos: z.number(),
  baresFechados: z.number(),
  baresInativos: z.number(),
  // Produtos
  totalProdutos: z.number(),
  // Entradas
  totalEntradas: z.number(),
  totalQuantidadeEntradas: z.number(),
  // Saídas
  totalSaidas: z.number(),
  totalQuantidadeSaidas: z.number(),
  // Sangrias
  totalSangrias: z.number(),
  // Devoluções
  totalDevolucoes: z.number(),
  // Atividade recente
  ultimasMovimentacoes: z.array(
    z.object({
      id: z.number(),
      tipo: z.enum(["ENTRADA", "SAIDA"]),
      dataHora: z.string(),
      totalItens: z.number(),
      totalQuantidade: z.number(),
      descricao: z.string().nullable(),
    })
  ),
});

export const dashboardController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/dashboard",
    {
      schema: {
        description: "Resumo geral do evento para o dashboard",
        tags: ["Dashboard"],
        operationId: "dashboard",
        security: [{ BearerAuth: [] }],
        querystring: z.object({
          eventoId: z.coerce.number().optional(),
        }),
        response: {
          200: dashboardResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { eventoId } = req.query;
      const whereEvento = eventoId ? { eventoId } : {};

      const [
        bares,
        totalProdutos,
        entradas,
        saidas,
        totalSangrias,
        totalDevolucoes,
      ] = await Promise.all([
        prisma.bares.findMany({
          where: whereEvento,
          select: { ativo: true, status: true },
        }),
        prisma.produtos.count({ where: whereEvento }),
        prisma.entradas.findMany({
          where: whereEvento,
          select: {
            id: true,
            dataHora: true,
            tipoEntrada: true,
            fornecedor: true,
            itens: { select: { quantidade: true } },
          },
          orderBy: { dataHora: "desc" },
        }),
        prisma.saidas.findMany({
          where: whereEvento,
          select: {
            id: true,
            dataHora: true,
            tipoSaida: true,
            observacoes: true,
            itens: { select: { quantidade: true } },
          },
          orderBy: { dataHora: "desc" },
        }),
        prisma.sangrias.count({ where: whereEvento }),
        prisma.devolucoes.count({ where: whereEvento }),
      ]);

      // Agrupa bares
      const totalBares = bares.length;
      const baresAbertos = bares.filter((b) => b.ativo && b.status === "ABERTO").length;
      const baresFechados = bares.filter((b) => b.ativo && b.status === "FECHADO").length;
      const baresInativos = bares.filter((b) => !b.ativo).length;

      // Agrega entradas
      const totalEntradas = entradas.length;
      const totalQuantidadeEntradas = entradas.reduce(
        (acc, e) => acc + e.itens.reduce((s, i) => s + i.quantidade, 0),
        0
      );

      // Agrega saídas
      const totalSaidas = saidas.length;
      const totalQuantidadeSaidas = saidas.reduce(
        (acc, s) => acc + s.itens.reduce((sum, i) => sum + i.quantidade, 0),
        0
      );

      // Últimas 8 movimentações (4 entradas + 4 saídas, ordenadas por data)
      const movimentacoes = [
        ...entradas.slice(0, 10).map((e) => ({
          id: e.id,
          tipo: "ENTRADA" as const,
          dataHora: e.dataHora.toISOString(),
          totalItens: e.itens.length,
          totalQuantidade: e.itens.reduce((s, i) => s + i.quantidade, 0),
          descricao: e.fornecedor ?? e.tipoEntrada,
        })),
        ...saidas.slice(0, 10).map((s) => ({
          id: s.id,
          tipo: "SAIDA" as const,
          dataHora: s.dataHora.toISOString(),
          totalItens: s.itens.length,
          totalQuantidade: s.itens.reduce((sum, i) => sum + i.quantidade, 0),
          descricao: s.observacoes ?? s.tipoSaida,
        })),
      ]
        .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
        .slice(0, 8);

      return res.send({
        totalBares,
        baresAbertos,
        baresFechados,
        baresInativos,
        totalProdutos,
        totalEntradas,
        totalQuantidadeEntradas,
        totalSaidas,
        totalQuantidadeSaidas,
        totalSangrias,
        totalDevolucoes,
        ultimasMovimentacoes: movimentacoes,
      });
    }
  );
};
