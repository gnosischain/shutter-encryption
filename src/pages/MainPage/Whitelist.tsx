import { useShutterValidators } from "@/shared/ShutterTimer/ShutterValidatorsProvider";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCallback, useState, useEffect } from "react";

interface Whitelist {
    [key: string]: number[];
}

const whiteList: Whitelist = {
    Nethermind: [10, 9, 58],
    Gateway: [18, 34],
};

export const WhiteList = () => {
    const [isWhitelistOpen, setIsWhitelistOpen] = useState(false);
    const [tags, setTags] = useState<Set<string>>(new Set());
    const { setWhitelist } = useShutterValidators();
    const [localWhitelist, setLocalWhitelist] = useState<Set<number>>(new Set());

    useEffect(() => {
        setWhitelist(localWhitelist);
    }, [localWhitelist, setWhitelist]);

    const handleClick = useCallback(
        (tag: string) => {
            setTags((prevTags) => {
                const newTags = new Set(prevTags);
                const newWhitelist = new Set(localWhitelist);

                if (newTags.has(tag)) {
                    newTags.delete(tag);
                    whiteList[tag].forEach((id) => newWhitelist.delete(id));
                } else {
                    newTags.add(tag);
                    whiteList[tag].forEach((id) => newWhitelist.add(id));
                }

                setLocalWhitelist(newWhitelist);
                return newTags;
            });
        },
        [localWhitelist]
    );

    return (
        <div className="w-full flex flex-col my-4">
            <div className="w-full py-1 mb-4 flex items-center border-b border-b-white hover:text-white/70 hover:cursor-pointer" onClick={() => setIsWhitelistOpen(!isWhitelistOpen)}>
                WhiteList {isWhitelistOpen ? <ChevronDownIcon className="h-[18px] w-[18px] ml-2" /> : <ChevronRightIcon className="h-[18px] w-[18px] ml-2" />}
            </div>
            <div className={`flex gap-x-2 overflow-hidden transition-all ease-in-out duration-300 ${isWhitelistOpen ? "max-h-48" : "max-h-0"}`}>
                {Object.keys(whiteList).map((tag) => (
                    <p
                        id={tag}
                        key={tag}
                        className={`px-6 py-1 flex text-xs items-center hover:cursor-pointer border border-white rounded-full ${tags.has(tag) ? "bg-white text-primary" : ""}`}
                        onClick={() => handleClick(tag)}
                    >
                        {tag}
                    </p>
                ))}
            </div>
        </div>
    );
};
