-- Adiciona coluna categoria e novos campos no eventos
ALTER TABLE `eventos`
  ADD COLUMN `categoria`           VARCHAR(191) NOT NULL DEFAULT 'SHOW',
  ADD COLUMN `responsavelNome`     VARCHAR(191) NULL,
  ADD COLUMN `responsavelTelefone` VARCHAR(191) NULL,
  ADD COLUMN `responsavelEmail`    VARCHAR(191) NULL,
  MODIFY COLUMN `data`  DATETIME(3) NULL,
  MODIFY COLUMN `local` VARCHAR(191) NULL;

-- Copia tipo -> categoria e remove coluna antiga
UPDATE `eventos` SET `categoria` = `tipo`;
ALTER TABLE `eventos` DROP COLUMN `tipo`;

-- Cria tabela de usuários vinculados ao evento
CREATE TABLE `eventosUsuarios` (
    `id`         INTEGER NOT NULL AUTO_INCREMENT,
    `eventoId`   INTEGER NOT NULL,
    `usuariosId` INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `eventosUsuarios_eventoId_fkey`
        FOREIGN KEY (`eventoId`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `eventosUsuarios_usuariosId_fkey`
        FOREIGN KEY (`usuariosId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
