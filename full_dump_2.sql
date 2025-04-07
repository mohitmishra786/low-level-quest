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
INSERT INTO public.categories VALUES (7, 'Operating Systems', 'Problems related to OS concepts, system calls, and kernel programming', '2025-04-06 21:55:47.720608+05:30');
INSERT INTO public.categories VALUES (8, 'Computer Architecture', 'Problems focusing on CPU architecture, memory hierarchy, and assembly language', '2025-04-06 21:55:47.720608+05:30');
INSERT INTO public.categories VALUES (9, 'Reverse Engineering', 'Challenges involving binary analysis and understanding compiled code', '2025-04-06 21:55:47.720608+05:30');
INSERT INTO public.categories VALUES (10, 'Binary Exploitation', 'Problems related to security vulnerabilities and exploit development', '2025-04-06 21:55:47.720608+05:30');
INSERT INTO public.categories VALUES (11, 'DevOps', 'Tasks involving system administration, automation, and deployment', '2025-04-06 21:55:47.720608+05:30');
INSERT INTO public.categories VALUES (12, 'Machine Learning', 'Problems related to ML algorithms, neural networks, and data processing', '2025-04-06 21:55:47.720608+05:30');


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


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.users VALUES (1, 'Mohit', 'immadmohit@gmail.com', '$2b$10$i6ynhdkQCXguUymKGtzaVeUNYcP2rCQl/5kpwMQAMF663pk3QEKE.', '2025-04-06 19:45:33.721286+05:30', '2025-04-06 19:45:33.721286+05:30');
INSERT INTO public.users VALUES (3, 'abc', 'immadmoht@gmail.com', '$2b$10$2yULpFqYHpirinGNPLbF5OLTNP77F2kc0YznYWAgLLnUYnMyqcggS', '2025-04-06 19:48:28.021021+05:30', '2025-04-06 19:48:28.021021+05:30');
INSERT INTO public.users VALUES (4, 'mohit', 'abc@gmail.com', '$2b$10$TEvfjY2Aek5rfcZ.B8jQC.4VUvWTwc17L.1jZEcIMsgahbSBIp8I6', '2025-04-06 19:59:02.981248+05:30', '2025-04-06 19:59:02.981248+05:30');
INSERT INTO public.users VALUES (5, 'testuser', 'test@example.com', '$2b$10$6jM7.1R8dVZTcVBCRZg/QOwI9U3jqA.gx2rmY.oqHX9ENCyDMArTi', '2025-04-06 22:06:39.50382+05:30', '2025-04-06 22:06:39.50382+05:30');
INSERT INTO public.users VALUES (6, 'mahi', 'uma@gmail.com', '$2b$10$uJws9.CXbncy8PgDlCYwjeMDGM.rtK3kAR1NE1mB34/Yoij6gDBXC', '2025-04-06 22:24:39.258821+05:30', '2025-04-06 22:24:39.258821+05:30');


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


--
-- Data for Name: user_problem_status; Type: TABLE DATA; Schema: public; Owner: chessman
--

INSERT INTO public.user_problem_status VALUES (1, 4, 2, 'attempted', 1, '2025-04-06 23:11:37.452388+05:30', NULL);
INSERT INTO public.user_problem_status VALUES (2, 4, 1, 'attempted', 15, '2025-04-07 21:36:23.73482+05:30', NULL);
INSERT INTO public.user_problem_status VALUES (6, 6, 1, 'solved', 62, '2025-04-08 00:15:17.193419+05:30', '2025-04-08 00:15:17.193419+05:30');


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: chessman
--



--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.categories_id_seq', 12, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.comments_id_seq', 16, true);


--
-- Name: discussions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.discussions_id_seq', 13, true);


--
-- Name: hints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.hints_id_seq', 24, true);


--
-- Name: problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.problems_id_seq', 9, true);


--
-- Name: test_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.test_cases_id_seq', 6, true);


--
-- Name: user_problem_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.user_problem_status_id_seq', 78, true);


--
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chessman
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- PostgreSQL database dump complete
--

