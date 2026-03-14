-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `senha` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `funcao` ENUM('ADMINISTRADOR', 'GESTOR', 'COORDENADOR_BAR', 'COORDENADOR_ESTOQUE') NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
