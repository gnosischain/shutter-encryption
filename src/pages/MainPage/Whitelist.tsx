import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCallback, useState } from "react";

interface Whitelist {
    [key: string]: number[];
}

const whitelist: Whitelist = {
    Nethermind: [10, 9, 58],
    Gateway: [18, 34],
};

export const Whitelist = () => {
    const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

    const handleClick = useCallback((tag: string) => {
        setActiveTags((prevTags) => {
            const newTags = new Set(prevTags);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else {
                newTags.add(tag);
            }
            return newTags;
        });
    }, []);

    return (
        <div className="w-full flex flex-col my-4">
            <div className="w-full py-1 mb-4 flex items-center border-b border-b-white hover:text-white/70 hover:cursor-pointer" onClick={() => setIsWhitelistOpen(!isWhitelistOpen)}>WhiteList {isWhitelistOpen ? <ChevronDownIcon className="h-[18px] w-[18px] ml-2" /> : <ChevronRightIcon className="h-[18px] w-[18px] ml-2" />}</div>
            <div className={`flex gap-x-2 overflow-hidden transition-all ease-in-out duration-300 ${isWhitelistOpen ? "max-h-48" : "max-h-0"}`}>
                {Object.keys(whitelist).map((tag) => (
                    <p id={tag}
                        key={tag}
                        className={`px-6 py-1 flex text-xs items-center hover:cursor-pointer border border-white rounded-full ${activeTags.has(tag.toLowerCase()) ? "bg-white text-primary" : ""}`}
                        onClick={() => handleClick(tag.toLowerCase())}
                    >
                        {tag}
                    </p>
                ))}
            </div>
        </div>
    );
};
