import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Don't show if user already dismissed this session
        if (sessionStorage.getItem('pwa-install-dismissed')) {
            setDismissed(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        setDeferredPrompt(null);
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!deferredPrompt || dismissed) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 border border-white/50 max-w-sm animate-toast">
            <span className="text-2xl">📲</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">Install Paletti</p>
                <p className="text-xs text-gray-500">Add to your home screen for quick access</p>
            </div>
            <button
                onClick={handleInstall}
                className="cursor-pointer bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
                Install
            </button>
            <button
                onClick={handleDismiss}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                aria-label="Dismiss install prompt"
            >
                ×
            </button>
        </div>
    );
}

export default InstallPWA;
