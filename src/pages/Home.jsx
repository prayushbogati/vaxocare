import React from 'react'
import { useEffect, useState } from 'react'
import heroImg from "../assets/images/hero-img.png"
import { Link } from 'react-router-dom'

const Home = () => {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setLoaded(true)
    }, [])
    return (
        <div className={`container max-w-7xl p-10 sm:p-20 mx-auto min-h-[89vh] my-10 py-10 rounded-2xl transition-all duration-900 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <section className='flex flex-col justify-around items-center gap-10 md:flex-row'>
                <div className='md:w-1/2 text-center md:text-left'>
                    <h1 className='text-5xl'>Your Child’s Health, Digitally Secured</h1>
                    <p className='text-2xl mt-5'>We turn paper-based uncertainty into digital peace of mind.</p>
                </div>

                <img src={heroImg} className='md:w-1/2' alt="heroImg" />
            </section>

            <section className='flex flex-col justify-around items-center md:gap-10 md:flex-row mt-10'>
                <div className='md:w-1/2 p-10 text-center md:text-left'>
                    <p className='text-xl'>Keep your child’s immunizations up to date with our easy online registration system.</p><br />
                    <p className='text-xl'>Access digital records, schedule appointments, ad stay informed-all in one secure platform.</p>

                    <button className='bg-blue-800 text-white mt-5 py-2 px-4 rounded-xl hover:bg-blue-700 cursor-pointer'>
                        <Link to='/signup'>Register Now</Link></button>
                </div>

                <div className='md:w-1/2 p-10 md:ml-20 text-center md:text-left'>
                    <h1 className='text-4xl'>Child <br /> Vaccination <br /> Registration</h1>
                    <ul className='text-xl ml-5 mt-3 list-decimal'>
                        <li>Secure Online Registration</li>
                        <li>Digital Vaccine Records</li>
                        <li>Mobile Access Anytime</li>
                    </ul>
                </div>
            </section>
        </div>
    )
}

export default Home