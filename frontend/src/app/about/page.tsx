import Link from "next/link"
import { ArrowRight, BarChart3, BookOpen, Shield, Target, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
          About <span className="text-primary">StockSage-AI</span>
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Empowering the next generation of investors with AI-powered insights and risk-free trading.
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-6">
              At StockSage-AI, we believe that financial education and market experience should be accessible to
              everyone, regardless of their financial situation or risk tolerance.
            </p>
            <p className="text-lg mb-6">
              We've created a platform that combines advanced artificial intelligence with real-time market data to
              provide a risk-free environment where students and professionals can learn, practice, and refine their
              trading strategies.
            </p>
            <p className="text-lg">
              Our goal is to democratize financial literacy and empower the next generation of investors with the tools
              and knowledge they need to succeed in the real market when they're ready.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-2">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Education</h3>
                <p className="text-muted-foreground">Learn market fundamentals without financial risk</p>
              </CardContent>
            </Card>
            <Card className="p-2">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Practice</h3>
                <p className="text-muted-foreground">Test strategies with realistic market simulations</p>
              </CardContent>
            </Card>
            <Card className="p-2">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Safety</h3>
                <p className="text-muted-foreground">Trade without risking real capital</p>
              </CardContent>
            </Card>
            <Card className="p-2">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Growth</h3>
                <p className="text-muted-foreground">Build confidence before entering real markets</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Founders</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {founders.map((founder) => (
            <Card key={founder.name} className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{founder.name}</h3>
                  <p className="text-primary mb-2">{founder.title}</p>
                  <p className="text-muted-foreground">{founder.bio}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-4 sm:px-6 md:px-8 rounded-2xl bg-primary/5 border border-primary/20">
        <h2 className="text-3xl font-bold mb-4">Ready to start your risk-free trading journey?</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
          Join thousands of students and professionals who are building their trading skills with StockSage-AI.
        </p>
        <Button size="lg" className="text-lg px-8 py-6 rounded-full" asChild>
          <Link href="/signup">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  )
}


// Founder data
const founders = [
    {
      name: "James Paul",
      title: "Co-Founder & Product Lead",
      bio: "Experienced in developing innovative tech solutions and user-centered design.",
      image: "/placeholder.svg?height=200&width=200", // No actual image, placeholder is used
    },
    {
      name: "Somin Park",
      title: "Co-Founder & Full-Stack Developer",
      bio: "Skilled in building scalable applications and passionate about tech-driven education.",
      image: "/placeholder.svg?height=200&width=200", // No actual image, placeholder is used
    },
    {
      name: "Akshat Joshi",
      title: "Co-Founder & CTO",
      bio: "Tech entrepreneur focused on AI integration for financial platforms and real-time data.",
      image: "/placeholder.svg?height=200&width=200", // No actual image, placeholder is used
    },
    {
      name: "Wilson Qiu",
      title: "Co-Founder & Operations Manager",
      bio: "Strong background in managing operations and optimizing user experiences in fintech.",
      image: "/placeholder.svg?height=200&width=200", // No actual image, placeholder is used
    },
];