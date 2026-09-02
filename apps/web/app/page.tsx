// apps/web/app/page.tsx – no changes needed
import { Hero } from "@/components/marketing/hero";
import { ChapterIntroduction } from "@/components/marketing/chapter-introduction";
import { PainWeekendLoop } from "@/components/marketing/pain-weekend-loop";
import { ChapterRepetition } from "@/components/marketing/chapter-repetition";
import { ChapterRepository } from "@/components/marketing/github-chaos";
import { ChapterCost } from "@/components/marketing/chapter-cost";
import { ChapterTrace } from "@/components/marketing/chapter-trace";
import { ChapterCapabilities as ChapterOutcomes } from "@/components/marketing/chapter-outcomes";
import { ChapterReport } from "@/components/marketing/chapter-report";
import { ChapterBoundary } from "@/components/marketing/chapter-boundary";
import { ChapterCta } from "@/components/marketing/chapter-cta";
import { ChapterProcess } from "@/components/marketing/chapter-process";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ChapterIntroduction />
      <PainWeekendLoop />
      <ChapterRepetition />
      <ChapterRepository />
      <ChapterCost />
      <ChapterProcess />
      <ChapterTrace />
      <ChapterOutcomes />
      <ChapterReport />
      <ChapterBoundary />
      <ChapterCta />
      <Footer />
    </main>
  );
}
