import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            
            <div className="prose prose-blue">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                    We collect audio files that you upload for transcription. These files are processed
                    using our transcription service and are temporarily stored to provide you with the
                    transcription results.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                    Your audio files are used solely for the purpose of providing transcription services.
                    We do not use your data for any other purposes without your explicit consent.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">3. Data Storage and Security</h2>
                <p className="mb-4">
                    All uploaded files are encrypted during transmission and storage. Files are
                    automatically deleted after processing is complete, typically within 24 hours.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-4">4. Your Rights</h2>
                <p className="mb-4">
                    You have the right to:
                </p>
                <ul className="list-disc list-inside mb-4">
                    <li>Access your data</li>
                    <li>Request deletion of your data</li>
                    <li>Export your data</li>
                    <li>Opt-out of data collection</li>
                </ul>

                <h2 className="text-xl font-semibold mt-6 mb-4">5. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us at:
                    <br />
                    <a href="mailto:privacy@example.com" className="text-blue-600 hover:text-blue-800">
                        privacy@example.com
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