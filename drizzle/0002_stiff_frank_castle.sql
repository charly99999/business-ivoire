CREATE TABLE `community_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(140) NOT NULL,
	`description` varchar(1200) NOT NULL,
	`category` varchar(80) NOT NULL,
	`location` varchar(160) NOT NULL DEFAULT 'Abidjan, Côte d’Ivoire',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','admin') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_member_unique` UNIQUE(`groupId`,`userId`)
);
--> statement-breakpoint
CREATE INDEX `groups_category_idx` ON `community_groups` (`category`);--> statement-breakpoint
CREATE INDEX `groups_owner_idx` ON `community_groups` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `group_members_user_idx` ON `group_members` (`userId`);