import { useState, useEffect } from "react";
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import SecurityIcon from '@mui/icons-material/Security';
import { Link } from 'react-router-dom'

const TEAM = [
    {
        name: "John Doe",
        role: "Founder",
        img: "",
    },
    {
        name: "Sarah",
        role: "Co-Founder",
        img: "",
    },
    {
        name: "Aisha",
        role: "Manager",
        img: "",
    },
];

const VALUES = [
    {
        icon: <AccessAlarmsIcon />,
        title: "Timely Vaccination Reminders",
        desc: "Ensure children receive their vaccines on schedule through automated reminders and intelligent appointment scheduling that help parents stay informed and prepared.",
    },
    {
        icon: <SecurityIcon />,
        title: "Secure Digital Vaccination Records",
        desc: "Maintain reliable and centralized vaccination records that are safely stored and easily accessible for parents and healthcare providers whenever needed.",
    }
];

export default function About() {
    const [hoveredMember, setHoveredMember] = useState(null);
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setLoaded(true)
    }, [])

    return (
        <div className={`min-h-screen bg-gray-100 transition-all duration-900 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

            {/* ── hero ── */}
            <section className="relative overflow-hidden">

                <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
                    {/* Text */}
                    <div className="flex-1">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest
                           bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full mb-4">
                            Our Story
                        </span>
                        <h1 className="text-5xl font-semibold leading-tight mb-5">
                            Empowering Smarter Child Vaccination Management
                        </h1>
                        <p className="text-lg leading-relaxed max-w-lg">
                            Vaxocare is a smart digital platform designed to simplify and improve the management of childhood vaccination records and schedules. By connecting parents, healthcare providers, and administrators in one secure system, it helps ensure timely immunizations through automated reminders, easy appointment scheduling, and centralized health records.
                        </p>
                    </div>

                    {/* Hero image collage */}
                    <div className="flex-1 flex justify-center items-center relative w-full max-w-sm lg:max-w-md">
                        <div className="relative w-full aspect-square">
                            {/* Main image */}
                            <img
                                src="https://tse4.mm.bing.net/th/id/OIP.OOB1EYM2R7lIb84ZYAcorwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"
                                alt="child vaccination"
                                className="w-4/5 rounded-3xl shadow-2xl object-cover aspect-square
                           border-4 border-white/10 absolute top-0 left-0"
                            />
                            {/* Overlapping second image */}
                            <img
                                src="https://images.stockcake.com/public/4/c/4/4c488865-a148-43bc-9110-fcf90c4acbc9_large/pediatric-care-moment-stockcake.jpg"
                                alt="child vaccination"
                                className="w-2/5 rounded-2xl shadow-xl object-cover aspect-square
                           border-4 border-white absolute bottom-0 right-0
                           hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* -- mission -- */}
            <section className="max-w-7xl mx-auto px-6 py-10 bg-gray-200 rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    {/* Image */}
                    <div className="relative">
                        <img
                            src="https://cdn.prgloo.com/media/422edbbe8e7b48ca85e65222868ab678.jpg?width=968&height=1452"
                            alt="Mission"
                            className="w-full rounded-3xl object-cover shadow-lg"
                            style={{ maxHeight: "420px" }}
                        />
                    </div>

                    {/* Text */}
                    <div>
                        <h2 className="text-4xl font-bold mb-5">
                            Our Mission
                        </h2>
                        <p className="leading-relaxed mb-4 text-gray-600">
                            Our mission is to improve childhood immunization management by replacing unreliable paper-based systems with a secure and intelligent digital platform. Vaxocare aims to ensure that every child receives vaccines on time by providing accessible tools for parents and healthcare providers.
                        </p>

                        <h3 className="text-xl font-bold">Key Goals</h3>

                        {/* Values */}
                        <div className="mt-5 flex flex-col gap-4">
                            {VALUES.map(({ icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-3 group">
                                    <div className="transition-all hover:scale-110">
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-md">{title}</p>
                                        <p className="text-md leading-relaxed text-gray-600">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ── cta banner ── */}
            <section className="bg-blue-800 relative overflow-hidden">
                <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3"
                        style={{ fontFamily: "'Georgia', serif" }}>
                        Ready to work with us?
                    </h2>
                    <p className="text-blue-200 mb-8 text-base">
                        We're always looking for curious, driven people to join our team.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link to="/contact"
                            className="px-7 py-3 border-2 border-white/40 text-white font-semibold text-sm rounded-full
                         hover:border-white hover:bg-white/10 transition-all duration-200">
                            Contact Us
                        </Link>
                    </div>
                </div>
                <div className="h-px bg-blue-700 mb-6 mx-15" />
            </section>
        </div>
    );
}