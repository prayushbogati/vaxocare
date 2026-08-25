import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import { api, auth } from '../apis/index.jsx'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        setLoaded(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        try {
            const res = await api.login({ email, password });
            if (res?.token) auth.setToken(res.token);

            const role = res?.data?.role;
            // backend login response shape: { token, data: { role, ... } }
            if (role) auth.setRole(role);

            if (role === 'admin') navigate('/adminDashboard');
            else if (role === 'provider') navigate('/orgDashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err?.message || 'Login failed');
        }
    }
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 transition-all duration-900 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                    >
                        Login
                    </button>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </form>
            </div>

            <div className='text-center my-5'>
                <span>OR</span><br />
                <Link to='/signup' className='text-blue-900 font-bold block transition-all hover:underline cursor-pointer'>SignUp</Link>
            </div>
        </div>
    )
}

export default Login