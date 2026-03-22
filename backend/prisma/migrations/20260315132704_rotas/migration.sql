-- CreateTable
CREATE TABLE `rotas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rota` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NOT NULL,
    `modulo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
