import React from 'react'

const Header = () => {
    return (
        <div className=" h-[97px] border-b-[0.5px] border-[#d3cdcd]">
            <div className="flex justify-between items-center pl-[33px] pr-[33px]">
                <img src="/src/assets/FarmShield.svg" className="pt-[15px]" />
                <div className="flex justify-center items-center w-[65px] h-[65px] border-[#D8D8D8] border-[1px] rounded-[10px] mt-[15.5px]">
                    <img src="/src/assets/bell.svg" />
                </div>
            </div>
        </div>
    )
}

export default Header
