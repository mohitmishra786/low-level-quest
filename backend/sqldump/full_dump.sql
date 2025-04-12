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
    run_code_count integer DEFAULT 0,
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

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.categories VALUES (1, 'Operating Systems', 'Problems related to OS concepts, system calls, and kernel programming', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (2, 'Computer Architecture', 'Problems focusing on CPU architecture, memory hierarchy, and assembly language', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (3, 'Reverse Engineering', 'Challenges involving binary analysis and understanding compiled code', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (4, 'Binary Exploitation', 'Problems related to security vulnerabilities and exploit development', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (5, 'DevOps', 'Tasks involving system administration, automation, and deployment', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (6, 'Machine Learning', 'Problems related to ML algorithms, neural networks, and data processing', '2025-04-06 19:37:05.626892+05:30');
INSERT INTO public.categories VALUES (13, 'OOPs', 'Problems related to Object-Oriented Programming concepts, design patterns, and SOLID principles', '2025-04-12 15:09:23.467361+05:30');
INSERT INTO public.categories VALUES (14, 'Angular', 'Problems focusing on Angular framework, components, services, and state management', '2025-04-12 15:09:23.467361+05:30');


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.problems VALUES (2, 'Process Scheduling', 'Implement a round-robin scheduler', 'Hard', 1, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (3, 'CPU Cache', 'Optimize code for better cache utilization', 'Medium', 2, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (4, 'Assembly Basics', 'Write a function in x86 assembly', 'Easy', 2, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (5, 'Binary Analysis', 'Analyze a binary file and find vulnerabilities', 'Hard', 3, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (6, 'Buffer Overflow', 'Exploit a simple buffer overflow vulnerability', 'Hard', 4, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (7, 'Docker Container', 'Create a Dockerfile for a web application', 'Easy', 5, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (8, 'Kubernetes Deployment', 'Deploy an application to Kubernetes', 'Medium', 5, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (9, 'Neural Network', 'Implement a simple neural network from scratch', 'Hard', 6, NULL, NULL, NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (1, 'Memory Management', 'Implement a simple memory allocator in C with the following requirements:

1. Create a fixed-size memory pool of 1024 bytes
2. Implement function that allocates memory from this pool
3. Implement function that frees memory
4. Your allocator should return NULL when:
   - Requested size is 0
   - Requested size is larger than available memory
   - Less than 4 bytes remain in the pool
5. For this simple implementation, your function should only reset the allocator when freeing the first allocated block

Example:
```c
// Allocate memory for an integer
int* x = (int*)my_malloc(sizeof(int));
*x = 42;
printf("%d\n", *x);  // Outputs: 42
my_free(x);

// Memory allocation failure cases
void* ptr1 = my_malloc(0);  // Returns NULL (zero size)
void* ptr2 = my_malloc(2000);  // Returns NULL (too large)
```', 'Medium', 1, '#include <stdio.h>
#include <stdlib.h>

void* my_malloc(size_t size) {
    // Your implementation here
    return NULL;
}

void my_free(void* ptr) {
    // Your implementation here
}', '#include <stdio.h>
#include <stdlib.h>

#define BLOCK_SIZE 1024
static char memory_pool[BLOCK_SIZE];
static int allocated = 0;

void* my_malloc(size_t size) {
    if (size == 0) return NULL;
    if (allocated + size > BLOCK_SIZE) return NULL;
    
    void* ptr = &memory_pool[allocated];
    allocated += size;
    return ptr;
}

void my_free(void* ptr) {
    // Simple implementation: reset allocation if ptr is start of memory pool
    if (ptr == memory_pool) {
        allocated = 0;
    }
}', NULL, '2025-04-06 19:47:07.847756+05:30', '2025-04-06 19:47:07.847756+05:30');
INSERT INTO public.problems VALUES (24, 'Component Basics and Data Binding', 'Learn how to create and structure Angular components. Master data binding techniques including property binding, event binding, and two-way binding for dynamic component interactions.', 'Hard', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (14, 'Singleton Pattern: Thread-Safe Implementation', 'Implement a thread-safe Singleton pattern in C++ that manages a global configuration system. Requirements:\n\n1. Thread-safe instance creation using double-checked locking\n2. Configuration management with key-value pairs\n3. Lazy initialization of the configuration\n4. Proper memory management and cleanup\n5. Prevention of copying and assignment\n6. Error handling for invalid operations\n\nThe Singleton should provide methods to:\n- Get/Set configuration values\n- Reset configuration to defaults\n- Check if a configuration key exists\n- Clear all configurations\n\nExample Usage:\nConfigSingleton::getInstance()->setValue("timeout", 30);\nint timeout = ConfigSingleton::getInstance()->getValue("timeout");', 'Hard', 13, 'class ConfigSingleton {\nprivate:\n    static ConfigSingleton* instance;\n    static std::mutex mutex;\n    std::unordered_map<std::string, int> config;\n    \n    ConfigSingleton() = default;  // Private constructor\n    ~ConfigSingleton() = default;\n    \n public:\n    static ConfigSingleton* getInstance();\n    void setValue(const std::string& key, int value);\n    int getValue(const std::string& key);\n    bool hasKey(const std::string& key);\n    void reset();\n    void clear();\n};', NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (25, 'Services and Dependency Injection', 'Understand Angular services and dependency injection system. Learn how to create, provide, and consume services across components for better code organization and reusability.', 'Medium', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (26, 'Template Syntax and Directives', 'Master Angular template syntax and built-in directives. Learn how to use structural directives like *ngIf and *ngFor, and attribute directives for dynamic template rendering.', 'Easy', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (27, 'Reactive Forms and Validation', 'Implement complex form handling using Angular reactive forms. Learn form validation, custom validators, and how to handle form submission with proper error handling.', 'Medium', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (28, 'HTTP Client and API Integration', 'Learn how to make HTTP requests using Angular HttpClient. Master API integration, error handling, and implementing proper data transformation for backend communication.', 'Medium', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (29, 'Advanced Routing and Navigation', 'Implement complex routing scenarios with guards and resolvers. Learn lazy loading, route parameters, and how to handle navigation events for better application performance.', 'Hard', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (30, 'Custom Pipes and Data Transformation', 'Create custom pipes for data transformation and formatting. Learn how to implement pure and impure pipes, and handle async data streams with the async pipe.', 'Easy', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (31, 'Component Styling and View Encapsulation', 'Master component styling techniques and view encapsulation. Learn how to use component-specific styles, global styles, and implement dynamic styling using ngClass and ngStyle.', 'Easy', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (32, 'Component Lifecycle and Change Detection', 'Understand component lifecycle hooks and change detection mechanism. Learn how to optimize performance by properly implementing lifecycle hooks and managing change detection.', 'Easy', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (33, 'Testing Angular Applications', 'Learn how to write unit tests and e2e tests for Angular applications. Master testing utilities, mocking dependencies, and implementing test coverage for components and services.', 'Easy', 14, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (15, 'Classes and Objects', 'Learn the fundamentals of object-oriented programming with classes and objects. Understand encapsulation, constructors, and how to create reusable code structures.', 'Medium', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (16, 'Inheritance and Polymorphism', 'Master inheritance hierarchies and polymorphic behavior in OOP. Learn how to create derived classes, override methods, and implement runtime polymorphism for flexible code design.', 'Easy', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (19, 'Method Overloading and Overriding', 'Learn the differences between method overloading and overriding. Understand how to implement both techniques effectively for creating flexible and maintainable code.', 'Medium', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (22, 'Design Patterns Implementation', 'Learn and implement common design patterns in OOP. Understand creational, structural, and behavioral patterns for creating maintainable and scalable applications.', 'Easy', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (17, 'Abstract Classes and Interfaces', 'Understand the difference between abstract classes and interfaces. Learn how to define abstract methods, implement interfaces, and create flexible class hierarchies.', 'Medium', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (18, 'Encapsulation and Access Control', 'Master encapsulation principles and access modifiers. Learn how to protect class members, implement getters and setters, and maintain data integrity in your classes.', 'Hard', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (20, 'Static Members and Constants', 'Understand static class members, constants, and their usage in OOP. Learn how to implement class-level variables and methods, and maintain global state effectively.', 'Medium', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (21, 'Exception Handling and Error Management', 'Master exception handling in OOP. Learn how to create custom exceptions, implement try-catch blocks, and handle errors gracefully in your applications.', 'Medium', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');
INSERT INTO public.problems VALUES (23, 'Advanced OOP Concepts', 'Explore advanced OOP concepts like composition, aggregation, and dependency injection. Learn how to implement complex object relationships and create flexible software architectures.', 'Easy', 13, NULL, NULL, NULL, '2025-04-12 15:25:31.311147+05:30', '2025-04-12 15:25:31.311147+05:30');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.users VALUES (1, 'Mohit', 'immadmohit@gmail.com', '$2b$10$i6ynhdkQCXguUymKGtzaVeUNYcP2rCQl/5kpwMQAMF663pk3QEKE.', '2025-04-06 19:45:33.721286+05:30', '2025-04-06 19:45:33.721286+05:30');
INSERT INTO public.users VALUES (3, 'abc', 'immadmoht@gmail.com', '$2b$10$2yULpFqYHpirinGNPLbF5OLTNP77F2kc0YznYWAgLLnUYnMyqcggS', '2025-04-06 19:48:28.021021+05:30', '2025-04-06 19:48:28.021021+05:30');
INSERT INTO public.users VALUES (4, 'mohit', 'abc@gmail.com', '$2b$10$TEvfjY2Aek5rfcZ.B8jQC.4VUvWTwc17L.1jZEcIMsgahbSBIp8I6', '2025-04-06 19:59:02.981248+05:30', '2025-04-06 19:59:02.981248+05:30');
INSERT INTO public.users VALUES (5, 'testuser', 'test@example.com', '$2b$10$6jM7.1R8dVZTcVBCRZg/QOwI9U3jqA.gx2rmY.oqHX9ENCyDMArTi', '2025-04-06 22:06:39.50382+05:30', '2025-04-06 22:06:39.50382+05:30');
INSERT INTO public.users VALUES (6, 'mahi', 'uma@gmail.com', '$2b$10$uJws9.CXbncy8PgDlCYwjeMDGM.rtK3kAR1NE1mB34/Yoij6gDBXC', '2025-04-06 22:24:39.258821+05:30', '2025-04-06 22:24:39.258821+05:30');
INSERT INTO public.users VALUES (7, 'abcd', 'abcd@gmail.com', '$2b$10$bGiRH8r0hCwVJtJCvLf0jOvGBmWi/HTcTj/qt2VE.nsVTC2Db0wRK', '2025-04-10 23:03:37.099585+05:30', '2025-04-10 23:03:37.099585+05:30');


--
-- Data for Name: discussions; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.discussions VALUES (1, 5, 1, 'Memory Allocation Strategy', 'What''s the best way to handle fragmentation in the memory allocator?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (2, 5, 1, 'Edge Cases', 'How should we handle allocation requests larger than the available memory?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (3, 5, 2, 'Process Priority', 'Should we consider process priorities in the round-robin scheduler?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (4, 5, 3, 'Cache Miss Patterns', 'I''m seeing a lot of cache misses in my implementation. Any suggestions?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (5, 5, 4, 'Assembly Syntax', 'Which assembly syntax should we use - Intel or AT&T?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (6, 5, 5, 'Static Analysis Tools', 'What tools would you recommend for binary analysis?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (7, 5, 6, 'Buffer Size', 'How can we determine the correct buffer size to trigger the overflow?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (8, 5, 7, 'Multi-stage Builds', 'Should we use multi-stage builds for smaller image size?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (9, 5, 8, 'Resource Limits', 'What are good default resource limits for Kubernetes pods?', '2025-04-06 22:05:46.063857+05:30', '2025-04-06 22:05:46.063857+05:30');
INSERT INTO public.discussions VALUES (10, 4, 1, 'lalal', 'Laval', '2025-04-06 22:21:03.366551+05:30', '2025-04-06 22:21:03.366551+05:30');
INSERT INTO public.discussions VALUES (11, 6, 1, 'my first time', 'I learned memory in java', '2025-04-06 22:25:28.054283+05:30', '2025-04-06 22:25:28.054283+05:30');
INSERT INTO public.discussions VALUES (12, 4, 1, 'hello', 'hello', '2025-04-06 23:04:25.647283+05:30', '2025-04-06 23:04:25.647283+05:30');
INSERT INTO public.discussions VALUES (13, 4, 1, 'a', 'a', '2025-04-06 23:20:37.510236+05:30', '2025-04-06 23:20:37.510236+05:30');
INSERT INTO public.discussions VALUES (14, 6, 1, 'what', 'what to do', '2025-04-12 14:41:43.871756+05:30', '2025-04-12 14:41:43.871756+05:30');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.comments VALUES (1, 5, 1, 'You could use a free list to keep track of memory blocks.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (2, 5, 1, 'Another approach is to use a bitmap to track allocated regions.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (3, 5, 2, 'You should return NULL if the requested size is too large.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (4, 5, 3, 'Priority scheduling could be added as an extension to the basic round-robin.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (5, 5, 4, 'Try reorganizing your data structures to improve spatial locality.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (6, 5, 5, 'Intel syntax is more commonly used in Windows development.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (7, 5, 6, 'IDA Pro is great for static analysis, but Ghidra is a good free alternative.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (8, 5, 7, 'Multi-stage builds are definitely recommended for production images.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (9, 5, 8, 'Start with CPU limits at 1 core and memory at 512Mi, then adjust based on monitoring.', '2025-04-06 22:05:46.06734+05:30', '2025-04-06 22:05:46.06734+05:30');
INSERT INTO public.comments VALUES (10, 4, 10, 'my Lala', '2025-04-06 22:21:10.192074+05:30', '2025-04-06 22:21:10.192074+05:30');
INSERT INTO public.comments VALUES (11, 6, 11, 'I also learnt using java', '2025-04-06 22:25:44.680126+05:30', '2025-04-06 22:25:44.680126+05:30');
INSERT INTO public.comments VALUES (12, 4, 11, 'sure', '2025-04-06 22:53:53.06223+05:30', '2025-04-06 22:53:53.06223+05:30');
INSERT INTO public.comments VALUES (13, 4, 11, 'jkh', '2025-04-06 23:01:02.329661+05:30', '2025-04-06 23:01:02.329661+05:30');
INSERT INTO public.comments VALUES (14, 4, 11, 'asd', '2025-04-06 23:02:41.461797+05:30', '2025-04-06 23:02:41.461797+05:30');
INSERT INTO public.comments VALUES (15, 4, 12, 'why not', '2025-04-06 23:04:30.888726+05:30', '2025-04-06 23:04:30.888726+05:30');
INSERT INTO public.comments VALUES (16, 6, 13, 'my name', '2025-04-07 22:08:51.078572+05:30', '2025-04-07 22:08:51.078572+05:30');
INSERT INTO public.comments VALUES (17, 6, 13, 'hello', '2025-04-12 13:05:10.435175+05:30', '2025-04-12 13:05:10.435175+05:30');
INSERT INTO public.comments VALUES (18, 6, 13, 'hi', '2025-04-12 14:41:35.571161+05:30', '2025-04-12 14:41:35.571161+05:30');
INSERT INTO public.comments VALUES (19, 6, 14, 'ok', '2025-04-12 14:54:19.688199+05:30', '2025-04-12 14:54:19.688199+05:30');


--
-- Data for Name: hints; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.hints VALUES (1, 1, 'Think about how to track the amount of memory that has been allocated.', 1, '2025-04-06 21:55:58.460967+05:30', 1);
INSERT INTO public.hints VALUES (2, 1, 'Consider using a static array as a memory pool.', 2, '2025-04-06 21:55:58.460967+05:30', 1);
INSERT INTO public.hints VALUES (3, 1, 'Remember to handle edge cases like zero-size allocations and out-of-memory conditions.', 3, '2025-04-06 21:55:58.460967+05:30', 1);
INSERT INTO public.hints VALUES (4, 2, 'Consider using a queue data structure to implement the round-robin scheduler.', 1, '2025-04-06 21:55:58.462928+05:30', 1);
INSERT INTO public.hints VALUES (5, 2, 'Think about how to handle time slices for each process.', 2, '2025-04-06 21:55:58.462928+05:30', 1);
INSERT INTO public.hints VALUES (6, 2, 'Remember to implement a mechanism to move processes from the back of the queue to the front.', 3, '2025-04-06 21:55:58.462928+05:30', 1);
INSERT INTO public.hints VALUES (7, 3, 'Consider the cache line size when accessing memory.', 1, '2025-04-06 21:55:58.463165+05:30', 1);
INSERT INTO public.hints VALUES (8, 3, 'Think about spatial locality and how to improve it in your code.', 2, '2025-04-06 21:55:58.463165+05:30', 1);
INSERT INTO public.hints VALUES (9, 3, 'Remember that cache misses are expensive, so minimize them.', 3, '2025-04-06 21:55:58.463165+05:30', 1);
INSERT INTO public.hints VALUES (10, 4, 'Start by understanding the basic x86 registers and their purposes.', 1, '2025-04-06 21:55:58.463282+05:30', 1);
INSERT INTO public.hints VALUES (11, 4, 'Consider using a simple function like addition or multiplication to practice assembly.', 2, '2025-04-06 21:55:58.463282+05:30', 1);
INSERT INTO public.hints VALUES (12, 4, 'Remember to follow the calling convention for your platform.', 3, '2025-04-06 21:55:58.463282+05:30', 1);
INSERT INTO public.hints VALUES (13, 5, 'Use tools like objdump or radare2 to analyze the binary.', 1, '2025-04-06 21:55:58.463385+05:30', 1);
INSERT INTO public.hints VALUES (14, 5, 'Look for common vulnerability patterns in the disassembled code.', 2, '2025-04-06 21:55:58.463385+05:30', 1);
INSERT INTO public.hints VALUES (15, 5, 'Consider using dynamic analysis with a debugger to understand the program flow.', 3, '2025-04-06 21:55:58.463385+05:30', 1);
INSERT INTO public.hints VALUES (16, 6, 'Understand how the stack is laid out in memory.', 1, '2025-04-06 21:55:58.463487+05:30', 1);
INSERT INTO public.hints VALUES (17, 6, 'Look for functions that don''t properly check buffer sizes.', 2, '2025-04-06 21:55:58.463487+05:30', 1);
INSERT INTO public.hints VALUES (18, 6, 'Consider using a debugger to examine the stack during execution.', 3, '2025-04-06 21:55:58.463487+05:30', 1);
INSERT INTO public.hints VALUES (19, 7, 'Start with a base image that includes the necessary dependencies.', 1, '2025-04-06 21:55:58.463588+05:30', 1);
INSERT INTO public.hints VALUES (20, 7, 'Use multi-stage builds to keep the final image size small.', 2, '2025-04-06 21:55:58.463588+05:30', 1);
INSERT INTO public.hints VALUES (21, 7, 'Remember to expose the necessary ports for your web application.', 3, '2025-04-06 21:55:58.463588+05:30', 1);
INSERT INTO public.hints VALUES (22, 8, 'Create a deployment manifest that specifies the container image and replicas.', 1, '2025-04-06 21:55:58.46372+05:30', 1);
INSERT INTO public.hints VALUES (23, 8, 'Consider using a service to expose your application.', 2, '2025-04-06 21:55:58.46372+05:30', 1);
INSERT INTO public.hints VALUES (24, 8, 'Think about resource limits and requests for your pods.', 3, '2025-04-06 21:55:58.46372+05:30', 1);


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.test_cases VALUES (1, 1, 'int* x = (int*)my_malloc(sizeof(int));
*x = 42;
printf("%d\n", *x);
my_free(x);', '42', false, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Basic allocation and use of memory for a single integer');
INSERT INTO public.test_cases VALUES (2, 1, 'int* x = (int*)my_malloc(sizeof(int));
int* y = (int*)my_malloc(sizeof(int));
*x = 10;
*y = 20;
printf("%d %d\n", *x, *y);
my_free(y);
my_free(x);', '10 20', false, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Allocate and use multiple memory blocks');
INSERT INTO public.test_cases VALUES (3, 1, 'void* ptr = my_malloc(0);
printf("%s\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', false, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Allocating zero bytes should return NULL');
INSERT INTO public.test_cases VALUES (4, 1, 'void* ptr = my_malloc(2000);
printf("%s\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', true, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Allocating more than pool size should return NULL');
INSERT INTO public.test_cases VALUES (5, 1, 'char* str1 = (char*)my_malloc(6);
char* str2 = (char*)my_malloc(4);
strcpy(str1, "Hello");
strcpy(str2, "Hi!");
printf("%s %s\n", str1, str2);
my_free(str2);
my_free(str1);', 'Hello Hi!', false, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Allocate and use memory for strings');
INSERT INTO public.test_cases VALUES (6, 1, 'void* ptr1 = my_malloc(1020);
void* ptr2 = my_malloc(4);
printf("%s %s\n", 
       ptr1 != NULL ? "ALLOCATED" : "NULL",
       ptr2 != NULL ? "ALLOCATED" : "NULL");', 'ALLOCATED NULL', true, '2025-04-06 20:36:31.347977+05:30', '2025-04-06 20:36:31.347977+05:30', 'Edge case: After allocating 1020 bytes, a request for 4 more bytes should fail (reserved space)');
INSERT INTO public.test_cases VALUES (143, 14, 'ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("special@key#123", "value!@#$%^&*()");
std::cout << instance->getValue("special@key#123");', 'value!@#$%^&*()', false, '2025-04-12 15:35:56.162908+05:30', '2025-04-12 15:35:56.162908+05:30', 'Test handling special characters in configuration');
INSERT INTO public.test_cases VALUES (146, 24, '(click)="handleClick()"', 'Event handled successfully', false, '2025-04-12 15:37:11.512627+05:30', '2025-04-12 15:37:11.512627+05:30', 'Test component event handling');
INSERT INTO public.test_cases VALUES (149, 25, 'try { this.userService.getUserData() } catch (error) { console.error(error) }', 'Error handled successfully', false, '2025-04-12 15:37:33.78258+05:30', '2025-04-12 15:37:33.78258+05:30', 'Test service error handling');
INSERT INTO public.test_cases VALUES (152, 26, '<div [ngClass]={"active": isActive}>Content</div>', 'Attribute directive applied successfully', false, '2025-04-12 15:38:22.086387+05:30', '2025-04-12 15:38:22.086387+05:30', 'Test attribute directives');
INSERT INTO public.test_cases VALUES (155, 27, 'try {
  this.userService.submit(this.userForm.value);
} catch (error) {
  this.handleError(error);
}', 'Form error handled successfully', false, '2025-04-12 15:38:30.717197+05:30', '2025-04-12 15:38:30.717197+05:30', 'Test form error handling');
INSERT INTO public.test_cases VALUES (158, 28, 'this.http.get("/api/data").subscribe(
  response => this.handleResponse(response),
  error => this.handleError(error)
);', 'HTTP error handled successfully', false, '2025-04-12 15:38:41.027311+05:30', '2025-04-12 15:38:41.027311+05:30', 'Test HTTP error handling');
INSERT INTO public.test_cases VALUES (161, 29, 'const routes: Routes = [
  {
    path: ''admin'',
    loadChildren: () => import(''./admin/admin.module'').then(m => m.AdminModule)
  }
];', 'Lazy loading implemented successfully', false, '2025-04-12 15:39:14.112744+05:30', '2025-04-12 15:39:14.112744+05:30', 'Test lazy loading');
INSERT INTO public.test_cases VALUES (164, 30, '<div>{{ data$ | async }}</div>', 'Async pipe successful', false, '2025-04-12 15:39:26.72951+05:30', '2025-04-12 15:39:26.72951+05:30', 'Test async pipe');
INSERT INTO public.test_cases VALUES (167, 31, '<div [style.color]="isActive ? ''red'' : ''blue''">Content</div>', 'Style binding successful', false, '2025-04-12 15:39:37.696775+05:30', '2025-04-12 15:39:37.696775+05:30', 'Test style binding');
INSERT INTO public.test_cases VALUES (170, 32, 'constructor(private service: DataService) {
  this.service.initialize();
}', 'Component initialization successful', false, '2025-04-12 15:39:48.278061+05:30', '2025-04-12 15:39:48.278061+05:30', 'Test component initialization');
INSERT INTO public.test_cases VALUES (173, 33, '<app-child
  [data]="parentData"
  (dataChange)="handleChildData()"
></app-child>', 'Parent-child communication successful', false, '2025-04-12 15:40:02.592743+05:30', '2025-04-12 15:40:02.592743+05:30', 'Test parent-child communication');
INSERT INTO public.test_cases VALUES (176, 6, 'char buffer[10];\nstrcpy(buffer, "NOP sled + shellcode");', 'Shellcode executed', false, '2025-04-12 15:41:16.731532+05:30', '2025-04-12 15:41:16.731532+05:30', 'Test shellcode execution');
INSERT INTO public.test_cases VALUES (179, 4, 'cmp eax, ebx
je equal_label
jmp end_label', 'Control flow successful', false, '2025-04-12 15:41:30.402111+05:30', '2025-04-12 15:41:30.402111+05:30', 'Test control flow');
INSERT INTO public.test_cases VALUES (182, 3, 'for(int i = 0; i < 1000; i++) {
    for(int j = 0; j < 64; j++) {
        array[i][j] = i + j;
    }
}', 'Cache line utilization > 80%', false, '2025-04-12 15:41:40.705226+05:30', '2025-04-12 15:41:40.705226+05:30', 'Test cache line utilization');
INSERT INTO public.test_cases VALUES (185, 7, 'docker run -v /host/path:/container/path ubuntu', 'Container volumes mounted successfully', false, '2025-04-12 15:41:50.821907+05:30', '2025-04-12 15:41:50.821907+05:30', 'Test container volumes');
INSERT INTO public.test_cases VALUES (188, 8, 'kubectl scale deployment nginx-deployment --replicas=5', 'Deployment scaled successfully', false, '2025-04-12 15:42:01.75444+05:30', '2025-04-12 15:42:01.75444+05:30', 'Test scaling');
INSERT INTO public.test_cases VALUES (191, 9, 'model.predict(X_new)', 'Model prediction successful', false, '2025-04-12 15:42:11.358702+05:30', '2025-04-12 15:42:11.358702+05:30', 'Test model prediction');
INSERT INTO public.test_cases VALUES (194, 23, 'class BankAccount {
private:
    double balance;
public:
    void deposit(double amount) {}
};', 'Encapsulation implemented successfully', false, '2025-04-12 15:42:31.246288+05:30', '2025-04-12 15:42:31.246288+05:30', 'Test encapsulation');
INSERT INTO public.test_cases VALUES (144, 24, 'ng serve', 'Component initialized successfully', false, '2025-04-12 15:37:05.981903+05:30', '2025-04-12 15:37:05.981903+05:30', 'Test component initialization');
INSERT INTO public.test_cases VALUES (147, 25, 'constructor(private userService: UserService) {}', 'Service injected successfully', false, '2025-04-12 15:37:27.227316+05:30', '2025-04-12 15:37:27.227316+05:30', 'Test service dependency injection');
INSERT INTO public.test_cases VALUES (150, 26, '<div>{{ title }}</div>', 'Template rendered successfully', false, '2025-04-12 15:38:13.814089+05:30', '2025-04-12 15:38:13.814089+05:30', 'Test template syntax');
INSERT INTO public.test_cases VALUES (153, 27, '<form [formGroup]="userForm">
  <input formControlName="email">
</form>', 'Form validation successful', false, '2025-04-12 15:38:25.149377+05:30', '2025-04-12 15:38:25.149377+05:30', 'Test form validation');
INSERT INTO public.test_cases VALUES (156, 28, 'this.http.get("/api/data").subscribe(
  response => this.handleResponse(response)
);', 'HTTP GET request successful', false, '2025-04-12 15:38:35.523772+05:30', '2025-04-12 15:38:35.523772+05:30', 'Test HTTP GET request');
INSERT INTO public.test_cases VALUES (159, 29, '@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    return this.authService.isAuthenticated();
  }
}', 'Route guard implemented successfully', false, '2025-04-12 15:39:02.432795+05:30', '2025-04-12 15:39:02.432795+05:30', 'Test route guard implementation');
INSERT INTO public.test_cases VALUES (162, 30, '@Pipe({
  name: ''custom''
})
export class CustomPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}', 'Pipe transformation successful', false, '2025-04-12 15:39:18.313632+05:30', '2025-04-12 15:39:18.313632+05:30', 'Test pipe transformation');
INSERT INTO public.test_cases VALUES (165, 31, '@Component({
  selector: ''app-component'',
  styles: [`.custom { color: red; }`]
})', 'Component styling successful', false, '2025-04-12 15:39:30.603392+05:30', '2025-04-12 15:39:30.603392+05:30', 'Test component styling');
INSERT INTO public.test_cases VALUES (168, 32, 'ngOnInit() {
  this.initializeData();
}

ngOnDestroy() {
  this.cleanup();
}', 'Component lifecycle successful', false, '2025-04-12 15:39:41.28793+05:30', '2025-04-12 15:39:41.28793+05:30', 'Test component lifecycle');
INSERT INTO public.test_cases VALUES (171, 33, '@Output() dataChange = new EventEmitter<any>();

updateData() {
  this.dataChange.emit(newData);
}', 'Component communication successful', false, '2025-04-12 15:39:53.444076+05:30', '2025-04-12 15:39:53.444076+05:30', 'Test component communication');
INSERT INTO public.test_cases VALUES (174, 6, 'char buffer[10];
strcpy(buffer, "AAAAAAAAAAAAAAAA");', 'Segmentation fault', false, '2025-04-12 15:40:57.279058+05:30', '2025-04-12 15:40:57.279058+05:30', 'Test basic buffer overflow');
INSERT INTO public.test_cases VALUES (177, 4, 'mov eax, 5
add eax, 3
mov ebx, eax', 'eax = 8', false, '2025-04-12 15:41:24.459266+05:30', '2025-04-12 15:41:24.459266+05:30', 'Test basic arithmetic');
INSERT INTO public.test_cases VALUES (180, 3, 'for(int i = 0; i < 1000; i++) {
    array[i] = i;
}', 'Cache hit rate > 90%', false, '2025-04-12 15:41:33.618244+05:30', '2025-04-12 15:41:33.618244+05:30', 'Test cache hit');
INSERT INTO public.test_cases VALUES (183, 7, 'FROM ubuntu:20.04
RUN apt-get update && apt-get install -y python3
CMD ["python3"]', 'Container built successfully', false, '2025-04-12 15:41:44.224142+05:30', '2025-04-12 15:41:44.224142+05:30', 'Test container build');
INSERT INTO public.test_cases VALUES (186, 8, 'apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3', 'Deployment created successfully', false, '2025-04-12 15:41:55.260487+05:30', '2025-04-12 15:41:55.260487+05:30', 'Test deployment creation');
INSERT INTO public.test_cases VALUES (189, 9, 'model.fit(X_train, y_train, epochs=10, batch_size=32)', 'Model trained successfully', false, '2025-04-12 15:42:05.141852+05:30', '2025-04-12 15:42:05.141852+05:30', 'Test model training');
INSERT INTO public.test_cases VALUES (192, 23, 'class Animal {
    virtual void makeSound() {}
}
class Dog : public Animal {
    void makeSound() override {}
}', 'Inheritance implemented successfully', false, '2025-04-12 15:42:15.979627+05:30', '2025-04-12 15:42:15.979627+05:30', 'Test inheritance');
INSERT INTO public.test_cases VALUES (195, 14, 'ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("special@key#123", "value!@#$%^&*()");
std::cout << instance->getValue("special@key#123");', 'value!@#$%^&*()', false, '2025-04-12 16:28:26.403707+05:30', '2025-04-12 16:28:26.403707+05:30', 'Test handling special characters in configuration');
INSERT INTO public.test_cases VALUES (145, 24, '<app-component [data]="testData"></app-component>', 'Data binding successful', false, '2025-04-12 15:37:08.979994+05:30', '2025-04-12 15:37:08.979994+05:30', 'Test component data binding');
INSERT INTO public.test_cases VALUES (148, 25, 'this.userService.getUserData()', 'User data retrieved successfully', false, '2025-04-12 15:37:30.997524+05:30', '2025-04-12 15:37:30.997524+05:30', 'Test service method call');
INSERT INTO public.test_cases VALUES (151, 26, '<div *ngIf="condition">Content</div>', 'Structural directive applied successfully', false, '2025-04-12 15:38:16.513167+05:30', '2025-04-12 15:38:16.513167+05:30', 'Test structural directives');
INSERT INTO public.test_cases VALUES (154, 27, 'submitForm() {
  if (this.userForm.valid) {
    this.userService.submit(this.userForm.value);
  }
}', 'Form submitted successfully', false, '2025-04-12 15:38:28.068928+05:30', '2025-04-12 15:38:28.068928+05:30', 'Test form submission');
INSERT INTO public.test_cases VALUES (157, 28, 'this.http.post("/api/data", data).subscribe(
  response => this.handleResponse(response)
);', 'HTTP POST request successful', false, '2025-04-12 15:38:38.123529+05:30', '2025-04-12 15:38:38.123529+05:30', 'Test HTTP POST request');
INSERT INTO public.test_cases VALUES (160, 29, '@Injectable()
export class DataResolver implements Resolve<any> {
  resolve(): Observable<any> {
    return this.dataService.getData();
  }
}', 'Route resolver implemented successfully', false, '2025-04-12 15:39:08.211164+05:30', '2025-04-12 15:39:08.211164+05:30', 'Test route resolver');
INSERT INTO public.test_cases VALUES (139, 14, 'ConfigSingleton* instance1 = ConfigSingleton::getInstance();
ConfigSingleton* instance2 = ConfigSingleton::getInstance();
std::cout << (instance1 == instance2);', '1', false, '2025-04-12 15:34:29.929443+05:30', '2025-04-12 15:34:29.929443+05:30', 'Verify singleton instance uniqueness');
INSERT INTO public.test_cases VALUES (140, 14, 'ConfigSingleton* instance = ConfigSingleton::getInstance();
try {
    std::cout << instance->getValue("nonexistent_key");
} catch (const std::out_of_range& e) {
    std::cout << "Key not found";
}', 'Key not found', false, '2025-04-12 15:34:33.291225+05:30', '2025-04-12 15:34:33.291225+05:30', 'Test error handling for non-existent key');
INSERT INTO public.test_cases VALUES (141, 14, 'ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("timeout", "30");
std::cout << instance->getValue("timeout");', '30', false, '2025-04-12 15:34:36.590874+05:30', '2025-04-12 15:34:36.590874+05:30', 'Test configuration value storage');
INSERT INTO public.test_cases VALUES (142, 14, 'ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("existing_key", "old_value");
instance->setValue("existing_key", "new_value");
std::cout << instance->getValue("existing_key");', 'new_value', false, '2025-04-12 15:34:39.910083+05:30', '2025-04-12 15:34:39.910083+05:30', 'Test updating existing configuration value');
INSERT INTO public.test_cases VALUES (163, 30, '{{ value | custom | date:''medium'' }}', 'Pipe chaining successful', false, '2025-04-12 15:39:23.591007+05:30', '2025-04-12 15:39:23.591007+05:30', 'Test pipe chaining');
INSERT INTO public.test_cases VALUES (166, 31, '@Component({
  selector: ''app-component'',
  encapsulation: ViewEncapsulation.None
})', 'View encapsulation successful', false, '2025-04-12 15:39:34.268434+05:30', '2025-04-12 15:39:34.268434+05:30', 'Test view encapsulation');
INSERT INTO public.test_cases VALUES (169, 32, 'ngOnChanges(changes: SimpleChanges) {
  if (changes[''data'']) {
    this.updateView();
  }
}', 'Change detection successful', false, '2025-04-12 15:39:44.837174+05:30', '2025-04-12 15:39:44.837174+05:30', 'Test change detection');
INSERT INTO public.test_cases VALUES (172, 33, '@Injectable()
export class DataService {
  private dataSubject = new BehaviorSubject<any>(null);
  data$ = this.dataSubject.asObservable();
}', 'Service communication successful', false, '2025-04-12 15:39:59.063727+05:30', '2025-04-12 15:39:59.063727+05:30', 'Test service communication');
INSERT INTO public.test_cases VALUES (175, 6, 'char buffer[10];
strcpy(buffer, "AAAAAAAAAAAAAAAAABCD");', 'Return address corrupted', false, '2025-04-12 15:41:06.286224+05:30', '2025-04-12 15:41:06.286224+05:30', 'Test return address overwrite');
INSERT INTO public.test_cases VALUES (178, 4, 'mov eax, [memory_address]
mov [memory_address], ebx', 'Memory operations successful', false, '2025-04-12 15:41:27.30473+05:30', '2025-04-12 15:41:27.30473+05:30', 'Test memory operations');
INSERT INTO public.test_cases VALUES (181, 3, 'for(int i = 0; i < 1000; i += 64) {
    array[i] = i;
}', 'Cache miss rate > 50%', false, '2025-04-12 15:41:36.924019+05:30', '2025-04-12 15:41:36.924019+05:30', 'Test cache miss');
INSERT INTO public.test_cases VALUES (184, 7, 'docker run --network host -p 8080:80 nginx', 'Container networking successful', false, '2025-04-12 15:41:47.452389+05:30', '2025-04-12 15:41:47.452389+05:30', 'Test container networking');
INSERT INTO public.test_cases VALUES (187, 8, 'apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: LoadBalancer', 'Service created successfully', false, '2025-04-12 15:41:58.691838+05:30', '2025-04-12 15:41:58.691838+05:30', 'Test service creation');
INSERT INTO public.test_cases VALUES (190, 9, 'model.evaluate(X_test, y_test)', 'Model evaluated successfully', false, '2025-04-12 15:42:08.438859+05:30', '2025-04-12 15:42:08.438859+05:30', 'Test model evaluation');
INSERT INTO public.test_cases VALUES (193, 23, 'Animal* animal = new Dog();
animal->makeSound();', 'Polymorphism implemented successfully', false, '2025-04-12 15:42:22.77271+05:30', '2025-04-12 15:42:22.77271+05:30', 'Test polymorphism');


--
-- Data for Name: user_problem_status; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.user_problem_status VALUES (1, 4, 2, 'attempted', 1, '2025-04-06 23:11:37.452388+05:30', NULL, 0);
INSERT INTO public.user_problem_status VALUES (144, 7, 1, 'solved', 2, '2025-04-12 12:19:17.400831+05:30', '2025-04-12 12:19:17.400831+05:30', 0);
INSERT INTO public.user_problem_status VALUES (2, 4, 1, 'solved', 18, '2025-04-12 14:55:52.325787+05:30', '2025-04-12 14:55:52.325787+05:30', 1);
INSERT INTO public.user_problem_status VALUES (152, 6, 14, 'attempted', 1, '2025-04-12 15:45:38.345333+05:30', NULL, 1);
INSERT INTO public.user_problem_status VALUES (6, 6, 1, 'solved', 97, '2025-04-12 15:55:00.2213+05:30', '2025-04-12 15:55:00.2213+05:30', 31);


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: chessman
--



--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.categories_id_seq', 14, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.comments_id_seq', 19, true);


--
-- Name: discussions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.discussions_id_seq', 14, true);


--
-- Name: hints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.hints_id_seq', 24, true);


--
-- Name: problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.problems_id_seq', 33, true);


--
-- Name: test_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.test_cases_id_seq', 195, true);


--
-- Name: user_problem_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.user_problem_status_id_seq', 156, true);


--
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

