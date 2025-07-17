import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            
            <div className="prose prose-blue">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing and using our transcription service, you agree to be bound by these
                    Terms of Service and all applicable laws and regulations.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">2. Service Description</h2>
                <p className="mb-4">
                    We provide audio transcription services using advanced AI technology. The service
                    includes:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Audio file transcription</li>
                    <li>Speaker diarization</li>
                    <li>Summary generation</li>
                    <li>Export in various formats</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
                <p className="mb-4">
                    You agree to:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Upload only audio files you have the right to transcribe</li>
                    <li>Not use the service for any illegal purposes</li>
                    <li>Not attempt to reverse engineer the service</li>
                    <li>Not upload files containing malicious code</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-4">4. Service Limitations</h2>
                <p className="mb-4">
                    Our service has the following limitations:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Maximum file size: 500MB</li>
                    <li>Supported formats: MP3, WAV, M4A</li>
                    <li>Processing time varies based on file size and complexity</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-4">5. Intellectual Property</h2>
                <p className="mb-4">
                    You retain all rights to your audio content. We claim no ownership of your
                    uploaded files or the resulting transcriptions.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">6. Disclaimer</h2>
                <p className="mb-4">
                    The service is provided "as is" without any warranties. We do not guarantee
                    the accuracy of transcriptions or the availability of the service.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">7. Contact</h2>
                <p className="mb-4">
                    For questions about these Terms of Service, please contact us at:
                    <br />
                    <a href="mailto:legal@example.com" className="text-blue-600 hover:text-blue-800">
                        legal@example.com
                    </a>
                </p>
            </div>

            <div className="mt-8">
                <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
} 