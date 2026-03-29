import EmailCaptureForm from './email-capture-form';

export default function EmailCapture() {
  return (
    <section className="bg-primary text-primary-foreground py-16 sm:py-20">
      <div className="container text-center">
        <h2 className="font-headline text-3xl sm:text-4xl">Join The Movement</h2>
        <p className="mt-2 max-w-2xl mx-auto text-lg">
          Get exclusive offers, weekly inspiration, and be the first to know about new collections.
        </p>
        <div className="mt-6 flex justify-center">
          <EmailCaptureForm />
        </div>
      </div>
    </section>
  );
}
