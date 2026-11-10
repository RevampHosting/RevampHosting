import type { Metadata } from "next";
import { images } from "@/config/images";
import { projectCategories, projects } from "@/config/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { CtaBanner } from "@/components/sections/cta-banner";
import { PageHero } from "@/components/sections/page-hero";
import { ProjectGallery } from "@/components/sections/project-gallery";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Browse completed construction, remodeling, carpentry, deck, and flooring projects.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={
          <>
            Built by hand. <span className="text-lime">Proven on site.</span>
          </>
        }
        intro="Explore a selection of our completed projects. Filter by category and click any photo to see it in full detail."
        image={images.modernInterior}
      />
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <ProjectGallery projects={projects} categories={projectCategories} />
        </div>
      </section>
      <CtaBanner phone={settings.phone} title="Like what you see?" />
    </>
  );
}
