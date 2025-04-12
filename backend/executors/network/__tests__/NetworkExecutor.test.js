const { NetworkExecutor } = require('../NetworkExecutor');
const fs = require('fs');
const path = require('path');

describe('NetworkExecutor', () => {
  let executor;
  const serverCode = `
import socket
import threading

def handle_client(client_socket, addr):
    print(f"Connection from {addr}")
    data = client_socket.recv(1024)
    print(f"Received: {data.decode()}")
    client_socket.send(b"Server received your message")
    client_socket.close()

def start_server(port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('localhost', port))
    server.listen(5)
    print(f"Server listening on port {port}")
    
    while True:
        client, addr = server.accept()
        thread = threading.Thread(target=handle_client, args=(client, addr))
        thread.start()

if __name__ == "__main__":
    start_server(5000)`;

  const clientCode = `
import socket

def send_message(message, port):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(('localhost', port))
    client.send(message.encode())
    response = client.recv(1024)
    print(f"Response: {response.decode()}")
    client.close()

if __name__ == "__main__":
    send_message("Hello, Server!", 5000)`;

  beforeEach(() => {
    executor = new NetworkExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should start a TCP server', async () => {
    const result = await executor.execute(serverCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Server listening on port 5000/);
  });

  test('should connect to server and send message', async () => {
    const result = await executor.execute(clientCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Response: Server received your message/);
  });

  test('should handle multiple clients', async () => {
    const multiClientCode = `
import socket
import threading

def client_thread(client_id):
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect(('localhost', 5000))
    message = f"Hello from client {client_id}"
    client.send(message.encode())
    response = client.recv(1024)
    print(f"Client {client_id} received: {response.decode()}")
    client.close()

if __name__ == "__main__":
    threads = []
    for i in range(3):
        thread = threading.Thread(target=client_thread, args=(i,))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()`;

    const result = await executor.execute(multiClientCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Client \d received: Server received your message/);
  });

  test('should handle connection errors', async () => {
    const errorCode = `
import socket

def connect_to_nonexistent_server():
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect(('localhost', 9999))
    except ConnectionRefusedError:
        print("Connection refused")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    connect_to_nonexistent_server()`;

    const result = await executor.execute(errorCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Connection refused/);
  });

  test('should handle timeout', async () => {
    const timeoutCode = `
import socket

def connect_with_timeout():
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.settimeout(1)
    try:
        client.connect(('localhost', 9999))
    except socket.timeout:
        print("Connection timed out")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    connect_with_timeout()`;

    const result = await executor.execute(timeoutCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Connection timed out/);
  });
}); 