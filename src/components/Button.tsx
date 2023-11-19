import React from 'react';

interface Props {
    text: string;
    callback: React.Dispatch<React.SetStateAction<boolean>>;
}

const Button: React.FC<Props> = ({text, callback}) => {
    return (
        <button
            className="bg-[green] text-white p-2 rounded  hover:bg-[#5e9c54] transition mr-5"
            onClick={() => callback(true)}
        >
            {text}
        </button>
    )
}

export default Button;