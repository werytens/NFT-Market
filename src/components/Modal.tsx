import React from "react";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setData: React.Dispatch<React.SetStateAction<string>>;
    callback: () => Promise<void>

    setDataTwo?: React.Dispatch<React.SetStateAction<any>>;
    dataText?: string;

    setDataThree?: React.Dispatch<React.SetStateAction<any>>;
    dataThreeText?: string;
}

const Modal: React.FC<Props> = ({ visible, setVisible, setData, callback, setDataTwo, dataText, setDataThree, dataThreeText }) => {
    return (
        <section
            className={['absolute w-[100%] h-[100%] top-0 left-0 bg-black z-10 flex items-center justify-center', visible ? 'block' : 'hidden'].join(' ')}
            onClick={() => setVisible(false)}
        >
            <div
                onClick={(event) => { event.stopPropagation() }}
                className="bg-[white] w-[20%] h-[30%] p-2 rounded flex flex-col justify-between"
            >
                <h1 className="text-center uppercase">
                    Creating
                </h1>

                <div className="flex flex-col justify-between h-[40%]">
                    <input
                        type="text"
                        className="bg-[#e0e0e0] outline-none placeholder:text-[#9b9b9b] p-2 rounded text-center"
                        placeholder="Name"
                        onChange={(e) => setData(e.target.value)}
                    />
                    <>
                        {
                            setDataTwo ?
                                <input
                                    type="text"
                                    className="bg-[#e0e0e0] outline-none placeholder:text-[#9b9b9b] p-2 rounded text-center"
                                    placeholder={dataText}
                                    onChange={(e) => setDataTwo(e.target.value)}
                                />
                                : null
                        }
                    </>
                    <>
                        {
                            setDataThree ?
                                <input
                                    type="text"
                                    className="bg-[#e0e0e0] outline-none placeholder:text-[#9b9b9b] p-2 rounded text-center"
                                    placeholder={dataThreeText}
                                    onChange = {(e) => setDataThree(e.target.value)}
                                />
                                : null
                        }
                    </>
                </div>

                <button
                    className="bg-[green] text-white p-2 rounded  hover:bg-[#5e9c54] transition"
                    onClick={callback}
                > Create </button>
            </div>
        </section>
    )
}

export default Modal;