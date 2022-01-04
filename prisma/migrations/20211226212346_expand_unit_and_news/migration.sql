/*
  Warnings:

  - Added the required column `image` to the `Newspaper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Newspaper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xo` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Newspaper` ADD COLUMN `image` VARCHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(60) NOT NULL;

-- AlterTable
ALTER TABLE `Unit` ADD COLUMN `co` INTEGER NOT NULL,
    ADD COLUMN `image` CHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(60) NOT NULL,
    ADD COLUMN `xo` INTEGER NOT NULL;
