--
-- PostgreSQL database dump
--

\restrict 9lJxYWq7E5wsXdlIucIK6qeZeALAXZjftSWnrCdASSNu04XAc4HaG6fYGHv5SVn

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

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
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider character varying(50) NOT NULL,
    provider_user_id character varying(255),
    password_hash text,
    password_changed_at timestamp with time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_accounts_provider_check CHECK (((provider)::text = ANY ((ARRAY['PASSWORD'::character varying, 'GOOGLE'::character varying, 'GITHUB'::character varying, 'MICROSOFT'::character varying])::text[])))
);


ALTER TABLE public.auth_accounts OWNER TO postgres;

--
-- Name: concepts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.concepts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name public.citext NOT NULL,
    category character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.concepts OWNER TO postgres;

--
-- Name: evaluation_dimensions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_dimensions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.evaluation_dimensions OWNER TO postgres;

--
-- Name: evidence_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evidence_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.evidence_categories OWNER TO postgres;

--
-- Name: job_eligibility_criteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_eligibility_criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    currency character varying(10) NOT NULL,
    salary_min numeric(12,2) NOT NULL,
    salary_max numeric(12,2) NOT NULL,
    experience_min_years numeric(4,1) NOT NULL,
    experience_ideal_years numeric(4,1) NOT NULL,
    experience_max_years numeric(4,1) NOT NULL,
    notice_period_ideal_days integer NOT NULL,
    notice_period_max_days integer NOT NULL,
    relocation_supported boolean DEFAULT false NOT NULL,
    visa_sponsorship boolean DEFAULT false NOT NULL,
    work_authorization_required boolean DEFAULT false NOT NULL,
    degree_required boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_eligibility_experience_check CHECK (((experience_min_years <= experience_ideal_years) AND (experience_ideal_years <= experience_max_years))),
    CONSTRAINT job_eligibility_notice_check CHECK ((notice_period_ideal_days <= notice_period_max_days)),
    CONSTRAINT job_eligibility_salary_check CHECK ((salary_min <= salary_max))
);


ALTER TABLE public.job_eligibility_criteria OWNER TO postgres;

--
-- Name: job_evaluation_priorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_evaluation_priorities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    evaluation_dimension_id uuid NOT NULL,
    weight integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_evaluation_priorities_weight_check CHECK (((weight >= 0) AND (weight <= 100)))
);


ALTER TABLE public.job_evaluation_priorities OWNER TO postgres;

--
-- Name: job_evidence_priorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_evidence_priorities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    evidence_category_id uuid NOT NULL,
    weight integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_evidence_priorities_weight_check CHECK (((weight >= 0) AND (weight <= 100)))
);


ALTER TABLE public.job_evidence_priorities OWNER TO postgres;

--
-- Name: job_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    technology_id uuid,
    concept_id uuid,
    requirement_type character varying(20) NOT NULL,
    priority_type character varying(20) NOT NULL,
    weight integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_requirements_priority_check CHECK (((priority_type)::text = ANY ((ARRAY['MANDATORY'::character varying, 'PREFERRED'::character varying, 'BONUS'::character varying])::text[]))),
    CONSTRAINT job_requirements_reference_check CHECK (((((requirement_type)::text = 'TECHNOLOGY'::text) AND (technology_id IS NOT NULL) AND (concept_id IS NULL)) OR (((requirement_type)::text = 'CONCEPT'::text) AND (concept_id IS NOT NULL) AND (technology_id IS NULL)))),
    CONSTRAINT job_requirements_type_check CHECK (((requirement_type)::text = ANY ((ARRAY['TECHNOLOGY'::character varying, 'CONCEPT'::character varying])::text[])))
);


ALTER TABLE public.job_requirements OWNER TO postgres;

--
-- Name: job_role_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_role_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_role_categories OWNER TO postgres;

--
-- Name: job_submission_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_submission_requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    resume_required boolean DEFAULT true NOT NULL,
    github_required boolean DEFAULT false NOT NULL,
    portfolio_required boolean DEFAULT false NOT NULL,
    problem_solving_profile_required boolean DEFAULT false NOT NULL,
    linkedin_required boolean DEFAULT false NOT NULL,
    project_explanation_required boolean DEFAULT false NOT NULL,
    feature_explanation_required boolean DEFAULT false NOT NULL,
    zip_upload_allowed boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_submission_requirements OWNER TO postgres;

--
-- Name: job_success_signals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_success_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    success_signal_id uuid NOT NULL,
    weight integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_success_signals_weight_check CHECK (((weight >= 0) AND (weight <= 100)))
);


ALTER TABLE public.job_success_signals OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    created_by_membership_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    department character varying(150),
    employment_type character varying(30) NOT NULL,
    work_mode character varying(30) NOT NULL,
    country character varying(100) NOT NULL,
    state character varying(100),
    city character varying(100),
    open_positions integer DEFAULT 1 NOT NULL,
    description text,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    published_at timestamp with time zone,
    closed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    role_category_id uuid NOT NULL,
    CONSTRAINT jobs_closed_after_created_check CHECK (((closed_at IS NULL) OR (closed_at >= created_at))),
    CONSTRAINT jobs_employment_type_check CHECK (((employment_type)::text = ANY ((ARRAY['FULL_TIME'::character varying, 'INTERNSHIP'::character varying, 'CONTRACT'::character varying, 'PART_TIME'::character varying])::text[]))),
    CONSTRAINT jobs_open_positions_check CHECK ((open_positions > 0)),
    CONSTRAINT jobs_published_after_created_check CHECK (((published_at IS NULL) OR (published_at >= created_at))),
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'PAUSED'::character varying, 'CLOSED'::character varying, 'ARCHIVED'::character varying])::text[]))),
    CONSTRAINT jobs_work_mode_check CHECK (((work_mode)::text = ANY ((ARRAY['ONSITE'::character varying, 'HYBRID'::character varying, 'REMOTE'::character varying])::text[])))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    title character varying(150),
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    invited_by uuid,
    removed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT organization_members_role_check CHECK (((role)::text = ANY ((ARRAY['ORG_OWNER'::character varying, 'RECRUITING_ADMIN'::character varying, 'RECRUITER'::character varying, 'HIRING_MANAGER'::character varying, 'INTERVIEWER'::character varying, 'VIEWER'::character varying])::text[])))
);


ALTER TABLE public.organization_members OWNER TO postgres;

--
-- Name: organization_security_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_security_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    initiated_by_membership_id uuid NOT NULL,
    target_membership_id uuid,
    action_type character varying(50) NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    reason text,
    mfa_verified_at timestamp with time zone,
    scheduled_for timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    cancelled_at timestamp with time zone,
    cancelled_by_membership_id uuid,
    executed_at timestamp with time zone,
    execution_error text,
    idempotency_key uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT org_security_action_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CANCELLED'::character varying, 'EXECUTED'::character varying, 'EXPIRED'::character varying, 'FAILED'::character varying])::text[]))),
    CONSTRAINT org_security_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['OWNERSHIP_TRANSFER'::character varying, 'ORG_DELETION'::character varying, 'BILLING_OWNERSHIP_TRANSFER'::character varying])::text[])))
);


ALTER TABLE public.organization_security_actions OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug public.citext NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT organizations_credits_check CHECK ((credits >= 0)),
    CONSTRAINT organizations_slug_format_check CHECK ((slug OPERATOR(public.~) '^[a-zA-Z0-9_-]+$'::public.citext)),
    CONSTRAINT organizations_slug_length_check CHECK (((char_length((slug)::text) >= 3) AND (char_length((slug)::text) <= 100))),
    CONSTRAINT organizations_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying, 'DELETED'::character varying])::text[])))
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    requested_ip inet,
    requested_user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: platform_invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    revoked_at timestamp with time zone,
    created_by uuid,
    revoked_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT platform_invites_accept_after_create_check CHECK (((accepted_at IS NULL) OR (accepted_at >= created_at))),
    CONSTRAINT platform_invites_revoke_after_create_check CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at)))
);


ALTER TABLE public.platform_invites OWNER TO postgres;

--
-- Name: success_signals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.success_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.success_signals OWNER TO postgres;

--
-- Name: technologies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technologies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name public.citext NOT NULL,
    category character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technologies OWNER TO postgres;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    phone character varying(30),
    avatar_url text,
    linkedin_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    refresh_token_hash text NOT NULL,
    parent_session_id uuid,
    user_agent text,
    ip_address inet,
    device_name character varying(255),
    platform character varying(100),
    browser character varying(100),
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    revoked_reason character varying(100),
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    email public.citext NOT NULL,
    status character varying(30) DEFAULT 'PENDING_INVITE'::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    email_verified_at timestamp with time zone,
    suspended_at timestamp with time zone,
    suspended_reason text,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING_INVITE'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying, 'DELETED'::character varying])::text[]))),
    CONSTRAINT users_username_format_check CHECK ((username OPERATOR(public.~) '^[a-zA-Z0-9_-]+$'::public.citext)),
    CONSTRAINT users_username_length_check CHECK (((char_length((username)::text) >= 3) AND (char_length((username)::text) <= 50)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: auth_accounts auth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_pkey PRIMARY KEY (id);


--
-- Name: auth_accounts auth_accounts_provider_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_provider_unique UNIQUE (provider, provider_user_id);


--
-- Name: concepts concepts_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concepts
    ADD CONSTRAINT concepts_name_key UNIQUE (name);


--
-- Name: concepts concepts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concepts
    ADD CONSTRAINT concepts_pkey PRIMARY KEY (id);


--
-- Name: evaluation_dimensions evaluation_dimensions_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dimensions
    ADD CONSTRAINT evaluation_dimensions_code_key UNIQUE (code);


--
-- Name: evaluation_dimensions evaluation_dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_dimensions
    ADD CONSTRAINT evaluation_dimensions_pkey PRIMARY KEY (id);


--
-- Name: evidence_categories evidence_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidence_categories
    ADD CONSTRAINT evidence_categories_code_key UNIQUE (code);


--
-- Name: evidence_categories evidence_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidence_categories
    ADD CONSTRAINT evidence_categories_pkey PRIMARY KEY (id);


--
-- Name: job_eligibility_criteria job_eligibility_criteria_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_eligibility_criteria
    ADD CONSTRAINT job_eligibility_criteria_job_id_key UNIQUE (job_id);


--
-- Name: job_eligibility_criteria job_eligibility_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_eligibility_criteria
    ADD CONSTRAINT job_eligibility_criteria_pkey PRIMARY KEY (id);


--
-- Name: job_evaluation_priorities job_evaluation_priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evaluation_priorities
    ADD CONSTRAINT job_evaluation_priorities_pkey PRIMARY KEY (id);


--
-- Name: job_evaluation_priorities job_evaluation_priorities_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evaluation_priorities
    ADD CONSTRAINT job_evaluation_priorities_unique UNIQUE (job_id, evaluation_dimension_id);


--
-- Name: job_evidence_priorities job_evidence_priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evidence_priorities
    ADD CONSTRAINT job_evidence_priorities_pkey PRIMARY KEY (id);


--
-- Name: job_evidence_priorities job_evidence_priorities_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evidence_priorities
    ADD CONSTRAINT job_evidence_priorities_unique UNIQUE (job_id, evidence_category_id);


--
-- Name: job_requirements job_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_pkey PRIMARY KEY (id);


--
-- Name: job_role_categories job_role_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_role_categories
    ADD CONSTRAINT job_role_categories_code_key UNIQUE (code);


--
-- Name: job_role_categories job_role_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_role_categories
    ADD CONSTRAINT job_role_categories_pkey PRIMARY KEY (id);


--
-- Name: job_submission_requirements job_submission_requirements_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_submission_requirements
    ADD CONSTRAINT job_submission_requirements_job_id_key UNIQUE (job_id);


--
-- Name: job_submission_requirements job_submission_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_submission_requirements
    ADD CONSTRAINT job_submission_requirements_pkey PRIMARY KEY (id);


--
-- Name: job_success_signals job_success_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_success_signals
    ADD CONSTRAINT job_success_signals_pkey PRIMARY KEY (id);


--
-- Name: job_success_signals job_success_signals_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_success_signals
    ADD CONSTRAINT job_success_signals_unique UNIQUE (job_id, success_signal_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: organization_members organization_members_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);


--
-- Name: organization_security_actions organization_security_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_security_actions
    ADD CONSTRAINT organization_security_actions_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: platform_invites platform_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_invites
    ADD CONSTRAINT platform_invites_pkey PRIMARY KEY (id);


--
-- Name: success_signals success_signals_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.success_signals
    ADD CONSTRAINT success_signals_code_key UNIQUE (code);


--
-- Name: success_signals success_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.success_signals
    ADD CONSTRAINT success_signals_pkey PRIMARY KEY (id);


--
-- Name: technologies technologies_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_name_key UNIQUE (name);


--
-- Name: technologies technologies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_auth_accounts_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_accounts_provider ON public.auth_accounts USING btree (provider);


--
-- Name: idx_auth_accounts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_accounts_user_id ON public.auth_accounts USING btree (user_id);


--
-- Name: idx_job_evidence_priorities_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_evidence_priorities_category ON public.job_evidence_priorities USING btree (evidence_category_id);


--
-- Name: idx_job_evidence_priorities_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_evidence_priorities_job ON public.job_evidence_priorities USING btree (job_id);


--
-- Name: idx_job_requirements_concept; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_requirements_concept ON public.job_requirements USING btree (concept_id);


--
-- Name: idx_job_requirements_job; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_requirements_job ON public.job_requirements USING btree (job_id);


--
-- Name: idx_job_requirements_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_requirements_priority ON public.job_requirements USING btree (priority_type);


--
-- Name: idx_job_requirements_technology; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_requirements_technology ON public.job_requirements USING btree (technology_id);


--
-- Name: idx_jobs_active_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_active_org ON public.jobs USING btree (organization_id, status) WHERE (deleted_at IS NULL);


--
-- Name: idx_jobs_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_created_by ON public.jobs USING btree (created_by_membership_id);


--
-- Name: idx_jobs_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_org ON public.jobs USING btree (organization_id);


--
-- Name: idx_jobs_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_published_at ON public.jobs USING btree (published_at);


--
-- Name: idx_jobs_role_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_role_category_id ON public.jobs USING btree (role_category_id);


--
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- Name: idx_one_owner_per_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_one_owner_per_org ON public.organization_members USING btree (organization_id) WHERE (((role)::text = 'ORG_OWNER'::text) AND (removed_at IS NULL));


--
-- Name: idx_org_member_active_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_org_member_active_unique ON public.organization_members USING btree (organization_id, user_id) WHERE (removed_at IS NULL);


--
-- Name: idx_org_members_org_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_org_active ON public.organization_members USING btree (organization_id) WHERE (removed_at IS NULL);


--
-- Name: idx_org_members_org_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_org_role ON public.organization_members USING btree (organization_id, role) WHERE (removed_at IS NULL);


--
-- Name: idx_org_members_user_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_user_active ON public.organization_members USING btree (user_id) WHERE (removed_at IS NULL);


--
-- Name: idx_org_security_idempotency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_org_security_idempotency ON public.organization_security_actions USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);


--
-- Name: idx_org_security_initiator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_security_initiator ON public.organization_security_actions USING btree (initiated_by_membership_id);


--
-- Name: idx_org_security_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_security_org ON public.organization_security_actions USING btree (organization_id);


--
-- Name: idx_org_security_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_security_scheduled ON public.organization_security_actions USING btree (scheduled_for) WHERE ((status)::text = 'PENDING'::text);


--
-- Name: idx_org_security_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_security_status ON public.organization_security_actions USING btree (status);


--
-- Name: idx_organizations_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_created_at ON public.organizations USING btree (created_at);


--
-- Name: idx_organizations_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_created_by ON public.organizations USING btree (created_by);


--
-- Name: idx_organizations_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_deleted_at ON public.organizations USING btree (deleted_at);


--
-- Name: idx_organizations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_status ON public.organizations USING btree (status);


--
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_platform_invites_active_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_platform_invites_active_email ON public.platform_invites USING btree (email) WHERE ((accepted_at IS NULL) AND (revoked_at IS NULL));


--
-- Name: idx_platform_invites_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_invites_created_by ON public.platform_invites USING btree (created_by);


--
-- Name: idx_platform_invites_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_invites_email ON public.platform_invites USING btree (email);


--
-- Name: idx_platform_invites_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_invites_expires_at ON public.platform_invites USING btree (expires_at);


--
-- Name: idx_user_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);


--
-- Name: idx_user_sessions_parent_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_parent_session_id ON public.user_sessions USING btree (parent_session_id);


--
-- Name: auth_accounts auth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organization_members fk_org_members_invited_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT fk_org_members_invited_by FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: job_eligibility_criteria job_eligibility_criteria_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_eligibility_criteria
    ADD CONSTRAINT job_eligibility_criteria_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_evaluation_priorities job_evaluation_priorities_evaluation_dimension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evaluation_priorities
    ADD CONSTRAINT job_evaluation_priorities_evaluation_dimension_id_fkey FOREIGN KEY (evaluation_dimension_id) REFERENCES public.evaluation_dimensions(id) ON DELETE RESTRICT;


--
-- Name: job_evaluation_priorities job_evaluation_priorities_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evaluation_priorities
    ADD CONSTRAINT job_evaluation_priorities_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_evidence_priorities job_evidence_priorities_evidence_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evidence_priorities
    ADD CONSTRAINT job_evidence_priorities_evidence_category_id_fkey FOREIGN KEY (evidence_category_id) REFERENCES public.evidence_categories(id) ON DELETE RESTRICT;


--
-- Name: job_evidence_priorities job_evidence_priorities_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_evidence_priorities
    ADD CONSTRAINT job_evidence_priorities_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_requirements job_requirements_concept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_concept_id_fkey FOREIGN KEY (concept_id) REFERENCES public.concepts(id) ON DELETE RESTRICT;


--
-- Name: job_requirements job_requirements_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_requirements job_requirements_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_requirements
    ADD CONSTRAINT job_requirements_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technologies(id) ON DELETE RESTRICT;


--
-- Name: job_submission_requirements job_submission_requirements_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_submission_requirements
    ADD CONSTRAINT job_submission_requirements_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_success_signals job_success_signals_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_success_signals
    ADD CONSTRAINT job_success_signals_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_success_signals job_success_signals_success_signal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_success_signals
    ADD CONSTRAINT job_success_signals_success_signal_id_fkey FOREIGN KEY (success_signal_id) REFERENCES public.success_signals(id) ON DELETE RESTRICT;


--
-- Name: jobs jobs_created_by_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_membership_id_fkey FOREIGN KEY (created_by_membership_id) REFERENCES public.organization_members(id) ON DELETE RESTRICT;


--
-- Name: jobs jobs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_role_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_role_category_id_fkey FOREIGN KEY (role_category_id) REFERENCES public.job_role_categories(id) ON DELETE RESTRICT;


--
-- Name: organization_members organization_members_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: organization_members organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_members organization_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organization_security_actions organization_security_actions_cancelled_by_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_security_actions
    ADD CONSTRAINT organization_security_actions_cancelled_by_membership_id_fkey FOREIGN KEY (cancelled_by_membership_id) REFERENCES public.organization_members(id) ON DELETE RESTRICT;


--
-- Name: organization_security_actions organization_security_actions_initiated_by_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_security_actions
    ADD CONSTRAINT organization_security_actions_initiated_by_membership_id_fkey FOREIGN KEY (initiated_by_membership_id) REFERENCES public.organization_members(id) ON DELETE RESTRICT;


--
-- Name: organization_security_actions organization_security_actions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_security_actions
    ADD CONSTRAINT organization_security_actions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_security_actions organization_security_actions_target_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_security_actions
    ADD CONSTRAINT organization_security_actions_target_membership_id_fkey FOREIGN KEY (target_membership_id) REFERENCES public.organization_members(id) ON DELETE RESTRICT;


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: platform_invites platform_invites_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_invites
    ADD CONSTRAINT platform_invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: platform_invites platform_invites_revoked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_invites
    ADD CONSTRAINT platform_invites_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_parent_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_parent_session_id_fkey FOREIGN KEY (parent_session_id) REFERENCES public.user_sessions(id) ON DELETE SET NULL;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 9lJxYWq7E5wsXdlIucIK6qeZeALAXZjftSWnrCdASSNu04XAc4HaG6fYGHv5SVn

