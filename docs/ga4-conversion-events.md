# GA4 conversion event map

Measurement ID: `G-DT7RGRTYV4`

Arcana AI sends custom funnel events and GA4 recommended ecommerce events from the client. Use this file as the source of truth when configuring GA4 key events and Google Ads conversions.

## Primary conversion

Mark this as the primary conversion / key event:

- `purchase`

Payload notes:

- Sent only after `/api/stripe/confirm-session` returns `ok: true`.
- Uses Stripe Checkout Session ID as `transaction_id` for deduplication.
- Includes `value`, `currency`, `items`, `plan`, `plan_name`, `product_id`, `subscription_id`, and `payment_status`.

## Secondary conversion signals

Mark these as key events or import them into Google Ads as secondary conversions:

- `result_view`
- `paywall_view`
- `checkout_start`
- `begin_checkout`

Recommended use:

- `result_view`: user received a complete AI reading.
- `paywall_view`: user saw the paid offer.
- `checkout_start`: user clicked into the paid checkout flow.
- `begin_checkout`: GA4 recommended ecommerce event for checkout intent.

## Diagnostic events

Keep these as regular events for funnel debugging:

- `spread_click`
- `question_submit`
- `draw_start`
- `draw_complete`
- `plan_select`
- `paywall_cta_click`
- `login_start`
- `login_success`
- `checkout_cancel`
- `checkout_error`
- `checkout_success`

## Funnel to build in GA4 Explore

Create a funnel exploration with these steps:

1. `landing_view`
2. `spread_click`
3. `question_submit`
4. `draw_start`
5. `draw_complete`
6. `result_view`
7. `paywall_view`
8. `paywall_cta_click`
9. `begin_checkout`
10. `purchase`

Breakdowns to add:

- `device_type`
- `spread_id`
- `paywall_src`
- `plan`
- `utm_source`
- `utm_campaign`
- `utm_term`
- `user_status`

## GA4 setup checklist

1. Open GA4 Admin.
2. Go to Data display -> Events.
3. Confirm the events above are being received.
4. Mark `purchase` as a key event.
5. Mark `result_view`, `paywall_view`, `checkout_start`, and `begin_checkout` as secondary key events if you want softer conversion signals.
6. In Google Ads, import `purchase` as the primary conversion.
7. Import checkout and result events as secondary conversions only, so bidding does not optimize toward low-intent events as if they were revenue.
