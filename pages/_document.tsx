import { getCssText } from '@maximeheckel/design-system';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="maximeheckel-light">
        <Head>
          <link
            href="/favicon.svg"
            rel="icon"
            type="image/svg+xml"
          />
          <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        </Head>
        <body className="maximeheckel-dark">
          <Script src="/sw.js"></Script>
          <script
            key="maximeheckel-theme"
            dangerouslySetInnerHTML={{
              __html: `(function() { try {
        var mode = localStorage.getItem('mode');
        var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
        if (!mode && supportDarkMode)  document.documentElement.classList.add('maximeheckel-dark');
        if (!mode) return
        document.documentElement.classList.add('maximeheckel-' + mode);
      } catch (e) {} })();`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
