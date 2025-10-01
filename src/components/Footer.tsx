import {FaLinkedin} from 'react-icons/fa';
import {FaBluesky} from 'react-icons/fa6';
import {MdEmail} from 'react-icons/md';
import eoscLogo from '@/assets/logo-eosc-data-commons.svg';
import {version} from '../../package.json';

interface FooterProps {
    translucent?: boolean;
    className?: string;
}

export const Footer = ({translucent = false, className = ''}: FooterProps) => {
    const base = 'py-8 border-t border-eosc-border w-full relative mt-8';
    const trans = translucent ? ' bg-white/60 backdrop-blur-sm' : '';
    const fullClass = `${base}${trans}${className ? ' ' + className : ''}`;

    return (
        <footer className={fullClass}>
            <div className="flex justify-end items-center px-10 w-full">
                {/* Right: Logo and Social Links */}
                <div className="flex flex-col items-end gap-2">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="http://www.eosc-data-commons.eu"
                        aria-label="Link to Homepage"
                        className="cursor-pointer mb-2"
                    >
                        <div className="w-64">
                            <div className="w-full h-16 flex items-center justify-center text-sm">
                                <img
                                    src={eoscLogo}
                                    alt="EOSC Data Commons"
                                    className="w-full max-w-lg h-auto"
                                />
                            </div>
                        </div>
                    </a>
                    <div className="flex items-center gap-4">
                        <a
                            target="_blank"
                            rel="noreferrer"
                            aria-label="linkedin"
                            title="LinkedIn Profile"
                            href="https://www.linkedin.com/company/eosc-data-commons/"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <FaLinkedin size={24} className="text-eosc-dark-blue"/>
                        </a>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            aria-label="bluesky"
                            title="Bluesky Profile"
                            href="https://bsky.app/profile/eosc-data-commons.bsky.social"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <FaBluesky size={24} className="text-eosc-dark-blue"/>
                        </a>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="mailto:eosc-data-commons-po@mailman.egi.eu"
                            aria-label="Mail"
                            title="Mail"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <MdEmail size={24} className="text-eosc-dark-blue"/>
                        </a>
                    </div>
                </div>
                {/* Center text */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <p className="text-sm font-light text-eosc-gray text-center">
                        Made with ❤️ in Europe 🇪🇺
                    </p>
                    <p className="text-xs font-light text-eosc-gray text-center mt-1">
                        v{version}
                    </p>
                </div>
            </div>
        </footer>
    );
};
