"use client";

import { useEffect, useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { ArrowRight, Check, Upload, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { env } from "@/lib/env/client";

type PublicJob = {
  title: string;
  department: string | null;
  employment_type: string;
  role_category: string | null;
  work: { mode: string; remote_scope: string | null; country: string; state: string | null; city: string | null };
  description: string | null;
  organization: { name: string; slug: string };
  eligibility: { currency: string; salary_min: number | null; salary_max: number | null; experience_min_years: number | null; experience_max_years: number | null; notice_period_max_days: number | null; relocation_assistance: boolean; visa_sponsorship: boolean; work_authorization_required: boolean; minimum_education_level: string | null };
  submission_requirements: { resume_required: boolean; github_required: boolean; portfolio_required: boolean; problem_solving_profile_required: boolean; linkedin_required: boolean; project_explanation_required: boolean; feature_explanation_required: boolean; zip_upload_allowed: boolean };
};

type Props = { orgSlug: string; jobSlug: string };

export function PublicJobApplication({ orgSlug, jobSlug }: Props) {
  const [job, setJob] = useState<PublicJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const countries = useMemo(() => Country.getAllCountries(), []);
  const countryCode = countries.find((item) => item.name === country)?.isoCode ?? "";
  const states = useMemo(() => countryCode ? State.getStatesOfCountry(countryCode) : [], [countryCode]);
  const stateCode = states.find((item) => item.name === state)?.isoCode ?? "";
  const cities = useMemo(() => countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [], [countryCode, stateCode]);

  useEffect(() => {
    fetch(`${env.NEXT_PUBLIC_API_URL}/public/organizations/${encodeURIComponent(orgSlug)}/jobs/${encodeURIComponent(jobSlug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message ?? "This role is no longer available.");
        setJob(data.job);
        setCountry(data.job.work.country ?? "");
        setState(data.job.work.state ?? "");
        setCity(data.job.work.city ?? "");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load this role."));
  }, [jobSlug, orgSlug]);

  if (error) return <StateMessage>{error}</StateMessage>;
  if (!job) return <StateMessage>Opening this role...</StateMessage>;
  if (submitted) return <SuccessMessage organization={job.organization.name} title={job.title} />;

  const requirements = job.submission_requirements;
  const locationMismatch = country && country !== job.work.country;
  const remoteRestricted = job.work.mode === "REMOTE" && job.work.remote_scope !== "GLOBAL";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(null);
    const form = new FormData(event.currentTarget);
    const eligibility = {
      yearsOfProfessionalExperience: Number(form.get("yearsOfProfessionalExperience")),
      highestEducationLevel: String(form.get("highestEducationLevel") || "NONE"),
      noticePeriodDays: Number(form.get("noticePeriodDays")),
      willingToRelocate: form.get("willingToRelocate") === "on",
      requiresVisaSponsorship: form.get("requiresVisaSponsorship") === "on",
      workAuthorized: form.get("workAuthorized") === "on",
      currentCountry: String(form.get("currentCountry")), currentCountryCode: countryCode || undefined, currentState: String(form.get("currentState") || ""), currentStateCode: stateCode || undefined, currentCity: String(form.get("currentCity") || ""),
    };
    const submission = {
      githubUrl: String(form.get("githubUrl")), portfolioUrl: String(form.get("portfolioUrl") || ""), linkedinUrl: String(form.get("linkedinUrl") || ""),
      problemSolvingProfileUrl: String(form.get("problemSolvingProfileUrl") || ""), projectDescription: String(form.get("projectDescription") || ""), featureDescription: String(form.get("featureDescription") || ""),
    };
    const payload = new FormData();
    for (const key of ["firstName", "lastName", "email", "phone"]) payload.append(key, String(form.get(key) || ""));
    payload.append("eligibility", JSON.stringify(eligibility)); payload.append("submission", JSON.stringify(submission)); payload.append("technologies", "[]"); payload.append("concepts", "[]");
    const resume = form.get("resume"); if (resume instanceof File) payload.append("resume", resume);
    try {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/public/organizations/${encodeURIComponent(orgSlug)}/jobs/${encodeURIComponent(jobSlug)}/applications`, { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Application could not be submitted.");
      setSubmitted(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Application could not be submitted."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-paper text-ink"><header className="border-b border-forest/12 bg-paper/90 px-6 py-5 backdrop-blur md:px-10"><div className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-forest text-paper"><Sparkles className="size-4" /></span><span className="font-mono text-sm uppercase tracking-[.18em] text-forest">{job.organization.name}</span></div><span className="rounded-full border border-forest/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-olive">Application</span></div></header><div className="mx-auto max-w-6xl px-6 pb-28 md:px-10"><section className="border-b border-forest/12 py-16 md:py-20"><div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[.16em] text-olive"><span>{job.role_category ?? "Open role"}</span><span className="text-forest/35">/</span><span>{job.employment_type}</span></div><h1 className="mt-6 max-w-[16ch] text-5xl font-light leading-[.94] tracking-[-.055em] md:text-7xl">{job.title}</h1><p className="mt-7 max-w-[62ch] text-lg leading-relaxed text-moss md:text-xl">{job.description || "Bring the work you are proud of. Tell us clearly where you are and what you can do."}</p><LocationSummary job={job} /></section><form onSubmit={submit} className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_19rem]"><div className="space-y-14"><Section title="01 · About you"><div className="grid gap-7 sm:grid-cols-2"><Input name="firstName" label="First name" required /><Input name="lastName" label="Last name" required /><Input name="email" label="Email" type="email" required /><Input name="phone" label="Phone" /></div></Section><Section title="02 · Your location"><p className="mb-6 max-w-2xl text-sm leading-relaxed text-moss">Use the same place naming shown above when it applies. This helps us assess the role&apos;s location boundary accurately.</p><LocationFields country={country} state={state} city={city} countries={countries} states={states} cities={cities} onCountry={(value) => { setCountry(value); setState(""); setCity(""); }} onState={(value) => { setState(value); setCity(""); }} onCity={setCity} /></Section><Section title="03 · Eligibility"><div className="grid gap-7 sm:grid-cols-2"><Input name="yearsOfProfessionalExperience" label="Professional experience (years)" type="number" required /><Input name="noticePeriodDays" label="Notice period (days)" type="number" required /><Select name="highestEducationLevel" label="Highest education" options={["NONE", "HIGH_SCHOOL", "DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"]} /><CheckField name="workAuthorized" required>Legally authorized to work in this location</CheckField></div><div className="mt-7 space-y-4"><CheckField name="requiresVisaSponsorship">I need visa sponsorship for this role</CheckField><CheckField name="willingToRelocate">I am willing to relocate if this role requires it</CheckField></div>{locationMismatch && !job.eligibility.relocation_assistance && <Warning>Are you willing to relocate to {job.work.city || job.work.state || job.work.country} on your own? Relocation assistance is not configured for this role.</Warning>}{remoteRestricted && <Warning>This role is remote only within the stated boundary. Enter your current location exactly as it applies: {job.work.remote_scope === "COUNTRY" ? job.work.country : `${job.work.state || "the stated region"}, ${job.work.country}`}.</Warning>}{job.eligibility.visa_sponsorship && <p className="mt-5 text-sm text-olive">Visa sponsorship may be available for candidates who otherwise meet the work authorization requirements.</p>}</Section><Section title="04 · Required proof"><p className="mb-6 max-w-2xl text-sm leading-relaxed text-moss">Show us the work you want to be considered for. A resume and GitHub profile are required for every application.</p><div className="space-y-7"><FileInput /><Input name="githubUrl" label="GitHub profile" type="url" required />{requirements.portfolio_required && <Input name="portfolioUrl" label="Portfolio" type="url" required />}{requirements.linkedin_required && <Input name="linkedinUrl" label="LinkedIn" type="url" required />}{requirements.problem_solving_profile_required && <Input name="problemSolvingProfileUrl" label="Problem-solving profile" type="url" required />}{requirements.project_explanation_required && <TextArea name="projectDescription" label="Project explanation" required />}{requirements.feature_explanation_required && <TextArea name="featureDescription" label="Feature explanation" required />}</div></Section><div className="flex flex-wrap items-center gap-5 border-t border-forest/12 pt-8"><button disabled={busy} className="group inline-flex items-center gap-4 rounded-sm bg-forest px-6 py-4 font-mono text-sm uppercase tracking-[.14em] text-paper transition-colors hover:bg-moss disabled:opacity-50">{busy ? "Submitting..." : "Submit application"}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}</div></div><aside className="lg:pt-2"><div className="space-y-8 lg:sticky lg:top-8"><div className="rounded-sm bg-forest p-7 text-paper shadow-[0_18px_45px_rgba(18,55,41,.14)]"><ShieldCheck className="size-5 text-sage" /><p className="mt-7 font-mono text-xs uppercase tracking-[.16em] text-sage">A clear process</p><p className="mt-4 text-2xl font-light leading-snug">Tell us what you built. Trace helps the team review the evidence behind it.</p></div><div className="border-l-2 border-olive/50 pl-5"><p className="font-mono text-xs uppercase tracking-[.16em] text-olive">Before you submit</p><p className="mt-3 text-sm leading-relaxed text-moss">Your location and authorization answers are checked against this role&apos;s requirements.</p></div></div></aside></form></div></main>;
}

function LocationSummary({ job }: { job: PublicJob }) { return <div className="mt-9 flex items-center gap-3 border-t border-forest/12 pt-5 text-sm uppercase tracking-[.12em] text-olive"><MapPin className="size-4 text-forest" />{job.work.mode === "REMOTE" ? `Remote · ${job.work.remote_scope ?? "stated boundary"}` : `${job.work.city ? `${job.work.city}, ` : ""}${job.work.state ? `${job.work.state}, ` : ""}${job.work.country}`}</div>; }
function LocationFields({ country, state, city, countries, states, cities, onCountry, onState, onCity }: { country: string; state: string; city: string; countries: ReturnType<typeof Country.getAllCountries>; states: ReturnType<typeof State.getStatesOfCountry>; cities: ReturnType<typeof City.getCitiesOfState>; onCountry: (value: string) => void; onState: (value: string) => void; onCity: (value: string) => void }) { return <div className="grid gap-6 sm:grid-cols-3"><Select name="currentCountry" label="Country" value={country} onChange={onCountry} options={countries.map((item) => item.name)} required /><Select name="currentState" label="State / region" value={state} onChange={onState} options={states.map((item) => item.name)} required={states.length > 0} /><Select name="currentCity" label="City" value={city} onChange={onCity} options={cities.map((item) => item.name)} /></div>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border-t border-forest/12 pt-9"><h2 className="font-mono text-xs uppercase tracking-[.2em] text-forest">{title}</h2><div className="mt-7">{children}</div></section>; }
function Input({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="block text-sm text-forest">{label}{required && <span className="ml-2 font-mono text-[10px] uppercase text-destructive">Required</span>}<input name={name} type={type} required={required} className="mt-2 w-full border-0 border-b border-forest/20 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-olive/50 focus:border-forest focus:ring-0" /></label>; }
function TextArea({ name, label, required = false }: { name: string; label: string; required?: boolean }) { return <label className="block text-sm text-forest">{label}{required && <span className="ml-2 font-mono text-[10px] uppercase text-destructive">Required</span>}<textarea name={name} required={required} rows={4} className="mt-2 w-full resize-y border border-forest/20 bg-warm/50 p-4 text-base leading-relaxed outline-none transition-colors focus:border-forest" /></label>; }
function Select({ name, label, options, value, onChange, required = false }: { name: string; label: string; options: string[]; value?: string; onChange?: (value: string) => void; required?: boolean }) { return <label className="block text-sm text-forest">{label}{required && <span className="ml-2 font-mono text-[10px] uppercase text-destructive">Required</span>}<select name={name} value={value} onChange={(event) => onChange?.(event.target.value)} required={required} className="mt-2 w-full border-0 border-b border-forest/20 bg-transparent py-3 text-base outline-none transition-colors focus:border-forest focus:ring-0"><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>; }
function CheckField({ name, children, required = false }: { name: string; children: React.ReactNode; required?: boolean }) { return <label className="flex items-start gap-3 text-base leading-relaxed text-moss"><input name={name} type="checkbox" required={required} className="mt-1 size-4 accent-forest" /> <span>{children}</span></label>; }
function FileInput() { return <label className="block text-sm text-forest">Resume (PDF or DOCX)<span className="ml-2 font-mono text-[10px] uppercase text-destructive">Required</span><span className="mt-3 flex cursor-pointer items-center gap-4 rounded-sm border border-dashed border-forest/25 bg-warm/35 px-4 py-5 text-base text-olive transition-colors hover:border-forest hover:bg-warm"><Upload className="size-5 text-forest" /><span>Choose a file<span className="block text-xs text-olive/70">PDF or DOCX · required</span></span><input name="resume" type="file" accept=".pdf,.doc,.docx" required className="sr-only" /></span></label>; }
function Warning({ children }: { children: React.ReactNode }) { return <p className="mt-5 border-l-2 border-conflict bg-conflict/5 px-5 py-4 text-sm leading-relaxed text-ink" role="alert">{children}</p>; }
function StateMessage({ children }: { children: React.ReactNode }) { return <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-lg text-olive">{children}</main>; }
function SuccessMessage({ organization, title }: { organization: string; title: string }) { return <main className="min-h-screen bg-paper px-6 py-8 text-ink"><div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center"><span className="font-mono text-xs uppercase tracking-[.2em] text-olive">{organization} · Application received</span><div className="mt-8 grid size-16 place-items-center rounded-full bg-forest text-paper"><Check className="size-7" /></div><h1 className="mt-8 max-w-[14ch] text-5xl font-light leading-[.95] tracking-[-.05em] md:text-7xl">You&apos;re in the review.</h1><p className="mt-7 max-w-xl text-xl leading-relaxed text-moss">Your application for <span className="text-ink">{title}</span> has been received. The team will review the details and evidence you shared.</p><div className="mt-12 border-t border-forest/12 pt-5 font-mono text-xs uppercase tracking-[.16em] text-olive">You can close this page now.</div></div></main>; }
