import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import {useNavigate} from "react-router-dom"

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [username,setUsername] = useState("");
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled':'filled' });

    const onClick = async() => {
        try{
            await dispatch(login({username,password}))
            await navigate('/')
        }
        catch{
            console.log("error")
        }
    }
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${"light" === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Welcome, Isabel!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                            Username
                            </label>
                            <InputText inputid="username" value={username} type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password inputid="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>
                            <Button label="Sign In" className="w-full p-3 text-xl" onClick={onClick} ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default LoginPage;
