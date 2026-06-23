ALTER TABLE `subscriptions` RENAME COLUMN `paypal_subscription_id` TO `stripe_subscription_id`;
--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `stripe_customer_id` text;
--> statement-breakpoint
DROP INDEX IF EXISTS `subscriptions_paypal_idx`;
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_idx` ON `subscriptions` (`stripe_subscription_id`);
--> statement-breakpoint
ALTER TABLE `paypal_webhook_events` RENAME TO `stripe_webhook_events`;
