const { OOPExecutor } = require('../OOPExecutor');
const fs = require('fs');
const path = require('path');

describe('OOPExecutor', () => {
  let executor;
  const singletonCode = `
class ConfigSingleton {
private:
    static ConfigSingleton* instance;
    std::map<std::string, std::string> config;

    ConfigSingleton() {}

public:
    static ConfigSingleton* getInstance() {
        if (instance == nullptr) {
            instance = new ConfigSingleton();
        }
        return instance;
    }

    void setValue(const std::string& key, const std::string& value) {
        config[key] = value;
    }

    std::string getValue(const std::string& key) {
        if (config.find(key) == config.end()) {
            throw std::out_of_range("Key not found");
        }
        return config[key];
    }
};

ConfigSingleton* ConfigSingleton::instance = nullptr;

int main() {
    ConfigSingleton* instance = ConfigSingleton::getInstance();
    instance->setValue("test_key", "test_value");
    std::cout << instance->getValue("test_key") << std::endl;
    return 0;
}`;

  const inheritanceCode = `
class Animal {
protected:
    std::string name;
    int age;

public:
    Animal(const std::string& n, int a) : name(n), age(a) {}
    
    virtual void makeSound() {
        std::cout << "Some sound" << std::endl;
    }
    
    virtual std::string getInfo() {
        return name + " is " + std::to_string(age) + " years old";
    }
};

class Dog : public Animal {
private:
    std::string breed;

public:
    Dog(const std::string& n, int a, const std::string& b) 
        : Animal(n, a), breed(b) {}
    
    void makeSound() override {
        std::cout << "Woof!" << std::endl;
    }
    
    std::string getInfo() override {
        return Animal::getInfo() + " and is a " + breed;
    }
};

int main() {
    Dog dog("Rex", 5, "German Shepherd");
    dog.makeSound();
    std::cout << dog.getInfo() << std::endl;
    return 0;
}`;

  const polymorphismCode = `
class Shape {
public:
    virtual double area() = 0;
    virtual double perimeter() = 0;
    virtual ~Shape() {}
};

class Circle : public Shape {
private:
    double radius;

public:
    Circle(double r) : radius(r) {}
    
    double area() override {
        return 3.14159 * radius * radius;
    }
    
    double perimeter() override {
        return 2 * 3.14159 * radius;
    }
};

class Rectangle : public Shape {
private:
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() override {
        return width * height;
    }
    
    double perimeter() override {
        return 2 * (width + height);
    }
};

int main() {
    Shape* shapes[2];
    shapes[0] = new Circle(5);
    shapes[1] = new Rectangle(4, 6);
    
    for (int i = 0; i < 2; i++) {
        std::cout << "Area: " << shapes[i]->area() << std::endl;
        std::cout << "Perimeter: " << shapes[i]->perimeter() << std::endl;
        delete shapes[i];
    }
    
    return 0;
}`;

  beforeEach(() => {
    executor = new OOPExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should verify singleton instance uniqueness', async () => {
    const testCase = {
      input: `ConfigSingleton* instance1 = ConfigSingleton::getInstance();
ConfigSingleton* instance2 = ConfigSingleton::getInstance();
std::cout << (instance1 == instance2);`,
      expectedOutput: '1'
    };

    const result = await executor.runTests(singletonCode, [testCase]);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  test('should test error handling for non-existent key', async () => {
    const testCase = {
      input: `ConfigSingleton* instance = ConfigSingleton::getInstance();
try {
    std::cout << instance->getValue("nonexistent_key");
} catch (const std::out_of_range& e) {
    std::cout << "Key not found";
}`,
      expectedOutput: 'Key not found'
    };

    const result = await executor.runTests(singletonCode, [testCase]);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  test('should test configuration value storage', async () => {
    const testCase = {
      input: `ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("timeout", "30");
std::cout << instance->getValue("timeout");`,
      expectedOutput: '30'
    };

    const result = await executor.runTests(singletonCode, [testCase]);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  test('should test updating existing configuration value', async () => {
    const testCase = {
      input: `ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("existing_key", "old_value");
instance->setValue("existing_key", "new_value");
std::cout << instance->getValue("existing_key");`,
      expectedOutput: 'new_value'
    };

    const result = await executor.runTests(singletonCode, [testCase]);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  test('should test handling special characters in configuration', async () => {
    const testCase = {
      input: `ConfigSingleton* instance = ConfigSingleton::getInstance();
instance->setValue("special@key#123", "value!@#$%^&*()");
std::cout << instance->getValue("special@key#123");`,
      expectedOutput: 'value!@#$%^&*()'
    };

    const result = await executor.runTests(singletonCode, [testCase]);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  test('should demonstrate inheritance', async () => {
    const result = await executor.execute(inheritanceCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Woof!/);
    expect(result.output).toMatch(/Rex is 5 years old and is a German Shepherd/);
  });

  test('should demonstrate polymorphism', async () => {
    const result = await executor.execute(polymorphismCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Area: 78\.5398/);
    expect(result.output).toMatch(/Perimeter: 31\.4159/);
    expect(result.output).toMatch(/Area: 24/);
    expect(result.output).toMatch(/Perimeter: 20/);
  });
}); 