"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    title: "",
    href: "/",
    button: false,
  },
];

export default function LayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  // console.log("PathName", pathName);

  //hide header footer when we go to the login and signup button.. so create first blacklists array

  const blackLists = ["/login", "/signup"];

  const isBlackList = blackLists.includes(pathName);
  // console.log("BlackList Value ", x);

  if (isBlackList) {
    return <div>{children}</div>;
  }

  return (
    <div>
      <nav className="bg-white shadow-lg sticky top-0 left-0 w-full py-6 flex justify-between items-center px-[5%]">
        <Link href="/" className="text-2xl font-semibold">
          Mylex Infotech
        </Link>
        {/* <div className="flex space-x-10 items-center">
          {menus.map((menu, index) => (
            <Link
              key={index}
              href={menu.href}
              className={
                menu.button
                  ? "bg-blue-600 px-12 py-3 rounded text-white"
                  : pathName === menu.href
                  ? "text-blue-600 font-medium"
                  : "text-black font-normal"
              }
            >
              {menu.title}
            </Link>
          ))}

          <Link
            href="/signup"
            className="bg-blue-600 px-12 py-3 rounded text-white"
          >
            Signup
          </Link>
        </div> */}
      </nav>
      <section className="px-[10%] py-16">{children}</section>
      <footer className="bg-gray-900 text-white py-12 px-[10%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Mylex Infotech</h3>
            <p className="text-gray-400">
              Address: STPI-Incubation Center Mohali,Plot No.C-184,Industrial
              Area,Phase 8 B, Sector-75, opposite Sun Pharma Pvt Ltd, Sahibzada
              Ajit Singh Nagar, Punjab 160071
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {menus.map((menu, index) => (
                <li key={index}>
                  <Link
                    href={menu.href}
                    className="text-gray-400 hover:text-white"
                  >
                    {menu.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: mylexinfotech@gmail.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} MylexInfotech. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
