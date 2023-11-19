"use client"

import Web3, { MatchPrimitiveType } from "web3";
import type { MetaMaskInpageProvider } from "@metamask/providers";
import { useState, useEffect } from 'react';
import { web3Contract, contractInstanse } from '@/data';

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import ManagmentMenu from "@/components/ManagmentMenu";
import NFTModal from "@/components/NFTModal";
import NFT from "@/components/NFT";

import SellIcon from '@mui/icons-material/Sell';
import StorefrontIcon from '@mui/icons-material/Storefront';

type IAccountInfo = {
    address: string;
    balance: bigint;
};

type TWindowInjected = Window & typeof globalThis & { ethereum: MetaMaskInpageProvider };

export default function Home() {
    const [web3, setWeb3] = useState<Web3>();
    const [provider, setProvider] = useState<MetaMaskInpageProvider>();
    const [currentAccount, setCurrentAccount] = useState<string | undefined>(undefined);
    const [balance, setBalance] = useState(0);
    const [balanceUpdate, setBalanceUpdate] = useState(0);

    const [isOwner, setIsOwner] = useState(false);

    const setNewBalance = async (address?: string) => {
        try {
            let balanceHex;

            if (address) {
                balanceHex = await web3Contract.eth.getBalance(String(address));
            } else {
                balanceHex = await web3Contract.eth.getBalance(String(currentAccount));
            }

            setBalance(Number(await web3Contract.utils.fromWei(balanceHex, 'ether')));
        } catch (e) {
            console.log('e');
        }
    }

    const getSaleData = async (id: number) => {
        const response = await contractInstanse.methods.getSaleData(id).call();

        return {onSale: Boolean(response.isValid), price: Number(response.price)}
    }

    const [nfts, setNfts] = useState<{ name: string, isCollectible: boolean, collectionId: any, owner: string, pictureLink: string }[]>();
    const [saleNFTs, setSaleNFTs] = useState<({ name: string, isCollectible: boolean, collectionId: any, owner: string, pictureLink: string, id: number, price: number } | undefined )[]>();

    async function loadNfts() {
        const response = await contractInstanse.methods.getNfts().call();

        if (response !== undefined) {
            setNfts(response);
            const array: { name: string, isCollectible: boolean, collectionId: any, owner: string, pictureLink: string }[] = response; 

            const saleNFTsResponse = await Promise.all(array.map(async (item, index) => {
                    if ((await contractInstanse.methods.getSaleData(index).call()).isValid === true) {
                        return {id: index, price: (await getSaleData(index)).price, ...item};
                    }
            }));
                
            const filteredNfts = saleNFTsResponse.filter(item => item !== undefined);
            setSaleNFTs(filteredNfts);  
        }
    }

    useEffect(() => {
        setProvider((window as TWindowInjected).ethereum);
        setWeb3(new Web3({ provider }));

        setNewBalance();
        loadNfts();
    }, [balanceUpdate])

    

    async function getAccountsWithBalance(): Promise<IAccountInfo[]> {
        const accounts = await web3!.eth.getAccounts();
        const accountsWithBalance = accounts.map(async (account) => {
            const balance = await web3!.eth.getBalance(account);
            return { address: account, balance };
        });

        return await Promise.all(accountsWithBalance);
    }

    async function requestAccounts() {
        const data = await provider!.request<string[]>({ method: "eth_requestAccounts" });
        const ownerAddress = await contractInstanse.methods.owner().call();

        if (data) {
            setCurrentAccount(data[0]);
            setNewBalance(data[0]);

            if (String(data[0]).toLocaleLowerCase() == ownerAddress.toLocaleLowerCase()) {
                setIsOwner(true);
            }
        }


        return data
    }

    const [collections, setCollections] = useState<{ name: string, isOpen: boolean, nftIds: bigint[] }[]>();

    async function loadCollections() {
        const response = await contractInstanse.methods.getCollections().call();

        console.log(response)

        if (response !== undefined) {
            setCollections(response as any);
        }
    }


    const [newNFTPicture, setNewNFTPicture] = useState('');
    const [newNFTName, setNewNFTName] = useState('');
    const [createModal, setCreateModal] = useState(false);


    async function createNFT() {
        setCreateModal(false);

        await contractInstanse.methods.createCommonNft(newNFTName, newNFTPicture).send({
            from: currentAccount,
            gas: String(3000000)
        });

        setBalanceUpdate(balance + 1);
    }

    const [newCollectionName, setNewCollectionName] = useState('');
    const [collectionCreateModal, setCollectionCreateModal] = useState(false);

    async function createCollection() {
        setCollectionCreateModal(false);

        await contractInstanse.methods.createCollection(newCollectionName).send({
            from: currentAccount,
            gas: String(3000000)
        })
    }

    const [colNftModal, setColNftModal] = useState(false);
    const [newColNftName, setNewColNftName] = useState('');
    const [newColNftColId, setNewColNftColId] = useState<number | undefined>(undefined);
    const [newColNftPictureLink, setNewColNftPictureLink] = useState('');

    async function createCollectionNft() {
        setColNftModal(false);

        const response = await contractInstanse.methods.createCollectibleNft(newColNftName, Number(newColNftColId), newColNftPictureLink).send({
            from: currentAccount,
            gas: String(3000000)
        })

    }

    const [mainModal, setMainModal] = useState(false);
    const [selectedCollection, setSelectedColleciton] = useState<{ name: string, isOpen: boolean, nftIds: bigint[] }>();

    const nftOnSale = async (id: number) => {
        const price = Number(prompt('Введите цену!'))

        if (price !== undefined) {
            await contractInstanse.methods.placeNftOnSale(id, price).send({
                from: currentAccount,
                gas: String(3000000)
            })
        }
    }

    const buyNft = async (id: number, price: number) => {
        web3 ? 

        await contractInstanse.methods.NFTbuy(id).send({
            from: currentAccount,
            gas: String(300000),
            value: web3.utils.toWei(price, 'ether')
        })

        : null
    }

    const sale = async (id: number, owner: string, currentAccount: string, price: number) => {
        currentAccount.toLocaleLowerCase() !== owner.toLocaleLowerCase() ?
        confirm('Вы уверены?') === true ? buyNft(id, price) : null : null
    }

    const getCollectionOwner = async (id: number) => {
        const res = await contractInstanse.methods.getCollectionOwner(id).call();

        return res.toLocaleLowerCase() === currentAccount?.toLocaleLowerCase();        
    } 

    const startAuction = async (id: number, startPrice: number, maxPrice: number) => {
        await contractInstanse.methods.startAuction(id, startPrice, maxPrice).send({
            from: currentAccount,
            gas: String(3000000)
        })
    }

    const joinAuction = async (id: number, value: number) => {
        web3 ? 

        await contractInstanse.methods.joinAuction(id).send({
            from: currentAccount,
            gas: String(3000000),
            value: web3.utils.toWei(value, 'ether')
        })

        : null
    }

    const finishAuction = async (id: number) => {
        await contractInstanse.methods.finishAuction(id).send({
            from: currentAccount,
            gas: String(3000000)
        })
    }

    const auction = async (id: number) => {
        const isCollectionOwn = await getCollectionOwner(id);

        if (isCollectionOwn) {

            if ((await getAuction(id)).startPrice) {
                const check = confirm('Вы уверены, что хотите закончить аукцион этой коллекции?')
                if (check) {
                    await finishAuction(id);
                }
            } else {
                const data = prompt('[startPrice] [maxPrice]');
            
                await startAuction(id, Number(data?.split(' ')[0]), Number(data?.split(' ')[1]))
            }

        } else {
            const value = prompt('Amount of money');

            await joinAuction(id, Number(value));
        }
    }


    const getAuction = async (id: number) => {
        return await contractInstanse.methods.getAuction(0).call()
    }

    return (
        <div className="px-[200px] w-[100%] h-[100%]">

            <Modal visible={createModal} setVisible={setCreateModal} setData={setNewNFTName} setDataTwo={setNewNFTPicture} dataText="Picture Link" callback={createNFT} />
            <Modal visible={collectionCreateModal} setVisible={setCollectionCreateModal} setData={setNewCollectionName} callback={createCollection} />
            <Modal visible={colNftModal} callback={createCollectionNft} setVisible={setColNftModal} setData={setNewColNftName} setDataTwo={setNewColNftColId} dataText="Collection id" setDataThree={setNewColNftPictureLink} dataThreeText="Picture Link" />

            <NFTModal
                visible={mainModal}
                setVisible={setMainModal}
                data={selectedCollection}
                nfts={
                    nfts?.map((item, index) => {
                        if (selectedCollection?.nftIds.includes(BigInt(index))) {
                            return item
                        } else { null }
                    }
                    )
                }
            />

            <header className="mt-[40px] mb-[40px] w-[100%] flex flex-col items-center">
                <h1 className="text-[2em]">
                    NFT COLLECTIONS
                </h1>
                <p>
                    {
                        currentAccount ?
                            <span>Current Account: {currentAccount}</span>
                            :
                            <button
                                onClick={requestAccounts}
                                className="bg-[blue] text-white p-2 rounded"
                            >
                                Login
                            </button>
                    }
                </p>
                {
                    currentAccount ?
                        <span> Balance: {balance} ETH </span> : null
                }
            </header>
            {
                currentAccount ?
                    <main>
                        <ManagmentMenu
                            visible={isOwner}
                            data={['Create NFT', 'Create collection', 'Create collectialbe NFT']}
                            dataCallbacks={[setCreateModal, setCollectionCreateModal, setColNftModal]}
                        />

                        <section>
                            <h1 className="text-[1.3em] mt-10">All NFT`s:</h1>
                            <button onClick={loadNfts} className="p-2 bg-[#b074c4] rounded text-white text-[0.8em] mb-10" >Load</button>

                            <div className="flex flex-wrap justify-around">
                                {
                                    nfts?.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className="p-3 bg-[#c9c9c9] rounded flex flex-col justify-between h-[260px] mb-10" 
                                            onClick={() => getSaleData(index)}
                                        >

                                            <img className="h-[200px] w-[200px] object-cover" src={item.pictureLink} alt="" />

                                            <p className="flex justify-between">
                                                <span>
                                                    ({index}) {item.name}
                                                </span>

                                                {
                                                    currentAccount.toLocaleLowerCase() === item.owner.toLocaleLowerCase() ? 

                                                    <button
                                                        onClick={() => {nftOnSale(index)}}
                                                    >
                                                        <SellIcon/>
                                                    </button>

                                                    : null
                                                }
                                            </p>

                                        </div>
                                    ))
                                }
                            </div>
                        </section>

                        <section>
                            <h1 className="text-[1.3em] mt-10">Sale NFT`s:</h1>
                            <button onClick={loadNfts} className="p-2 bg-[#b074c4] rounded text-white text-[0.8em] mb-10" >Load</button>

                            <div className="flex flex-wrap justify-around">
                                {
                                    saleNFTs?.map((item, index) => 
                                    
                                        (

                                            <>
                                                {
                                                    item !== undefined ?

                                                    <div 
                                                        key={index}
                                                        onClick={
                                                            () => {sale(item.id, item.owner, currentAccount, item.price)}
                                                        }
                                                    >
                                                        <NFT text={item.name} link = {item.pictureLink} price={item.price} /> 
                                                    </div>
                                                    
                                                    : null
                                                }
                                            </>

                                        )

                                    )
                                }
                            </div>
                        </section>

                        <section>
                            <h1 className="text-[1.3em] mt-10"> Collections: </h1>
                            <button onClick={loadCollections} className="p-2 bg-[#b074c4] rounded text-white text-[0.8em] mb-10" >Load</button>
                            <div className="flex flex-col mb-10">
                                {
                                    collections?.map((item, index) => (
                                        <div className="flex h-[50px] w-[100%]">
                                            <div
                                                key={index}
                                                className="h-[50px] p-3 bg-[#c9c9c9] rounded flex justify-around items-center mb-2 cursor-pointer w-[95%]"
                                                onClick={() => {
                                                    setMainModal(true);
                                                    setSelectedColleciton(item);
                                                }}
                                            >
                                                <p>
                                                    ({index + 1}) <b></b>
                                                    <span className="mr-4">
                                                        {item.name}
                                                    </span>
                                                </p>
                                                <p>
                                                    Open collection: <b></b>
                                                    <span className={item.isOpen ? 'text-[green]' : 'text-[red]'} >
                                                        {
                                                            String(item.isOpen)
                                                        }
                                                    </span>
                                                </p>
                                                <p>
                                                    Nft count: {item.nftIds.length}
                                                </p>
                                            </div>
                                            <button 
                                                className="p-3 bg-[#c9c9c9] rounded ml-2 w-[5%]"
                                                onClick={() => {auction(index)}}
                                            >
                                                <StorefrontIcon/>
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                        </section>
                    </main>
                    : null
            }
        </div>
    )
}