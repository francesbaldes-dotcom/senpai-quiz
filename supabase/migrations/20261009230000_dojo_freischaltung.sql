-- Senpai Quiz: Freischaltung des Senpai Dojo (Japanisch lernen) im Profil.
--
-- dojo_bis = Ablauf der Freischaltung. Einmalkauf: weit in der Zukunft (9999-12-31),
-- Monatsabo: Ende der bezahlten Periode, null: nicht freigeschaltet.
-- Geschrieben wird die Spalte nicht aus der App (kein RPC, keine Policy), sondern
-- später vom Server aus dem Store-Webhook (RevenueCat → Edge Function mit
-- Service-Rolle). Die App liest sie nur und hält zusätzlich den Kauf lokal fest.

alter table public.profile add column if not exists dojo_bis timestamptz;

comment on column public.profile.dojo_bis is 'Senpai Dojo freigeschaltet bis (null = nicht gekauft); setzt nur der Store-Webhook';
