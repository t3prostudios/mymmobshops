
import HeroSection from '@/components/home/hero-section';
import TrustBar from '@/components/home/trust-bar';
import SpinToWinSection from '@/components/home/spin-to-win-section';
import FeaturedCategories from '@/components/home/featured-categories';
import BestsellersCarousel from '@/components/home/bestsellers-carousel';
import SocialProof from '@/components/home/social-proof';
import MotivationalMondays from '@/components/home/motivational-mondays';
import BrandMission from '@/components/home/brand-mission';
import EmailCapture from '@/components/home/email-capture';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustBar />
      <SpinToWinSection />
      <Suspense fallback={<BestsellersCarouselSkeleton />}>
        <FeaturedCategories />
      </Suspense>
      <Suspense fallback={<BestsellersCarouselSkeleton />}>
        <BestsellersCarousel />
      </Suspense>
      <Suspense fallback={<BestsellersCarouselSkeleton />}>
        <SocialProof />
      </Suspense>
      <MotivationalMondays />
      <Suspense fallback={<BestsellersCarouselSkeleton />}>
        <BrandMission />
      </Suspense>
      <EmailCapture />
    </div>
  );
}

function BestsellersCarouselSkeleton() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-1/3 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto mt-4" />
      </div>
      <div className="flex space-x-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 w-1/4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
