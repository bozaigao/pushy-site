import type { AppProps } from "next/app";
import "../components/home/home.scss";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
