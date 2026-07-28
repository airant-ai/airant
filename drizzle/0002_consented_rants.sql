CREATE TABLE `consented_rants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`provider` text NOT NULL,
	`style` text NOT NULL,
	`rant` text NOT NULL,
	`response` text NOT NULL,
	`consent_version` text NOT NULL,
	`moderation_status` text DEFAULT 'pending' NOT NULL,
	`published_at` text
);
