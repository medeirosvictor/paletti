type Props = {
    cluster: Array<string> | null;
    title: string;
};

function HexCluster({ cluster, title }: Props) {
    return (
        <div className="flex flex-col gap-1 my-5 items-center">
            <h3 className="text-xl">{title}</h3>
            <div className="flex gap-0.5">
                {cluster &&
                    cluster.map((hex, index) => (
                        <div
                            key={index}
                            className="rounded-3xl w-[70px] h-[70px] flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: hex }}
                        >
                            {hex}
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default HexCluster;
