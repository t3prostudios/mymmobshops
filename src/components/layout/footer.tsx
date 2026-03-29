
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import Logo from "@/components/ui/logo";

const footerLinks = [
  { 
    title: "Shop", 
    links: [
      { label: "Tops", href: "/products?category=tops" },
      { label: "Bottoms", href: "/products?category=bottoms" },
      { label: "Hats", href: "/products?category=hats" },
      { label: "Bundles", href: "/products?category=bundles" },
    ] 
  },
  { 
    title: "Help", 
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns Policy", href: "/returns-policy" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Loyalty Program", href: "/loyalty-program" },
      { label: "Report an Issue", href: "/report-issue" }
    ] 
  },
  { 
    title: "Company", 
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/mission" },
      { label: "POS", href: "/pos" },
    ] 
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/mindingmyown.business?igsh=MzRlODBiNWFlZA==", name: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61554017023386&mibextid=ZbWKwL", name: "Facebook" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
          <video
              src="/images/footer-logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-[150px] h-[88px]"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Fashion for the bold, the brave, and the inspired.
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((social) => (
                <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-foreground" aria-label={social.name}>
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-headline text-md font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MindingMyOwnBusiness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
