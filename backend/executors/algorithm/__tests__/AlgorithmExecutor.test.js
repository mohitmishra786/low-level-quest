const { AlgorithmExecutor } = require('../AlgorithmExecutor');
const fs = require('fs');
const path = require('path');

describe('AlgorithmExecutor', () => {
  let executor;
  
  const sortingCode = `
#include <iostream>
#include <vector>
#include <algorithm>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
            }
        }
    }
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    for (int num : arr) {
        std::cout << num << " ";
    }
    return 0;
}`;

  const searchingCode = `
#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

int main() {
    std::vector<int> arr = {11, 12, 22, 25, 34, 64, 90};
    int target = 34;
    int result = binarySearch(arr, target);
    std::cout << "Found at index: " << result << std::endl;
    return 0;
}`;

  const graphCode = `
#include <iostream>
#include <vector>
#include <queue>

class Graph {
private:
    int V;
    std::vector<std::vector<int>> adj;
    
public:
    Graph(int vertices) : V(vertices) {
        adj.resize(V);
    }
    
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    
    void BFS(int start) {
        std::vector<bool> visited(V, false);
        std::queue<int> q;
        
        visited[start] = true;
        q.push(start);
        
        while (!q.empty()) {
            int vertex = q.front();
            std::cout << vertex << " ";
            q.pop();
            
            for (int neighbor : adj[vertex]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
    }
};

int main() {
    Graph g(4);
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(1, 2);
    g.addEdge(2, 3);
    
    std::cout << "BFS starting from vertex 0: ";
    g.BFS(0);
    return 0;
}`;

  beforeEach(() => {
    executor = new AlgorithmExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should execute bubble sort correctly', async () => {
    const result = await executor.execute(sortingCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('11 12 22 25 34 64 90');
  });

  test('should execute binary search correctly', async () => {
    const result = await executor.execute(searchingCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Found at index: 4');
  });

  test('should execute graph BFS correctly', async () => {
    const result = await executor.execute(graphCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('BFS starting from vertex 0: 0 1 2 3');
  });

  test('should handle empty input for sorting', async () => {
    const emptySortCode = `
#include <iostream>
#include <vector>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
            }
        }
    }
}

int main() {
    std::vector<int> arr;
    bubbleSort(arr);
    std::cout << "Empty array sorted" << std::endl;
    return 0;
}`;

    const result = await executor.execute(emptySortCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Empty array sorted');
  });

  test('should handle element not found in binary search', async () => {
    const notFoundCode = `
#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

int main() {
    std::vector<int> arr = {11, 12, 22, 25, 34, 64, 90};
    int target = 100;
    int result = binarySearch(arr, target);
    std::cout << "Found at index: " << result << std::endl;
    return 0;
}`;

    const result = await executor.execute(notFoundCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('Found at index: -1');
  });

  test('should handle disconnected graph in BFS', async () => {
    const disconnectedGraphCode = `
#include <iostream>
#include <vector>
#include <queue>

class Graph {
private:
    int V;
    std::vector<std::vector<int>> adj;
    
public:
    Graph(int vertices) : V(vertices) {
        adj.resize(V);
    }
    
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    
    void BFS(int start) {
        std::vector<bool> visited(V, false);
        std::queue<int> q;
        
        visited[start] = true;
        q.push(start);
        
        while (!q.empty()) {
            int vertex = q.front();
            std::cout << vertex << " ";
            q.pop();
            
            for (int neighbor : adj[vertex]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
    }
};

int main() {
    Graph g(5);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(3, 4);
    
    std::cout << "BFS starting from vertex 0: ";
    g.BFS(0);
    std::cout << "\\nBFS starting from vertex 3: ";
    g.BFS(3);
    return 0;
}`;

    const result = await executor.execute(disconnectedGraphCode);
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('BFS starting from vertex 0: 0 1 2\nBFS starting from vertex 3: 3 4');
  });
}); 