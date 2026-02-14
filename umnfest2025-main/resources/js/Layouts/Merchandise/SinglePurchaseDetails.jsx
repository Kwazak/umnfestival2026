import React from "react";
import SHIRT from "../../../images/Merchandise/SHIRT.webp";
import LANYARD from "../../../images/Merchandise/LANYARD.webp";
import KIPAS from "../../../images/Merchandise/KIPAS.webp";
import TOTEBAG from "../../../images/Merchandise/TOTEBAG.webp";
import KEYCHAIN from "../../../images/Merchandise/KEYCHAIN.webp";

const merchandiseItems = [
    {
        image: SHIRT,
        name: "“Strength in Struggle” Cream T-Shirt",
        price: "IDR 80.000,-",
        imgStyle: "w-[90%] md:w-[90%] max-w-[300px] mx-auto sm:scale-120 md:-translate-y-6  lg:group-hover:-translate-y-10 lg:group-hover:scale-110 lg:scale-100 transition-all duration-300",
        link: "https://bit.ly/3GGNLqs"
    },
    {
        image: LANYARD,
        name: "Lanyard UMN Festival 2025",
        price: "IDR 20.000,-",
        imgStyle: "w-[80%] md:w-[100%] max-w-[300px] mx-auto translate-y-8 -translate-x-2 md:translate-y-3 lg:translate-y-10 lg:group-hover:-translate-y-3 lg:group-hover:w-[85%] transition-all duration-300",
        link: "https://bit.ly/3GGNLqs"
    },
    {
        image: TOTEBAG,
        name: "Legends Don't Need To Roar Totebag",
        price: "IDR 40.000,-",
        imgStyle: "w-[65%] md:w-[85%] max-w-[300px] translate-y-2 md:translate-y- mx-auto lg:translate-y-10 lg:group-hover:-translate-y-2 lg:group-hover:w-[80%] transition-all duration-300",
        link: "https://bit.ly/3GGNLqs"
    },
    {
        image: KEYCHAIN,
        name: "UMN Festival 2025 Keychain Series",
        price: "IDR 13.000-20.000,-",
        imgStyle: "w-[80%] max-w-[300px] mx-auto md:w-[85%] translate-y-1 lg:translate-y-5 lg:group-hover:-translate-y-6 lg:group-hover:w-[75%] transition-all duration-300",
        link: "https://bit.ly/3GGNLqs"
    },
    {
        image: KIPAS,
        name: "Nago UMN Festival 2025 Hand Fan",
        price: "IDR 12.000,-",
        imgStyle: "w-[70%] md:w-[85%] max-w-[300px] mx-auto translate-y-0 md:-translate-y-8 lg:-translate-y-0   adsalg:group-hover:-translate-y-6 lg:group-hover:w-[80%] transition-all duration-300",
        link: "https://bit.ly/3GGNLqs"
    },
];

export default function SinglePurchaseDetails() {
    return (
        <section className="w-full px-4 py-4">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-3 px-9">
                {merchandiseItems.map((item, index) => (
                    <div className="flex flex-col items-center" key={index}>
                        <div
                            className="group bg-[#ffffff] mb-4 border-5 rounded-[15px] w-full max-w-[348px] h-[360px] md:h-[446px] flex flex-col justify-end items-center overflow-hidden"
                            style={{ borderColor: "#BA2129" }}
                        >
                            <div>
                                <img src={item.image} alt="" className={item.imgStyle} />
                            </div>
                            <div className="z-10 bg-[#B42129] w-full text-white p-5 sm:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                <p className="font-semibold text-lg">{item.name}</p>
                                <p className="text-lg">{item.price}</p>
                            </div>
                        </div>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#B42129] rounded-full cursor-pointer hover:bg-[#892026] transition-all duration-200 w-full max-w-[316px] h-[56px] md:h-[65.9px] text-xl md:text-2xl lg:text-3xl text-white text-center flex items-center justify-center"
                        >
                            PRE-ORDER NOW
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}