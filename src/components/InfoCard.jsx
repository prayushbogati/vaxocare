import React from 'react'

export default function InfoCard({ icon, title, detail, sub }) {
    return (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100
                    hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                      group-hover:scale-110 transition-transform duration-300">
                    {icon}
            </div>
            <div>
                <p className="text-sm font-bold uppercase tracking-widest mb-0.5">{title}</p>
                <p className="text-sm">{detail}</p>
                {sub && <p className="text-sm mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}