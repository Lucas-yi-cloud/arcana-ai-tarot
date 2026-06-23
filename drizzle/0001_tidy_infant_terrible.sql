CREATE TABLE `oauth_states` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`state_hash` text NOT NULL,
	`verifier_hash` text NOT NULL,
	`redirect_path` text DEFAULT '/' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`used_at` integer,
	`ip_hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_states_state_idx` ON `oauth_states` (`state_hash`);--> statement-breakpoint
CREATE INDEX `oauth_states_provider_created_idx` ON `oauth_states` (`provider`,`created_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `display_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `google_sub` text;--> statement-breakpoint
ALTER TABLE `users` ADD `auth_provider` text DEFAULT 'email' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_sub_idx` ON `users` (`google_sub`);