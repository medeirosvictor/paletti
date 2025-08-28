type Props = {};

function HowItWorks({}: Props) {
    return (
        <div className="flex flex-col justify-center items-center w-5/6 mx-auto">
            <div className="text-5xl mb-5">Important Disclaimers</div>
            <div className="flex flex-col gap-10">
                <div className="text-3xl font-bold">
                    We do not store any of your uploaded data — all processing
                    happens locally on your device.
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold">Why register or log in?</h3>
                    <div>
                        Registering allows us to save your color palette
                        suggestions, so you can easily access previous results.
                        Since the recommendations are generated using LLMs, the
                        final output may vary slightly. While we aim to provide
                        accurate suggestions for your skin tone, results may not
                        always be identical.
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold">How does it work?</h3>
                    <ul className="flex flex-col list-disc px-4">
                        <li>
                            Upload an image file or capture one using your
                            device camera.
                        </li>
                        <li>We compress the image to optimize its size.</li>
                        <li>
                            Using the face-api.js library, we detect your facial
                            landmarks (cheeks, jawline, eyes, etc.).
                        </li>
                        <li>
                            We extract pixel color data from your face image.
                        </li>
                        <li>
                            We run K-Means clustering to determine 3 main HEX
                            values representing your average skin tones.
                        </li>
                        <li>
                            These values are sent to an LLM API (like ChatGPT)
                            to generate color palette suggestions based on color
                            theory and your skin tone.
                        </li>
                        <li>
                            The results are displayed on your screen. If you’re
                            logged in, the palette is saved to your account —
                            this is the only information stored outside your
                            local environment.
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold">
                        I want to delete my account/data
                    </h3>
                    <div>
                        Absolutely — you can delete your data at any time by
                        clicking here.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowItWorks;
