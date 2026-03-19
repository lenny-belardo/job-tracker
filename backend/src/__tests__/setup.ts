// global test setup
beforeAll(() => {
    // set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
});

afterAll(() => {
    // cleanup
});
