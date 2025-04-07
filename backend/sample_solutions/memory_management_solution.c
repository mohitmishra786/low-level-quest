#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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
} 