-- CreateEnum
-- CreateTable
CREATE TABLE
    `eventos` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `nome` VARCHAR(191) NOT NULL,
        `descricao` VARCHAR(191) NULL,
        `data` DATETIME (3) NOT NULL,
        `local` VARCHAR(191) NOT NULL,
        `ativo` BOOLEAN NOT NULL DEFAULT true,
        `tipo` ENUM ('SHOW', 'FESTIVAL', 'CORPORATIVO', 'PRIVADO') NOT NULL,
        PRIMARY KEY (`id`)
    ) DEFAULT CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;