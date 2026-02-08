import Head from "next/head";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy – Scrollframe</title>
        <meta name="description" content="Scrollframe privacy policy" />
      </Head>

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 16px",
          lineHeight: 1.6,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <h1>Privacy Policy – Scrollframe</h1>
        <p>
          <strong>Last updated:</strong> 8 February 2026
        </p>

        <p>
          Scrollframe (“we”, “our”, “us”) respects your privacy. This Privacy
          Policy explains how the Scrollframe browser extension and website
          operate and how we handle user data.
        </p>

        <h2>1. Overview</h2>
        <p>
          Scrollframe is a browser extension that allows users to capture
          frame-based screenshots while scrolling on any web page, manage
          captured frames, add annotations, and copy frames individually or all
          at once.
        </p>
        <p>
          Scrollframe is designed with privacy in mind and does <strong>not</strong>{" "}
          collect, store, or transmit personal data to external servers.
        </p>

        <h2>2. Data Collection</h2>
        <p>
          <strong>We do NOT collect:</strong>
        </p>
        <ul>
          <li>Personal information (name, email address, IP address)</li>
          <li>Browsing history</li>
          <li>Website content</li>
          <li>Authentication data</li>
          <li>Keystrokes or form inputs</li>
          <li>Financial or payment information</li>
        </ul>
        <p>
          Scrollframe does <strong>not</strong> use analytics, tracking pixels,
          cookies, or third-party monitoring tools.
        </p>

        <h2>3. Screenshots &amp; Content Data</h2>
        <ul>
          <li>
            Screenshots and frames captured by Scrollframe are processed{" "}
            <strong>locally in the user’s browser</strong>.
          </li>
          <li>Captured frames remain on the user’s device.</li>
          <li>
            No screenshots, annotations, or page content are uploaded, stored,
            or shared with our servers.
          </li>
        </ul>
        <p>
          All actions (capture, annotation, copying) happen entirely on the
          client side.
        </p>

        <h2>4. Permissions Explanation</h2>
        <p>
          Scrollframe requests only the minimum permissions required for its
          functionality:
        </p>
        <ul>
          <li>
            <strong>Active Tab / Host Access</strong> — Used only to capture
            visual frames from the currently active web page when the user
            explicitly triggers the action.
          </li>
          <li>
            <strong>Storage (if applicable)</strong> — Used to temporarily store
            frames or user preferences locally in the browser.
          </li>
        </ul>
        <p>
          These permissions are <strong>not</strong> used for tracking,
          monitoring, or data collection.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          Scrollframe does <strong>not</strong> integrate with third-party
          services, advertisers, analytics providers, or data brokers. The
          extension operates independently on the user’s browser.
        </p>

        <h2>6. Data Sharing</h2>
        <p>
          We do <strong>not</strong> sell, rent, share, or transfer any user data
          to third parties. Since Scrollframe does not collect personal data,
          there is no data to share.
        </p>

        <h2>7. Children’s Privacy</h2>
        <p>
          Scrollframe is not directed toward children under the age of 13 and
          does not knowingly collect any information from children.
        </p>

        <h2>8. Website Usage</h2>
        <p>
          The Scrollframe website (https://scrollframe.tech) may display
          informational content about the product. Any contact or authentication
          features on the website follow standard security practices. No browser
          extension data is transmitted through the website.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be reflected on this page with an updated revision date.
        </p>

        <h2>10. Contact</h2>
        <p>If you have questions or concerns about this Privacy Policy:</p>
        <p>
          📧{" "}
          <a href="mailto:contacts@scrollframe.tech">contacts@scrollframe.tech</a>
          <br />
          🌐 <a href="https://scrollframe.tech">https://scrollframe.tech</a>
        </p>
      </main>
    </>
  );
}
