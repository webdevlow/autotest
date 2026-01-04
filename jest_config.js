module.exports = {
  // Окружение для тестов
  testEnvironment: 'node',
  
  // Таймаут для каждого теста (в миллисекундах)
  testTimeout: 30000,
  
  // Паттерн для поиска тестовых файлов
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Файлы, которые нужно игнорировать
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Показывать подробный вывод
  verbose: true,
  
  // Покрытие кода
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // Reporters для вывода результатов
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: 'test-report.html',
      includeFailureMsg: true
    }]
  ]
};
