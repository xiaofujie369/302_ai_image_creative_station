import Link from "next/link";
import SignOutButton from "@/components/saas/sign-out-button";

export function AccountNav() {
  const links = [
    ["/account", "Overview"],
    ["/account/generations", "Generations"],
    ["/account/orders", "Orders"],
    ["/account/credits", "Credits"],
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          {label}
        </Link>
      ))}
      <SignOutButton />
    </div>
  );
}

export default AccountNav;
