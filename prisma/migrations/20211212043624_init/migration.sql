-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `xp` BIGINT NOT NULL DEFAULT 0,
    `health` INTEGER NOT NULL DEFAULT 100,
    `countryId` INTEGER NOT NULL,
    `gold` DECIMAL(65, 30) NOT NULL DEFAULT 5.00,
    `strength` BIGINT NOT NULL DEFAULT 0,
    `militaryRank` BIGINT NOT NULL DEFAULT 0,
    `totalDmg` BIGINT NOT NULL DEFAULT 0,
    `locationId` INTEGER NOT NULL,
    `residenceId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `newsId` INTEGER NOT NULL,
    `canTrain` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `canWork` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `canCollectRewards` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `canHeal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `banned` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatriotDamage` (
    `id` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WalletBalance` (
    `id` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `currencyId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(3) NOT NULL,

    UNIQUE INDEX `Currency_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `quality` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(60) NOT NULL,
    `message` VARCHAR(255) NOT NULL,
    `from` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `toId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MsgThread` (
    `id` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `subject` VARCHAR(60) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Msg` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `from` INTEGER NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PendingFriend` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `pending` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Friend` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpAddr` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `ip` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `nick` VARCHAR(30) NOT NULL,
    `flagCode` VARCHAR(3) NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `capital` INTEGER NOT NULL,

    UNIQUE INDEX `Country_currencyCode_key`(`currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Region` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `resource` INTEGER NOT NULL,
    `coreId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegionGeom` (
    `id` VARCHAR(191) NOT NULL,
    `regionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegionPath` (
    `id` VARCHAR(191) NOT NULL,
    `geomId` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegionNeighbor` (
    `id` VARCHAR(191) NOT NULL,
    `regionId` INTEGER NOT NULL,
    `neighborId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `type` INTEGER NOT NULL,
    `ceoId` INTEGER NOT NULL,
    `locationId` INTEGER NOT NULL,
    `gold` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FundsBalance` (
    `id` VARCHAR(191) NOT NULL,
    `compId` INTEGER NOT NULL,
    `currencyId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StorageItem` (
    `id` VARCHAR(191) NOT NULL,
    `compId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `compId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(30) NOT NULL,
    `wage` DECIMAL(65, 30) NOT NULL DEFAULT 1.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOffer` (
    `id` VARCHAR(191) NOT NULL,
    `compId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobOffer` (
    `id` VARCHAR(191) NOT NULL,
    `compId` INTEGER NOT NULL,
    `title` VARCHAR(30) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `wage` DECIMAL(65, 30) NOT NULL DEFAULT 1.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `econStance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `socStance` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `president` INTEGER NOT NULL,
    `vp` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `color` VARCHAR(7) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CPCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CongressCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PPCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `partyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Newspaper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `authorId` INTEGER NOT NULL,

    UNIQUE INDEX `Newspaper_authorId_key`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MsgThreadToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MsgThreadToUser_AB_unique`(`A`, `B`),
    INDEX `_MsgThreadToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
