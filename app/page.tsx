import JsonLd from "./json-ld";
import TarotApp from "./tarot-app";
import { homeStructuredData } from "@/lib/structured-data";

export default function Home() {
  return (
    <>
      <JsonLd data={homeStructuredData()} />
      <TarotApp />
    </>
  );
}
