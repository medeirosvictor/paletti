function Footer() {
    return (
        <footer className="flex flex-col md:flex-row justify-center items-center gap-2 py-4 bg-gray-800 text-gray-300 text-sm px-4">
            <span>© 2025 Victor Medeiros</span>
            <span className="hidden md:inline">·</span>
            <a
                href="https://github.com/medeirosvictor/paletti"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
            >
                GitHub
            </a>
        </footer>
    );
}

export default Footer;
