CREATE TABLE `listing_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `listing_favorite_unique` UNIQUE(`listingId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `listing_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`sortOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `listing_image_order_unique` UNIQUE(`listingId`,`sortOrder`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'XOF',
	`category` varchar(80) NOT NULL,
	`location` varchar(160) NOT NULL,
	`condition` enum('new','used','service') NOT NULL DEFAULT 'used',
	`status` enum('active','sold','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `listing_favorite_user_idx` ON `listing_favorites` (`userId`);--> statement-breakpoint
CREATE INDEX `listing_images_listing_idx` ON `listing_images` (`listingId`);--> statement-breakpoint
CREATE INDEX `listings_active_created_idx` ON `listings` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `listings_category_idx` ON `listings` (`category`);--> statement-breakpoint
CREATE INDEX `listings_seller_idx` ON `listings` (`sellerId`);