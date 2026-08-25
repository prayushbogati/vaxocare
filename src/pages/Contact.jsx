import React from 'react'
import { useState, useEffect } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoCard from '../components/InfoCard';

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [focused, setFocused] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setLoaded(true)
    }, [])

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = () => {
        if (!form.name || !form.email || !form.message) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); setSubmitted(true); }, 1400);
    };

    const inputClass = (field) =>
        `w-full bg-white border-2 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none
     placeholder-gray-400 transition-all duration-200
     ${focused === field ? "border-blue-600 shadow-sm shadow-blue-100" : "border-gray-200 hover:border-blue-300"}`;

    return (
        <section className={`flex-1 bg-gray-50 transition-all duration-900 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Page heading */}
                <div className="text-center mb-14">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest
                           bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full mb-4">
                        Get in Touch
                    </span>
                    <h1 className="text-4xl font-semibold mb-3"
                    >
                        We'd love to hear from you
                    </h1>
                    <p className="text-gray-500 text-base max-w-md mx-auto">
                        Have a question, idea, or just want to say hello? Fill out the form and we'll get back to you shortly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

                    {/* Left — info cards */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <InfoCard
                            icon={<LocationOnIcon fontSize='large' className='text-blue-900' />}
                            title="Our Office"
                            detail="Kathmandu, Nepal"
                            sub="Sun - Fri, 10am - 5pm"
                        />
                        <InfoCard
                            icon={<EmailIcon fontSize='large' className='text-blue-900' />}
                            title="Email Us"
                            detail="vaxocare26@email.com"
                            sub="We reply within 24 hours"
                        />
                        <InfoCard
                            icon={<PhoneAndroidIcon fontSize='large' className='text-blue-900' />}
                            title="Call Us"
                            detail="+977 - 9876543210"
                            sub="Sun - Fri, 10am - 5pm"
                        />

                    </div>

                    {/* Right — form */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                                <div>
                                    <h3 className="text-xl font-bold mb-1"
                                    >Message Sent!</h3>
                                    <p className="text-gray-500 text-sm">Thanks for reaching out. We'll be in touch very soon.</p>
                                </div>
                                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                    className="mt-2 px-6 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-full
                             hover:bg-blue-700 active:scale-95 transition-all duration-200">
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <h2 className="text-xl font-bold"
                                    >Send us a message</h2>
                                    <p className="text-gray-400 text-sm mt-0.5">All fields marked are required.</p>
                                </div>

                                {/* Name + Email row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Name *</label>
                                        <input type="text" placeholder="John Doe" value={form.name}
                                            onChange={set("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                                            className={inputClass("name")} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Email *</label>
                                        <input type="email" placeholder="johndoe@email.com" value={form.email}
                                            onChange={set("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                                            className={inputClass("email")} />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Subject</label>
                                    <input type="text" placeholder="How can we help?" value={form.subject}
                                        onChange={set("subject")} onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                                        className={inputClass("subject")} />
                                </div>

                                {/* Message */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Message *</label>
                                    <textarea rows={5} placeholder="Tell us what's on your mind..." value={form.message}
                                        onChange={set("message")} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                                        className={`${inputClass("message")} resize-none`} />
                                </div>

                                {/* Submit */}
                                <button onClick={handleSubmit} disabled={loading}
                                    className="w-full py-3.5 bg-blue-800 text-white font-semibold rounded-xl text-sm
                             hover:bg-blue-700 active:scale-[0.98] transition-all duration-200
                             disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                            </svg>
                                            Sending…
                                        </>
                                    ) : "Send Message →"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact
