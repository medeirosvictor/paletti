import React from 'react';

type Props = {};

function Footer({}: Props) {
    return (
        <footer className="flex flex-col md:flex-row justify-center items-center gap-2 h-16 bg-black text-white font-bold px-4">
            <span>© 2025 Victor Medeiros</span>
            <a
                href="https://github.com/medeirosvictor/paletti"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
            >
                GitHub Repo
            </a>
        </footer>
    );
}

export default Footer;
