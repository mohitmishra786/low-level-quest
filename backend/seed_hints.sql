-- Insert hints for Memory Management problem (id: 1)
INSERT INTO hints (problem_id, content, order_index) VALUES
(1, 'Think about how to track the amount of memory that has been allocated.', 1),
(1, 'Consider using a static array as a memory pool.', 2),
(1, 'Remember to handle edge cases like zero-size allocations and out-of-memory conditions.', 3);

-- Insert hints for Process Scheduling problem (id: 2)
INSERT INTO hints (problem_id, content, order_index) VALUES
(2, 'Consider using a queue data structure to implement the round-robin scheduler.', 1),
(2, 'Think about how to handle time slices for each process.', 2),
(2, 'Remember to implement a mechanism to move processes from the back of the queue to the front.', 3);

-- Insert hints for CPU Cache problem (id: 3)
INSERT INTO hints (problem_id, content, order_index) VALUES
(3, 'Consider the cache line size when accessing memory.', 1),
(3, 'Think about spatial locality and how to improve it in your code.', 2),
(3, 'Remember that cache misses are expensive, so minimize them.', 3);

-- Insert hints for Assembly Basics problem (id: 4)
INSERT INTO hints (problem_id, content, order_index) VALUES
(4, 'Start by understanding the basic x86 registers and their purposes.', 1),
(4, 'Consider using a simple function like addition or multiplication to practice assembly.', 2),
(4, 'Remember to follow the calling convention for your platform.', 3);

-- Insert hints for Binary Analysis problem (id: 5)
INSERT INTO hints (problem_id, content, order_index) VALUES
(5, 'Use tools like objdump or radare2 to analyze the binary.', 1),
(5, 'Look for common vulnerability patterns in the disassembled code.', 2),
(5, 'Consider using dynamic analysis with a debugger to understand the program flow.', 3);

-- Insert hints for Buffer Overflow problem (id: 6)
INSERT INTO hints (problem_id, content, order_index) VALUES
(6, 'Understand how the stack is laid out in memory.', 1),
(6, 'Look for functions that don''t properly check buffer sizes.', 2),
(6, 'Consider using a debugger to examine the stack during execution.', 3);

-- Insert hints for Docker Container problem (id: 7)
INSERT INTO hints (problem_id, content, order_index) VALUES
(7, 'Start with a base image that includes the necessary dependencies.', 1),
(7, 'Use multi-stage builds to keep the final image size small.', 2),
(7, 'Remember to expose the necessary ports for your web application.', 3);

-- Insert hints for Kubernetes Deployment problem (id: 8)
INSERT INTO hints (problem_id, content, order_index) VALUES
(8, 'Create a deployment manifest that specifies the container image and replicas.', 1),
(8, 'Consider using a service to expose your application.', 2),
(8, 'Think about resource limits and requests for your pods.', 3); 