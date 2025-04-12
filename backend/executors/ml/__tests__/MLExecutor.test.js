const { MLExecutor } = require('../MLExecutor');
const fs = require('fs');
const path = require('path');

describe('MLExecutor', () => {
  let executor;
  const testCode = `
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def train_model(X_train, y_train):
    model = LogisticRegression()
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    return accuracy

if __name__ == "__main__":
    # Generate synthetic data
    X = np.random.randn(100, 2)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    # Split data
    X_train, X_test = X[:80], X[80:]
    y_train, y_test = y[:80], y[80:]
    
    # Train and evaluate
    model = train_model(X_train, y_train)
    accuracy = evaluate_model(model, X_test, y_test)
    print(f"Accuracy: {accuracy:.4f}")`;

  beforeEach(() => {
    executor = new MLExecutor();
  });

  afterEach(async () => {
    await executor.cleanup();
  });

  test('should train and evaluate a logistic regression model', async () => {
    const result = await executor.execute(testCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Accuracy: \d+\.\d+/);
  });

  test('should handle data preprocessing', async () => {
    const preprocessingCode = `
import numpy as np
from sklearn.preprocessing import StandardScaler

def preprocess_data(X):
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled

if __name__ == "__main__":
    X = np.random.randn(100, 2)
    X_scaled = preprocess_data(X)
    print(f"Mean: {X_scaled.mean():.4f}")
    print(f"Std: {X_scaled.std():.4f}")`;

    const result = await executor.execute(preprocessingCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Mean: 0\.\d+/);
    expect(result.output).toMatch(/Std: 1\.\d+/);
  });

  test('should handle model persistence', async () => {
    const persistenceCode = `
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression

def save_model(model, path):
    joblib.dump(model, path)

def load_model(path):
    return joblib.load(path)

if __name__ == "__main__":
    # Train model
    X = np.random.randn(100, 2)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    model = LogisticRegression()
    model.fit(X, y)
    
    # Save and load
    save_model(model, "model.joblib")
    loaded_model = load_model("model.joblib")
    
    # Compare predictions
    pred1 = model.predict(X[:5])
    pred2 = loaded_model.predict(X[:5])
    print(f"Predictions match: {np.all(pred1 == pred2)}")`;

    const result = await executor.execute(persistenceCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Predictions match: True/);
  });

  test('should handle cross-validation', async () => {
    const cvCode = `
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression

if __name__ == "__main__":
    # Generate data
    X = np.random.randn(100, 2)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    # Cross-validation
    model = LogisticRegression()
    scores = cross_val_score(model, X, y, cv=5)
    print(f"CV Scores: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")`;

    const result = await executor.execute(cvCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/CV Scores: \d+\.\d+/);
  });

  test('should handle hyperparameter tuning', async () => {
    const tuningCode = `
import numpy as np
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import LogisticRegression

if __name__ == "__main__":
    # Generate data
    X = np.random.randn(100, 2)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    # Grid search
    param_grid = {'C': [0.1, 1, 10]}
    model = LogisticRegression()
    grid_search = GridSearchCV(model, param_grid, cv=3)
    grid_search.fit(X, y)
    
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best score: {grid_search.best_score_:.4f}")`;

    const result = await executor.execute(tuningCode);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/Best parameters: {'C': \d+\.\d+/);
    expect(result.output).toMatch(/Best score: \d+\.\d+/);
  });
}); 