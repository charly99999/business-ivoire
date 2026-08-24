-- Initialisation de profil compatible avec l’inscription téléphone et e-mail.
-- Les nouveaux comptes téléphone reçoivent immédiatement les données saisies
-- pendant l’onboarding ; aucun numéro n’est exposé au-delà des règles existantes.

create or replace function public.handle_new_business_ivoire_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
begin
  full_name := nullif(
    concat_ws(
      ' ',
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), '')
    ),
    ''
  );

  insert into public.profiles (id, display_name, location, phone, contact_email)
  values (
    new.id,
    coalesce(full_name, nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, new.phone, 'Utilisateur'), '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Abidjan, Côte d’Ivoire'),
    coalesce(new.phone, nullif(new.raw_user_meta_data ->> 'phone', '')),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
