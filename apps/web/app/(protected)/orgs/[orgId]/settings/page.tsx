"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError, api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { useAuth } from "@/providers/auth-provider";
import { useManageOrg } from "@/features/organizations/hooks/use-manage-org";

type Org = { id: string; name: string; slug: string; description: string | null; status: string; security_question: string | null; deletion_scheduled_for: string | null };

export default function OrganizationSettingsPage() {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const { organizations } = useAuth();
  const membership = organizations.find((item) => item.orgId === params.orgId);
  const isOwner = membership?.role === "ORG_OWNER";
  const { data, isLoading } = useQuery({ queryKey: queryKeys.organizations.detail(params.orgId), queryFn: () => api.get<{ data: Org }>(API.organizations.detail(params.orgId)), enabled: Boolean(params.orgId) });
  const org = data?.data;
  const manage = useManageOrg(params.orgId);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const current = org ?? { name: "", slug: "", description: "", security_question: null };
  const save = async () => {
    setError(null);
    try { await manage.update.mutateAsync({ name: name || current.name, slug: slug || current.slug, description, ...(question ? { securityQuestion: question, securityAnswer: answer } : {}) }); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Unable to save organization"); }
  };
  const requestDeletion = async () => {
    setError(null);
    try { await manage.requestDeletion.mutateAsync({ password: password || undefined, securityAnswer: securityAnswer || undefined }); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Unable to schedule deletion"); }
  };
  if (!isOwner) return <main className="min-h-svh bg-paper p-8 text-ink"><p className="font-mono text-sm text-olive">Only the organization owner can manage these settings.</p></main>;
  if (isLoading || !org) return <main className="min-h-svh bg-paper p-8 text-ink"><p className="font-mono text-sm text-olive">Loading organization…</p></main>;
  return <main className="min-h-svh bg-paper px-6 py-10 text-ink md:px-12"><div className="mx-auto max-w-3xl"><Link href={`/orgs/${params.orgId}/dashboard`} className="font-mono text-xs uppercase tracking-[.16em] text-olive">← Dashboard</Link><p className="mt-14 font-mono text-xs uppercase tracking-[.18em] text-olive">Organization settings</p><h1 className="mt-4 text-5xl font-light tracking-[-.05em]">{org.name}</h1>{error && <p role="alert" className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}<section className="mt-12 border-t border-forest/15 pt-8"><h2 className="text-2xl">Edit organization</h2><div className="mt-6 grid gap-5"><label className="text-sm">Name<input defaultValue={org.name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-rule bg-transparent p-3" /></label><label className="text-sm">Slug<input defaultValue={org.slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full border border-rule bg-transparent p-3" /></label><label className="text-sm">Description<textarea defaultValue={org.description ?? ""} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-28 w-full border border-rule bg-transparent p-3" /></label><div className="border-t border-rule pt-5"><p className="text-sm font-medium">Deletion security question</p><p className="mt-1 text-sm text-olive">{org.security_question ? "A question is configured. Enter both fields to replace it." : "Optional alternative to your password."}</p><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={org.security_question ?? "Your private question"} className="mt-3 w-full border border-rule bg-transparent p-3" /><input value={answer} onChange={(e) => setAnswer(e.target.value)} type="password" placeholder="Answer" className="mt-3 w-full border border-rule bg-transparent p-3" /></div><button onClick={save} disabled={manage.update.isPending} className="w-fit bg-forest px-5 py-3 font-mono text-xs uppercase tracking-[.14em] text-paper disabled:opacity-50">{manage.update.isPending ? "Saving…" : "Save changes"}</button></div></section><section className="mt-16 border-t border-red-900/20 pt-8"><h2 className="text-2xl text-red-900">Danger zone</h2>{org.status === "PENDING_DELETION" ? <><p className="mt-3 text-sm text-olive">Deletion is scheduled for {org.deletion_scheduled_for ? new Date(org.deletion_scheduled_for).toLocaleString() : "the end of the cooldown period"}.</p><button onClick={() => manage.cancelDeletion.mutate()} disabled={manage.cancelDeletion.isPending} className="mt-5 border border-forest px-5 py-3 font-mono text-xs uppercase tracking-[.14em]">{manage.cancelDeletion.isPending ? "Cancelling…" : "Cancel deletion"}</button></> : <><p className="mt-3 max-w-xl text-sm leading-relaxed text-olive">Deletion is delayed for seven days. During that window you can cancel it. Confirm with your account password or the organization security answer.</p><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Account password" className="mt-5 w-full max-w-md border border-rule bg-transparent p-3" /><input value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} type="password" autoComplete="off" placeholder={org.security_question ?? "Organization security answer"} className="mt-3 w-full max-w-md border border-rule bg-transparent p-3" /><button onClick={requestDeletion} disabled={manage.requestDeletion.isPending || (!password && !securityAnswer)} className="mt-5 border border-red-900 bg-red-900 px-5 py-3 font-mono text-xs uppercase tracking-[.14em] text-paper disabled:opacity-40">{manage.requestDeletion.isPending ? "Scheduling…" : "Schedule organization deletion"}</button></>}</section></div></main>;
}
