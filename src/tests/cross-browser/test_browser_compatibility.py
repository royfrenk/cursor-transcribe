import pytest
from playwright.sync_api import Page, expect

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_basic_functionality(browser, page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test file upload
    page.set_input_files('input[type="file"]', 'test.mp3')
    expect(page.locator('.file-name')).to_contain_text('test.mp3')
    
    # Test language selection
    page.select_option('select[name="language"]', 'en')
    expect(page.locator('select[name="language"]')).to_have_value('en')
    
    # Test transcription start
    page.click('button:has-text("Start Transcription")')
    expect(page.locator('.processing-status')).to_contain_text('Processing')
    
    # Test export functionality
    page.click('button:has-text("Export")')
    expect(page.locator('.export-options')).to_be_visible()

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_audio_playback(browser, page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Upload and process file
    page.set_input_files('input[type="file"]', 'test.mp3')
    page.click('button:has-text("Start Transcription")')
    
    # Test audio controls
    expect(page.locator('audio')).to_have_attribute('src')
    page.click('.play-button')
    expect(page.locator('audio')).to_have_property('paused', False)
    
    # Test volume control
    page.fill('input[type="range"]', '0.5')
    expect(page.locator('audio')).to_have_property('volume', 0.5)
    
    # Test seeking
    page.click('.seek-bar')
    expect(page.locator('audio')).to_have_property('currentTime', 0)

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_rtl_support(browser, page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test RTL layout
    page.select_option('select[name="language"]', 'ar')
    expect(page.locator('html')).to_have_attribute('dir', 'rtl')
    
    # Test text alignment
    expect(page.locator('.transcription-text')).to_have_css('text-align', 'right')
    
    # Test form inputs
    expect(page.locator('input[type="file"]')).to_have_css('direction', 'rtl')
    
    # Test navigation
    expect(page.locator('.mobile-menu')).to_have_css('direction', 'rtl')

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_mobile_view(browser, page: Page):
    # Set mobile viewport
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto("http://localhost:3001")
    
    # Test mobile menu
    expect(page.locator('.mobile-menu')).to_be_visible()
    expect(page.locator('.desktop-menu')).to_be_hidden()
    
    # Test touch interactions
    page.tap('.menu-button')
    expect(page.locator('.mobile-nav')).to_be_visible()
    
    # Test form elements
    expect(page.locator('input[type="file"]')).to_be_visible()
    expect(page.locator('select[name="language"]')).to_be_visible()
    
    # Test buttons
    expect(page.locator('button:has-text("Start Transcription")')).to_be_visible()
    expect(page.locator('button:has-text("Export")')).to_be_visible()

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_error_handling(browser, page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test invalid file upload
    page.set_input_files('input[type="file"]', 'invalid.txt')
    expect(page.locator('.error-message')).to_contain_text('Invalid file type')
    
    # Test network error
    page.route('**/api/transcribe', lambda route: route.abort())
    page.click('button:has-text("Start Transcription")')
    expect(page.locator('.error-message')).to_contain_text('Network error')
    
    # Test recovery
    page.set_input_files('input[type="file"]', 'test.mp3')
    expect(page.locator('.error-message')).to_be_hidden()

@pytest.mark.parametrize("browser", ["chromium", "firefox", "webkit"])
@pytest.mark.nondestructive
def test_performance(browser, page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test initial load time
    load_time = page.evaluate('performance.timing.loadEventEnd - performance.timing.navigationStart')
    assert load_time < 3000  # 3 seconds
    
    # Test file processing time
    page.set_input_files('input[type="file"]', 'test.mp3')
    start_time = page.evaluate('performance.now()')
    page.click('button:has-text("Start Transcription")')
    expect(page.locator('.processing-status')).to_contain_text('Completed')
    end_time = page.evaluate('performance.now()')
    processing_time = end_time - start_time
    assert processing_time < 30000  # 30 seconds
    
    # Test memory usage
    memory_info = page.evaluate('performance.memory')
    assert memory_info['usedJSHeapSize'] < 100 * 1024 * 1024  # 100MB 