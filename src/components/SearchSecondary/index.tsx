"use client";

import React from "react";

interface SearchProps {
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SecondarySearch: React.FC<SearchProps> = ({ handleChange }) => {
    return (
        <input
            type="search"
            onChange={handleChange}
            id="search"
            placeholder="Search"
            className="sm:text-sm border border-zinc-300 focus:outline-none focus:border-emerald-400 hover:border-emerald-400 px-2 py-1 leading-1 rounded-lg"
        />
    );
};

export default SecondarySearch;
