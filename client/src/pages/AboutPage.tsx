/*
 * GADGET STYLE — About Page
 * Blue corporate identity, editorial storytelling with brand values
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Target, Eye, Zap, Shield } from "lucide-react";

/* Blue GS logo — concentric ring G with flowing S */
const GS_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663395363177/nZmSiQVXzc25kuuG4eCQev/logo_blue_v2-ZhrJEA2VoZxipLuGZMBdr4.png";

export default function AboutPage() {
  const values = [
    {
      icon: Eye,
      title: "Curated, Not Cluttered",
      description: "We hand-pick every product. If it doesn't meet our standards for design, functionality, and value, it doesn't make the cut.",
    },
    {
      icon: Shield,
      title: "Independent Reviews",
      description: "Our editorial team tests products hands-on. We never accept paid placements or let advertisers influence our recommendations.",
    },
    {
      icon: Zap,
      title: "Tech-Forward",
      description: "We focus on innovation — products that push boundaries, solve real problems, or simply make life more enjoyable.",
    },
    {
      icon: Target,
      title: "Value-Driven",
      description: "Great tech doesn't have to break the bank. We highlight the best products at every price point, from budget picks to premium splurges.",
    },
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="container">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={GS_ICON} alt="GS" className="h-14 w-auto" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              GADGET <span className="text-primary">STYLE</span>
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold font-display mb-5 leading-tight">
            We Find the Best Tech
            <br />
            <span className="text-primary">So You Don't Have To</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Gadget Style is a curated product discovery platform for tech enthusiasts, gadget lovers, and anyone who appreciates well-designed technology. We sift through thousands of products to bring you only the ones worth your attention.
          </p>
        </motion.div>

        {/* Values grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-16">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <value.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold font-display mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card p-8 lg:p-12 text-center"
        >
          <h2 className="text-2xl font-bold font-display mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded by tech enthusiasts who were tired of wading through endless product listings and biased reviews, Gadget Style was born from a simple idea: what if there was a place that only showed you the good stuff?
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Today, our editorial team reviews hundreds of products each month across categories like smart home, audio, gaming, wearables, and outdoor tech. We combine hands-on testing with data-driven analysis to deliver recommendations you can trust.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
