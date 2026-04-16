export const metadata = { title: "About & Disclaimer — Seattle Shitty Drivers" };

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl space-y-8 text-sm leading-relaxed">
      <div>
        <h1 className="text-3xl font-bold mb-3">About Seattle Shitty Drivers</h1>
        <p className="text-gray-600">
          Seattle Shitty Drivers is a satirical, community-humor website created for entertainment
          purposes only. It is a place for Seattle residents to vent, commiserate, and laugh about
          the joys of sharing the road. Nothing here is meant to be taken seriously.
        </p>
      </div>

      {/* Prominent satirical disclaimer box */}
      <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6 space-y-3">
        <h2 className="text-lg font-bold text-yellow-900">🎭 Entertainment Purposes Only</h2>
        <p className="text-yellow-800">
          <strong>This website is a parody and satire site intended for comedic purposes only.</strong>{" "}
          It is not affiliated with, endorsed by, or representative of any law enforcement agency,
          government body, vehicle licensing authority, or official traffic reporting system.
          Reports submitted to this site are fictional user opinions expressed for humor and
          should not be interpreted as factual accounts of any person&apos;s driving behavior.
        </p>
        <p className="text-yellow-800">
          Any resemblance between reports on this site and actual events is coincidental. The
          existence of a license plate on this site&apos;s leaderboard does not mean that driver
          has actually committed any traffic violation. <strong>This site is not intended to be
          punitive, and no report here carries any legal weight whatsoever.</strong>
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">User-Generated Content Disclaimer</h2>
        <p className="text-gray-600">
          All reports are submitted anonymously by third-party users. Seattle Shitty Drivers does
          not create, edit, verify, investigate, or validate any report. We make no representation
          about the accuracy, completeness, or truthfulness of any user submission. Content on
          this site reflects the opinions of individual users only and does not represent the
          views of the site operators.
        </p>
        <p className="text-gray-600 mt-2">
          Pursuant to Section 230 of the Communications Decency Act (47 U.S.C. § 230), the
          operators of this site are not liable for content posted by users.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Responsible Use</h2>
        <p className="text-gray-600">
          This site is meant for humor. Submitting a report that you know to be false — with intent
          to harass, defame, or harm a specific individual — may violate Washington State law,
          including RCW 9A.86.010 (Malicious Harassment) and civil defamation statutes.
          Use this site in the spirit it was intended: a light-hearted, anonymous venting platform.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Privacy</h2>
        <p className="text-gray-600">
          No personally identifiable information about reporters is stored. Your IP address is
          cryptographically hashed with a rotating daily salt for rate-limiting purposes only.
          The hash cannot be reversed to recover your IP address. License plates are public
          information displayed on vehicles in public spaces.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Takedowns & Content Removal</h2>
        <p className="text-gray-600">
          We take content concerns seriously even on a humor site. If you believe a specific report
          about your vehicle is false, malicious, or defamatory, you may request its removal by
          emailing{" "}
          <a href="mailto:takedown@seattleshittydrivers.com" className="text-blue-600 hover:underline">
            takedown@seattleshittydrivers.com
          </a>.
          Include the license plate and state in your request. We honor valid takedown requests
          within 7 days. You can also use the 🚩 flag button on any individual report to
          community-flag it — reports hidden after 3 flags.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Geographic Scope</h2>
        <p className="text-gray-600">
          This site only accepts reports for incidents with GPS coordinates within the
          Seattle metropolitan area. Coordinates are validated server-side before any report
          is accepted.
        </p>
      </div>

      <div className="border-t pt-6 text-xs text-gray-400">
        <p>
          Seattle Shitty Drivers is an independent satirical project. All content is user-generated.
          &copy; {new Date().getFullYear()} Seattle Shitty Drivers. All rights reserved.
        </p>
      </div>
    </main>
  );
}
