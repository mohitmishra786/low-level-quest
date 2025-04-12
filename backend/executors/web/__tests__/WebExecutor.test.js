const { WebExecutor } = require('../WebExecutor');
const fs = require('fs');
const path = require('path');

describe('WebExecutor', () => {
  let executor;
  const browserCode = `
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_browser_automation():
    driver = webdriver.Chrome()
    try:
        driver.get("https://www.example.com")
        title = driver.title
        print(f"Page title: {title}")
        
        # Wait for element and click
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "myButton"))
        )
        element.click()
        
        # Get text from element
        text = driver.find_element(By.CLASS_NAME, "content").text
        print(f"Content: {text}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_browser_automation()`;

  beforeEach(() => {
    executor = new WebExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should automate browser interactions', async () => {
    const result = await executor.execute(browserCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Page title: Example Domain/);
  });

  test('should test API endpoints', async () => {
    const apiCode = `
import requests
import json

def test_api():
    # GET request
    response = requests.get("https://api.example.com/data")
    print(f"GET Status: {response.status_code}")
    print(f"GET Data: {response.json()}")
    
    # POST request
    data = {"name": "John", "age": 30}
    response = requests.post("https://api.example.com/users", json=data)
    print(f"POST Status: {response.status_code}")
    print(f"POST Response: {response.json()}")

if __name__ == "__main__":
    test_api()`;

    const result = await executor.execute(apiCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/GET Status: 200/);
    expect(result.output).toMatch(/POST Status: 201/);
  });

  test('should handle form submission', async () => {
    const formCode = `
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_form_submission():
    driver = webdriver.Chrome()
    try:
        driver.get("https://www.example.com/form")
        
        # Fill form
        driver.find_element(By.NAME, "username").send_keys("testuser")
        driver.find_element(By.NAME, "password").send_keys("password123")
        
        # Submit form
        driver.find_element(By.ID, "submit").click()
        
        # Wait for success message
        success = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success"))
        )
        print(f"Form submission: {success.text}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_form_submission()`;

    const result = await executor.execute(formCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Form submission: Success/);
  });

  test('should test responsive design', async () => {
    const responsiveCode = `
from selenium import webdriver
from selenium.webdriver.common.by import By

def test_responsive_design():
    driver = webdriver.Chrome()
    try:
        driver.get("https://www.example.com")
        
        # Test desktop view
        driver.set_window_size(1920, 1080)
        desktop_elements = driver.find_elements(By.CLASS_NAME, "desktop-only")
        print(f"Desktop elements: {len(desktop_elements)}")
        
        # Test mobile view
        driver.set_window_size(375, 667)
        mobile_elements = driver.find_elements(By.CLASS_NAME, "mobile-only")
        print(f"Mobile elements: {len(mobile_elements)}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_responsive_design()`;

    const result = await executor.execute(responsiveCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Desktop elements: \d+/);
    expect(result.output).toMatch(/Mobile elements: \d+/);
  });

  test('should handle JavaScript events', async () => {
    const eventsCode = `
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_js_events():
    driver = webdriver.Chrome()
    try:
        driver.get("https://www.example.com")
        
        # Test click event
        button = driver.find_element(By.ID, "clickButton")
        button.click()
        
        # Wait for and verify result
        result = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "result"))
        )
        print(f"Click result: {result.text}")
        
        # Test hover event
        element = driver.find_element(By.ID, "hoverElement")
        driver.execute_script("arguments[0].dispatchEvent(new Event('mouseover'))", element)
        
        # Wait for and verify hover effect
        hover_result = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "hover-active"))
        )
        print(f"Hover effect: {hover_result.text}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_js_events()`;

    const result = await executor.execute(eventsCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Click result: Button clicked/);
    expect(result.output).toMatch(/Hover effect: Element hovered/);
  });
}); 