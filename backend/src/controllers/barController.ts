import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const barResponse = z.object({
  id: z.number(),
  nome: z.string(),
  liderNome: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  setor: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  status: z.string(),
  ativo: z.boolean(),
  eventoId: z.number().optional().nullable(),
  qtdProdutos: z.number(),
});

const barDetalheResponse = barResponse.extend({
  produtos: z.array(z.object({ id: z.number(), nome: z.string(), categoria: z.string(), unidadeMedida: z.string() })),
  usuarios: z.array(z.object({ id: z.number(), nome: z.string(), email: z.string() })),
});

const barBody = z.object({
  nome: z.string(),
  liderNome: z.string().optional(),
  area: z.string().optional(),
  setor: z.string().optional(),
  descricao: z.string().optional(),
  status: z.string().optional().default("FECHADO"),
  ativo: z.boolean().optional().default(false),
  eventoId: z.number().optional(),
  produtosIds: z.array(z.number()).optional().default([]),
  usuariosIds: z.array(z.number()).optional().default([]),
});

const movimentacaoResponse = z.object({
  id: z.number(),
  tipo: z.string(), // ENTRADA | SAIDA
  tipoMovimentacao: z.string(), // tipoEntrada ou tipoSaida
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoCodigo: z.string(),
  produtoCategoria: z.string(),
  produtoUnidadeMedida: z.string(),
  quantidade: z.number(),
  dataHora: z.string(),
});

export const barController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/bares",
    {
      schema: {
        description: "Lista todos os bares do sistema",
        tags: ["Bares"],
        operationId: "listaBares",
        security: [{ BearerAuth: [] }],
        querystring: z.object({
          eventoId: z.coerce.number().optional(),
          usuarioId: z.coerce.number().optional(),
        }),
        response: { 200: z.array(barResponse) },
      },
    },
    async (req, res) => {
      const { eventoId, usuarioId } = req.query;
      const bares = await prisma.bares.findMany({
        where: {
          ...(eventoId ? { eventoId } : {}),
          ...(usuarioId ? { barUsuarios: { some: { usuarioId } } } : {}),
        },
        include: { _count: { select: { produtos: true } } },
        orderBy: { id: "asc" },
      });
      return res.send(
        bares.map(({ _count, ...b }) => ({ ...b, qtdProdutos: _count.produtos }))
      );
    }
  );

  app.post(
    "/bares",
    {
      schema: {
        description: "Cria um bar no sistema",
        tags: ["Bares"],
        operationId: "criaBar",
        security: [{ BearerAuth: [] }],
        body: barBody,
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const { produtosIds, usuariosIds, ...data } = req.body;
      const bar = await prisma.bares.create({ data });
      if (produtosIds && produtosIds.length > 0) {
        await prisma.barProdutos.createMany({
          data: produtosIds.map((pid) => ({ barId: bar.id, produtoId: pid })),
        });
      }
      if (usuariosIds && usuariosIds.length > 0) {
        await prisma.barUsuarios.createMany({
          data: usuariosIds.map((uid) => ({ barId: bar.id, usuarioId: uid })),
        });
      }
      return res.status(201).send({ id: bar.id });
    }
  );

  app.get(
    "/bar/:id",
    {
      schema: {
        description: "Busca um bar pelo ID",
        tags: ["Bares"],
        operationId: "listaBar",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: { 200: barDetalheResponse },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const bar = await prisma.bares.findUniqueOrThrow({
        where: { id },
        include: {
          _count: { select: { produtos: true } },
          produtos: { include: { produto: true } },
          barUsuarios: { include: { usuario: true } },
        },
      });
      const { _count, produtos: barProdutos, barUsuarios, ...rest } = bar;
      return res.send({
        ...rest,
        qtdProdutos: _count.produtos,
        produtos: barProdutos.map((bp) => ({
          id: bp.produto.id,
          nome: bp.produto.nome,
          categoria: bp.produto.categoria,
          unidadeMedida: bp.produto.unidadeMedida,
        })),
        usuarios: barUsuarios.map((bu) => ({
          id: bu.usuario.id,
          nome: bu.usuario.nome,
          email: bu.usuario.email,
        })),
      });
    }
  );

  app.put(
    "/bar/:id",
    {
      schema: {
        description: "Altera os dados de um bar",
        tags: ["Bares"],
        operationId: "alteraBar",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: barBody,
        response: { 200: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { produtosIds, usuariosIds, ...data } = req.body;
      await prisma.bares.update({ where: { id }, data });
      if (produtosIds !== undefined) {
        await prisma.barProdutos.deleteMany({ where: { barId: id } });
        if (produtosIds.length > 0) {
          await prisma.barProdutos.createMany({
            data: produtosIds.map((pid) => ({ barId: id, produtoId: pid })),
          });
        }
      }
      if (usuariosIds !== undefined) {
        await prisma.barUsuarios.deleteMany({ where: { barId: id } });
        if (usuariosIds.length > 0) {
          await prisma.barUsuarios.createMany({
            data: usuariosIds.map((uid) => ({ barId: id, usuarioId: uid })),
          });
        }
      }
      return res.status(200).send({});
    }
  );

  app.get(
    "/bar/:id/movimentacoes",
    {
      schema: {
        description: "Lista as movimentações (entradas e saídas) de um bar",
        tags: ["Bares"],
        operationId: "listaMovimentacoesBar",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: { 200: z.array(movimentacaoResponse) },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const [entradaItens, saidaItens] = await Promise.all([
        prisma.entradaItens.findMany({
          where: { barId: id },
          include: { produto: true, entrada: true },
        }),
        prisma.saidaItens.findMany({
          where: { barId: id },
          include: { produto: true, saida: true },
        }),
      ]);

      const movimentacoes = [
        ...entradaItens.map((item) => ({
          id: item.id,
          tipo: "ENTRADA",
          tipoMovimentacao: item.entrada.tipoEntrada,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoCodigo: item.produto.codigo,
          produtoCategoria: item.produto.categoria,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          quantidade: item.quantidade,
          dataHora: item.entrada.dataHora.toISOString(),
        })),
        ...saidaItens.map((item) => ({
          id: item.id,
          tipo: "SAIDA",
          tipoMovimentacao: item.saida.tipoSaida,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoCodigo: item.produto.codigo,
          produtoCategoria: item.produto.categoria,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          quantidade: item.quantidade,
          dataHora: item.saida.dataHora.toISOString(),
        })),
      ].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

      return res.send(movimentacoes);
    }
  );

  app.patch(
    "/bar/:id/ativo",
    {
      schema: {
        description: "Altera o status ativo de um bar",
        tags: ["Bares"],
        operationId: "alteraAtivoBar",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: z.object({ ativo: z.boolean() }),
        response: { 200: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { ativo } = req.body;
      await prisma.bares.update({ where: { id }, data: { ativo } });
      return res.status(200).send({});
    }
  );
};
