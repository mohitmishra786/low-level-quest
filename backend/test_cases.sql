-- Create test_cases table if it doesn't exist
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- First, let's update the initial code and solution for the Memory Management problem
UPDATE problems 
SET initial_code = '#include <stdio.h>
#include <stdlib.h>

void* my_malloc(size_t size) {
    // Your implementation here
    return NULL;
}

void my_free(void* ptr) {
    // Your implementation here
}',
    solution = '#include <stdio.h>
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
}'
WHERE id = 1;

-- Insert test cases for Memory Management problem
INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES
-- Test case 1: Basic allocation
(1, 'int* x = (int*)my_malloc(sizeof(int));
*x = 42;
printf("%d\n", *x);
my_free(x);', '42', false),

-- Test case 2: Multiple allocations
(1, 'int* x = (int*)my_malloc(sizeof(int));
int* y = (int*)my_malloc(sizeof(int));
*x = 10;
*y = 20;
printf("%d %d\n", *x, *y);
my_free(y);
my_free(x);', '10 20', false),

-- Test case 3: Zero size allocation
(1, 'void* ptr = my_malloc(0);
printf("%s\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', false),

-- Test case 4: Allocation failure (hidden)
(1, 'void* ptr = my_malloc(2000);
printf("%s\n", ptr == NULL ? "NULL" : "NOT NULL");', 'NULL', true),

-- Test case 5: Multiple allocations and frees
(1, 'char* str1 = (char*)my_malloc(6);
char* str2 = (char*)my_malloc(4);
strcpy(str1, "Hello");
strcpy(str2, "Hi!");
printf("%s %s\n", str1, str2);
my_free(str2);
my_free(str1);', 'Hello Hi!', false),

-- Test case 6: Edge case - maximum allocation (hidden)
(1, 'void* ptr1 = my_malloc(1020);
void* ptr2 = my_malloc(4);
printf("%s %s\n", 
       ptr1 != NULL ? "ALLOCATED" : "NULL",
       ptr2 != NULL ? "ALLOCATED" : "NULL");', 'ALLOCATED NULL', true); 