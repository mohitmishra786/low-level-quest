-- Seed data for discussions
INSERT INTO discussions (user_id, problem_id, title, content, created_at, updated_at)
VALUES 
(1, 1, 'Memory Allocation Strategy', 'What''s the best way to handle fragmentation in the memory allocator?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 'Edge Cases', 'How should we handle allocation requests larger than the available memory?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 2, 'Process Priority', 'Should we consider process priorities in the round-robin scheduler?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 3, 'Cache Miss Patterns', 'I''m seeing a lot of cache misses in my implementation. Any suggestions?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 4, 'Assembly Syntax', 'Which assembly syntax should we use - Intel or AT&T?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 5, 'Static Analysis Tools', 'What tools would you recommend for binary analysis?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 6, 'Buffer Size', 'How can we determine the correct buffer size to trigger the overflow?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 7, 'Multi-stage Builds', 'Should we use multi-stage builds for smaller image size?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 8, 'Resource Limits', 'What are good default resource limits for Kubernetes pods?', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed data for comments
INSERT INTO comments (user_id, discussion_id, content, created_at, updated_at)
VALUES
(1, 1, 'You could use a free list to keep track of memory blocks.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 'Another approach is to use a bitmap to track allocated regions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 2, 'You should return NULL if the requested size is too large.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 3, 'Priority scheduling could be added as an extension to the basic round-robin.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 4, 'Try reorganizing your data structures to improve spatial locality.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 5, 'Intel syntax is more commonly used in Windows development.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 6, 'IDA Pro is great for static analysis, but Ghidra is a good free alternative.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 7, 'Multi-stage builds are definitely recommended for production images.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 8, 'Start with CPU limits at 1 core and memory at 512Mi, then adjust based on monitoring.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 