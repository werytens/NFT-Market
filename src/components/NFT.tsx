import React from 'react';

interface Props {
    link: string;
    text: string;
    price?: number;
}

const NFT: React.FC<Props> = ({ link, text, price }) => {

    return (
        <div className="p-3 bg-[#c9c9c9] rounded flex flex-col justify-between h-[260px] mb-10" >

            <img className="h-[200px] w-[200px] object-cover" src={link} alt="" />

            <p className='flex justify-between'>
                <span>
                    {text}
                </span>

                <span>
                    {
                        price
                    } ETH
                </span>
            </p>

        </div>
    )
    
}

export default NFT;