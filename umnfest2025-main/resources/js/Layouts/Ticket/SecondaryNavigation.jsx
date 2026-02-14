import React from 'react';

const SecondaryNavigation = () => {
    const navigationItems = [
        {
            id: 'lineup',
            label: 'Line Up Guest Star',
            targetId: 'lineup-section'
        },
        {
            id: 'tickets',
            label: 'Ticket',
            targetId: 'tickets-section'
        }
    ];

    const scrollToSection = (targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <section className="w-full bg-[#B42129] h-auto">
            <div className="w-full flex justify-center gap-[55px]
                            h-[40px]
                            sm:h-[45px]
                            md:h-[60px]
                            lg:h-[80px]
                            xl:h-[100px]
                            2xl:h-[110px]">                
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => scrollToSection(item.targetId)}
                        className="text-white flex items-center justify-center group
                                 bg-transparent hover:bg-transparent cursor-pointer
                                 border-none outline-none focus:outline-none focus:bg-transparent
                                 shadow-none hover:shadow-none focus:shadow-none active:shadow-none
                                 hover:brightness-100 active:bg-transparent
                                 text-[14px]
                                 sm:text-[17px]
                                 md:text-[20px]
                                 lg:text-[25px]
                                 xl:text-[30px]
                                 2xl:text-[32px]"
                        style={{ 
                            boxShadow: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none'
                        }}
                    >
                        <p className="relative leading-tight 
                                    before:content-[''] 
                                    before:absolute 
                                    before:left-0 
                                    before:-bottom-1 
                                    before:w-full 
                                    before:h-[3px] 
                                    before:bg-white 
                                    before:scale-x-0 
                                    before:origin-left 
                                    before:transition-transform 
                                    before:duration-300 
                                    group-hover:before:scale-x-100">
                            {item.label}
                        </p>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default SecondaryNavigation;