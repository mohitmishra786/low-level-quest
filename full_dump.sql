--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer,
    discussion_id integer,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: discussions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussions (
    id integer NOT NULL,
    user_id integer,
    problem_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: discussions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discussions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discussions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discussions_id_seq OWNED BY public.discussions.id;


--
-- Name: hints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hints (
    id integer NOT NULL,
    problem_id integer,
    content text NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    sequence_number integer DEFAULT 1 NOT NULL
);


--
-- Name: hints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hints_id_seq OWNED BY public.hints.id;


--
-- Name: problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problems (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    difficulty character varying(20) NOT NULL,
    category_id integer,
    initial_code text,
    solution text,
    test_cases jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: problems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problems_id_seq OWNED BY public.problems.id;


--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_cases (
    id integer NOT NULL,
    problem_id integer,
    input text NOT NULL,
    expected_output text NOT NULL,
    is_hidden boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


--
-- Name: test_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.test_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: test_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.test_cases_id_seq OWNED BY public.test_cases.id;


--
-- Name: user_problem_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_problem_status (
    id integer NOT NULL,
    user_id integer,
    problem_id integer,
    status character varying(20) NOT NULL,
    attempts integer DEFAULT 0,
    last_attempted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    solved_at timestamp with time zone,
    CONSTRAINT user_problem_status_status_check CHECK (((status)::text = ANY ((ARRAY['attempted'::character varying, 'solved'::character varying])::text[])))
);


--
-- Name: user_problem_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_problem_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_problem_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_problem_status_id_seq OWNED BY public.user_problem_status.id;


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id integer NOT NULL,
    user_id integer,
    problem_id integer,
    status character varying(20) NOT NULL,
    submitted_solution text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_progress_id_seq OWNED BY public.user_progress.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: discussions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions ALTER COLUMN id SET DEFAULT nextval('public.discussions_id_seq'::regclass);


--
-- Name: hints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hints ALTER COLUMN id SET DEFAULT nextval('public.hints_id_seq'::regclass);


--
-- Name: problems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems ALTER COLUMN id SET DEFAULT nextval('public.problems_id_seq'::regclass);


--
-- Name: test_cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases ALTER COLUMN id SET DEFAULT nextval('public.test_cases_id_seq'::regclass);


--
-- Name: user_problem_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_problem_status ALTER COLUMN id SET DEFAULT nextval('public.user_problem_status_id_seq'::regclass);


--
-- Name: user_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- Name: hints hints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hints
    ADD CONSTRAINT hints_pkey PRIMARY KEY (id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: user_problem_status user_problem_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_problem_status
    ADD CONSTRAINT user_problem_status_pkey PRIMARY KEY (id);


--
-- Name: user_problem_status user_problem_status_user_id_problem_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_problem_status
    ADD CONSTRAINT user_problem_status_user_id_problem_id_key UNIQUE (user_id, problem_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_problem_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_problem_id_key UNIQUE (user_id, problem_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: comments comments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: discussions discussions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id);


--
-- Name: discussions discussions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: hints hints_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hints
    ADD CONSTRAINT hints_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id);


--
-- Name: problems problems_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: test_cases test_cases_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id);


--
-- Name: user_problem_status user_problem_status_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_problem_status
    ADD CONSTRAINT user_problem_status_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: user_problem_status user_problem_status_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_problem_status
    ADD CONSTRAINT user_problem_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id);


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

