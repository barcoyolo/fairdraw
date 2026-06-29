insert into public.events (
  title,
  description,
  public_slug,
  winner_count,
  alternate_count,
  preregistration_opens_at,
  preregistration_closes_at,
  live_registration_closes_at,
  eligibility_rules,
  preregistration_open,
  live_registration_open
)
values (
  'FairDraw Community Lottery',
  'Transparent community distribution for a public World Cup ticket giveaway.',
  'world-cup-community-draw',
  3,
  2,
  now() - interval '1 day',
  now() + interval '7 days',
  now() + interval '8 days',
  'One entry per person. Participants must meet embassy/community eligibility rules.',
  true,
  true
)
on conflict (public_slug) do update set
  title = excluded.title,
  description = excluded.description,
  winner_count = excluded.winner_count,
  alternate_count = excluded.alternate_count,
  eligibility_rules = excluded.eligibility_rules,
  preregistration_open = excluded.preregistration_open,
  live_registration_open = excluded.live_registration_open;
