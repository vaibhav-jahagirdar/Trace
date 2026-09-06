"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { addMember, getOrganizationMembers, removeMember, updateMemberRole, type OrganizationMember } from "@/features/organizations/api/members";

const roles = ["RECRUITING_ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "VIEWER"];
const rank: Record<string, number> = { VIEWER: 0, INTERVIEWER: 1, HIRING_MANAGER: 2, RECRUITER: 3, RECRUITING_ADMIN: 4, ORG_OWNER: 5 };

export default function OrganizationMembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { user, organizations } = useAuth();
  const me = organizations.find((org) => org.orgId === orgId);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("VIEWER");
  const load = () => getOrganizationMembers(orgId).then((result) => setMembers(result.data)).catch(() => setError("Unable to load members."));
  useEffect(() => { void load(); }, [orgId]);
  const canManage = (member: OrganizationMember) => Boolean(me && me.role !== "VIEWER" && member.user_id !== user?.id && rank[me.role] > rank[member.role]);
  async function add() { setError(null); try { await addMember(orgId, email, newRole); setEmail(""); await load(); } catch { setError("Unable to add that existing Trace user. Check the email and your role authority."); } }
  if (!me || me.role === "VIEWER") return <main className="min-h-svh bg-paper p-8 text-ink"><p className="text-sm text-olive">Only members with a higher role than the target can manage membership.</p></main>;
  return <main className="min-h-svh bg-paper px-6 py-10 text-ink md:px-12"><div className="mx-auto max-w-4xl"><Link href={`/orgs/${orgId}/dashboard`} className="font-mono text-xs uppercase tracking-[.16em] text-olive">← Dashboard</Link><p className="mt-14 font-mono text-xs uppercase tracking-[.18em] text-olive">Organization / Members</p><h1 className="mt-4 text-5xl font-light tracking-[-.05em]">Team access</h1><p className="mt-4 max-w-xl text-olive">Add an existing Trace user by email. You can only manage another member whose role is below yours.</p>{error && <p className="mt-6 text-sm text-red-800">{error}</p>}<section className="mt-10 border border-forest/15 bg-warm/40 p-5"><p className="font-mono text-xs uppercase tracking-[.14em] text-olive">Add existing Trace user</p><div className="mt-4 flex flex-wrap gap-3"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="person@example.com" className="min-w-64 flex-1 border border-rule bg-transparent p-3" /><select value={newRole} onChange={(event) => setNewRole(event.target.value)} className="border border-rule bg-transparent px-3">{roles.filter((role) => rank[role] < rank[me.role]).map((role) => <option key={role}>{role}</option>)}</select><button type="button" disabled={!email || rank[newRole] >= rank[me.role]} onClick={() => void add()} className="bg-forest px-4 py-3 font-mono text-xs uppercase tracking-[.12em] text-paper disabled:opacity-40">Add member</button></div></section><div className="mt-12 divide-y divide-forest/12 border-y border-forest/12">{members.map((member) => <div key={member.membership_id} className="flex flex-wrap items-center gap-5 py-6"><div className="min-w-0 flex-1"><p className="text-lg">{member.username}</p><p className="mt-1 text-sm text-olive">{member.email}{member.title ? ` · ${member.title}` : ""}</p></div><span className="font-mono text-xs uppercase tracking-[.12em] text-olive">{member.role}</span>{canManage(member) && <><select defaultValue={member.role} onChange={(event) => { void updateMemberRole(orgId, member.membership_id, event.target.value).then(load).catch(() => setError("Unable to update role.")); }} className="border border-rule bg-transparent px-3 py-2 text-sm">{roles.filter((role) => rank[role] < rank[me.role]).map((role) => <option key={role}>{role}</option>)}</select><button type="button" onClick={() => { if (window.confirm(`Remove ${member.username} from this organization?`)) void removeMember(orgId, member.membership_id).then(load).catch(() => setError("Unable to remove member.")); }} className="border border-red-900/30 px-3 py-2 text-sm text-red-900">Remove</button></>}</div>)}</div></div></main>;
}
