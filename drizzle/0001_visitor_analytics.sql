CREATE TABLE `analytics_visitor_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`event` text NOT NULL,
	`provider` text DEFAULT 'unknown' NOT NULL,
	`style` text DEFAULT 'unknown' NOT NULL,
	`value` text DEFAULT 'none' NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_visitor_event_idx` ON `analytics_visitor_events` (`day`,`visitor_hash`,`event`,`provider`,`style`,`value`);
