import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const relatorioBarItemSchema = z.object({
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoCodigo: z.string(),
  produtoUnidadeMedida: z.string(),
  totalEntrada: z.number(),
  totalSaida: z.number(),
  totalDevolucao: z.number(),
  totalSangria: z.number(),
  saldo: z.number(),
});

export const relatorioController: FastifyPluginAsyncZod = async (app) => {
  // ── Relatório por bar ─────────────────────────────────────────────────────
  app.get(
    "/relatorios/bar",
    {
      schema: {
        description:
          "Relatório de movimentações por bar: entradas, saídas, devoluções e saldo por produto",
        tags: ["Relatórios"],
        operationId: "relatorioBar",
        security: [{ BearerAuth: [] }],
        querystring: z.object({
          barId: z.coerce.number(),
        }),
        response: {
          200: z.array(relatorioBarItemSchema),
        },
      },
    },
    async (req, res) => {
      const { barId } = req.query;

      // 1. Busca todos os itens das quatro fontes para este bar
      const [entradaItens, saidaItens, devolucaoItens, sangriaItens] =
        await Promise.all([
          prisma.entradaItens.findMany({
            where: { barId },
            select: { produtoId: true, quantidade: true, produto: true },
          }),
          prisma.saidaItens.findMany({
            where: { barId },
            select: { produtoId: true, quantidade: true, produto: true },
          }),
          prisma.devolucaoItens.findMany({
            where: { devolucao: { barId } },
            select: { produtoId: true, quantidade: true, produto: true },
          }),
          prisma.sangriaItens.findMany({
            where: { sangria: { barId } },
            select: { produtoId: true, quantidade: true, produto: true },
          }),
        ]);

      // 2. Agrega por produtoId
      const toMap = (itens: { produtoId: number; quantidade: number }[]) =>
        itens.reduce((acc, i) => {
          acc.set(i.produtoId, (acc.get(i.produtoId) ?? 0) + i.quantidade);
          return acc;
        }, new Map<number, number>());

      const entradaMap = toMap(entradaItens);
      const saidaMap = toMap(saidaItens);
      const devolucaoMap = toMap(devolucaoItens);
      const sangriaMap = toMap(sangriaItens);

      // 3. União de todos os produtos que apareceram em qualquer das quatro fontes
      const produtosMap = new Map(
        [
          ...entradaItens,
          ...saidaItens,
          ...devolucaoItens,
          ...sangriaItens,
        ].map((i) => [i.produtoId, i.produto])
      );

      const result = [...produtosMap.values()]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((produto) => {
          const totalEntrada = entradaMap.get(produto.id) ?? 0;
          const totalSaida = saidaMap.get(produto.id) ?? 0;
          const totalDevolucao = devolucaoMap.get(produto.id) ?? 0;
          const totalSangria = sangriaMap.get(produto.id) ?? 0;
          const saldo = totalEntrada - totalSaida - totalDevolucao - totalSangria;

          return {
            produtoId: produto.id,
            produtoNome: produto.nome,
            produtoCodigo: produto.codigo,
            produtoUnidadeMedida: produto.unidadeMedida,
            totalEntrada,
            totalSaida,
            totalDevolucao,
            totalSangria,
            saldo,
          };
        });

      return res.send(result);
    }
  );
};
