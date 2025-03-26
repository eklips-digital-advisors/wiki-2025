'use client'
import React, { useState } from 'react'

export const PasswordGeneratorBlock = () => {
  const [password, setPassword] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  const [length, setLength] = useState(20);

  // Function to generate random password
  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let newPassword = '';
    setCopyText('Copy')
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    setPassword(newPassword);
  };

  // Function to copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopyText('Copied')
    }, (err) => {
      setCopyText('Error on copy')
      console.error('Error in copying text: ', err);
    });
  };

  return (
    <div className="prose">
      <h2 className="border-b border-zinc-900/5 pb-6 mb-6">Password generator</h2>
      <label form="pw-length" className="mr-2">Set password length</label>
      <input
        className="h-10 w-24 sm:text-sm border border-zinc-200 px-4 py-2 rounded-md mb-2"
        type="number"
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        placeholder="Password Length"
        id="pw-length"
      />
      <div className="flex items-center gap-1">
        <button
          className="!mr-0 h-10 sm:text-sm border border-zinc-200 focus:outline-none focus:border-zinc-400 hover:border-zinc-400 px-4 py-2 rounded-md"
          onClick={() => generatePassword()}>Generate Password
        </button>
        <input className="h-10 sm:text-sm border border-zinc-200 px-4 py-2 rounded-md bg-gray-50" type="text"
               value={password} readOnly/>
        <button
          className={`${copyText === 'Copy' ? '' : 'bg-zinc-100'} mr-0 h-10 sm:text-sm border border-zinc-200 focus:outline-none focus:border-zinc-400 hover:border-zinc-400 px-4 py-2 rounded-md`}
          onClick={copyToClipboard}>{copyText}</button>
      </div>
    </div>
  )
}
