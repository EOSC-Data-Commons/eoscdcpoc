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
            <div className="px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="hidden md:block md:flex-1"></div>

                    {/* Center text */}
                    <div className="text-center md:flex-1">
                        <p className="text-sm font-light text-eosc-gray">
                            Made with ❤️ in Europe 🇪🇺
                        </p>
                        <p className="text-xs font-light text-eosc-gray mt-1">
                            <a
                                href="https://github.com/EOSC-Data-Commons/eoscdcpoc/blob/main/CHANGELOG.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={"hover:text-eosc-dark-blue transition-colors"}
                                aria-label="View Changelog"
                                style={{textDecoration: 'none'}}
                            >
                                v{version}
                            </a>
                        </p>
                    </div>

                    {/* Right: Logo and Social Links */}
                    <div className="flex-1 flex flex-col items-center md:items-end gap-2">
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
                </div>
            </div>
        </footer>
    );
};
