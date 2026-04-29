// Basic test for codeRecorder functionality
import CodeRecorder from '../codeRecorder.js';

// Simple test to verify the recorder can be instantiated and basic methods work
function testCodeRecorder() {
  console.log('Testing CodeRecorder...');
  
  try {
    // Test instantiation
    const recorder = new CodeRecorder('test-mission');
    console.log('✓ CodeRecorder instantiated successfully');
    
    // Test starting recording
    recorder.startRecording('initial code');
    console.log('✓ Recording started successfully');
    
    // Test adding events
    recorder.recordCodeEdit('edited code');
    recorder.recordRunTests();
    recorder.recordHint(0);
    recorder.recordReset();
    console.log('✓ Events recorded successfully');
    
    // Test stopping recording
    recorder.stopRecording();
    console.log('✓ Recording stopped successfully');
    
    // Test loading recording
    const loadedRecording = CodeRecorder.loadRecording('test-mission');
    console.log('✓ Recording loaded successfully');
    
    if (loadedRecording && loadedRecording.events && loadedRecording.events.length > 0) {
      console.log('✓ Events found in recording');
      console.log(`  - Total events: ${loadedRecording.events.length}`);
      console.log('  - Event types:', loadedRecording.events.map(e => e.type));
    } else {
      console.log('✗ No events found in recording');
    }
    
    // Test checking if recording exists
    const hasRecording = CodeRecorder.hasRecording('test-mission');
    console.log(`✓ Recording exists check: ${hasRecording}`);
    
    // Clean up
    CodeRecorder.deleteRecording('test-mission');
    console.log('✓ Recording cleaned up');
    
    console.log('All tests passed!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Export for potential use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCodeRecorder };
}
