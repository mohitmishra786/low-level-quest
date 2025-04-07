UPDATE problems 
SET description = E'Implement a simple memory allocator in C with the following requirements:

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
printf("%d\\n", *x);  // Outputs: 42
my_free(x);

// Memory allocation failure cases
void* ptr1 = my_malloc(0);  // Returns NULL (zero size)
void* ptr2 = my_malloc(2000);  // Returns NULL (too large)
```'
WHERE id = 1;
