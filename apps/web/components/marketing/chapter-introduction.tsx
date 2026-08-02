"use client";

import { ChapterMark } from "@/components/editorial/ChapterMark";
import { EditorialContainer } from "@/components/editorial/EditorialContainer";
import { EditorialParagraph } from "@/components/editorial/EditorialParagraph";
import { EditorialRule } from "../editorial/ EditorialRule";
import { Reveal } from "@/components/editorial/Reveal";
import { SectionHeading } from "@/components/editorial/SectionHeading";

export function ChapterIntroduction() {
  return (
    <section className="bg-paper text-ink">
      <EditorialContainer spacing="xl" width="editorial">
        <div className="grid gap-20 lg:grid-cols-12">
          {/* Left editorial column */}
          <div className="lg:col-span-5">
            <ChapterMark index="01" label="The Diagnosis" />

            <Reveal className="mt-12">
              {/* 👇 Use size="hero" to apply display-hero */}
              <SectionHeading size="hero">
                Hiring
                <br />
                already
                <br />
                failed.
              </SectionHeading>
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <EditorialRule width="md" />
            </Reveal>
          </div>

          {/* Right narrative */}
          <div className="lg:col-span-7 lg:pt-36">
            <Reveal delay={0.25}>
              <EditorialParagraph width="md">
                Not after interviews.
              </EditorialParagraph>
            </Reveal>

            <Reveal delay={0.35} className="mt-8">
              <EditorialParagraph width="md">
                Before anyone opened the first resume.
              </EditorialParagraph>
            </Reveal>

            <Reveal delay={0.5} className="mt-16">
              <EditorialParagraph width="lg">
                Hiring rarely fails because engineering teams cannot
                recognize good engineers. It fails because the process
                begins without enough context about the role itself.
              </EditorialParagraph>
            </Reveal>

            <Reveal delay={0.65} className="mt-12">
              <blockquote className="border-l border-forest pl-8">
                <p className="display-large max-w-[18ch] italic text-forest">
                  Hiring begins when you know who you're looking for.
                </p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </EditorialContainer>
    </section>
  );
}