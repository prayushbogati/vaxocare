import { useState, useContext } from "react";
import { UseHeaderContext } from "../Hooks/UseHeaderContext";
import logo from "../assets/images/logoLight.png"
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
    Company: ["Home", "About"],
    Support: ["Contact"],
};


export default function Footer() {
    const [hoveredLink, setHoveredLink] = useState(null);

    const { active, setActive } = UseHeaderContext()

    return (
        <footer className="w-full bg-blue-800 text-white">
            <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">

                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 mb-10">

                    {/* Brand column */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group w-fit">
                            <div
                                className="w-30 rounded-lg flex items-center justify-center
                                                    transition-all duration-300 group-hover:scale-105"
                            >
                                <img src={logo} alt="logo" />
                            </div>
                        </Link>

                        <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
                            Your trustworthy child vaccination partner.
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category} className="flex flex-col gap-3 md:ml-60 lg:ml-90">
                            <h4 className="text-xs font-semibold uppercase tracking-widest">
                                {category}
                            </h4>
                            <ul className="flex flex-col gap-2">
                                {links.map((link) => (
                                    <li key={link}>
                                        <Link
                                            to={link == "Home" ? "/" : '/' + link}
                                            onClick={() => setActive(link)}
                                            onMouseEnter={() => setHoveredLink(link)}
                                            onMouseLeave={() => setHoveredLink(null)}
                                            className="flex items-center gap-1.5 text-sm text-blue-200
                                 hover:text-white transition-all duration-200 group w-fit"
                                        >
                                            <span
                                                className={`inline-block w-1 h-1 rounded-full bg-blue-400
                                    transition-all duration-200
                                    ${hoveredLink === link ? "scale-150 bg-white" : ""}`}
                                            />
                                            <span className={`transition-all duration-200 ${hoveredLink === link ? "translate-x-0.5" : ""}`}>
                                                {link}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom divider */}
                <div className="h-px bg-blue-700 mb-6" />

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-blue-400 text-xs">
                        © {new Date().getFullYear()} Vaxocare | All rights reserved.
                    </p>

                    {/* Social icons */}
                    <div className="flex items-center gap-3">
                        <a href="https://www.x.com" target="_blank">
                            <XIcon className="hover:text-black" fontSize="large" />
                        </a>
                        <a href="https://www.facebook.com" target="_blank">
                            <FacebookIcon className="hover:text-black" fontSize="large" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}