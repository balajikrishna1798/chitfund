// src/api/auth.js
import axios from 'axios';


const server = axios.create({
    baseURL: "http://localhost:8000/",
});

export const authLogin = async (username, password) => {
    const response = await server.post('/users/auth/login/', { username, password });
    console.log(response.data,"ss");
    return  response.data;
};

