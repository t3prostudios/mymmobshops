import { Target, Eye, Leaf, Store, ShoppingBag, Users, Zap, Lightbulb } from 'lucide-react';

export const metadata = {
  title: 'Our Mission | VogueVerse',
  description:
    'Learn about the mission, vision, and philosophy of Minding My Own Business.',
};

const missionSections = [
    {
        icon: Target,
        title: 'Our Mission',
        content: 'To empower individuals to achieve self-mastery, cultivate creativity, and pursue purposeful growth. We fulfill this mission through three pillars: our intentionally designed products, our supportive community, and our empowering message. Minding My Own Business serves as the catalyst and provides the tangible tools for this personal journey.',
    },
    {
        icon: Eye,
        title: 'Our Vision',
        content: 'We envision a world where individuals are liberated to unlock their full potential. We strive to be the definitive lifestyle movement for a global community of creators, dreamers, and leaders who have embraced their authenticity, elevated their mindset, and successfully transformed their personal focus into freedom and their vision into reality.',
    },
];

const philosophySections = [
    {
        icon: Zap,
        title: 'A Lifestyle Movement',
        content: "Minding My Own Business is more than a brand; it is a philosophy centered on intentional living and self-investment. We champion the idea that by focusing on one's own growth, one can achieve anything.",
    },
    {
        icon: Store,
        title: 'The "MMOB Place" Experience',
        content: 'Our retail environment is the physical embodiment of our philosophy. Its unique, individually named sections are curated zones designed to inspire creativity, challenge perspectives, and turn shopping into a journey of self-discovery.',
    },
    {
        icon: ShoppingBag,
        title: 'Tools for Self-Mastery',
        content: 'Our products are the instruments of this lifestyle. From apparel that builds external confidence to natural care products that foster internal wellness, every item is meticulously curated to help our community look good, feel good, and live with purpose.',
    },
    {
        icon: Users,
        title: 'Community as a Catalyst',
        content: 'We believe growth is amplified in a supportive ecosystem. MMOB is committed to fostering a vibrant community where authenticity is celebrated, and individuals can connect, share, and elevate one another on their path to achieving their dreams.',
    },
];

export default function MissionPage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Lightbulb className="h-8 w-8" />
                </div>
            </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            The Minding My Own Business (MMOB) Identity
          </h1>
        </div>

        <div className="space-y-12">
            {missionSections.map((section, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <section.icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold font-headline">
                        {section.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
                        {section.content}
                    </p>
                </div>
            ))}
        </div>

        <div className="mt-20 pt-12 border-t">
            <h2 className="text-center font-headline text-3xl font-bold tracking-tight sm:text-4xl mb-12">
                Our Philosophy: The Movement in Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {philosophySections.map((section) => (
                    <div key={section.title} className="flex gap-6">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <section.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold font-headline">{section.title}</h3>
                            <p className="mt-1 text-muted-foreground">{section.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
