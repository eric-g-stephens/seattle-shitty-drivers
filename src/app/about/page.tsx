export const metadata = { title: "About — Seattle Shitty Drivers" };

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl prose prose-slate">
      <h1>About</h1>
      <p>
        Seattle Shitty Drivers is a community tool for reporting and tracking bad driving behavior
        in the Seattle area. All reports are user-submitted and anonymous.
      </p>

      <h2>Disclaimer</h2>
      <p>
        Reports on this site are <strong>user-submitted opinions</strong>, not verified facts.
        We make no representation about the accuracy of any report. Submitting a false report
        may violate Washington State defamation law. Use this site responsibly.
      </p>

      <h2>Privacy</h2>
      <p>
        No personally identifiable information about reporters is stored. Your IP address is
        hashed with a rotating daily salt for rate-limiting purposes only and cannot be reversed.
      </p>

      <h2>Takedowns</h2>
      <p>
        To request removal of a report you believe is false or defamatory, email{" "}
        <a href="mailto:takedown@seattleshittydrivers.com">takedown@seattleshittydrivers.com</a>.
        We honor valid takedown requests within 7 days.
      </p>

      <h2>Scope</h2>
      <p>
        This site only accepts reports for incidents occurring within the Seattle metropolitan area.
        GPS coordinates are validated before any report is accepted.
      </p>
    </main>
  );
}
