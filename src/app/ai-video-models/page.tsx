import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ExternalLink,
  Play,
  Sparkles,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Best AI Video Generation Models (2026) | Directory",
  description:
    "Comprehensive directory of the best AI video generation models in 2026. Compare Sora, Veo 3, Kling, Runway Gen-4, MiniMax, and more.",
  openGraph: {
    title: "Best AI Video Generation Models (2026)",
    description:
      "Compare the top AI video generators: Sora, Veo 3, Kling, Runway Gen-4, MiniMax, and more.",
  },
};

type PricingTier = "Free" | "Freemium" | "Paid" | "Enterprise" | "Open Source";

interface AIVideoModel {
  name: string;
  company: string;
  description: string;
  url: string;
  maxDuration: string;
  maxResolution: string;
  pricing: PricingTier;
  pricingNote?: string;
  rating: number; // 1-5
  features: string[];
  strengths: string[];
  releaseYear: number;
  category: "Commercial" | "Open Source" | "Research";
  highlighted?: boolean;
}

const models: AIVideoModel[] = [
  {
    name: "Veo 3",
    company: "Google DeepMind",
    description:
      "Google's flagship video generation model with native audio generation, producing cinematic-quality videos with synchronized sound effects, dialogue, and ambient audio.",
    url: "https://deepmind.google/technologies/veo/",
    maxDuration: "8 seconds",
    maxResolution: "4K",
    pricing: "Freemium",
    pricingNote: "Via Google AI Studio & Vertex AI",
    rating: 5,
    features: [
      "Native audio generation",
      "Text-to-video",
      "Image-to-video",
      "Cinematic camera controls",
      "Synchronized dialogue",
      "Physics-aware rendering",
    ],
    strengths: [
      "Best-in-class audio sync",
      "Photorealistic output",
      "Excellent prompt adherence",
      "Natural physics simulation",
    ],
    releaseYear: 2025,
    category: "Commercial",
    highlighted: true,
  },
  {
    name: "Sora",
    company: "OpenAI",
    description:
      "OpenAI's world-simulation video model capable of generating realistic and imaginative scenes from text instructions, with strong temporal coherence and creative flexibility.",
    url: "https://openai.com/sora",
    maxDuration: "60 seconds",
    maxResolution: "1080p",
    pricing: "Paid",
    pricingNote: "Included with ChatGPT Plus/Pro",
    rating: 5,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Video-to-video",
      "Storyboard mode",
      "Variable aspect ratios",
      "Long-form generation",
    ],
    strengths: [
      "Longest generation duration",
      "Strong creative understanding",
      "Excellent temporal coherence",
      "Versatile aspect ratios",
    ],
    releaseYear: 2024,
    category: "Commercial",
    highlighted: true,
  },
  {
    name: "Kling 2.0",
    company: "Kuaishou",
    description:
      "Advanced video generation model from Kuaishou with exceptional motion quality, supporting up to 4K resolution and featuring industry-leading character consistency.",
    url: "https://klingai.com",
    maxDuration: "10 minutes",
    maxResolution: "4K",
    pricing: "Freemium",
    pricingNote: "Free tier available, Pro plans from $8/mo",
    rating: 5,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Motion brush",
      "Lip sync",
      "Virtual try-on",
      "Extended video generation",
    ],
    strengths: [
      "Excellent motion quality",
      "Long video support",
      "Character consistency",
      "Affordable pricing",
    ],
    releaseYear: 2025,
    category: "Commercial",
    highlighted: true,
  },
  {
    name: "Runway Gen-4",
    company: "Runway",
    description:
      "Runway's latest generation model focused on consistent characters, locations, and objects across scenes, enabling coherent multi-shot storytelling.",
    url: "https://runwayml.com",
    maxDuration: "40 seconds",
    maxResolution: "4K",
    pricing: "Paid",
    pricingNote: "From $15/mo",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Character consistency",
      "Scene coherence",
      "Custom style references",
      "API access",
    ],
    strengths: [
      "Multi-shot consistency",
      "Professional workflow integration",
      "Strong API ecosystem",
      "Creative control tools",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
  {
    name: "MiniMax (Hailuo AI)",
    company: "MiniMax",
    description:
      "Chinese AI lab's video model known for natural human motion and expressions, offering competitive quality at accessible pricing with strong character animation.",
    url: "https://hailuoai.video",
    maxDuration: "6 seconds",
    maxResolution: "1080p",
    pricing: "Freemium",
    pricingNote: "Free daily credits",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Subject reference",
      "Natural expressions",
      "Fast generation",
      "Director mode",
    ],
    strengths: [
      "Natural human motion",
      "Expressive faces",
      "Fast generation speed",
      "Generous free tier",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
  {
    name: "Pika 2.2",
    company: "Pika Labs",
    description:
      "Creative-focused video generation with unique special effects capabilities including Scene Ingredients for combining multiple reference images into cohesive videos.",
    url: "https://pika.art",
    maxDuration: "10 seconds",
    maxResolution: "1080p",
    pricing: "Freemium",
    pricingNote: "Free tier, Pro from $10/mo",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Scene Ingredients",
      "Special effects (Inflate, Melt, Explode)",
      "Lip sync",
      "Sound effects",
    ],
    strengths: [
      "Unique creative effects",
      "Scene composition from references",
      "User-friendly interface",
      "Fun creative tools",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
  {
    name: "Luma Dream Machine 2.0",
    company: "Luma AI",
    description:
      "Ray2 model powering Dream Machine delivers fast, high-quality video generation with strong 3D understanding and realistic physics simulation.",
    url: "https://lumalabs.ai/dream-machine",
    maxDuration: "10 seconds",
    maxResolution: "1080p",
    pricing: "Freemium",
    pricingNote: "Free tier, Pro from $9.99/mo",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Camera controls",
      "Keyframe animation",
      "Fast generation",
      "3D-aware rendering",
    ],
    strengths: [
      "Fast generation speed",
      "Good 3D understanding",
      "Realistic physics",
      "Competitive pricing",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
  {
    name: "Wan 2.1",
    company: "Alibaba (Tongyi Lab)",
    description:
      "Open-source video generation model from Alibaba achieving state-of-the-art results, available in multiple sizes from 1.3B to 14B parameters for local deployment.",
    url: "https://github.com/Wan-Video/Wan2.1",
    maxDuration: "5 seconds",
    maxResolution: "1080p",
    pricing: "Open Source",
    pricingNote: "Apache 2.0 license",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Multiple model sizes",
      "Local deployment",
      "Community fine-tuning",
      "LoRA support",
    ],
    strengths: [
      "Fully open source",
      "Multiple model sizes",
      "Active community",
      "No usage limits",
    ],
    releaseYear: 2025,
    category: "Open Source",
    highlighted: true,
  },
  {
    name: "CogVideoX",
    company: "Zhipu AI (THUDM)",
    description:
      "Open-source video generation model with expert transformer architecture, offering strong text-video alignment and supporting both text-to-video and image-to-video generation.",
    url: "https://github.com/THUDM/CogVideo",
    maxDuration: "6 seconds",
    maxResolution: "720p",
    pricing: "Open Source",
    pricingNote: "Apache 2.0 license",
    rating: 3,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Expert transformer architecture",
      "3D VAE",
      "Local deployment",
      "Fine-tuning support",
    ],
    strengths: [
      "Open source",
      "Good text alignment",
      "Efficient architecture",
      "Research-friendly",
    ],
    releaseYear: 2024,
    category: "Open Source",
  },
  {
    name: "Stable Video Diffusion (SVD)",
    company: "Stability AI",
    description:
      "Stability AI's open video generation model based on Stable Diffusion, primarily focused on image-to-video generation with smooth temporal consistency.",
    url: "https://stability.ai/stable-video",
    maxDuration: "4 seconds",
    maxResolution: "1024x576",
    pricing: "Open Source",
    pricingNote: "Community license",
    rating: 3,
    features: [
      "Image-to-video",
      "Frame interpolation",
      "Multi-view synthesis",
      "Local deployment",
      "ComfyUI integration",
      "Fine-tuning support",
    ],
    strengths: [
      "Large community ecosystem",
      "ComfyUI workflows",
      "Good for animation",
      "Extensible architecture",
    ],
    releaseYear: 2024,
    category: "Open Source",
  },
  {
    name: "Vidu 2.0",
    company: "Shengshu Technology",
    description:
      "Chinese video generation model with strong multi-subject reference capabilities, enabling consistent character and style transfer across generated videos.",
    url: "https://www.vidu.com",
    maxDuration: "8 seconds",
    maxResolution: "1080p",
    pricing: "Freemium",
    pricingNote: "Free credits daily",
    rating: 4,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Multi-subject reference",
      "Style transfer",
      "Character consistency",
      "Scene blending",
    ],
    strengths: [
      "Multi-reference composition",
      "Character consistency",
      "Style flexibility",
      "Good free tier",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
  {
    name: "Pixverse V4",
    company: "Pixverse",
    description:
      "Video generation platform with strong anime and stylized content capabilities, featuring unique transition effects and creative templates for social media content.",
    url: "https://pixverse.ai",
    maxDuration: "8 seconds",
    maxResolution: "4K",
    pricing: "Freemium",
    pricingNote: "Free tier, Pro from $9.99/mo",
    rating: 3,
    features: [
      "Text-to-video",
      "Image-to-video",
      "Anime style",
      "Transition effects",
      "Templates",
      "4K upscaling",
    ],
    strengths: [
      "Anime/stylized content",
      "Creative transitions",
      "Social media templates",
      "4K output",
    ],
    releaseYear: 2025,
    category: "Commercial",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-primary text-primary"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function PricingBadge({ pricing }: { pricing: PricingTier }) {
  const variantMap: Record<
    PricingTier,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    Free: "default",
    Freemium: "secondary",
    Paid: "outline",
    Enterprise: "destructive",
    "Open Source": "default",
  };

  return (
    <Badge variant={variantMap[pricing]} className="text-xs">
      {pricing === "Open Source" ? "🔓 Open Source" : pricing}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className="text-xs">
      {category}
    </Badge>
  );
}

export default function AIVideoModelsPage() {
  const commercial = models.filter((m) => m.category === "Commercial");
  const openSource = models.filter((m) => m.category === "Open Source");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-6 w-6 text-primary fill-primary" />
            <span className="font-semibold text-lg">AI Video Directory</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#commercial"
              className="hover:text-foreground transition-colors"
            >
              Commercial
            </a>
            <a
              href="#open-source"
              className="hover:text-foreground transition-colors"
            >
              Open Source
            </a>
            <a
              href="#comparison"
              className="hover:text-foreground transition-colors"
            >
              Comparison
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Updated February 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Best AI Video Generation Models
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A comprehensive directory of the top AI video generation models.
          Compare features, pricing, quality, and find the right tool for your
          creative projects.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="h-4 w-4" /> {models.length} Models
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />{" "}
            {
              models.filter(
                (m) =>
                  m.pricing === "Free" ||
                  m.pricing === "Freemium" ||
                  m.pricing === "Open Source"
              ).length
            }{" "}
            Free Options
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Up to 10 min generation
          </span>
        </div>
      </section>

      {/* Commercial Models */}
      <section id="commercial" className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Commercial Models
        </h2>
        <p className="text-muted-foreground mb-8">
          Production-ready video generation platforms with APIs and web
          interfaces.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commercial.map((model) => (
            <ModelCard key={model.name} model={model} />
          ))}
        </div>
      </section>

      {/* Open Source Models */}
      <section id="open-source" className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Open Source Models
        </h2>
        <p className="text-muted-foreground mb-8">
          Self-hostable models you can run locally or fine-tune for your
          specific needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openSource.map((model) => (
            <ModelCard key={model.name} model={model} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Quick Comparison
        </h2>
        <p className="text-muted-foreground mb-8">
          Side-by-side comparison of key specifications across all models.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold">Model</th>
                <th className="text-left p-3 font-semibold">Company</th>
                <th className="text-left p-3 font-semibold">Max Duration</th>
                <th className="text-left p-3 font-semibold">Max Resolution</th>
                <th className="text-left p-3 font-semibold">Pricing</th>
                <th className="text-left p-3 font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, i) => (
                <tr
                  key={model.name}
                  className={`border-b last:border-0 ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  } ${model.highlighted ? "bg-primary/5" : ""}`}
                >
                  <td className="p-3 font-medium">
                    <a
                      href={model.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {model.name}
                    </a>
                  </td>
                  <td className="p-3 text-muted-foreground">{model.company}</td>
                  <td className="p-3">{model.maxDuration}</td>
                  <td className="p-3">{model.maxResolution}</td>
                  <td className="p-3">
                    <PricingBadge pricing={model.pricing} />
                  </td>
                  <td className="p-3">
                    <StarRating rating={model.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Last updated: February 2026. Ratings are based on output quality,
            feature set, and community feedback. Pricing and features may
            change.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ModelCard({ model }: { model: AIVideoModel }) {
  return (
    <Card
      className={`flex flex-col h-full transition-shadow hover:shadow-md ${
        model.highlighted ? "ring-1 ring-primary/30" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{model.name}</CardTitle>
            <CardDescription className="mt-1">{model.company}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <PricingBadge pricing={model.pricing} />
            <CategoryBadge category={model.category} />
          </div>
        </div>
        <StarRating rating={model.rating} />
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {model.description}
        </p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{model.maxDuration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{model.maxResolution}</span>
          </div>
        </div>

        {/* Features */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Key Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {model.features.slice(0, 4).map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="text-xs font-normal"
              >
                {feature}
              </Badge>
            ))}
            {model.features.length > 4 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{model.features.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Strengths
          </p>
          <ul className="text-sm space-y-1">
            {model.strengths.slice(0, 3).map((strength) => (
              <li key={strength} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">✦</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {model.pricingNote && (
          <p className="text-xs text-muted-foreground italic">
            {model.pricingNote}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <a
          href={model.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Visit {model.name} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
