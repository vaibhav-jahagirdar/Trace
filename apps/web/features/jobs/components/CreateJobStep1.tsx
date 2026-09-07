"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
} from "lucide-react";

import { Country, State, City } from "country-state-city";

import { useAuth } from "@/providers/auth-provider";


const ROLE_CATEGORY_API = `${process.env.NEXT_PUBLIC_API_URL}/job-role-categories`;

const EMPLOYMENT_TYPES = [
  {
    value: "FULL_TIME",
    label: "Full-time",
  },
  {
    value: "INTERNSHIP",
    label: "Internship",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "PART_TIME",
    label: "Part-time",
  },
] as const;

const WORK_MODES = [
  {
    value: "ONSITE",
    label: "On-site",
    description: "Works from the office or job location.",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    description: "Splits time between the office and remote work.",
  },
  {
    value: "REMOTE",
    label: "Remote",
    description: "No regular office attendance.",
  },
] as const;

const REMOTE_SCOPES = [
  {
    value: "GLOBAL",
    label: "Anywhere",
    description: "No geographic restriction.",
  },
  {
    value: "COUNTRY",
    label: "Within a country",
    description: "Candidate must be based in a specific country.",
  },
  {
    value: "REGION",
    label: "Within a region",
    description: "Candidate must be within a defined geographic region.",
  },
] as const;
type LocationFormValues = {
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
};

export const step1Schema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Job title is required")
      .max(255),

    role_category_id: z
      .string()
      .uuid("Select a role category"),

    department: z
      .string()
      .trim()
      .max(150)
      .optional(),

    employment_type: z.enum([
      "FULL_TIME",
      "INTERNSHIP",
      "CONTRACT",
      "PART_TIME",
    ]),

    work_mode: z.enum([
      "ONSITE",
      "HYBRID",
      "REMOTE",
    ]),

    remote_scope: z
      .enum([
        "NONE",
        "GLOBAL",
        "COUNTRY",
        "REGION",
      ])
      .optional(),

    country: z
      .string()
      .trim()
      .min(1, "Select a country")
      .max(100),
    country_code: z.string().length(2).optional(),

    state: z
      .string()
      .trim()
      .max(100)
      .optional(),
    state_code: z.string().max(10).optional(),

    city: z
      .string()
      .trim()
      .max(100)
      .optional(),

    open_positions: z
      .number()
      .int()
      .positive()
      .default(1),

    description: z
      .string()
      .trim()
      .max(10000)
      .optional(),
  })
  .superRefine((data, ctx) => {
    /*
     * Remote jobs have an explicit geographic policy.
     */
    if (data.work_mode === "REMOTE") {
      if (!data.remote_scope || data.remote_scope === "NONE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["remote_scope"],
          message: "Choose where remote candidates can work from.",
        });
      }

      /*
       * Country-scoped remote hiring needs a country.
       */
      if (data.remote_scope === "COUNTRY" && !data.country) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["country"],
          message: "Select the hiring country.",
        });
      }

      /*
       * Region-scoped remote hiring needs geographic context.
       */
      if (
        data.remote_scope === "REGION" &&
        (!data.country || !data.state)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["state"],
          message: "Select the country and region.",
        });
      }
    }

    /*
     * Office-based jobs need an actual working location.
     */
    if (
      (data.work_mode === "ONSITE" ||
        data.work_mode === "HYBRID") &&
      !data.country
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["country"],
        message: "Select the primary work location.",
      });
    }

    /*
     * remote_scope has no meaning for office-based jobs.
     */
    if (
      data.work_mode !== "REMOTE" &&
      data.remote_scope &&
      data.remote_scope !== "NONE"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["remote_scope"],
        message:
          "Remote hiring scope only applies to remote roles.",
      });
    }
  });

export type Step1Input = z.input<typeof step1Schema>;

/* =========================================================
   API Types
   ========================================================= */

type JobRoleCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

/* =========================================================
   Styles
   ========================================================= */

const inputClassName =
  "w-full border-0 border-b border-forest/20 bg-transparent px-0 py-3 text-[1.3rem] text-ink outline-none transition-colors placeholder:text-olive/45 focus:border-forest disabled:cursor-not-allowed disabled:opacity-40";



export function CreateJobStep1({
  initialData,
  onContinue,
}: {
  initialData?: Record<string, unknown>;
  onContinue?: (data: Step1Input & { role_category_code?: string }) => void;
}) {
  const { activeOrg } = useAuth();
  

  const [roleCategories, setRoleCategories] =
    useState<JobRoleCategory[]>([]);

  const [roleCategoriesLoading, setRoleCategoriesLoading] =
    useState(true);

  const [roleCategoriesError, setRoleCategoriesError] =
    useState<string | null>(null);

  /*
   * country-state-city is local data.
   * No backend lookup is required.
   */
  const countries = useMemo(
    () => Country.getAllCountries(),
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: {
      errors,
      isValid,
    },
  } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),

    mode: "onChange",

    defaultValues: {
      open_positions: 1,

      employment_type: "FULL_TIME",

      work_mode: "ONSITE",

      remote_scope: "NONE",

      country: "India",

      state: "Karnataka",

      city: "Bengaluru",
    },
  });

  const values = useWatch({
    control,
  });

  const selectedRoleCategory = roleCategories.find(
    (category) => category.id === values.role_category_id,
  );

  const workMode = values.work_mode;

  const employmentType =
    values.employment_type;

  const selectedCountry =
    countries.find(
      (country) =>
        country.name === values.country,
    );

  const countryCode =
    selectedCountry?.isoCode ?? "";

  const states = useMemo(() => {
    if (!countryCode) {
      return [];
    }

    return State.getStatesOfCountry(
      countryCode,
    );
  }, [countryCode]);

  const selectedState =
    states.find(
      (state) =>
        state.name === values.state,
    );

  const stateCode =
    selectedState?.isoCode ?? "";

  const cities = useMemo(() => {
    if (!countryCode || !stateCode) {
      return [];
    }

    return City.getCitiesOfState(
      countryCode,
      stateCode,
    );
  }, [countryCode, stateCode]);

  /* =======================================================
     Fetch role categories
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRoleCategories() {
      try {
        setRoleCategoriesLoading(true);
        setRoleCategoriesError(null);

        const response = await fetch(
          ROLE_CATEGORY_API,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load role categories.",
          );
        }

        const payload = await response.json();

        const categories =
          payload?.data ?? [];

        if (!cancelled) {
          setRoleCategories(categories);
        }
      } catch {
        if (!cancelled) {
          setRoleCategoriesError(
            "Role categories could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setRoleCategoriesLoading(false);
        }
      }
    }

    loadRoleCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     Restore draft
     ======================================================= */

  useEffect(() => {
    const savedData = initialData;
    if (!savedData) {
      return;
    }

    for (const [
      key,
      value,
    ] of Object.entries(
      savedData,
    )) {
      if (
        key in step1Schema.shape
      ) {
        setValue(
          key as keyof Step1Input,
          value as never,
          {
            shouldDirty: false,
            shouldValidate: true,
          },
        );
      }
    }
  }, [initialData, setValue]);

  /* =======================================================
     Work mode semantics
     ======================================================= */

  function handleWorkModeChange(
    mode: Step1Input["work_mode"],
  ) {
    setValue(
      "work_mode",
      mode,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    if (mode !== "REMOTE") {
      /*
       * On-site / Hybrid have a physical work location.
       * remote_scope therefore has no meaning.
       */
      setValue(
        "remote_scope",
        "NONE",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      return;
    }

    /*
     * Remote requires the recruiter to explicitly
     * define geographic eligibility.
     */
    if (
      !values.remote_scope ||
      values.remote_scope === "NONE"
    ) {
      setValue(
        "remote_scope",
        "GLOBAL",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    }
  }

  function handleRemoteScopeChange(
    scope: "GLOBAL" | "COUNTRY" | "REGION",
  ) {
    setValue(
      "remote_scope",
      scope,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    /*
     * GLOBAL means the candidate is not constrained
     * by country/region.
     *
     * However, the current DB has jobs.country NOT NULL.
     * Until that schema is changed, we preserve the existing
     * country value rather than inventing a fake value.
     */
    if (scope === "GLOBAL") {
      setValue(
        "state",
        "",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );

      setValue(
        "city",
        "",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    }
  }

  function handleCountryChange(
    countryName: string,
  ) {
    const country = countries.find(
      (item) =>
        item.name === countryName,
    );

    setValue(
      "country",
      countryName,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    /*
     * Changing country invalidates state + city.
     */
    setValue(
      "state",
      "",
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    setValue(
      "city",
      "",
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    /*
     * Explicitly touch country so the dependency chain
     * remains obvious.
     */
    void country;
  }

  function handleStateChange(
    stateName: string,
  ) {
    setValue(
      "state",
      stateName,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    /*
     * Changing state invalidates city.
     */
    setValue(
      "city",
      "",
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  /* =======================================================
     Submit
     ======================================================= */

  const onSubmit: SubmitHandler<
    Step1Input
  > = (data) => {
    onContinue?.({
      ...data,
      country_code: countryCode || undefined,
      state_code: stateCode || undefined,
      role_category_code: selectedRoleCategory?.code,
    });

  };

  /* =======================================================
     Render
     ======================================================= */

  return (
    <main className="min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-forest/12 bg-warm lg:flex lg:flex-col lg:items-center lg:py-6">
        <span className="grid size-8 place-items-center border border-forest/30 font-mono text-[0.75rem] text-forest">
          T
        </span>

        <div className="mt-24 flex flex-1 flex-col items-center gap-4">
          <span className="font-mono text-[0.8125rem] text-forest">
            01
          </span>

          <span className="h-14 w-px bg-forest" />

          <span className="font-mono text-[0.8125rem] text-olive/40">
            02
          </span>

          <span className="font-mono text-[0.8125rem] text-olive/40">
            03
          </span>

          <span className="font-mono text-[0.8125rem] text-olive/40">
            04
          </span>
        </div>

        <span className="[writing-mode:vertical-rl] font-mono text-[0.75rem] uppercase tracking-[0.2em] text-olive">
          Role brief
        </span>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-forest/12 bg-paper/95 px-6 py-5 backdrop-blur md:px-10 lg:px-14">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6">
            <span className="font-mono text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-forest lg:hidden">
              Trace
            </span>

            <span className="hidden font-mono text-[0.8125rem] uppercase tracking-[0.17em] text-olive sm:block">
              {activeOrg?.orgName ??
                "Hiring workspace"}{" "}
              · New role
            </span>

            <span className="ml-auto flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-[0.16em] text-olive">
              <Check
                className="size-3 text-forest"
                aria-hidden="true"
              />

              Ready
            </span>
          </div>
        </header>

        <main className="px-6 pb-28 md:px-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            {/* =================================================
                HERO
            ================================================= */}

            <section className="border-b border-forest/12 py-16 md:py-20">
              <p className="font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-olive">
                Trace · Define the hire
              </p>

              <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
                <div>
                  <h1
                    className="max-w-[20ch] text-5xl leading-[0.96] tracking-[-0.045em] text-ink md:text-6xl"
                    style={{
                      fontFamily:
                        "var(--font-primary)",
                      fontWeight: 400,
                    }}
                  >
                    A bad hire rarely starts
                    with a bad interview.
                  </h1>

                  <p
                    className="mt-4 max-w-[45ch] text-[1.625rem] font-light leading-snug tracking-[-0.005em] text-olive"
                    style={{
                      fontFamily:
                        "var(--font-primary)",
                    }}
                  >
                    It starts earlier—with not
                    being clear about who
                    you&apos;re hiring.
                  </p>
                </div>

                <blockquote className="border-l border-forest/25 pl-5 font-serif text-[1.4625rem] font-semibold italic leading-snug text-forest">
                  “10x engineer. Fast learner.
                  Strong problem solver.”
                </blockquote>
              </div>

              <div className="mt-12 grid gap-6 border-t border-forest/12 pt-6 md:grid-cols-[minmax(0,1fr)_15rem] md:items-start">
                <p
                  className="max-w-[60ch] text-[1.3rem] font-light leading-relaxed text-olive"
                  style={{
                    fontFamily:
                      "var(--font-sans)",
                  }}
                >
                  A polished job description can
                  still hide a vague decision.
                  Take ten minutes to define the
                  role properly before you spend
                  weeks paying for the
                  consequences.
                </p>

                <p className="font-mono text-[0.8125rem] uppercase tracking-[0.14em] leading-relaxed text-olive/70">
                  Salary · time-to-hire · senior
                  bandwidth · production risk
                </p>
              </div>
            </section>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-20">
              <form
                onSubmit={handleSubmit(
                  onSubmit,
                )}
                noValidate
              >
                <section aria-labelledby="role-heading">
                  <div className="flex items-end justify-between border-b border-forest/12 pb-5">
                    <div>
                      <p className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">
                        The decision
                      </p>

                      <h2
                        id="role-heading"
                        className="mt-2 text-[1.95rem] font-light tracking-[-0.035em]"
                        style={{
                          fontFamily:
                            "var(--font-primary)",
                        }}
                      >
                        Now define who
                        you&apos;re hiring.
                      </h2>

                      <p
                        className="mt-1 text-[1.1375rem] font-light text-olive"
                        style={{
                          fontFamily:
                            "var(--font-sans)",
                        }}
                      >
                        What is this person
                        actually being hired to
                        do?
                      </p>
                    </div>

                    <span className="hidden font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-olive sm:block">
                      All changes save
                      automatically
                    </span>
                  </div>

                  <div className="mt-10 space-y-11">


                    <Field
                      index="01"
                      label="Job title"
                      htmlFor="title"
                      hint="Name the role you actually need—not a title optimized for clicks."
                    >
                      <input
                        {...register("title")}
                        id="title"
                        placeholder="Backend Engineer"
                        aria-invalid={Boolean(
                          errors.title,
                        )}
                        className={
                          inputClassName
                        }
                      />

                      <FieldError
                        message={
                          errors.title?.message
                        }
                      />
                    </Field>

                    {/* ROLE CATEGORY */}

                    <div className="grid gap-9 sm:grid-cols-2">
                      <Field
                        index="02"
                        label="Role category"
                        htmlFor="role_category_id"
                        hint="This sets the context for how Trace evaluates the role."
                      >
                        <select
                          {...register(
                            "role_category_id",
                          )}
                          id="role_category_id"
                          disabled={
                            roleCategoriesLoading ||
                            Boolean(
                              roleCategoriesError,
                            )
                          }
                          aria-invalid={Boolean(
                            errors.role_category_id,
                          )}
                          className={
                            inputClassName
                          }
                        >
                          <option value="">
                            {roleCategoriesLoading
                              ? "Loading roles…"
                              : roleCategoriesError
                                ? "Unable to load roles"
                                : "Select a role"}
                          </option>

                          {roleCategories.map(
                            (role) => (
                              <option
                                key={role.id}
                                value={role.id}
                              >
                                {role.name}
                              </option>
                            ),
                          )}
                        </select>

                        <FieldError
                          message={
                            errors
                              .role_category_id
                              ?.message
                          }
                        />

                        {roleCategoriesError && (
                          <p className="mt-2 text-[0.975rem] text-destructive">
                            {roleCategoriesError}
                          </p>
                        )}
                      </Field>

                      <Field
                        index="03"
                        label="Department"
                        htmlFor="department"
                        optional
                      >
                        <input
                          {...register(
                            "department",
                          )}
                          id="department"
                          placeholder="Engineering"
                          className={
                            inputClassName
                          }
                        />
                      </Field>
                    </div>

                    {/* EMPLOYMENT */}

                    <ChoiceField
                      index="04"
                      label="Employment type"
                    >
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {EMPLOYMENT_TYPES.map(
                          (type) => (
                            <Option
                              key={type.value}
                              checked={
                                employmentType ===
                                type.value
                              }
                              label={type.label}
                            >
                              <input
                                {...register(
                                  "employment_type",
                                )}
                                className="sr-only"
                                type="radio"
                                value={
                                  type.value
                                }
                              />
                            </Option>
                          ),
                        )}
                      </div>
                    </ChoiceField>

                    {/* WORK MODE */}

                    <ChoiceField
                      index="05"
                      label="How will they work?"
                    >
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {WORK_MODES.map(
                          (mode) => {
                            const checked =
                              workMode ===
                              mode.value;

                            return (
                              <button
                                key={
                                  mode.value
                                }
                                type="button"
                                onClick={() =>
                                  handleWorkModeChange(
                                    mode.value,
                                  )
                                }
                                className={`relative border px-4 py-4 text-left transition-colors ${checked
                                  ? "border-forest bg-forest text-paper"
                                  : "border-forest/15 text-olive hover:border-forest/50 hover:text-ink"
                                  }`}
                              >
                                <span className="block text-[1.1375rem]">
                                  {mode.label}
                                </span>

                                <span
                                  className={`mt-1 block text-[0.975rem] leading-relaxed ${checked
                                    ? "text-paper/70"
                                    : "text-olive/70"
                                    }`}
                                >
                                  {
                                    mode.description
                                  }
                                </span>

                                {checked && (
                                  <Check className="absolute right-3 top-3 size-3.5" />
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <input
                        type="hidden"
                        {...register(
                          "work_mode",
                        )}
                      />
                    </ChoiceField>

                    {/* LOCATION SEMANTICS */}

                    {workMode ===
                      "REMOTE" ? (
                      <section className="border-t border-forest/12 pt-8">
                        <div className="mb-7">
                          <p className="font-mono text-[0.975rem] uppercase tracking-[0.18em] text-forest">
                            Remote hiring boundary
                          </p>

                          <h3 className="mt-2 text-[1.625rem] font-light tracking-[-0.025em]">
                            Where can this person
                            actually work from?
                          </h3>

                          <p className="mt-2 max-w-[55ch] text-[1.1375rem] leading-relaxed text-olive">
                            This is about candidate
                            eligibility—not where your
                            office is.
                          </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          {REMOTE_SCOPES.map(
                            (scope) => {
                              const checked =
                                values.remote_scope ===
                                scope.value;

                              return (
                                <button
                                  key={
                                    scope.value
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleRemoteScopeChange(
                                      scope.value,
                                    )
                                  }
                                  className={`relative border px-4 py-4 text-left transition-colors ${checked
                                    ? "border-forest bg-forest text-paper"
                                    : "border-forest/15 text-olive hover:border-forest/50 hover:text-ink"
                                    }`}
                                >
                                  <span className="block text-[1.1375rem]">
                                    {
                                      scope.label
                                    }
                                  </span>

                                  <span
                                    className={`mt-1 block text-[0.975rem] leading-relaxed ${checked
                                      ? "text-paper/70"
                                      : "text-olive/70"
                                      }`}
                                  >
                                    {
                                      scope.description
                                    }
                                  </span>

                                  {checked && (
                                    <Check className="absolute right-3 top-3 size-3.5" />
                                  )}
                                </button>
                              );
                            },
                          )}
                        </div>

                        <input
                          type="hidden"
                          {...register(
                            "remote_scope",
                          )}
                        />

                        {values.remote_scope ===
                          "COUNTRY" && (
                            <div className="mt-8">
                              <LocationFields
                                values={values}
                                countries={
                                  countries
                                }
                                states={states}
                                cities={cities}
                                onCountryChange={
                                  handleCountryChange
                                }
                                onStateChange={
                                  handleStateChange
                                }
                                setValue={
                                  setValue
                                }
                                countryRequired
                                stateOptional
                                cityHidden
                              />
                            </div>
                          )}

                        {values.remote_scope ===
                          "REGION" && (
                            <div className="mt-8">
                              <LocationFields
                                values={values}
                                countries={
                                  countries
                                }
                                states={states}
                                cities={cities}
                                onCountryChange={
                                  handleCountryChange
                                }
                                onStateChange={
                                  handleStateChange
                                }
                                setValue={
                                  setValue
                                }
                                countryRequired
                                stateRequired
                                cityHidden
                              />
                            </div>
                          )}

                        {values.remote_scope ===
                          "GLOBAL" && (
                            <div className="mt-8 border border-forest/12 bg-warm p-5">
                              <p className="text-[1.1375rem] leading-relaxed text-ink">
                                No country or office
                                boundary will be used
                                to restrict candidates.
                              </p>

                              <p className="mt-2 text-[0.975rem] leading-relaxed text-olive">
                                Note: the current jobs
                                table still requires a
                                country value. The
                                database should eventually
                                make that field nullable
                                for truly global remote
                                roles.
                              </p>
                            </div>
                          )}

                        <FieldError
                          message={
                            errors
                              .remote_scope
                              ?.message
                          }
                        />
                      </section>
                    ) : (
                      <section className="border-t border-forest/12 pt-8">
                        <div className="mb-7">
                          <p className="font-mono text-[0.975rem] uppercase tracking-[0.18em] text-forest">
                            Primary work location
                          </p>

                          <h3 className="mt-2 text-[1.625rem] font-light tracking-[-0.025em]">
                            Where will they work?
                          </h3>

                          <p className="mt-2 max-w-[55ch] text-[1.1375rem] leading-relaxed text-olive">
                            {workMode ===
                              "HYBRID"
                              ? "The office or primary work location they will use when working on-site."
                              : "The physical location where this role is based."}
                          </p>
                        </div>

                        <LocationFields
                          values={values}
                          countries={countries}
                          states={states}
                          cities={cities}
                          onCountryChange={
                            handleCountryChange
                          }
                          onStateChange={
                            handleStateChange
                          }
                          setValue={setValue}
                          countryRequired
                          stateOptional
                          cityOptional
                        />
                      </section>
                    )}



                    <div className="grid gap-6 border-y border-forest/12 py-8 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-end">
                      <Field
                        index="07"
                        label="Open positions"
                        htmlFor="open_positions"
                        hint="One brief represents one hiring decision."
                      >
                        <span />
                      </Field>

                      <input
                        {...register(
                          "open_positions",
                          {
                            valueAsNumber:
                              true,
                          },
                        )}
                        id="open_positions"
                        type="number"
                        min={1}
                        aria-label="Number of open positions"
                        className="border-b border-forest bg-transparent pb-2 text-[2.4375rem] tracking-[-0.05em] outline-none"
                      />
                    </div>


                    <Field
                      index="08"
                      label="What will this person own?"
                      htmlFor="description"
                    >
                      <textarea
                        {...register(
                          "description",
                        )}
                        id="description"
                        rows={6}
                        placeholder="What will they build, maintain, debug, operate, or own? What problems will they be responsible for solving?"
                        className="mt-4 w-full resize-y border border-forest/15 bg-warm p-5 text-[1.3rem] leading-relaxed outline-none placeholder:text-olive/45 focus:border-forest"
                      />

                      <p className="mt-3 text-[1.1375rem] leading-relaxed text-olive">
                        <strong className="font-medium text-ink">
                          Don&apos;t write a JD.
                          Don&apos;t sell the
                          company.
                        </strong>{" "}
                        Give the working context
                        behind the hire.
                      </p>

                      <FieldError
                        message={
                          errors.description
                            ?.message
                        }
                      />
                    </Field>
                  </div>
                </section>

                {/* WHY */}

                <section
                  className="mt-16 border-t border-forest/12 pt-8"
                  aria-labelledby="reference-heading"
                >
                  <p className="font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-forest">
                    Why this matters
                  </p>

                  <h3
                    id="reference-heading"
                    className="mt-3 max-w-[35ch] text-[1.95rem] font-light leading-tight tracking-[-0.03em] text-ink"
                    style={{
                      fontFamily:
                        "var(--font-primary)",
                    }}
                  >
                    You&apos;re defining the
                    reference point for every
                    candidate that follows.
                  </h3>

                  <p
                    className="mt-4 max-w-[62ch] text-[1.1375rem] font-light leading-relaxed text-olive"
                    style={{
                      fontFamily:
                        "var(--font-sans)",
                    }}
                  >
                    Without a clear role,
                    “strong candidate” becomes
                    subjective. With one, Trace can
                    ask a better question: does this
                    candidate actually fit what we
                    said we needed?
                  </p>
                </section>



                <footer className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-forest pt-7">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[1.1375rem] text-olive transition-colors hover:text-forest"
                  >
                    <ArrowLeft className="size-4" />

                    Back to jobs
                  </button>

                  <button
                    type="submit"
                    disabled={
                      !isValid ||
                      roleCategoriesLoading
                    }
                    className="group inline-flex items-center gap-8 bg-forest px-5 py-3.5 font-mono text-[0.89375rem] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-moss disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Continue

                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </footer>
              </form>


              <aside className="lg:pt-[3.55rem]">
                <div className="bg-forest p-6 text-paper lg:sticky lg:top-24">
                  <Circle
                    className="size-3 fill-sage text-sage"
                    aria-hidden="true"
                  />

                  <p className="mt-8 font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-sage">
                    The reference point
                  </p>

                  <p className="mt-4 font-serif text-[1.625rem] font-semibold italic leading-snug">
                    A strong candidate only
                    exists in relation to a clear
                    role.
                  </p>

                  <div className="mt-8 border-t border-paper/20 pt-5 text-[1.1375rem] leading-relaxed text-paper/70">
                    Trace will use this brief to
                    decide what evidence deserves
                    attention.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}



function LocationFields({
  values,
  countries,
  states,
  cities,
  onCountryChange,
  onStateChange,
  setValue,
  countryRequired,
  stateRequired,
  stateOptional,
  cityOptional,
  cityHidden,
}: {
  values: LocationFormValues;
  countries: ReturnType<typeof Country.getAllCountries>;
  states: ReturnType<typeof State.getStatesOfCountry>;
  cities: ReturnType<typeof City.getCitiesOfState>;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  setValue: ReturnType<typeof useForm<Step1Input>>["setValue"];
  countryRequired?: boolean;
  stateRequired?: boolean;
  stateOptional?: boolean;
  cityOptional?: boolean;
  cityHidden?: boolean;
}) {
  return (
    <div
      className={`grid gap-7 ${cityHidden
        ? "sm:grid-cols-2"
        : "sm:grid-cols-3"
        }`}
    >


      <Field
        index="06"
        label="Country"
        htmlFor="country"
        optional={!countryRequired}
      >
        <select
          id="country"
          value={values.country}
          onChange={(e) =>
            onCountryChange(
              e.target.value,
            )
          }
          className={
            inputClassName
          }
        >
          <option value="">
            Select country
          </option>

          {countries.map(
            (country) => (
              <option
                key={
                  country.isoCode
                }
                value={country.name}
              >
                {country.name}
              </option>
            ),
          )}
        </select>
      </Field>



      <Field
        label="State / region"
        htmlFor="state"
        optional={
          stateOptional ||
          !stateRequired
        }
      >
        <select
          id="state"
          value={
            values.state ?? ""
          }
          disabled={
            !values.country ||
            states.length === 0
          }
          onChange={(e) =>
            onStateChange(
              e.target.value,
            )
          }
          className={
            inputClassName
          }
        >
          <option value="">
            {states.length
              ? stateRequired
                ? "Select state / region"
                : "Select state / region"
              : "No states available"}
          </option>

          {states.map(
            (state) => (
              <option
                key={`${state.countryCode}-${state.isoCode}`}
                value={state.name}
              >
                {state.name}
              </option>
            ),
          )}
        </select>
      </Field>

      {/* CITY */}

      {!cityHidden && (
        <Field
          label="City"
          htmlFor="city"
          optional={cityOptional}
        >
          <select
            id="city"
            value={
              values.city ?? ""
            }
            disabled={
              !values.state ||
              cities.length === 0
            }
            onChange={(e) =>
              setValue(
                "city",
                e.target.value,
                {
                  shouldDirty:
                    true,
                  shouldValidate:
                    true,
                },
              )
            }
            className={
              inputClassName
            }
          >
            <option value="">
              {cities.length
                ? "Select city"
                : "No cities available"}
            </option>

            {cities.map(
              (city) => (
                <option
                  key={`${city.name}-${city.latitude}-${city.longitude}`}
                  value={city.name}
                >
                  {city.name}
                </option>
              ),
            )}
          </select>
        </Field>
      )}
    </div>
  );
}



function Field({
  index,
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  index?: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-3 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.17em] text-forest"
      >
        <span className="text-olive">
          {index ?? "—"}
        </span>

        <span>{label}</span>

        {optional && (
          <span className="ml-auto text-[0.73125rem] font-normal text-olive/60">
            Optional
          </span>
        )}
      </label>

      <div className="mt-2">
        {children}
      </div>

      {hint && (
        <p className="mt-2 text-[0.975rem] leading-relaxed text-olive">
          {hint}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   Choice Field
   ========================================================= */

function ChoiceField({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="flex items-baseline gap-3 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.17em] text-forest">
        <span className="text-olive">
          {index}
        </span>

        {label}
      </legend>

      {children}
    </fieldset>
  );
}

/* =========================================================
   Option
   ========================================================= */

function Option({
  checked,
  label,
  children,
}: {
  checked: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative cursor-pointer border px-4 py-3 text-[1.1375rem] transition-colors ${checked
        ? "border-forest bg-forest text-paper"
        : "border-forest/15 text-olive hover:border-forest/50 hover:text-ink"
        }`}
    >
      {children}

      {label}

      {checked && (
        <Check className="absolute right-2 top-2 size-3.5" />
      )}
    </label>
  );
}

/* =========================================================
   Error
   ========================================================= */

function FieldError({
  message,
}: {
  message?: string;
}) {
  return message ? (
    <p
      className="mt-2 text-[0.975rem] text-destructive"
      role="alert"
    >
      {message}
    </p>
  ) : null;
}
