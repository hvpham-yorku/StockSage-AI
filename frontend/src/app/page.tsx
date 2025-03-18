import { Header } from '@/components/Header';
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
    /*
        TODO
            Have user redirected to dashboard if logged in
        TODO

    */
    return (
        <div>
            <Header/>


            {/* 
            Call to action with Sign Up Button
            TODO Talk about maybe adding stock graphs below?
            */}
            <div className="container relative mx-auto px-4 py-24 flex h-screen items-center px-8">
                <div className="max-w-3xl text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-6">
                        <div className="flex items-center space-x-2 bg-primary rounded-full px-4 py-2">
                            <span className="font-semibold text-lg text-primary-foreground">StockSage-AI</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                        Trade Smarter with
                        <span className="block text-primary">AI-Powered Insights</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground mx-0">
                        StockSage-AI combines advanced artificial intelligence with real-time market data to help you make informed
                        investment decisions and maximize your returns.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Button size="lg" className="text-lg px-8 py-6 rounded-full" asChild>
                            <Link href="/signup">
                                Sign Up Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}