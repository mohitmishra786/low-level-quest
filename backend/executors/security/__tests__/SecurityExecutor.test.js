const { SecurityExecutor } = require('../SecurityExecutor');
const fs = require('fs');
const path = require('path');

describe('SecurityExecutor', () => {
  let executor;
  const encryptionCode = `
from cryptography.fernet import Fernet
import base64

def encrypt_message(message, key):
    f = Fernet(key)
    encrypted = f.encrypt(message.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_message(encrypted, key):
    f = Fernet(key)
    decrypted = f.decrypt(base64.b64decode(encrypted))
    return decrypted.decode()

if __name__ == "__main__":
    key = Fernet.generate_key()
    message = "Hello, World!"
    encrypted = encrypt_message(message, key)
    decrypted = decrypt_message(encrypted, key)
    print(f"Original: {message}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")`;

  beforeEach(() => {
    executor = new SecurityExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should encrypt and decrypt messages', async () => {
    const result = await executor.execute(encryptionCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Original: Hello, World!/);
    expect(result.output).toMatch(/Decrypted: Hello, World!/);
  });

  test('should detect SQL injection vulnerability', async () => {
    const sqlInjectionCode = `
def check_sql_injection(code):
    vulnerable = False
    if "SELECT" in code and "+" in code:
        vulnerable = True
    if "INSERT" in code and ";" in code:
        vulnerable = True
    return vulnerable

if __name__ == "__main__":
    code1 = "SELECT * FROM users WHERE id = " + user_id
    code2 = "SELECT * FROM users WHERE id = ?"
    print(f"Code 1 vulnerable: {check_sql_injection(code1)}")
    print(f"Code 2 vulnerable: {check_sql_injection(code2)}")`;

    const result = await executor.execute(sqlInjectionCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Code 1 vulnerable: True/);
    expect(result.output).toMatch(/Code 2 vulnerable: False/);
  });

  test('should detect XSS vulnerability', async () => {
    const xssCode = `
def check_xss_vulnerability(code):
    vulnerable = False
    if "<script>" in code:
        vulnerable = True
    if "javascript:" in code:
        vulnerable = True
    return vulnerable

if __name__ == "__main__":
    code1 = '<div><script>alert("XSS")</script></div>'
    code2 = '<div>Hello World</div>'
    print(f"Code 1 vulnerable: {check_xss_vulnerability(code1)}")
    print(f"Code 2 vulnerable: {check_xss_vulnerability(code2)}")`;

    const result = await executor.execute(xssCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Code 1 vulnerable: True/);
    expect(result.output).toMatch(/Code 2 vulnerable: False/);
  });

  test('should hash passwords securely', async () => {
    const hashingCode = `
import hashlib
import os

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return salt.hex() + ':' + key.hex()

def verify_password(stored_password, provided_password):
    salt, key = stored_password.split(':')
    salt = bytes.fromhex(salt)
    key = bytes.fromhex(key)
    new_key = hashlib.pbkdf2_hmac(
        'sha256',
        provided_password.encode('utf-8'),
        salt,
        100000
    )
    return key == new_key

if __name__ == "__main__":
    password = "mysecretpassword"
    hashed = hash_password(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")
    print(f"Verification: {verify_password(hashed, password)}")`;

    const result = await executor.execute(hashingCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Password: mysecretpassword/);
    expect(result.output).toMatch(/Verification: True/);
  });

  test('should detect insecure communication', async () => {
    const securityCode = `
def check_insecure_communication(code):
    insecure = False
    if "http://" in code:
        insecure = True
    if "ftp://" in code:
        insecure = True
    return insecure

if __name__ == "__main__":
    code1 = "fetch('http://api.example.com/data')"
    code2 = "fetch('https://api.example.com/data')"
    print(f"Code 1 insecure: {check_insecure_communication(code1)}")
    print(f"Code 2 insecure: {check_insecure_communication(code2)}")`;

    const result = await executor.execute(securityCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Code 1 insecure: True/);
    expect(result.output).toMatch(/Code 2 insecure: False/);
  });
}); 