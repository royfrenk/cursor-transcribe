import pytest
import sys
import os
from pathlib import Path
import shutil
import json
from datetime import datetime

def setup_test_environment():
    # Create test results directory
    test_results_dir = Path("test-results")
    test_results_dir.mkdir(exist_ok=True)
    
    # Create subdirectories for different test results
    (test_results_dir / "videos").mkdir(exist_ok=True)
    (test_results_dir / "screenshots").mkdir(exist_ok=True)
    (test_results_dir / "reports").mkdir(exist_ok=True)
    
    # Create test files directory
    test_files_dir = Path("test_files")
    test_files_dir.mkdir(exist_ok=True)
    
    return test_results_dir, test_files_dir

def cleanup_test_environment(test_results_dir, test_files_dir):
    # Clean up test files
    if test_files_dir.exists():
        shutil.rmtree(test_files_dir)
    
    # Archive old test results
    if test_results_dir.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_dir = Path(f"test-results-archive-{timestamp}")
        shutil.move(test_results_dir, archive_dir)

def run_tests():
    # Setup
    test_results_dir, test_files_dir = setup_test_environment()
    
    try:
        # Run unit tests
        print("\nRunning unit tests...")
        unit_test_result = pytest.main([
            "src/tests/unit",
            "-v",
            "--junitxml=test-results/reports/unit-tests.xml",
            "--html=test-results/reports/unit-tests.html"
        ])
        
        # Run integration tests
        print("\nRunning integration tests...")
        integration_test_result = pytest.main([
            "src/tests/integration",
            "-v",
            "--junitxml=test-results/reports/integration-tests.xml",
            "--html=test-results/reports/integration-tests.html"
        ])
        
        # Run end-to-end tests
        print("\nRunning end-to-end tests...")
        e2e_test_result = pytest.main([
            "src/tests/e2e",
            "-v",
            "--junitxml=test-results/reports/e2e-tests.xml",
            "--html=test-results/reports/e2e-tests.html"
        ])
        
        # Run accessibility tests
        print("\nRunning accessibility tests...")
        accessibility_test_result = pytest.main([
            "src/tests/accessibility",
            "-v",
            "--junitxml=test-results/reports/accessibility-tests.xml",
            "--html=test-results/reports/accessibility-tests.html"
        ])
        
        # Run cross-browser tests
        print("\nRunning cross-browser tests...")
        cross_browser_test_result = pytest.main([
            "src/tests/cross-browser",
            "-v",
            "--junitxml=test-results/reports/cross-browser-tests.xml",
            "--html=test-results/reports/cross-browser-tests.html"
        ])
        
        # Generate summary report
        summary = {
            "timestamp": datetime.now().isoformat(),
            "results": {
                "unit_tests": unit_test_result,
                "integration_tests": integration_test_result,
                "e2e_tests": e2e_test_result,
                "accessibility_tests": accessibility_test_result,
                "cross_browser_tests": cross_browser_test_result
            },
            "total_tests": sum([
                unit_test_result,
                integration_test_result,
                e2e_test_result,
                accessibility_test_result,
                cross_browser_test_result
            ])
        }
        
        with open("test-results/reports/summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        # Print summary
        print("\nTest Summary:")
        print(f"Unit Tests: {'PASSED' if unit_test_result == 0 else 'FAILED'}")
        print(f"Integration Tests: {'PASSED' if integration_test_result == 0 else 'FAILED'}")
        print(f"E2E Tests: {'PASSED' if e2e_test_result == 0 else 'FAILED'}")
        print(f"Accessibility Tests: {'PASSED' if accessibility_test_result == 0 else 'FAILED'}")
        print(f"Cross-Browser Tests: {'PASSED' if cross_browser_test_result == 0 else 'FAILED'}")
        print(f"\nTotal Tests: {summary['total_tests']}")
        
        # Return overall result
        return all(result == 0 for result in [
            unit_test_result,
            integration_test_result,
            e2e_test_result,
            accessibility_test_result,
            cross_browser_test_result
        ])
    
    finally:
        # Cleanup
        cleanup_test_environment(test_results_dir, test_files_dir)

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1) 