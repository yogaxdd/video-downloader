export const metadata = { title: "Video & Audio Downloader", description: "Download from YouTube, TikTok, IG, X via proxy APIs" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:'Inter, ui-sans-serif, system-ui', background:'#0b1020', color:'#e6e8ef'}}>
        {children}
      </body>
    </html>
  );
}
