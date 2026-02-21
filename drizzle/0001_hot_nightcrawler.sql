CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`detailJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lender_branches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lenderId` int NOT NULL,
	`address` text,
	`city` varchar(128),
	`state` varchar(2),
	`zip` varchar(10),
	`phone` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lender_branches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lenders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`lenderType` enum('bank','credit_union','broker','direct') NOT NULL,
	`statesServed` json,
	`url` text,
	`phone` varchar(32),
	`email` varchar(320),
	`licensingNotes` text,
	`vaSpecialist` boolean NOT NULL DEFAULT false,
	`description` text,
	`notes` text,
	`verifiedLevel` enum('unverified','verified','partner_verified') DEFAULT 'unverified',
	`lastVerifiedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lenders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submitterName` varchar(256),
	`submitterEmail` varchar(320),
	`submitterOrg` varchar(256),
	`categoryId` int,
	`resourceName` varchar(256) NOT NULL,
	`description` text,
	`url` text,
	`phone` varchar(32),
	`address` text,
	`city` varchar(128),
	`state` varchar(2),
	`zip` varchar(10),
	`coverageArea` enum('local','state','national') DEFAULT 'national',
	`eligibilityNotes` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedByUserId` int,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`militaryStatus` enum('active_duty','guard_reserve','transitioning','veteran','spouse_caregiver'),
	`zip` varchar(10),
	`state` varchar(2),
	`householdSize` int,
	`dependentsCount` int,
	`incomeBand` enum('under_25k','25k_50k','50k_75k','75k_100k','over_100k','prefer_not_to_say'),
	`vaEligible` enum('yes','no','unsure'),
	`disabilityRatingBand` enum('none','10_30','40_60','70_90','100','unknown'),
	`preferredContact` enum('email','phone','text'),
	`needsCategories` json,
	`intakeCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`sortOrder` int DEFAULT 0,
	CONSTRAINT `resource_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `resource_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`url` text,
	`phone` varchar(32),
	`address` text,
	`city` varchar(128),
	`state` varchar(2),
	`zip` varchar(10),
	`coverageArea` enum('local','state','national') DEFAULT 'national',
	`eligibilityNotes` text,
	`hours` varchar(256),
	`languages` json,
	`tags` json,
	`verifiedLevel` enum('unverified','verified','partner_verified') DEFAULT 'unverified',
	`lastVerifiedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('resource','lender') NOT NULL,
	`itemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`queryJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_logs_id` PRIMARY KEY(`id`)
);
