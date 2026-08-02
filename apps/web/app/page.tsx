// apps/web/app/page.tsx – no changes needed
import { Hero } from "@/components/marketing/hero";
import { ChapterIntroduction } from "@/components/marketing/chapter-introduction";
import { PainWeekendLoop } from "@/components/marketing/pain-weekend-loop";

export default function Home() {
  return (
    <main>
      <Hero />
      <ChapterIntroduction />
      <PainWeekendLoop />
    </main>
  );
}