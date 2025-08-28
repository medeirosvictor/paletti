type Props = {
    cluster: Array<string> | null;
    title: string;
};

function HexCluster({ cluster, title }: Props) {
    return (
        <div className="flex flex-col gap-1 my-5 items-center">
            <h3 className="text-xl font-bold">{title}</h3>
            <div className="flex flex-wrap justify-center">
                {cluster &&
                    cluster.map((hex, index) => (
                        <div
                            key={index}
                            className="min-w-[70px] min-h-[70px] flex items-center justify-center text-white font-bold text-xs"
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
