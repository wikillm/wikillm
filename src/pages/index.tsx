// @ts-nocheck
/* eslint-disable */
import { supabase } from '@wikillm/api/Store';
import React, { useState } from 'react';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (type, username, password) => {
    try {
      const {
        error,
        data: { user },
      } =
        type === 'LOGIN'
          ? await supabase.auth.signInWithPassword({
              email: username,
              password,
            })
          : await supabase.auth.signUp({ email: username, password });
      // If the user doesn't exist here and an error hasn't been raised yet,
      // that must mean that a confirmation email has been sent.
      // NOTE: Confirming your email address is required by default.
      if (error) {
        alert(`Error with auth: ${error.layer}`);
      } else if (!user)
        alert('Signup successful, confirmation mail should be sent soon!');
    } catch (error) {
      console.log('error', error);
      alert(error.error_description || error);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-300 p-4">
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="border-teal border-t-12 mb-6 rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4">
            <label className="text-grey-darker mb-2 block font-bold">
              Email
            </label>
            <input
              type="text"
              className="border-grey-light hover:border-grey block w-full appearance-none rounded border bg-white p-2 shadow"
              placeholder="Your Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
          <div className="mb-4">
            <label className="text-grey-darker mb-2 block font-bold">
              Password
            </label>
            <input
              type="password"
              className="border-grey-light hover:border-grey block w-full appearance-none rounded border bg-white p-2 shadow"
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <a
              onClick={(e) => {
                e.preventDefault();
                handleLogin('SIGNUP', username, password);
              }}
              href="/projects"
              className="hover:bg-teal rounded bg-indigo-700 px-4 py-2 text-center text-white transition duration-150 hover:bg-indigo-600 hover:text-white"
            >
              Sign up
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                handleLogin('LOGIN', username, password);
              }}
              href="/projects"
              className="w-full rounded border border-indigo-700 px-4 py-2 text-center text-indigo-700 transition duration-150 hover:bg-indigo-700 hover:text-white"
            >
              Login
            </a>
            <a href="/projects/1">Anonymous Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
