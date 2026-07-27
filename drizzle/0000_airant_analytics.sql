CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`event` text NOT NULL,
	`provider` text DEFAULT 'unknown' NOT NULL,
	`style` text DEFAULT 'unknown' NOT NULL,
	`value` text DEFAULT 'none' NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_event_bucket_idx` ON `analytics_events` (`day`,`event`,`provider`,`style`,`value`);
