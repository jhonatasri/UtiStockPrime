-- CreateTable
CREATE TABLE `rotasUsuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rotasId` INTEGER NOT NULL,
    `usuariosId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rotasUsuarios` ADD CONSTRAINT `rotasUsuarios_rotasId_fkey` FOREIGN KEY (`rotasId`) REFERENCES `rotas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rotasUsuarios` ADD CONSTRAINT `rotasUsuarios_usuariosId_fkey` FOREIGN KEY (`usuariosId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
