// Mock Audio API
class MockAudio {
  play() {
    return Promise.resolve();
  }
}

Object.defineProperty(window, 'Audio', {
  writable: true,
  value: MockAudio
});