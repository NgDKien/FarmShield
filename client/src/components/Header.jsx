import React from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
    return (
        <div className="h-20 lg:h-24 border-b border-gray-300 flex-shrink-0">
            <div className="flex justify-between items-center h-full px-4 lg:px-8">
                <img src="/src/assets/FarmShield.svg" className="h-8 lg:h-10" />
                <NavLink to="/notification" className="flex justify-center items-center w-12 h-12 shadow-lg lg:w-16 lg:h-16 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    <img src="/src/assets/bell.svg" className="w-5 h-5 lg:w-6 lg:h-6" />
                </NavLink>
            </div>
        </div>
    )
}

export default Header