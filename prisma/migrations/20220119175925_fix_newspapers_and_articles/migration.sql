/*
  Warnings:

  - The primary key for the `FundsBalance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `FundsBalance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `FundsBalance` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `newsId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `publishDate` DATETIME(3) NOT NULL,
    `published` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NewspaperSubscriber` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NewspaperSubscriber_AB_unique`(`A`, `B`),
    INDEX `_NewspaperSubscriber_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ArticleToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArticleToUser_AB_unique`(`A`, `B`),
    INDEX `_ArticleToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
