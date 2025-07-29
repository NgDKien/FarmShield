import React from 'react'

const Header = () => {
    return (
        <div className="h-20 lg:h-24 border-b border-gray-300 flex-shrink-0">
            <div className="flex justify-between items-center h-full px-4 lg:px-8">
                <img src="/src/assets/FarmShield.svg" className="h-8 lg:h-10" />
                <div className="flex justify-center items-center w-12 h-12 lg:w-16 lg:h-16 border border-gray-300 rounded-lg">
                    <img src="/src/assets/bell.svg" className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </div>
    )
}

export default Header