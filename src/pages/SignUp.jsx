import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom'
import { api, auth } from '../apis/index.jsx'

const Signup = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(null)
    const [role, setRole] = useState('parent')
    const [name, setName] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        setLoaded(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await api.register({ name, email, password, role });

            // Backend register returns: { message, data: { id, role, isApproved } }
            if (res?.token) {
                auth.setToken(res.token)
                navigate('/dashboard');
                return;
            }

            if (role === 'provider') {
                navigate('/login');
                return;
            }

            navigate('/login');
        } catch (err) {
            setError(err?.message || 'Signup failed');
        }
    }
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 transition-all duration-900 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="text-sm">Full Name</label><br />
                    <input
                        type="text"
                        name='fullName'
                        id='fullName'
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm">Email</label><br />
                    <input
                        type="email"
                        name='email'
                        id='email'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm">Role</label><br />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="parent">parent</option>
                        <option value="provider">provider</option>
                        <option value="admin">admin</option>
                    </select>

                    <label className="text-sm">Password</label><br />
                    <input
                        type="password"
                        name='password'
                        id='password'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm">Confirm Password</label><br />
                    <input
                        type="password"
                        name='confirmPassword'
                        id='confirmPassword'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                        Signup
                    </button>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className='text-center my-3'>
                        <Link to='/login' className='text-blue-900 font-bold block transition-all hover:underline cursor-pointer'>Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup
