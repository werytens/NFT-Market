import React from 'react'
import NFT from './NFT';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    data?: { name: string, isOpen: boolean, nftIds: bigint[] };
    nfts: ({ name: string; isCollectible: boolean; collectionId: any; owner: string; pictureLink: string; } | undefined)[] | undefined
}

const NFTModal: React.FC<Props> = ({ visible, setVisible, data, nfts }) => {
    return (
        <section
            className={['fixed w-[100%] h-[100%] top-0 left-0 bg-black/[.84] z-10 flex items-center justify-center', visible ? 'block' : 'hidden'].join(' ')}
            onClick={() => setVisible(false)}
        >
            <div
                onClick={(event) => { event.stopPropagation() }}
                className="bg-[white] w-[80%] h-[70%] p-2 rounded"
            >

                <h1>
                    Collection {data?.name}
                </h1>

                <div>
                    <h2>
                        NFT:
                    </h2>

                    <div className='flex flex-wrap justify-around overflow-y-scroll ' >
                        {
                            nfts ?
                                nfts.map((item, index) => (
                                    <>
                                        {
                                            item ?
                                                <NFT key = { index } text = {item.name} link = { item.pictureLink } />
                                                : null
                                        }
                                    </>   
                                ))
                        : null
                        }
                    </div>
                </div>

            </div>
        </section>
    )
}

export default NFTModal;