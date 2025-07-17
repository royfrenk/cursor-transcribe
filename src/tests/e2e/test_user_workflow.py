import pytest
from playwright.sync_api import Page, expect
from pathlib import Path

@pytest.mark.nondestructive
def test_complete_transcription_process(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Upload file
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files("test.mp3")
    
    # Wait for upload to complete
    expect(page.locator('text=Upload complete')).to_be_visible()
    
    # Select language
    page.select_option('select[name="language"]', 'en')
    
    # Start transcription
    page.click('button:has-text("Start Transcription")')
    
    # Wait for processing to complete
    expect(page.locator('text=Transcription complete')).to_be_visible()
    
    # Verify transcription display
    expect(page.locator('.transcription-text')).to_be_visible()
    expect(page.locator('.speaker-label')).to_be_visible()
    
    # Export in different formats
    export_formats = ["txt", "srt", "vtt", "pdf", "csv"]
    for format in export_formats:
        page.click(f'button:has-text("Export as {format.upper()}")')
        expect(page.locator(f'text=Exporting as {format.upper()}')).to_be_visible()
        expect(page.locator('text=Export complete')).to_be_visible()

@pytest.mark.nondestructive
def test_error_recovery_workflow(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Upload invalid file
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files("invalid.txt")
    
    # Verify error message
    expect(page.locator('text=Invalid file type')).to_be_visible()
    
    # Upload valid file
    file_input.set_input_files("test.mp3")
    
    # Verify upload success
    expect(page.locator('text=Upload complete')).to_be_visible()

@pytest.mark.nondestructive
def test_large_file_handling(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Upload large file
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files("large.mp3")
    
    # Verify chunked upload
    expect(page.locator('text=Uploading chunk 1 of')).to_be_visible()
    
    # Wait for processing
    expect(page.locator('text=Processing large file')).to_be_visible()
    expect(page.locator('text=Transcription complete')).to_be_visible()

@pytest.mark.nondestructive
def test_rtl_language_support(page: Page):
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Upload Arabic file
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files("arabic.mp3")
    
    # Select Arabic language
    page.select_option('select[name="language"]', 'ar')
    
    # Start transcription
    page.click('button:has-text("Start Transcription")')
    
    # Verify RTL display
    expect(page.locator('.transcription-text')).to_have_attribute('dir', 'rtl')
    expect(page.locator('.speaker-label')).to_have_attribute('dir', 'rtl')

@pytest.mark.nondestructive
def test_mobile_responsiveness(page: Page):
    # Set mobile viewport
    page.set_viewport_size({"width": 375, "height": 812})
    
    # Navigate to home page
    page.goto("http://localhost:3001")
    
    # Verify mobile menu
    expect(page.locator('.mobile-menu')).to_be_visible()
    page.click('.mobile-menu-button')
    expect(page.locator('.mobile-menu-items')).to_be_visible()
    
    # Test touch interactions
    page.touch('input[type="file"]')
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files("test.mp3")
    
    # Verify responsive layout
    expect(page.locator('.transcription-container')).to_have_css('flex-direction', 'column') 