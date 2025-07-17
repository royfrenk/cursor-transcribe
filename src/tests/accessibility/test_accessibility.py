import pytest
from playwright.sync_api import Page, expect

@pytest.mark.nondestructive
def test_keyboard_navigation(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test tab navigation
    page.keyboard.press("Tab")
    expect(page.locator('input[type="file"]')).to_be_focused()
    
    page.keyboard.press("Tab")
    expect(page.locator('select[name="language"]')).to_be_focused()
    
    page.keyboard.press("Tab")
    expect(page.locator('button:has-text("Start Transcription")')).to_be_focused()
    
    # Test keyboard shortcuts
    page.keyboard.press("Control+/")
    expect(page.locator('.keyboard-shortcuts')).to_be_visible()
    
    # Test focus management
    page.click('button:has-text("Start Transcription")')
    expect(page.locator('.processing-status')).to_be_focused()

@pytest.mark.nondestructive
def test_screen_reader_compatibility(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test ARIA labels
    expect(page.locator('input[type="file"]')).to_have_attribute('aria-label', 'Upload audio file')
    expect(page.locator('select[name="language"]')).to_have_attribute('aria-label', 'Select language')
    
    # Test announcements
    page.click('button:has-text("Start Transcription")')
    expect(page.locator('[role="status"]')).to_contain_text('Processing started')
    
    # Test navigation
    expect(page.locator('nav')).to_have_attribute('role', 'navigation')
    expect(page.locator('main')).to_have_attribute('role', 'main')
    
    # Test dynamic content
    page.click('button:has-text("Export")')
    expect(page.locator('[aria-live="polite"]')).to_contain_text('Export options available')

@pytest.mark.nondestructive
def test_rtl_language_support(page: Page):
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

def test_color_contrast(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Test text contrast
    text_elements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div')
    for element in text_elements.all():
        contrast_ratio = get_contrast_ratio(element)
        assert contrast_ratio >= 4.5  # WCAG AA standard
    
    # Test interactive elements
    interactive_elements = page.locator('button, a, input, select')
    for element in interactive_elements.all():
        contrast_ratio = get_contrast_ratio(element)
        assert contrast_ratio >= 3.0  # WCAG AA standard for large text

def test_responsive_design(page: Page):
    # Test different viewport sizes
    viewports = [
        {"width": 320, "height": 568},  # iPhone SE
        {"width": 375, "height": 812},  # iPhone X
        {"width": 768, "height": 1024}, # iPad
        {"width": 1024, "height": 768}, # iPad Pro
        {"width": 1920, "height": 1080} # Desktop
    ]
    
    for viewport in viewports:
        page.set_viewport_size(viewport)
        page.goto("http://localhost:3001")
        
        # Test layout adaptation
        if viewport["width"] < 768:
            expect(page.locator('.mobile-menu')).to_be_visible()
            expect(page.locator('.desktop-menu')).to_be_hidden()
        else:
            expect(page.locator('.mobile-menu')).to_be_hidden()
            expect(page.locator('.desktop-menu')).to_be_visible()
        
        # Test touch targets
        if viewport["width"] < 768:
            buttons = page.locator('button, a')
            for button in buttons.all():
                size = button.bounding_box()
                assert size["width"] >= 44
                assert size["height"] >= 44

# def test_axe_accessibility(page: Page):
#     # Navigate to home page
#     page.goto("http://localhost:3000")
#     
#     # Run axe-core analysis
#     axe = Axe()
#     results = axe.analyze(page)
#     
#     # Verify no violations
#     assert len(results.violations) == 0, f"Accessibility violations found: {results.violations}"
#     
#     # Verify no incomplete tests
#     assert len(results.incomplete) == 0, f"Incomplete tests: {results.incomplete}"
#     
#     # Verify no inapplicable tests
#     assert len(results.inapplicable) == 0, f"Inapplicable tests: {results.inapplicable}" 