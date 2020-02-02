module.exports = {
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/mocks/fileMock.js',
    '^~(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    DEBUG: true,
  },
  preset: 'ts-jest',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  setupFilesAfterEnv: ['./test/setup/setupTests.js'],
};
