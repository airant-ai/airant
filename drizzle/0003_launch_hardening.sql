ALTER TABLE `consented_rants` ADD `submission_id` text;
CREATE UNIQUE INDEX `consented_rants_submission_id_unique` ON `consented_rants` (`submission_id`);
CREATE TABLE `verdict_rate_limits` (
	`bucket` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY (`bucket`, `visitor_hash`)
);
