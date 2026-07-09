# GA4 conversion event map

Measurement ID: `G-BV1BZXP1X2`

Arcana AI sends client-side GA4 events for the full reading-to-subscription path. Do not send the user's question text to GA4. Events only include safe diagnostics such as `question_length`, `spread_id`, `page_type`, `user_status`, `reading_id`, and payment metadata.

## Identity and attribution

Every event includes these common parameters:

- `analytics_session_id`: browser session ID stored in sessionStorage.
- `analytics_landing_id`: landing visit ID stored in sessionStorage.
- `reading_id`: one ID for a single reading attempt, carried through login, paywall, checkout, and result events.
- `reading_entry_source`: `home_question`, `detail_ask`, `question`, `journal`, or another product entry point.
- `page_type`: `home`, `spread_detail`, `reading_question`, `reading_draw`, `reading_result`, `journal`, `about`, `privacy`, or `contact`.
- `page_path`: includes virtual reading steps such as `/spread/daily?step=result` for analytics only.
- `canonical_url`: the real SEO URL. This does not change for virtual steps.
- `user_status`: `guest`, `free`, or `pro`.
- `free_readings_used` and `free_readings_left`.
- `spread_id`, `spread_name`, and `spread_card_count`.
- `device_type`: `mobile` or `desktop`.
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `gbraid`, `wbraid`, `referrer`, and `landing_page`.

## Primary conversion

Mark this as the primary conversion / key event:

- `purchase`

Payload notes:

- Sent only after `/api/stripe/confirm-session` returns `ok: true`.
- Uses Stripe Checkout Session ID as `transaction_id` for deduplication.
- Includes `value`, `currency`, `items`, `plan`, `plan_name`, `product_id`, `subscription_id`, `payment_status`, `paywall_src`, and `reading_id`.

## Secondary conversion signals

Use these as secondary key events or Google Ads secondary conversions:

- `result_view`: user received a completed AI reading.
- `paywall_view`: logged-in user saw the paid offer.
- `paywall_cta_click`: user clicked the paid plan CTA.
- `begin_checkout`: GA4 recommended checkout-intent event.
- `checkout_start`: Stripe Checkout session creation started.
- `login_success`: useful when the user had to log in before paying.

## Diagnostic events

Keep these as regular events for funnel debugging:

- `landing_view`
- `route_view`
- `home_question_submit`
- `spread_inferred`
- `spread_click`
- `spread_view`
- `prompt_pick`
- `question_submit`
- `reading_limit_hit`
- `reading_begin_error`
- `draw_start`
- `draw_complete`
- `card_reveal`
- `card_reveal_all`
- `reveal_click`
- `interpret_start`
- `interpret_success`
- `interpret_error`
- `followup_click`
- `upsell_click`
- `new_reading_click`
- `journal_save_click`
- `journal_save_success`
- `journal_save_error`
- `paywall_login_required`
- `paywall_close`
- `plan_select`
- `login_modal_view`
- `login_start`
- `login_google_click`
- `login_email_code_request`
- `login_email_code_sent`
- `login_email_code_error`
- `login_email_verify_start`
- `login_error`
- `login_modal_close`
- `checkout_cancel`
- `checkout_error`
- `checkout_success`

## Recommended GA4 funnel

Create a funnel exploration with these steps:

1. `landing_view`
2. `route_view`
3. `home_question_submit` or `spread_click`
4. `question_submit`
5. `draw_start`
6. `draw_complete`
7. `reveal_click`
8. `interpret_success`
9. `result_view`
10. `reading_limit_hit` or `paywall_view`
11. `paywall_cta_click`
12. `login_success` if login was required
13. `begin_checkout`
14. `purchase`

Useful segment comparisons:

- `reading_entry_source`: homepage auto-spread vs selected spread.
- `page_type`: entry and drop-off step.
- `spread_id`: which spreads convert.
- `paywall_src`: `nav`, `result`, `draw_limit`, `new_reading`, `followup`.
- `plan`: monthly vs quarterly.
- `user_status`: guest, free, pro.
- `device_type`: mobile vs desktop.
- `utm_campaign`, `utm_term`, `gclid`: paid search performance.

## GA4 setup checklist

1. Open GA4 Admin -> Data display -> Custom definitions.
2. Create event-scoped custom dimensions for:
   `reading_id`, `reading_entry_source`, `page_type`, `spread_id`, `paywall_src`, `plan`, `user_status`, `device_type`, `utm_campaign`, `utm_term`, and `gclid`.
3. Open Admin -> Events and confirm the events above are being received.
4. Mark `purchase` as the primary key event.
5. Mark `result_view`, `paywall_view`, `paywall_cta_click`, and `begin_checkout` as secondary key events only.
6. In Google Ads, import `purchase` as the primary conversion.
7. Import secondary events only as observation signals, not bidding goals, unless there is still no purchase volume.
