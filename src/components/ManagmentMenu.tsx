import React from 'react';
import Button from './Button';

interface Props {
    visible: boolean;
    data: string[];
    dataCallbacks: React.Dispatch<React.SetStateAction<boolean>>[];
}

const ManagmentMenu: React.FC<Props> = ({ visible, data, dataCallbacks }) => {
    return (
        <>
            {
                visible ?
                    <section>
                        <h1 className="text-[1.8em]">Managment:</h1>
                        <div className="text-[0.8em] flex flex-wrap">
                            {
                                data.map((item, index) => (
                                    <span key={index}>
                                        <Button text={data[index]} callback={dataCallbacks[index]} />

                                    </span>
                                ))
                            }
                        </div>
                    </section>
                    : null
            }
        </>
    )
}

export default ManagmentMenu;