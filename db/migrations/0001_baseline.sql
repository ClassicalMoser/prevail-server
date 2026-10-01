--
-- PostgreSQL database dump
--

\restrict kYkJhKaLcD4wng0ag1aJoj47yr9xPfY9cKoi6D298zVMsPgBqpl64lmqPfKPrsw

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: armies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.armies (
    army_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    army_name text NOT NULL,
    public boolean DEFAULT true NOT NULL,
    archived_at timestamp with time zone,
    user_id uuid NOT NULL
);


--
-- Name: army_command_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.army_command_cards (
    army_id uuid NOT NULL,
    command_card_id uuid NOT NULL,
    quantity smallint DEFAULT 1 NOT NULL
);


--
-- Name: army_unit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.army_unit_cards (
    army_id uuid NOT NULL,
    unit_card_id uuid NOT NULL,
    quantity smallint DEFAULT 1 NOT NULL
);


--
-- Name: bots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bots (
    bot_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    bot_name text NOT NULL
);


--
-- Name: command_card_certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_card_certifications (
    rules_version_id uuid NOT NULL,
    command_card_version_id uuid NOT NULL
);


--
-- Name: command_card_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_card_versions (
    command_card_version_id uuid DEFAULT gen_random_uuid() CONSTRAINT card_versions_id_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT card_versions_created_at_not_null NOT NULL,
    command_card_id uuid CONSTRAINT card_versions_card_id_not_null NOT NULL,
    command_card_definition jsonb NOT NULL,
    version_major smallint NOT NULL,
    version_minor smallint NOT NULL,
    version_patch smallint NOT NULL,
    command_card_name text NOT NULL
);


--
-- Name: command_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_cards (
    command_card_id uuid DEFAULT gen_random_uuid() CONSTRAINT cards_id_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT cards_created_at_not_null NOT NULL
);


--
-- Name: game_rounds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_rounds (
    game_id uuid NOT NULL,
    round_number smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    round_state jsonb NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.games (
    game_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    rules_version_id uuid NOT NULL,
    game_mode text NOT NULL,
    white_player_army_id uuid NOT NULL,
    white_player_army_snapshot jsonb NOT NULL,
    black_player_army_id uuid NOT NULL,
    black_player_army_snapshot jsonb NOT NULL,
    outcome_result text,
    outcome_reason text,
    ended_at timestamp with time zone
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    game_id uuid NOT NULL,
    user_id uuid,
    bot_id uuid,
    side text NOT NULL,
    CONSTRAINT players_exactly_one_identity CHECK ((((user_id IS NOT NULL) AND (bot_id IS NULL)) OR ((bot_id IS NOT NULL) AND (user_id IS NULL)))),
    CONSTRAINT players_side_valid CHECK ((side = ANY (ARRAY['black'::text, 'white'::text])))
);


--
-- Name: rules_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules_versions (
    rules_version_id uuid DEFAULT gen_random_uuid() CONSTRAINT rules_versions_id_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    authoritative_at timestamp with time zone,
    version_major smallint NOT NULL,
    version_minor smallint NOT NULL,
    version_patch smallint NOT NULL
);


--
-- Name: unit_card_certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_card_certifications (
    unit_card_version_id uuid NOT NULL,
    rules_version_id uuid NOT NULL
);


--
-- Name: unit_card_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_card_versions (
    unit_card_version_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    unit_card_id uuid NOT NULL,
    unit_card_definition jsonb NOT NULL,
    version_major smallint NOT NULL,
    version_minor smallint NOT NULL,
    version_patch smallint NOT NULL,
    unit_card_name text NOT NULL,
    unit_card_artwork_url text
);


--
-- Name: unit_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_cards (
    unit_card_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_auth_sub text NOT NULL
);


--
-- Name: armies armies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.armies
    ADD CONSTRAINT armies_pkey PRIMARY KEY (army_id);


--
-- Name: army_command_cards army_command_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_command_cards
    ADD CONSTRAINT army_command_cards_pkey PRIMARY KEY (army_id, command_card_id);


--
-- Name: army_unit_cards army_unit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_unit_cards
    ADD CONSTRAINT army_unit_cards_pkey PRIMARY KEY (army_id, unit_card_id);


--
-- Name: bots bots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bots
    ADD CONSTRAINT bots_pkey PRIMARY KEY (bot_id);


--
-- Name: command_card_versions card_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_card_versions
    ADD CONSTRAINT card_versions_pkey PRIMARY KEY (command_card_version_id);


--
-- Name: command_cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (command_card_id);


--
-- Name: command_card_certifications command_card_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_card_certifications
    ADD CONSTRAINT command_card_certifications_pkey PRIMARY KEY (rules_version_id, command_card_version_id);


--
-- Name: game_rounds game_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rounds
    ADD CONSTRAINT game_rounds_pkey PRIMARY KEY (game_id, round_number);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (game_id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (game_id, side);


--
-- Name: rules_versions rules_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules_versions
    ADD CONSTRAINT rules_versions_pkey PRIMARY KEY (rules_version_id);


--
-- Name: unit_card_certifications unit_card_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_card_certifications
    ADD CONSTRAINT unit_card_certifications_pkey PRIMARY KEY (unit_card_version_id, rules_version_id);


--
-- Name: unit_card_versions unit_card_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_card_versions
    ADD CONSTRAINT unit_card_versions_pkey PRIMARY KEY (unit_card_version_id);


--
-- Name: unit_cards unit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_cards
    ADD CONSTRAINT unit_cards_pkey PRIMARY KEY (unit_card_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: command_card_versions_natural_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX command_card_versions_natural_key_unique ON public.command_card_versions USING btree (command_card_id, version_major, version_minor, version_patch);


--
-- Name: rules_versions_natural_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rules_versions_natural_key_unique ON public.rules_versions USING btree (version_major, version_minor, version_patch);


--
-- Name: unit_card_versions_natural_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unit_card_versions_natural_key_unique ON public.unit_card_versions USING btree (unit_card_id, version_major, version_minor, version_patch);


--
-- Name: user_auth_sub_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_auth_sub_unique ON public.users USING btree (user_auth_sub);


--
-- Name: armies armies_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.armies
    ADD CONSTRAINT armies_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: army_command_cards army_command_cards_army_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_command_cards
    ADD CONSTRAINT army_command_cards_army_id_fkey FOREIGN KEY (army_id) REFERENCES public.armies(army_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: army_command_cards army_command_cards_command_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_command_cards
    ADD CONSTRAINT army_command_cards_command_card_id_fkey FOREIGN KEY (command_card_id) REFERENCES public.command_cards(command_card_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: army_unit_cards army_unit_cards_army_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_unit_cards
    ADD CONSTRAINT army_unit_cards_army_id_fkey FOREIGN KEY (army_id) REFERENCES public.armies(army_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: army_unit_cards army_unit_cards_unit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.army_unit_cards
    ADD CONSTRAINT army_unit_cards_unit_card_id_fkey FOREIGN KEY (unit_card_id) REFERENCES public.unit_cards(unit_card_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: command_card_certifications command_card_certifications_command_card_version_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_card_certifications
    ADD CONSTRAINT command_card_certifications_command_card_version_id FOREIGN KEY (command_card_version_id) REFERENCES public.command_card_versions(command_card_version_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: command_card_certifications command_card_certifications_rules_version_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_card_certifications
    ADD CONSTRAINT command_card_certifications_rules_version_id FOREIGN KEY (rules_version_id) REFERENCES public.rules_versions(rules_version_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: command_card_versions command_card_versions_command_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_card_versions
    ADD CONSTRAINT command_card_versions_command_card_id_fkey FOREIGN KEY (command_card_id) REFERENCES public.command_cards(command_card_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: game_rounds game_rounds_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rounds
    ADD CONSTRAINT game_rounds_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: games games_black_player_army_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_black_player_army_id_fkey FOREIGN KEY (black_player_army_id) REFERENCES public.armies(army_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: games games_rules_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_rules_version_id_fkey FOREIGN KEY (rules_version_id) REFERENCES public.rules_versions(rules_version_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: games games_white_player_army_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_white_player_army_id_fkey FOREIGN KEY (white_player_army_id) REFERENCES public.armies(army_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: players players_bot_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_bot_id FOREIGN KEY (bot_id) REFERENCES public.bots(bot_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: players players_game_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_game_id FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: players players_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: unit_card_certifications unit_card_certifications_rules_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_card_certifications
    ADD CONSTRAINT unit_card_certifications_rules_version_id_fkey FOREIGN KEY (rules_version_id) REFERENCES public.rules_versions(rules_version_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: unit_card_certifications unit_card_certifications_unit_card_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_card_certifications
    ADD CONSTRAINT unit_card_certifications_unit_card_version_id_fkey FOREIGN KEY (unit_card_version_id) REFERENCES public.unit_card_versions(unit_card_version_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: unit_card_versions unit_card_versions_unit_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_card_versions
    ADD CONSTRAINT unit_card_versions_unit_card_id_fkey FOREIGN KEY (unit_card_id) REFERENCES public.unit_cards(unit_card_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict kYkJhKaLcD4wng0ag1aJoj47yr9xPfY9cKoi6D298zVMsPgBqpl64lmqPfKPrsw

